import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Weight } from "lucide-react";

interface WeightInputProps {
  value?: number;
  onChange: (weightKg: number) => void;
}

export default function WeightInput({ value, onChange }: WeightInputProps) {
  const [unit, setUnit] = useState<"metric" | "imperial">("imperial");
  const [lbs, setLbs] = useState(value ? Math.round(value * 2.20462) : 150);
  const [kg, setKg] = useState(value || 68);
  const navigate = useNavigate();

  const handleNext = () => {
    const weightKg = unit === "metric" ? kg : Math.round(lbs / 2.20462 * 10) / 10;
    onChange(weightKg);
    navigate("/onboarding/activity");
  };

  const isValid = unit === "metric" ? kg >= 30 && kg <= 300 : lbs >= 66 && lbs <= 660;

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-6 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => navigate("/onboarding/birth-date")}
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
              Select Your Current Weight
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
                lbs
              </button>
              <button
                onClick={() => setUnit("metric")}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  unit === "metric"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600"
                }`}
              >
                kg
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Weight ({unit === "metric" ? "kg" : "lbs"})
              </label>
              <Input
                type="number"
                value={unit === "metric" ? kg : lbs}
                onChange={(e) => {
                  const value = parseFloat(e.target.value) || 0;
                  if (unit === "metric") {
                    setKg(value);
                  } else {
                    setLbs(value);
                  }
                }}
                step="0.1"
                min={unit === "metric" ? "30" : "66"}
                max={unit === "metric" ? "300" : "660"}
                className="text-center text-lg"
              />
            </div>

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
          <div className="w-8 h-1 bg-purple-600 rounded"></div>
          <div className="w-8 h-1 bg-purple-600 rounded"></div>
          <div className="w-8 h-1 bg-gray-300 rounded"></div>
          <div className="w-8 h-1 bg-gray-300 rounded"></div>
          <div className="w-8 h-1 bg-gray-300 rounded"></div>
          <div className="w-8 h-1 bg-gray-300 rounded"></div>
        </div>
      </div>
    </div>
  );
}
