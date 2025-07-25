import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Ruler } from "lucide-react";

interface HeightInputProps {
  value?: number;
  onChange: (heightCm: number) => void;
}

export default function HeightInput({ value, onChange }: HeightInputProps) {
  const [unit, setUnit] = useState<"metric" | "imperial">("imperial");
  const [feet, setFeet] = useState(value ? Math.floor(value / 30.48) : 5);
  const [inches, setInches] = useState(value ? Math.round((value / 2.54) % 12) : 8);
  const [cm, setCm] = useState(value || 173);
  const navigate = useNavigate();

  const handleNext = () => {
    const heightCm = unit === "metric" ? cm : Math.round(feet * 30.48 + inches * 2.54);
    onChange(heightCm);
    navigate("/onboarding/birth-date");
  };

  const isValid = unit === "metric" ? cm >= 120 && cm <= 250 : feet >= 4 && feet <= 8;

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-6 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => navigate("/onboarding/gender")}
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
              Select Your Height
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setUnit("imperial")}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  unit === "imperial"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600"
                }`}
              >
                ft/in
              </button>
              <button
                onClick={() => setUnit("metric")}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  unit === "metric"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600"
                }`}
              >
                cm
              </button>
            </div>

            {unit === "imperial" ? (
              <div className="flex space-x-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Feet
                  </label>
                  <Input
                    type="number"
                    value={feet}
                    onChange={(e) => setFeet(parseInt(e.target.value) || 0)}
                    min="4"
                    max="8"
                    className="text-center"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Inches
                  </label>
                  <Input
                    type="number"
                    value={inches}
                    onChange={(e) => setInches(parseInt(e.target.value) || 0)}
                    min="0"
                    max="11"
                    className="text-center"
                  />
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Centimeters
                </label>
                <Input
                  type="number"
                  value={cm}
                  onChange={(e) => setCm(parseInt(e.target.value) || 0)}
                  min="120"
                  max="250"
                  className="text-center"
                />
              </div>
            )}

            <Button
              onClick={handleNext}
              disabled={!isValid}
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              Continue
            </Button>
          </CardContent>
        </Card>

        {/* Progress indicator */}
        <div className="flex justify-center mt-6 space-x-2">
          <div className="w-8 h-1 bg-purple-600 rounded"></div>
          <div className="w-8 h-1 bg-purple-600 rounded"></div>
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
