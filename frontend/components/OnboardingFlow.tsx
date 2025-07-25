import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { userApi } from "../lib/api";
import WelcomeScreens from "./onboarding/WelcomeScreens";
import PlanCreation from "./onboarding/PlanCreation";

export default function OnboardingFlow() {
  const { user } = useAuth();

  // Check if user has existing profile when signed in
  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: () => userApi.getProfile(),
    enabled: !!user,
  });

  // Show loading while checking profile
  if (user && isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  // If user is signed in, check if profile is complete
  if (user && profile) {
    const isProfileComplete = checkProfileCompletion(profile.profile);
    
    if (isProfileComplete) {
      // Profile is complete, redirect to main app
      return <Navigate to="/app" replace />;
    } else {
      // Profile is incomplete, show plan creation
      return (
        <Routes>
          <Route path="/*" element={<PlanCreation />} />
        </Routes>
      );
    }
  }

  // If user is not signed in, show welcome screens
  return (
    <Routes>
      <Route path="/*" element={<WelcomeScreens />} />
    </Routes>
  );
}

// Function to check if all 8 steps of profile setup are completed
function checkProfileCompletion(profile: any): boolean {
  // Check all 8 required fields for profile completion
  const requiredFields = [
    profile.gender,           // Step 1: Gender
    profile.height_cm,        // Step 2: Height
    profile.birth_date,       // Step 3: Birth Date
    profile.current_weight_kg, // Step 4: Current Weight
    profile.activity_level,   // Step 5: Activity Level
    profile.plan_type,        // Step 6: Plan Selection
    profile.target_weight_kg, // Step 7: Target Weight
    profile.daily_calorie_target // Step 8: Plan Summary (calculated)
  ];

  // All fields must be present and not null
  return requiredFields.every(field => field !== null && field !== undefined);
}
