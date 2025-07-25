import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import TabNavigation from "./main/TabNavigation";
import Dashboard from "./main/Dashboard";
import HealthCoach from "./main/HealthCoach";
import Profile from "./main/Profile";
import FoodLogger from "./main/FoodLogger";

export default function MainApp() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        <Route path="/" element={<Navigate to="/app/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/coach" element={<HealthCoach />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/food-logger" element={<FoodLogger />} />
      </Routes>
      <TabNavigation />
    </div>
  );
}
