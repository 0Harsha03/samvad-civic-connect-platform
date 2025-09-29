const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const reportSchema = new mongoose.Schema({
  reportId: {
    type: String,
    unique: true,
    default: () => `RPT${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 1000)}`
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: {
      values: ['Pothole', 'Waste', 'Light', 'Water', 'Traffic', 'Other'],
      message: '{VALUE} is not a supported category'
    }
  },
  priority: {
    type: Number,
    required: [true, 'Priority is required'],
    min: [1, 'Priority must be between 1 and 5'],
    max: [5, 'Priority must be between 1 and 5']
  },
  status: {
    type: String,
    enum: ['Submitted', 'Assigned', 'In Progress', 'Resolved', 'Closed', 'Rejected'],
    default: 'Submitted'
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: [true, 'Location coordinates are required'],
      validate: {
        validator: function(v) {
          return v.length === 2 && 
                 v[0] >= -180 && v[0] <= 180 && // longitude
                 v[1] >= -90 && v[1] <= 90; // latitude
        },
        message: 'Invalid coordinates format [longitude, latitude]'
      }
    },
    address: {
      type: String,
      trim: true,
      maxlength: [500, 'Address cannot exceed 500 characters']
    }
  },
  // Photo attachments
  photos: [{
    filename: String,
    originalName: String,
    mimetype: String,
    size: Number,
    url: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  // Citizen who reported
  citizenId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Citizen ID is required']
  },
  // Staff assignment
  assignedStaffId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  assignedAt: {
    type: Date,
    default: null
  },
  // Comments and updates
  staffComments: [{
    staffId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    comment: {
      type: String,
      required: true,
      trim: true,
      maxlength: [1000, 'Comment cannot exceed 1000 characters']
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  // Citizen feedback
  citizenFeedback: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      trim: true,
      maxlength: [500, 'Feedback comment cannot exceed 500 characters']
    },
    submittedAt: Date
  },
  // Resolution details
  resolvedAt: {
    type: Date,
    default: null
  },
  resolutionDetails: {
    type: String,
    trim: true,
    maxlength: [1000, 'Resolution details cannot exceed 1000 characters']
  },
  // Tracking
  estimatedResolutionDate: Date,
  actualResolutionDate: Date,
  
  // Auto-categorization data (for AI features)
  aiSuggestions: {
    suggestedCategory: String,
    suggestedPriority: Number,
    confidence: Number,
    processedAt: Date
  },
  
  // Public visibility
  isPublic: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Geospatial index for location queries
reportSchema.index({ location: '2dsphere' });

// Compound indexes for common queries
reportSchema.index({ status: 1, priority: -1, createdAt: -1 });
reportSchema.index({ citizenId: 1, createdAt: -1 });
reportSchema.index({ assignedStaffId: 1, status: 1 });
reportSchema.index({ category: 1, status: 1 });

// Virtual for getting latitude and longitude separately
reportSchema.virtual('latitude').get(function() {
  return this.location.coordinates[1];
});

reportSchema.virtual('longitude').get(function() {
  return this.location.coordinates[0];
});

// Pre-save middleware to set assignment timestamp
reportSchema.pre('save', function(next) {
  if (this.isModified('assignedStaffId') && this.assignedStaffId && !this.assignedAt) {
    this.assignedAt = new Date();
    if (this.status === 'Submitted') {
      this.status = 'Assigned';
    }
  }
  
  if (this.isModified('status') && this.status === 'Resolved' && !this.resolvedAt) {
    this.resolvedAt = new Date();
    this.actualResolutionDate = new Date();
  }
  
  next();
});

// Static method to get reports within a radius
reportSchema.statics.findNearby = function(longitude, latitude, maxDistance = 5000) {
  return this.find({
    location: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [longitude, latitude]
        },
        $maxDistance: maxDistance // in meters
      }
    }
  });
};

// Static method for analytics
reportSchema.statics.getAnalytics = function(startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        createdAt: {
          $gte: startDate,
          $lte: endDate
        }
      }
    },
    {
      $group: {
        _id: {
          category: '$category',
          status: '$status'
        },
        count: { $sum: 1 },
        avgPriority: { $avg: '$priority' }
      }
    },
    {
      $sort: { count: -1 }
    }
  ]);
};

// Transform output for API responses
reportSchema.methods.toJSON = function() {
  const reportObject = this.toObject();
  
  // Add virtual fields
  reportObject.latitude = this.latitude;
  reportObject.longitude = this.longitude;
  
  return reportObject;
};

module.exports = mongoose.model('Report', reportSchema);