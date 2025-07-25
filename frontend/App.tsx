import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import OnboardingFlow from "./components/OnboardingFlow";
import MainApp from "./components/MainApp";
import AuthScreen from "./components/AuthScreen";

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <Routes>
              <Route path="/auth" element={<AuthScreen />} />
              <Route path="/onboarding/*" element={
                <ProtectedRoute>
                  <OnboardingFlow />
                </ProtectedRoute>
              } />
              <Route path="/app/*" element={
                <ProtectedRoute>
                  <MainApp />
                </ProtectedRoute>
              } />
              <Route path="/" element={<OnboardingFlow />} />
            </Routes>
          </div>
          <Toaster />
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}
