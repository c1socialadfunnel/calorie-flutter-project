import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Loader2, CreditCard } from "lucide-react";
import { userApi } from "../../lib/api";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";

interface DeleteAccountDialogProps {
  open: boolean;
  onClose: () => void;
  hasActiveSubscription: boolean;
  onManageBilling: () => void;
}

export default function DeleteAccountDialog({ 
  open, 
  onClose, 
  hasActiveSubscription, 
  onManageBilling 
}: DeleteAccountDialogProps) {
  const [confirmText, setConfirmText] = useState("");
  const [step, setStep] = useState<"warning" | "confirm">("warning");
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { toast } = useToast();

  const deleteAccountMutation = useMutation({
    mutationFn: () => userApi.deleteAccount(),
    onSuccess: async () => {
      toast({
        title: "Account Deleted",
        description: "Your account has been permanently deleted.",
      });
      await signOut();
      navigate("/");
    },
    onError: (error: any) => {
      console.error("Delete account error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete account",
        variant: "destructive",
      });
    }
  });

  const handleContinue = () => {
    if (hasActiveSubscription) {
      onManageBilling();
      return;
    }
    setStep("confirm");
  };

  const handleConfirmDelete = () => {
    if (confirmText.toLowerCase() === "delete my account") {
      deleteAccountMutation.mutate();
    }
  };

  const handleClose = () => {
    setStep("warning");
    setConfirmText("");
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-red-600">
            <AlertTriangle className="w-5 h-5" />
            <span>Delete Account</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {step === "warning" && (
            <>
              {hasActiveSubscription ? (
                <div className="space-y-4">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2 text-yellow-800 mb-2">
                      <CreditCard className="w-4 h-4" />
                      <span className="font-medium">Active Subscription Detected</span>
                    </div>
                    <p className="text-sm text-yellow-700">
                      You have an active subscription. Please cancel your subscription first before deleting your account.
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-900">To delete your account:</h4>
                    <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
                      <li>Cancel your subscription in billing settings</li>
                      <li>Wait for the subscription period to end</li>
                      <li>Return here to delete your account</li>
                    </ol>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-sm text-red-700">
                      <strong>Warning:</strong> This action cannot be undone. All your data will be permanently deleted.
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-900">This will permanently delete:</h4>
                    <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                      <li>Your profile and personal information</li>
                      <li>All food logs and nutrition history</li>
                      <li>Chat history with AI coach</li>
                      <li>Progress tracking data</li>
                      <li>Account preferences and settings</li>
                    </ul>
                  </div>
                </div>
              )}
            </>
          )}

          {step === "confirm" && (
            <div className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-700 font-medium">
                  Are you absolutely sure you want to delete your account?
                </p>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Type "delete my account" to confirm:
                </label>
                <Input
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder="delete my account"
                  className="text-base"
                />
              </div>
            </div>
          )}

          <div className="flex space-x-3 pt-4">
            <Button
              variant="outline"
              onClick={handleClose}
              className="flex-1"
              disabled={deleteAccountMutation.isPending}
            >
              Cancel
            </Button>
            
            {step === "warning" && (
              <Button
                onClick={handleContinue}
                className={`flex-1 ${hasActiveSubscription 
                  ? 'bg-blue-600 hover:bg-blue-700' 
                  : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {hasActiveSubscription ? (
                  <>
                    <CreditCard className="w-4 h-4 mr-2" />
                    Manage Billing
                  </>
                ) : (
                  "Continue"
                )}
              </Button>
            )}
            
            {step === "confirm" && (
              <Button
                onClick={handleConfirmDelete}
                disabled={
                  confirmText.toLowerCase() !== "delete my account" || 
                  deleteAccountMutation.isPending
                }
                className="flex-1 bg-red-600 hover:bg-red-700"
              >
                {deleteAccountMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Delete Account"
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
