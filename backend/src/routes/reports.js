const express = require('express');
const { body } = require('express-validator');
const {
  createReport,
  getReports,
  getReport,
  updateReport,
  deleteReport,
  submitFeedback
} = require('../controllers/reportController');
const { protect, optionalAuth } = require('../middleware/auth');
const { upload, processImages } = require('../middleware/upload');

const router = express.Router();

// Validation rules
const createReportValidation = [
  body('title')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Title must be between 5 and 200 characters'),
  body('description')
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Description must be between 10 and 2000 characters'),
  body('category')
    .isIn(['Pothole', 'Waste', 'Light', 'Water', 'Traffic', 'Other'])
    .withMessage('Please select a valid category'),
  body('priority')
    .isInt({ min: 1, max: 5 })
    .withMessage('Priority must be between 1 and 5'),
  body('longitude')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Please provide a valid longitude'),
  body('latitude')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Please provide a valid latitude'),
  body('address')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Address cannot exceed 500 characters')
];

const updateReportValidation = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Title must be between 5 and 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Description must be between 10 and 2000 characters'),
  body('priority')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Priority must be between 1 and 5')
];

const feedbackValidation = [
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('comment')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Comment cannot exceed 500 characters')
];

// Routes
router.route('/')
  .get(optionalAuth, getReports)
  .post(protect, upload, processImages, createReportValidation, createReport);

router.route('/:id')
  .get(optionalAuth, getReport)
  .put(protect, updateReportValidation, updateReport)
  .delete(protect, deleteReport);

router.post('/:id/feedback', protect, feedbackValidation, submitFeedback);

module.exports = router;