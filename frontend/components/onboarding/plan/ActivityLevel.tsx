import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Activity, Zap, Flame, Rocket } from "lucide-react";

interface ActivityLevelProps {
  value?: "sedentary" | "low_active" | "active" | "very_active";
  onChange: (activityLevel: "sedentary" | "low_active" | "active" | "very_active") => void;
}

const activityLevels = [
  {
    value: "sedentary" as const,
    icon: Activity,
    title: "Sedentary",
    description: "e.g., light walking, online tasks",
    color: "text-gray-600"
  },
  {
    value: "low_active" as const,
    icon: Zap,
    title: "Low Active",
    description: "Moderate daily activities",
    color: "text-blue-600"
  },
  {
    value: "active" as const,
    icon: Flame,
    title: "Active",
    description: "Regular exercise routine",
    color: "text-orange-600"
  },
  {
    value: "very_active" as const,
    icon: Rocket,
    title: "Very Active",
    description: "Intensive training regimen",
    color: "text-red-600"
  }
];

export default function ActivityLevel({ value, onChange }: ActivityLevelProps) {
  const navigate = useNavigate();

  const handleNext = () => {
    if (value) {
      navigate("/onboarding/plan");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-6 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => navigate("/onboarding/weight")}
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
              Select Your Daily Activity Level
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {activityLevels.map((level) => {
              const Icon = level.icon;
              return (
                <button
                  key={level.value}
                  onClick={() => onChange(level.value)}
                  className={`w-full p-4 rounded-lg border-2 text-left transition-colors ${
                    value === level.value
                      ? "border-purple-600 bg-purple-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={`w-6 h-6 ${level.color}`} />
                    <div>
                      <div className="font-medium text-gray-900">{level.title}</div>
                      <div className="text-sm text-gray-600">{level.description}</div>
                    </div>
                  </div>
                </button>
              );
            })}

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <div className="text-sm text-blue-800">
                <div className="font-medium mb-1">• Typical Daily Activities</div>
                <div className="text-blue-600">e.g., light walking, online tasks</div>
              </div>
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
          <div className="w-8 h-1 bg-purple-600 rounded"></div>
          <div className="w-8 h-1 bg-purple-600 rounded"></div>
          <div className="w-8 h-1 bg-purple-600 rounded"></div>
          <div className="w-8 h-1 bg-purple-600 rounded"></div>
          <div className="w-8 h-1 bg-gray-300 rounded"></div>
          <div className="w-8 h-1 bg-gray-300 rounded"></div>
          <div className="w-8 h-1 bg-gray-300 rounded"></div>
        </div>
      </div>
    </div>
  );
}
