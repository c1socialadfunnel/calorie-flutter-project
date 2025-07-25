import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, CheckCircle, CreditCard } from "lucide-react";
import { PlanData } from "../PlanCreation";
import { stripeApi } from "../../../lib/stripe";
import { useToast } from "@/components/ui/use-toast";

interface PlanSummaryProps {
  planData: PlanData;
  onComplete: () => void;
  isLoading: boolean;
}

export default function PlanSummary({ planData, onComplete, isLoading }: PlanSummaryProps) {
  const navigate = useNavigate();
  const { toast } = useToast();

  // Calculate estimated daily calories (simplified calculation)
  const calculateDailyCalories = () => {
    if (!planData.currentWeightKg || !planData.heightCm || !planData.activityLevel || !planData.planType || !planData.gender) {
      return 2000; // Default
    }

    // Basic BMR calculation
    const age = 30; // Simplified
    let bmr: number;
    
    if (planData.gender === "male") {
      bmr = 10 * planData.currentWeightKg + 6.25 * planData.heightCm - 5 * age + 5;
    } else {
      bmr = 10 * planData.currentWeightKg + 6.25 * planData.heightCm - 5 * age - 161;
    }

    const activityMultipliers = {
      sedentary: 1.2,
      low_active: 1.375,
      active: 1.55,
      very_active: 1.725
    };

    const tdee = bmr * activityMultipliers[planData.activityLevel];

    const planDeficits = {
      steady: 500,
      intensive: 1000,
      accelerated: 750
    };

    const deficit = planDeficits[planData.planType];
    return Math.round(tdee - deficit);
  };

  const dailyCalories = calculateDailyCalories();
  const weightLoss = planData.currentWeightKg && planData.targetWeightKg 
    ? (planData.currentWeightKg - planData.targetWeightKg).toFixed(1)
    : "0";

  const deficit = planData.planType === 'steady' ? 500 : planData.planType === 'intensive' ? 1000 : 750;
  const weeklyLoss = planData.planType === 'steady' ? '1.0' : planData.planType === 'intensive' ? '2.0' : '1.5';

  const planPrices = {
    steady: '$9.99/month',
    intensive: '$14.99/month',
    accelerated: '$19.99/month'
  };

  const handleStartPlan = async () => {
    if (!planData.planType) {
      toast({
        title: "Error",
        description: "Please select a plan type",
        variant: "destructive",
      });
      return;
    }

    try {
      // First update the profile with the plan data
      await onComplete();

      // Then redirect to Stripe checkout
      const checkoutSession = await stripeApi.createCheckoutSession({
        planType: planData.planType,
        successUrl: `${window.location.origin}/app/dashboard?success=true`,
        cancelUrl: `${window.location.origin}/onboarding/summary`
      });

      // Redirect to Stripe checkout
      window.location.href = checkoutSession.url;
    } catch (error: any) {
      console.error("Checkout error:", error);
      toast({
        title: "Error",
        description: "Failed to start checkout process",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-6 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => navigate("/onboarding/target")}
            className="text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="text-sm text-purple-600 font-medium">
            Your Plan
          </div>
        </div>

        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-gray-900">
              Daily Intake
            </CardTitle>
            <div className="text-4xl font-bold text-purple-600 mt-2">
              {dailyCalories} <span className="text-lg text-gray-600">kcal</span>
            </div>
            <div className="text-sm text-gray-600">
              Daily Need {dailyCalories + deficit} kcal <span className="text-purple-600">-{deficit}kcal</span>
            </div>
            <div className="text-sm text-purple-700 mt-2">
              Eating {deficit} kcal less = lose {weeklyLoss} lb weekly
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Macro Split</h3>
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-400 to-blue-400 flex items-center justify-center">
                  <div className="text-white text-xs font-bold">45%</div>
                </div>
                <div className="flex-1 grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-sm text-gray-600">Carb</div>
                    <div className="font-bold text-gray-900">{Math.round(dailyCalories * 0.45 / 4)}g</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Protein</div>
                    <div className="font-bold text-gray-900">{Math.round(dailyCalories * 0.25 / 4)}g</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Fat</div>
                    <div className="font-bold text-gray-900">{Math.round(dailyCalories * 0.30 / 9)}g</div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Progress Timeline</h3>
              <div className="text-sm text-gray-600 mb-2">
                You'll reach {planData.targetWeightKg ? Math.round(planData.targetWeightKg) : 0} kg on{' '}
                <span className="font-medium text-purple-600">
                  {planData.planType === 'steady' ? 'Apr 23' : 
                   planData.planType === 'intensive' ? 'Dec 11' : 'Jan 22'}
                </span>
              </div>
              <div className="relative">
                <div className="h-2 bg-gray-200 rounded-full">
                  <div className="h-2 bg-purple-600 rounded-full w-1/12"></div>
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Start</span>
                  <span>
                    {planData.planType === 'steady' ? 'Apr 23' : 
                     planData.planType === 'intensive' ? 'Dec 11' : 'Jan 22'}
                  </span>
                </div>
                <div className="absolute right-0 -top-8 bg-purple-600 text-white text-xs px-2 py-1 rounded">
                  {planData.targetWeightKg ? Math.round(planData.targetWeightKg) : 0}kg
                </div>
              </div>
            </div>

            {/* Subscription Info */}
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-purple-900">
                  {planData.planType === 'steady' ? 'Steady Plan' : 
                   planData.planType === 'intensive' ? 'Intensive Plan' : 'Accelerated Plan'}
                </h4>
                <span className="font-bold text-purple-600">
                  {planData.planType ? planPrices[planData.planType] : '$9.99/month'}
                </span>
              </div>
              <div className="text-sm text-purple-700 space-y-1">
                <div>✓ AI-powered food analysis</div>
                <div>✓ 24/7 nutrition coach</div>
                <div>✓ Progress tracking & analytics</div>
                <div>✓ Personalized meal recommendations</div>
              </div>
            </div>

            <Button
              onClick={handleStartPlan}
              disabled={isLoading}
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              {isLoading ? (
                "Creating Plan..."
              ) : (
                <>
                  <CreditCard className="w-4 h-4 mr-2" />
                  Start Plan & Subscribe
                </>
              )}
            </Button>

            <div className="text-xs text-gray-500 text-center">
              You'll be redirected to secure payment processing. Cancel anytime.
            </div>
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
          <div className="w-8 h-1 bg-purple-600 rounded"></div>
        </div>
      </div>
    </div>
  );
}
