import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Target, Zap, Rocket } from "lucide-react";

interface PlanSelectionProps {
  value?: "steady" | "intensive" | "accelerated";
  onChange: (planType: "steady" | "intensive" | "accelerated") => void;
  currentWeight?: number;
}

const plans = [
  {
    value: "steady" as const,
    icon: Target,
    title: "Steady",
    price: "$9.99/month",
    badge: "Most Popular",
    description: "Best combination of visible results and sustainable progress, with moderate effort required",
    weeklyLoss: "1 lb",
    dailyCut: "-500 kcal",
    duration: "39 weeks",
    targetDate: "April 23, 2026",
    color: "text-green-600",
    badgeColor: "bg-green-100 text-green-800"
  },
  {
    value: "intensive" as const,
    icon: Zap,
    title: "Intensive",
    price: "$14.99/month",
    description: "Challenge mode. Maximum results for those ready to commit to significant lifestyle changes",
    weeklyLoss: "2 lb",
    dailyCut: "-1000 kcal",
    duration: "20 weeks",
    targetDate: "December 11, 2025",
    color: "text-orange-600"
  },
  {
    value: "accelerated" as const,
    icon: Rocket,
    title: "Accelerated",
    price: "$19.99/month",
    description: "For the ambitious. Faster results and greater momentum, but requires more planning and dedication",
    weeklyLoss: "3+ lb",
    dailyCut: "-750 kcal",
    duration: "26 weeks",
    targetDate: "January 22, 2026",
    color: "text-purple-600"
  }
];

export default function PlanSelection({ value, onChange, currentWeight }: PlanSelectionProps) {
  const navigate = useNavigate();

  const handleNext = () => {
    if (value) {
      navigate("/onboarding/target");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-6 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => navigate("/onboarding/activity")}
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
              Select a Weight Loss Plan
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {plans.map((plan) => {
              const Icon = plan.icon;
              return (
                <button
                  key={plan.value}
                  onClick={() => onChange(plan.value)}
                  className={`w-full p-4 rounded-lg border-2 text-left transition-colors relative ${
                    value === plan.value
                      ? "border-purple-600 bg-purple-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  {plan.badge && (
                    <Badge className={`absolute top-2 right-2 ${plan.badgeColor}`}>
                      {plan.badge}
                    </Badge>
                  )}
                  
                  <div className="flex items-start space-x-3">
                    <Icon className={`w-6 h-6 mt-1 ${plan.color}`} />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-bold text-gray-900">{plan.title}</h3>
                        <span className="font-bold text-purple-600">{plan.price}</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{plan.description}</p>
                      
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-gray-500">Weekly Weight Loss:</span>
                          <div className="font-medium">{plan.weeklyLoss}</div>
                        </div>
                        <div>
                          <span className="text-gray-500">Daily Calorie Cut:</span>
                          <div className="font-medium">{plan.dailyCut}</div>
                        </div>
                        <div>
                          <span className="text-gray-500">Duration:</span>
                          <div className="font-medium">{plan.duration}</div>
                        </div>
                        <div>
                          <span className="text-gray-500">Target Date:</span>
                          <div className="font-medium">{plan.targetDate}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}

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
          <div className="w-8 h-1 bg-purple-600 rounded"></div>
          <div className="w-8 h-1 bg-gray-300 rounded"></div>
          <div className="w-8 h-1 bg-gray-300 rounded"></div>
        </div>
      </div>
    </div>
  );
}
