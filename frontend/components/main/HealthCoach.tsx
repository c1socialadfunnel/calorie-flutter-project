import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Send, Camera, Utensils, Activity, ChefHat, Info, Zap, Target } from "lucide-react";
import { coachApi } from "../../lib/api";
import { useToast } from "@/components/ui/use-toast";

const quickSuggestions = [
  { text: "Food calories from photos or text", icon: Camera },
  { text: "Meal ideas for your daily targets", icon: Utensils },
  { text: "Patterns in your nutrition habits", icon: Target },
  { text: "Healthier swaps for favorite foods", icon: ChefHat },
  { text: "Info on specialty or restaurant items", icon: Info },
  { text: "Exercise needed to burn calories", icon: Activity },
  { text: "Quick recipes with your macros", icon: Zap },
  { text: "Activity plans matching your diet", icon: Target },
];

export default function HealthCoach() {
  const [message, setMessage] = useState("");
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: chatHistory } = useQuery({
    queryKey: ["chatHistory"],
    queryFn: () => coachApi.getChatHistory(),
  });

  const { data: currentSession } = useQuery({
    queryKey: ["sessionMessages", currentSessionId],
    queryFn: () => coachApi.getSessionMessages(currentSessionId!),
    enabled: !!currentSessionId,
  });

  const sendMessageMutation = useMutation({
    mutationFn: (data: { sessionId?: string; message: string }) => 
      coachApi.sendMessage(data),
    onSuccess: (data) => {
      setCurrentSessionId(data.sessionId);
      setMessage("");
      queryClient.invalidateQueries({ queryKey: ["chatHistory"] });
      queryClient.invalidateQueries({ queryKey: ["sessionMessages", data.sessionId] });
    },
    onError: (error: any) => {
      console.error("Send message error:", error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    }
  });

  const handleSendMessage = (messageText: string) => {
    if (!messageText.trim()) return;
    
    sendMessageMutation.mutate({
      sessionId: currentSessionId || undefined,
      message: messageText.trim()
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(message);
  };

  const messages = currentSession?.messages || [];

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-white shadow-sm">
        <div className="px-4 py-6">
          <h1 className="text-2xl font-bold text-gray-900">Health Coach</h1>
          <p className="text-gray-600">Your 24/7 AI nutrition assistant</p>
        </div>
      </div>

      <div className="flex flex-col h-[calc(100vh-140px)]">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="space-y-4">
              <Card className="bg-purple-50 border-purple-200">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">AI</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-purple-800">
                        Hi! I'm your personal nutrition coach. I can help you with calorie counting, 
                        meal planning, nutrition advice, and keeping you motivated. What can I help you with today?
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">Quick suggestions:</h3>
                <div className="grid grid-cols-1 gap-2">
                  {quickSuggestions.map((suggestion, index) => {
                    const Icon = suggestion.icon;
                    return (
                      <Button
                        key={index}
                        variant="outline"
                        onClick={() => handleSendMessage(suggestion.text)}
                        className="justify-start h-auto p-3 text-left"
                        disabled={sendMessageMutation.isPending}
                      >
                        <Icon className="w-4 h-4 mr-3 text-purple-600" />
                        <span className="text-sm">{suggestion.text}</span>
                      </Button>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            messages.map((msg) => (
              <Card key={msg.id} className={msg.role === "user" ? "ml-8" : "mr-8"}>
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      msg.role === "user" 
                        ? "bg-gray-600" 
                        : "bg-purple-600"
                    }`}>
                      <span className="text-white text-sm font-bold">
                        {msg.role === "user" ? "U" : "AI"}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-800">{msg.content}</p>
                      <p className="text-xs text-gray-500 mt-2">
                        {new Date(msg.created_at).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Message Input */}
        <div className="p-4 bg-white border-t border-gray-200">
          <form onSubmit={handleSubmit} className="flex space-x-2">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ask me anything about nutrition..."
              className="flex-1"
              disabled={sendMessageMutation.isPending}
            />
            <Button
              type="submit"
              disabled={!message.trim() || sendMessageMutation.isPending}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
