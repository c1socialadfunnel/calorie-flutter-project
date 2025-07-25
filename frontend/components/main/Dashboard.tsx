import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Camera, Plus, CheckCircle, Crown } from "lucide-react";
import { userApi, foodApi } from "../../lib/api";
import { useToast } from "@/components/ui/use-toast";

export default function Dashboard() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const today = new Date().toISOString().split('T')[0];

  // Check for successful payment
  React.useEffect(() => {
    if (searchParams.get('success') === 'true') {
      toast({
        title: "Welcome to Calorie.Help!",
        description: "Your subscription is now active. Let's start your health journey!",
      });
      // Remove the success parameter from URL
      navigate('/app/dashboard', { replace: true });
    }
  }, [searchParams, navigate, toast]);

  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: () => userApi.getProfile(),
  });

  const { data: subscription } = useQuery({
    queryKey: ["subscription"],
    queryFn: () => userApi.getSubscriptionStatus(),
  });

  const { data: nutrition } = useQuery({
    queryKey: ["nutrition", today],
    queryFn: () => foodApi.getDailyNutrition(today),
  });

  const targetCalories = profile?.profile.daily_calorie_target || 2000;
  const consumedCalories = nutrition?.totalCalories || 0;
  const remainingCalories = Math.max(0, targetCalories - consumedCalories);
  const progressPercentage = Math.min(100, (consumedCalories / targetCalories) * 100);

  const deficit = targetCalories < 2000 ? 2000 - targetCalories : 500; // Simplified calculation

  const isSubscriptionActive = subscription?.subscription_status === 'active';

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-white shadow-sm">
        <div className="px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Today's Progress</h1>
              <p className="text-gray-600">Keep up the great work!</p>
            </div>
            {subscription && (
              <Badge 
                className={
                  isSubscriptionActive 
                    ? "bg-green-100 text-green-800" 
                    : "bg-yellow-100 text-yellow-800"
                }
              >
                {isSubscriptionActive ? "Pro" : subscription.subscription_status}
              </Badge>
            )}
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Subscription Notice */}
        {!isSubscriptionActive && (
          <Card className="border-purple-200 bg-purple-50">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <Crown className="w-5 h-5 text-purple-600" />
                <div className="flex-1">
                  <div className="font-medium text-purple-900">
                    Upgrade to unlock all features
                  </div>
                  <div className="text-sm text-purple-700">
                    Get AI food analysis, unlimited coach chat, and more
                  </div>
                </div>
                <Button 
                  size="sm" 
                  className="bg-purple-600 hover:bg-purple-700"
                  onClick={() => navigate("/onboarding/plan")}
                >
                  Upgrade
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Calorie Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Daily Calories</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">
                {consumedCalories}
              </div>
              <div className="text-sm text-gray-600">
                of {targetCalories} calories
              </div>
              <div className="text-sm text-purple-600 font-medium">
                -{deficit} kcal deficit
              </div>
            </div>
            
            <Progress value={progressPercentage} className="h-3" />
            
            <div className="text-center text-sm text-gray-600">
              {remainingCalories > 0 
                ? `${remainingCalories} calories remaining`
                : `${Math.abs(remainingCalories)} calories over target`
              }
            </div>
          </CardContent>
        </Card>

        {/* Macro Split */}
        {nutrition && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Macros</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-sm text-gray-600">Carbs</div>
                  <div className="text-lg font-bold text-orange-600">
                    {Math.round(nutrition.totalCarbsG)}g
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Protein</div>
                  <div className="text-lg font-bold text-blue-600">
                    {Math.round(nutrition.totalProteinG)}g
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Fat</div>
                  <div className="text-lg font-bold text-green-600">
                    {Math.round(nutrition.totalFatG)}g
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Motivation */}
        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="p-4">
            <div className="text-center text-purple-700">
              <div className="text-sm font-medium">
                Eating {deficit} kcal less = lose{' '}
                {profile?.profile.plan_type === 'steady' ? '1.0' : 
                 profile?.profile.plan_type === 'intensive' ? '2.0' : '1.5'} lb weekly
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="space-y-3">
          <Button
            onClick={() => navigate("/app/food-logger")}
            className="w-full bg-purple-600 hover:bg-purple-700 py-4"
            disabled={!isSubscriptionActive}
          >
            <Camera className="w-5 h-5 mr-2" />
            {isSubscriptionActive ? "AI Calorie Count" : "AI Calorie Count (Pro)"}
          </Button>
          
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              onClick={() => navigate("/app/food-logger")}
              className="py-3"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Food
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate("/app/coach")}
              className="py-3"
              disabled={!isSubscriptionActive}
            >
              {isSubscriptionActive ? "Ask Coach" : "Ask Coach (Pro)"}
            </Button>
          </div>
        </div>

        {/* Recent Meals */}
        {nutrition && nutrition.totalCalories > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Today's Meals</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {Object.entries(nutrition.meals).map(([mealType, meals]) => {
                if (meals.length === 0) return null;
                
                const mealCalories = meals.reduce((sum, meal) => sum + meal.calories, 0);
                
                return (
                  <div key={mealType} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                    <div>
                      <div className="font-medium capitalize">{mealType}</div>
                      <div className="text-sm text-gray-600">
                        {meals.length} item{meals.length > 1 ? 's' : ''}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{mealCalories} cal</div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
