import React, { useState, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Camera, Type, Loader2, Upload, X, RotateCcw } from "lucide-react";
import { foodApi, AnalyzeFoodResponse } from "../../lib/api";
import { useToast } from "@/components/ui/use-toast";

export default function FoodLogger() {
  const [mode, setMode] = useState<"scan" | "type">("type");
  const [description, setDescription] = useState("");
  const [analysisResult, setAnalysisResult] = useState<AnalyzeFoodResponse | null>(null);
  const [mealType, setMealType] = useState<"breakfast" | "lunch" | "dinner" | "snack">("lunch");
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isUsingCamera, setIsUsingCamera] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const analyzeMutation = useMutation({
    mutationFn: (data: { description?: string; imageUrl?: string }) => 
      foodApi.analyzeFood(data),
    onSuccess: (data) => {
      setAnalysisResult(data);
    },
    onError: (error: any) => {
      console.error("Analyze food error:", error);
      toast({
        title: "Error",
        description: "Failed to analyze food",
        variant: "destructive",
      });
    }
  });

  const logFoodMutation = useMutation({
    mutationFn: (data: any) => foodApi.logFood(data),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Food logged successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["nutrition"] });
      navigate("/app/dashboard");
    },
    onError: (error: any) => {
      console.error("Log food error:", error);
      toast({
        title: "Error",
        description: "Failed to log food",
        variant: "destructive",
      });
    }
  });

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment', // Use back camera on mobile
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      
      setStream(mediaStream);
      setIsUsingCamera(true);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      toast({
        title: "Camera Error",
        description: "Unable to access camera. Please check permissions.",
        variant: "destructive",
      });
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsUsingCamera(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0);
        
        const imageDataUrl = canvas.toDataURL('image/jpeg', 0.8);
        setCapturedImage(imageDataUrl);
        stopCamera();
      }
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast({
          title: "File too large",
          description: "Please select an image smaller than 10MB",
          variant: "destructive",
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setCapturedImage(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    setAnalysisResult(null);
    if (mode === "scan") {
      startCamera();
    }
  };

  const handleAnalyze = () => {
    if (mode === "type" && !description.trim()) return;
    if (mode === "scan" && !capturedImage) return;
    
    if (mode === "type") {
      analyzeMutation.mutate({ description: description.trim() });
    } else {
      analyzeMutation.mutate({ imageUrl: capturedImage! });
    }
  };

  const handleLogFood = () => {
    if (!analysisResult) return;
    
    logFoodMutation.mutate({
      customFoodName: analysisResult.foodName,
      servingSizeG: 100, // Default serving size
      calories: analysisResult.calories,
      proteinG: analysisResult.proteinG,
      carbsG: analysisResult.carbsG,
      fatG: analysisResult.fatG,
      mealType: mealType,
    });
  };

  // Cleanup camera stream on unmount
  React.useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-white shadow-sm">
        <div className="px-4 py-6 flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/app/dashboard")}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">AI Calorie Count</h1>
            <p className="text-gray-600">Analyze your food with AI</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Mode Selection */}
        <Card>
          <CardHeader>
            <CardTitle>How would you like to log your food?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant={mode === "scan" ? "default" : "outline"}
                onClick={() => {
                  setMode("scan");
                  setCapturedImage(null);
                  setAnalysisResult(null);
                  stopCamera();
                }}
                className="h-20 flex-col space-y-2"
              >
                <Camera className="w-6 h-6" />
                <span>Scan</span>
              </Button>
              <Button
                variant={mode === "type" ? "default" : "outline"}
                onClick={() => {
                  setMode("type");
                  setCapturedImage(null);
                  setAnalysisResult(null);
                  stopCamera();
                }}
                className="h-20 flex-col space-y-2"
              >
                <Type className="w-6 h-6" />
                <span>Type</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Input Section */}
        <Card>
          <CardHeader>
            <CardTitle>
              {mode === "scan" ? "Take a Photo" : "Describe Your Food"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {mode === "scan" ? (
              <div className="space-y-4">
                {!capturedImage && !isUsingCamera && (
                  <div className="space-y-3">
                    <Button
                      onClick={startCamera}
                      className="w-full bg-purple-600 hover:bg-purple-700"
                    >
                      <Camera className="w-4 h-4 mr-2" />
                      Open Camera
                    </Button>
                    
                    <div className="text-center text-gray-500">or</div>
                    
                    <Button
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Photo
                    </Button>
                    
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </div>
                )}

                {isUsingCamera && (
                  <div className="space-y-4">
                    <div className="relative bg-black rounded-lg overflow-hidden">
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        className="w-full h-64 object-cover"
                      />
                      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-4">
                        <Button
                          onClick={capturePhoto}
                          className="bg-white text-black hover:bg-gray-100 rounded-full w-16 h-16"
                        >
                          <Camera className="w-6 h-6" />
                        </Button>
                        <Button
                          onClick={stopCamera}
                          variant="outline"
                          className="bg-white text-black hover:bg-gray-100 rounded-full w-12 h-12"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {capturedImage && (
                  <div className="space-y-4">
                    <div className="relative">
                      <img
                        src={capturedImage}
                        alt="Captured food"
                        className="w-full h-64 object-cover rounded-lg"
                      />
                      <Button
                        onClick={retakePhoto}
                        variant="outline"
                        size="sm"
                        className="absolute top-2 right-2 bg-white"
                      >
                        <RotateCcw className="w-4 h-4 mr-1" />
                        Retake
                      </Button>
                    </div>
                    
                    <Button
                      onClick={handleAnalyze}
                      disabled={analyzeMutation.isPending}
                      className="w-full bg-purple-600 hover:bg-purple-700"
                    >
                      {analyzeMutation.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Analyzing Image...
                        </>
                      ) : (
                        "Analyze Food"
                      )}
                    </Button>
                  </div>
                )}

                <canvas ref={canvasRef} className="hidden" />
              </div>
            ) : (
              <div className="space-y-4">
                <Input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g., grilled chicken breast with rice and vegetables"
                  className="text-base"
                />
                <Button
                  onClick={handleAnalyze}
                  disabled={!description.trim() || analyzeMutation.isPending}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                >
                  {analyzeMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    "Analyze Food"
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Analysis Results */}
        {analysisResult && (
          <Card>
            <CardHeader>
              <CardTitle>Analysis Results</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-purple-50 rounded-lg p-4">
                <h3 className="font-bold text-lg text-purple-900">
                  {analysisResult.foodName}
                </h3>
                <p className="text-purple-700">
                  {analysisResult.estimatedServingSize}
                </p>
                <div className="text-2xl font-bold text-purple-800 mt-2">
                  {analysisResult.calories} calories
                </div>
                {analysisResult.confidence && (
                  <div className="text-sm text-purple-600 mt-1">
                    Confidence: {Math.round(analysisResult.confidence * 100)}%
                  </div>
                )}
              </div>

              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-sm text-gray-600">Protein</div>
                  <div className="font-bold text-blue-600">
                    {Math.round(analysisResult.proteinG)}g
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-sm text-gray-600">Carbs</div>
                  <div className="font-bold text-orange-600">
                    {Math.round(analysisResult.carbsG)}g
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-sm text-gray-600">Fat</div>
                  <div className="font-bold text-green-600">
                    {Math.round(analysisResult.fatG)}g
                  </div>
                </div>
              </div>

              {/* Additional nutritional information if available */}
              {analysisResult.additionalNutrition && (
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900">Additional Nutrition</h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    {analysisResult.additionalNutrition.fiber && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Fiber:</span>
                        <span className="font-medium">{analysisResult.additionalNutrition.fiber}g</span>
                      </div>
                    )}
                    {analysisResult.additionalNutrition.sugar && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Sugar:</span>
                        <span className="font-medium">{analysisResult.additionalNutrition.sugar}g</span>
                      </div>
                    )}
                    {analysisResult.additionalNutrition.sodium && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Sodium:</span>
                        <span className="font-medium">{analysisResult.additionalNutrition.sodium}mg</span>
                      </div>
                    )}
                    {analysisResult.additionalNutrition.cholesterol && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Cholesterol:</span>
                        <span className="font-medium">{analysisResult.additionalNutrition.cholesterol}mg</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Vitamins and Minerals if available */}
              {analysisResult.vitaminsAndMinerals && (
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900">Key Vitamins & Minerals</h4>
                  <div className="grid grid-cols-1 gap-2 text-sm">
                    {Object.entries(analysisResult.vitaminsAndMinerals).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span>
                        <span className="font-medium">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Meal Type
                </label>
                <Select value={mealType} onValueChange={(value: any) => setMealType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="breakfast">Breakfast</SelectItem>
                    <SelectItem value="lunch">Lunch</SelectItem>
                    <SelectItem value="dinner">Dinner</SelectItem>
                    <SelectItem value="snack">Snack</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={handleLogFood}
                disabled={logFoodMutation.isPending}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                {logFoodMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Logging...
                  </>
                ) : (
                  "Log Food"
                )}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
