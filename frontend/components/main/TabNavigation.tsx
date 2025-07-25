import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Home, MessageCircle, User } from "lucide-react";

const tabs = [
  { id: "dashboard", label: "Home", icon: Home, path: "/app/dashboard" },
  { id: "coach", label: "Health Coach", icon: MessageCircle, path: "/app/coach" },
  { id: "profile", label: "Me", icon: User, path: "/app/profile" },
];

export default function TabNavigation() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-area-pb">
      <div className="flex">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = location.pathname === tab.path;
          
          return (
            <button
              key={tab.id}
              onClick={() => navigate(tab.path)}
              className={`flex-1 py-3 px-2 flex flex-col items-center space-y-1 transition-colors ${
                isActive
                  ? "text-purple-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Icon className="w-6 h-6" />
              <span className="text-xs font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
