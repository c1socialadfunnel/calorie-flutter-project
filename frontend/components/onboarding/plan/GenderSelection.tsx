import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, User } from "lucide-react";

interface GenderSelectionProps {
  value?: "male" | "female";
  onChange: (gender: "male" | "female") => void;
}

export default function GenderSelection({ value, onChange }: GenderSelectionProps) {
  const navigate = useNavigate();

  const handleNext = () => {
    if (value) {
      navigate("/onboarding/height");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-6 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => navigate("/auth")}
            className="text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="text-sm text-purple-600 font-medium">
            Create My Plan
          </div>
        </div>

        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-gray-900">
              Select Your Gender
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <button
                onClick={() => onChange("male")}
                className={`w-full p-4 rounded-lg border-2 text-left transition-colors ${
                  value === "male"
                    ? "border-purple-600 bg-purple-50 text-purple-700"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="font-medium">Male</div>
              </button>
              <button
                onClick={() => onChange("female")}
                className={`w-full p-4 rounded-lg border-2 text-left transition-colors ${
                  value === "female"
                    ? "border-purple-600 bg-purple-50 text-purple-700"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="font-medium">Female</div>
              </button>
            </div>

            <Button
              onClick={handleNext}
              disabled={!value}
              className="w-full bg-purple-600 hover:bg-purple-700 mt-6"
            >
              Continue
            </Button>
          </CardContent>
        </Card>

        {/* Progress indicator */}
        <div className="flex justify-center mt-6 space-x-2">
          <div className="w-8 h-1 bg-purple-600 rounded"></div>
          <div className="w-8 h-1 bg-gray-300 rounded"></div>
          <div className="w-8 h-1 bg-gray-300 rounded"></div>
          <div className="w-8 h-1 bg-gray-300 rounded"></div>
          <div className="w-8 h-1 bg-gray-300 rounded"></div>
          <div className="w-8 h-1 bg-gray-300 rounded"></div>
          <div className="w-8 h-1 bg-gray-300 rounded"></div>
          <div className="w-8 h-1 bg-gray-300 rounded"></div>
        </div>
      </div>
    </div>
  );
}
