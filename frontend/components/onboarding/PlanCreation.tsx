import React, { useState } from "react";
import { Routes, Route, useNavigate, Navigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "../../contexts/AuthContext";
import { userApi } from "../../lib/api";
import { useToast } from "@/components/ui/use-toast";
import GenderSelection from "./plan/GenderSelection";
import HeightInput from "./plan/HeightInput";
import BirthDateInput from "./plan/BirthDateInput";
import WeightInput from "./plan/WeightInput";
import ActivityLevel from "./plan/ActivityLevel";
import PlanSelection from "./plan/PlanSelection";
import TargetWeight from "./plan/TargetWeight";
import PlanSummary from "./plan/PlanSummary";

export interface PlanData {
  gender?: "male" | "female";
  heightCm?: number;
  birthDate?: Date;
  currentWeightKg?: number;
  targetWeightKg?: number;
  activityLevel?: "sedentary" | "low_active" | "active" | "very_active";
  planType?: "steady" | "intensive" | "accelerated";
}

export default function PlanCreation() {
  const [planData, setPlanData] = useState<PlanData>({});
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  // Check if user has existing profile
  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: () => userApi.getProfile(),
    enabled: !!user,
  });

  // Pre-populate form with existing profile data
  React.useEffect(() => {
    if (profile?.profile) {
      const existingProfile = profile.profile;
      setPlanData({
        gender: existingProfile.gender || undefined,
        heightCm: existingProfile.height_cm || undefined,
        birthDate: existingProfile.birth_date ? new Date(existingProfile.birth_date) : undefined,
        currentWeightKg: existingProfile.current_weight_kg || undefined,
        targetWeightKg: existingProfile.target_weight_kg || undefined,
        activityLevel: existingProfile.activity_level || undefined,
        planType: existingProfile.plan_type || undefined,
      });
    }
  }, [profile]);

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: (data: PlanData) => userApi.updateProfile({
      gender: data.gender,
      heightCm: data.heightCm,
      birthDate: data.birthDate?.toISOString().split('T')[0],
      currentWeightKg: data.currentWeightKg,
      targetWeightKg: data.targetWeightKg,
      activityLevel: data.activityLevel,
      planType: data.planType,
    }),
    onSuccess: () => {
      navigate("/app");
    },
    onError: (error: any) => {
      console.error("Update profile error:", error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    }
  });

  const updatePlanData = (updates: Partial<PlanData>) => {
    setPlanData(prev => ({ ...prev, ...updates }));
  };

  const handleComplete = () => {
    updateProfileMutation.mutate(planData);
  };

  // Determine the starting step based on completed profile data
  const getStartingStep = () => {
    if (!planData.gender) return "/onboarding/gender";
    if (!planData.heightCm) return "/onboarding/height";
    if (!planData.birthDate) return "/onboarding/birth-date";
    if (!planData.currentWeightKg) return "/onboarding/weight";
    if (!planData.activityLevel) return "/onboarding/activity";
    if (!planData.planType) return "/onboarding/plan";
    if (!planData.targetWeightKg) return "/onboarding/target";
    return "/onboarding/summary";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      <Routes>
        <Route path="/" element={<Navigate to={getStartingStep()} replace />} />
        <Route 
          path="/gender" 
          element={
            <GenderSelection 
              value={planData.gender} 
              onChange={(gender) => updatePlanData({ gender })}
            />
          } 
        />
        <Route 
          path="/height" 
          element={
            <HeightInput 
              value={planData.heightCm} 
              onChange={(heightCm) => updatePlanData({ heightCm })}
            />
          } 
        />
        <Route 
          path="/birth-date" 
          element={
            <BirthDateInput 
              value={planData.birthDate} 
              onChange={(birthDate) => updatePlanData({ birthDate })}
            />
          } 
        />
        <Route 
          path="/weight" 
          element={
            <WeightInput 
              value={planData.currentWeightKg} 
              onChange={(currentWeightKg) => updatePlanData({ currentWeightKg })}
            />
          } 
        />
        <Route 
          path="/activity" 
          element={
            <ActivityLevel 
              value={planData.activityLevel} 
              onChange={(activityLevel) => updatePlanData({ activityLevel })}
            />
          } 
        />
        <Route 
          path="/plan" 
          element={
            <PlanSelection 
              value={planData.planType} 
              onChange={(planType) => updatePlanData({ planType })}
              currentWeight={planData.currentWeightKg}
            />
          } 
        />
        <Route 
          path="/target" 
          element={
            <TargetWeight 
              currentWeight={planData.currentWeightKg}
              value={planData.targetWeightKg} 
              onChange={(targetWeightKg) => updatePlanData({ targetWeightKg })}
            />
          } 
        />
        <Route 
          path="/summary" 
          element={
            <PlanSummary 
              planData={planData}
              onComplete={handleComplete}
              isLoading={updateProfileMutation.isPending}
            />
          } 
        />
      </Routes>
    </div>
  );
}
