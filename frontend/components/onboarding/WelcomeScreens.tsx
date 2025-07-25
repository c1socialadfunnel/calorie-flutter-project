import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChefHat, Camera, MessageCircle } from "lucide-react";

const screens = [
  {
    icon: ChefHat,
    title: "Smart Meal Planning",
    subtitle: "Know exactly what to eat next to reach your goals",
    image: "/api/placeholder/300/200"
  },
  {
    icon: Camera,
    title: "Snap & AI Analysis",
    subtitle: "No more manual logging—just take a photo",
    image: "/api/placeholder/300/200"
  },
  {
    icon: MessageCircle,
    title: "Your 24/7 AI Coach",
    subtitle: "Like having a nutritionist in your pocket",
    image: "/api/placeholder/300/200"
  }
];

export default function WelcomeScreens() {
  const [currentScreen, setCurrentScreen] = useState(0);
  const navigate = useNavigate();

  const handleNext = () => {
    if (currentScreen < screens.length - 1) {
      setCurrentScreen(currentScreen + 1);
    } else {
      navigate("/auth");
    }
  };

  const screen = screens[currentScreen];
  const Icon = screen.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardContent className="p-8 text-center">
          <div className="mb-8">
            <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Icon className="w-10 h-10 text-purple-600" />
            </div>
            <div className="w-full h-48 bg-gray-100 rounded-lg mb-6 flex items-center justify-center">
              <span className="text-gray-400">Feature Preview</span>
            </div>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            {screen.title}
          </h1>
          <p className="text-gray-600 mb-8 leading-relaxed">
            {screen.subtitle}
          </p>

          <div className="flex justify-center mb-8">
            {screens.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full mx-1 ${
                  index === currentScreen ? "bg-purple-600" : "bg-gray-300"
                }`}
              />
            ))}
          </div>

          <Button
            onClick={handleNext}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3"
          >
            {currentScreen === screens.length - 1 ? "Create My Plan" : "Continue"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
