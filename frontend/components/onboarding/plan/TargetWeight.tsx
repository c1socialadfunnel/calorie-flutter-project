import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Target } from "lucide-react";

interface TargetWeightProps {
  currentWeight?: number;
  value?: number;
  onChange: (targetWeight: number) => void;
}

export default function TargetWeight({ currentWeight, value, onChange }: TargetWeightProps) {
  const [unit, setUnit] = useState<"metric" | "imperial">("imperial");
  const [lbs, setLbs] = useState(value ? Math.round(value * 2.20462) : currentWeight ? Math.round(currentWeight * 2.20462) - 20 : 130);
  const [kg, setKg] = useState(value || (currentWeight ? currentWeight - 9 : 59));
  const navigate = useNavigate();

  const currentWeightDisplay = currentWeight ? (unit === "metric" ? Math.round(currentWeight) : Math.round(currentWeight * 2.20462)) : 0;
  const targetWeightDisplay = unit === "metric" ? kg : lbs;
  const weightLoss = currentWeightDisplay - targetWeightDisplay;

  const handleNext = () => {
    const targetWeightKg = unit === "metric" ? kg : Math.round(lbs / 2.20462 * 10) / 10;
    onChange(targetWeightKg);
    navigate("/onboarding/summary");
  };

  const isValid = currentWeight && targetWeightDisplay < currentWeightDisplay && targetWeightDisplay > 0;

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-6 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => navigate("/onboarding/plan")}
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
              Set Your Target Weight
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {currentWeight && (
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600">Your Healthy Weight:</div>
                <div className="text-lg font-bold text-gray-900">
                  {unit === "metric" 
                    ? `${Math.round(currentWeight - 15)}.7-${Math.round(currentWeight - 5)}.4lbs`
                    : `${Math.round((currentWeight - 15) * 2.20462)}.7-${Math.round((currentWeight - 5) * 2.20462)}.4lbs`
                  }
                </div>
              </div>
            )}

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

            <div className="text-center">
              <div className="text-6xl font-bold text-gray-900 mb-2">
                {targetWeightDisplay}
              </div>
              <div className="text-lg text-gray-600">
                {unit === "metric" ? "kg" : "lbs"}
              </div>
            </div>

            {currentWeight && (
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-center">
                  <div className="text-sm text-gray-600">Weight to lose</div>
                  <div className="text-2xl font-bold text-purple-600">
                    {weightLoss > 0 ? weightLoss.toFixed(1) : 0} {unit === "metric" ? "kg" : "lbs"}
                  </div>
                </div>
              </div>
            )}

            <div className="flex space-x-4">
              <Button
                variant="outline"
                onClick={() => {
                  if (unit === "metric") {
                    setKg(Math.max(30, kg - 1));
                  } else {
                    setLbs(Math.max(66, lbs - 1));
                  }
                }}
                className="flex-1"
              >
                -
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  if (unit === "metric") {
                    setKg(Math.min(300, kg + 1));
                  } else {
                    setLbs(Math.min(660, lbs + 1));
                  }
                }}
                className="flex-1"
              >
                +
              </Button>
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
          <div className="w-8 h-1 bg-purple-600 rounded"></div>
          <div className="w-8 h-1 bg-purple-600 rounded"></div>
          <div className="w-8 h-1 bg-purple-600 rounded"></div>
          <div className="w-8 h-1 bg-gray-300 rounded"></div>
        </div>
      </div>
    </div>
  );
}
