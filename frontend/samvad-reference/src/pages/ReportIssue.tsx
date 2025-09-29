import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Camera, 
  MapPin, 
  Loader2, 
  CheckCircle, 
  Mic,
  Upload,
  Sparkles
} from "lucide-react";
import { mockAIService, mockLocationService } from "@/services/mockData";
import { Report } from "@/types";

interface ReportIssueProps {
  userId: string;
  onReportSubmitted: (report: Report) => void;
}

export const ReportIssue = ({ userId, onReportSubmitted }: ReportIssueProps) => {
  const [description, setDescription] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>("");
  const [location, setLocation] = useState<{ lat: number; lng: number; address: string } | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState<{ category: string; priority: number; suggestedTitle?: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhoto(file);
      const reader = new FileReader();
      reader.onload = (e) => setPhotoPreview(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const getCurrentLocation = async () => {
    setIsGettingLocation(true);
    try {
      const locationData = await mockLocationService.getCurrentLocation();
      setLocation(locationData);
    } catch (error) {
      console.error("Failed to get location:", error);
    }
    setIsGettingLocation(false);
  };

  const analyzeWithAI = async () => {
    if (!description.trim()) return;
    
    setIsAnalyzing(true);
    try {
      const result = await mockAIService.categorizeReport(description, photoPreview);
      setAiResult(result);
    } catch (error) {
      console.error("AI analysis failed:", error);
    }
    setIsAnalyzing(false);
  };

  const startVoiceRecording = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';
      
      setIsListening(true);
      
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setDescription(prev => prev + (prev ? ' ' : '') + transcript);
        setIsListening(false);
      };
      
      recognition.onerror = () => {
        setIsListening(false);
      };
      
      recognition.onend = () => {
        setIsListening(false);
      };
      
      recognition.start();
    }
  };

  const submitReport = async () => {
    if (!description.trim() || !location) return;
    
    setIsSubmitting(true);
    
    // Simulate submission delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const newReport: Report = {
      id: `RPT${String(Date.now()).slice(-3)}`,
      title: aiResult?.suggestedTitle || "New civic issue report",
      description: description.trim(),
      category: (aiResult?.category as Report["category"]) || "Other",
      priority: (aiResult?.priority as Report["priority"]) || 2,
      status: "Submitted",
      photoUrl: photoPreview || undefined,
      location,
      citizenId: userId,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    onReportSubmitted(newReport);
    
    // Reset form
    setDescription("");
    setPhoto(null);
    setPhotoPreview("");
    setLocation(null);
    setAiResult(null);
    setIsSubmitting(false);
  };

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-foreground mb-2">Report an Issue</h1>
        <p className="text-muted-foreground">Help improve your community by reporting civic issues</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5 text-primary" />
            Issue Details
          </CardTitle>
          <CardDescription>
            Provide clear details about the civic issue you've encountered
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Photo Upload */}
          <div className="space-y-2">
            <Label>Photo (Optional)</Label>
            <div className="flex flex-col gap-3">
              {photoPreview ? (
                <div className="relative">
                  <img 
                    src={photoPreview} 
                    alt="Issue preview" 
                    className="w-full h-48 object-cover rounded-lg border"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => {
                      setPhoto(null);
                      setPhotoPreview("");
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                  >
                    Remove
                  </Button>
                </div>
              ) : (
                <div 
                  className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:bg-accent/50 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Click to upload photo or drag and drop
                  </p>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handlePhotoChange}
                className="hidden"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="description">Description</Label>
              <Button
                variant="outline"
                size="sm"
                onClick={startVoiceRecording}
                disabled={isListening}
                className="ml-auto"
              >
                {isListening ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Mic className="h-4 w-4" />
                )}
                {isListening ? "Listening..." : "Voice"}
              </Button>
            </div>
            <Textarea
              id="description"
              placeholder="Describe the issue in detail. What did you observe? Where exactly is it located?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="resize-none"
            />
          </div>

          {/* AI Analysis */}
          {description.trim().length > 10 && (
            <div className="space-y-3">
              <Button
                variant="outline"
                onClick={analyzeWithAI}
                disabled={isAnalyzing}
                className="w-full"
              >
                {isAnalyzing ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Sparkles className="h-4 w-4 mr-2" />
                )}
                {isAnalyzing ? "Analyzing with AI..." : "Analyze with AI"}
              </Button>

              {aiResult && (
                <div className="bg-primary-light rounded-lg p-4 space-y-2">
                  <h4 className="font-semibold text-primary">AI Analysis Results:</h4>
                  <div className="flex gap-2 flex-wrap">
                    <Badge variant="secondary">Category: {aiResult.category}</Badge>
                    <Badge variant="outline">Priority: {aiResult.priority}/5</Badge>
                  </div>
                  {aiResult.suggestedTitle && (
                    <p className="text-sm">
                      <strong>Suggested Title:</strong> {aiResult.suggestedTitle}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Location */}
          <div className="space-y-2">
            <Label>Location</Label>
            {location ? (
              <div className="bg-success-light rounded-lg p-4 space-y-2">
                <div className="flex items-center gap-2 text-success">
                  <CheckCircle className="h-4 w-4" />
                  <span className="font-semibold">Location captured</span>
                </div>
                <p className="text-sm text-muted-foreground">{location.address}</p>
                <p className="text-xs text-muted-foreground">
                  {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                </p>
              </div>
            ) : (
              <Button
                variant="outline"
                onClick={getCurrentLocation}
                disabled={isGettingLocation}
                className="w-full"
              >
                {isGettingLocation ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <MapPin className="h-4 w-4 mr-2" />
                )}
                {isGettingLocation ? "Getting Location..." : "Get Current Location"}
              </Button>
            )}
          </div>

          {/* Submit */}
          <Button
            variant="civic"
            size="lg"
            onClick={submitReport}
            disabled={!description.trim() || !location || isSubmitting}
            className="w-full"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Submitting Report...
              </>
            ) : (
              "Submit Report"
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};