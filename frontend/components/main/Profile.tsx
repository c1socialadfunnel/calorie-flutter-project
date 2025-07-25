import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  Settings, 
  Star, 
  Globe, 
  Share, 
  Crown, 
  LogOut,
  Target,
  Activity,
  Calendar,
  CreditCard,
  Trash2,
  ExternalLink,
  Shield,
  FileText,
  Mail
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { userApi } from "../../lib/api";
import { stripeApi } from "../../lib/stripe";
import { useToast } from "@/components/ui/use-toast";
import DeleteAccountDialog from "./DeleteAccountDialog";

export default function Profile() {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { toast } = useToast();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: () => userApi.getProfile(),
  });

  const { data: subscription } = useQuery({
    queryKey: ["subscription"],
    queryFn: () => userApi.getSubscriptionStatus(),
  });

  const manageBillingMutation = useMutation({
    mutationFn: () => stripeApi.manageSubscription({
      action: 'get_portal_url',
      returnUrl: window.location.href
    }),
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url;
      }
    },
    onError: (error: any) => {
      console.error("Billing portal error:", error);
      toast({
        title: "Error",
        description: "Failed to open billing portal",
        variant: "destructive",
      });
    }
  });

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const handleAdjustPlan = () => {
    navigate("/onboarding");
  };

  const handleManageBilling = () => {
    manageBillingMutation.mutate();
  };

  const handleDeleteAccount = () => {
    setShowDeleteDialog(true);
  };

  const handleRateUs = () => {
    // Open app store rating
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isAndroid = /Android/.test(navigator.userAgent);
    
    if (isIOS) {
      window.open('https://apps.apple.com/app/id[YOUR_APP_ID]', '_blank');
    } else if (isAndroid) {
      window.open('https://play.google.com/store/apps/details?id=com.calorie.help', '_blank');
    } else {
      toast({
        title: "Rate Us",
        description: "Please rate us on your device's app store!",
      });
    }
  };

  const handleInvite = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Calorie.Help - AI Calorie Tracker',
        text: 'Check out this amazing AI-powered calorie tracking app!',
        url: 'https://calorie.help'
      });
    } else {
      // Fallback for browsers that don't support Web Share API
      const shareText = 'Check out Calorie.Help - AI-powered calorie tracking app! https://calorie.help';
      navigator.clipboard.writeText(shareText).then(() => {
        toast({
          title: "Link Copied",
          description: "Share link copied to clipboard!",
        });
      });
    }
  };

  const handleLanguage = () => {
    toast({
      title: "Language Settings",
      description: "Multiple language support coming soon!",
    });
  };

  const handleDietaryPreference = () => {
    toast({
      title: "Dietary Preferences",
      description: "Dietary preference settings coming soon!",
    });
  };

  const planTypeLabels = {
    steady: "Steady Plan",
    intensive: "Intensive Plan",
    accelerated: "Accelerated Plan"
  };

  const getSubscriptionStatusBadge = (status?: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'canceled':
        return <Badge className="bg-red-100 text-red-800">Canceled</Badge>;
      case 'past_due':
        return <Badge className="bg-yellow-100 text-yellow-800">Past Due</Badge>;
      case 'trialing':
        return <Badge className="bg-blue-100 text-blue-800">Trial</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">Inactive</Badge>;
    }
  };

  const isSubscriptionActive = subscription?.subscription_status === 'active';

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-white shadow-sm">
        <div className="px-4 py-6">
          <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
          <p className="text-gray-600">Manage your account and preferences</p>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* User Info */}
        {profile && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="w-5 h-5" />
                <span>Your Plan</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-600">Current Plan</div>
                  <div className="font-medium">
                    {profile.profile.plan_type 
                      ? planTypeLabels[profile.profile.plan_type as keyof typeof planTypeLabels]
                      : "Not set"
                    }
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Daily Calories</div>
                  <div className="font-medium">
                    {profile.profile.daily_calorie_target || "Not set"}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Current Weight</div>
                  <div className="font-medium">
                    {profile.profile.current_weight_kg 
                      ? `${Math.round(profile.profile.current_weight_kg)} kg`
                      : "Not set"
                    }
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Target Weight</div>
                  <div className="font-medium">
                    {profile.profile.target_weight_kg 
                      ? `${Math.round(profile.profile.target_weight_kg)} kg`
                      : "Not set"
                    }
                  </div>
                </div>
              </div>
              
              <Button 
                variant="outline" 
                className="w-full"
                onClick={handleAdjustPlan}
              >
                <Settings className="w-4 h-4 mr-2" />
                Adjust Plan
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Subscription Status */}
        {subscription && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CreditCard className="w-5 h-5" />
                  <span>Subscription</span>
                </div>
                {getSubscriptionStatusBadge(subscription.subscription_status)}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {subscription.subscription_current_period_end && (
                <div>
                  <div className="text-sm text-gray-600">Next billing date</div>
                  <div className="font-medium">
                    {new Date(subscription.subscription_current_period_end).toLocaleDateString()}
                  </div>
                </div>
              )}
              
              <Button 
                variant="outline" 
                className="w-full"
                onClick={handleManageBilling}
                disabled={manageBillingMutation.isPending}
              >
                <CreditCard className="w-4 h-4 mr-2" />
                {manageBillingMutation.isPending ? "Loading..." : "Manage Billing"}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              variant="ghost" 
              className="w-full justify-start"
              onClick={handleDietaryPreference}
            >
              <Target className="w-4 h-4 mr-3" />
              My dietary preference
            </Button>
            <Button 
              variant="ghost" 
              className="w-full justify-start"
              onClick={handleRateUs}
            >
              <Star className="w-4 h-4 mr-3" />
              Rate Us
            </Button>
            <Button 
              variant="ghost" 
              className="w-full justify-start"
              onClick={handleLanguage}
            >
              <Globe className="w-4 h-4 mr-3" />
              Language
            </Button>
            <Button 
              variant="ghost" 
              className="w-full justify-start"
              onClick={handleInvite}
            >
              <Share className="w-4 h-4 mr-3" />
              Invite Friends
            </Button>
            {!isSubscriptionActive && (
              <Button 
                variant="ghost" 
                className="w-full justify-start text-purple-600"
                onClick={() => navigate("/onboarding/plan")}
              >
                <Crown className="w-4 h-4 mr-3" />
                Get Pro free!
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Legal & Support */}
        <Card>
          <CardHeader>
            <CardTitle>Legal & Support</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              variant="ghost" 
              className="w-full justify-start"
              onClick={() => window.open('https://calorie.help/privacy', '_blank')}
            >
              <Shield className="w-4 h-4 mr-3" />
              Privacy Policy
              <ExternalLink className="w-3 h-3 ml-auto" />
            </Button>
            <Button 
              variant="ghost" 
              className="w-full justify-start"
              onClick={() => window.open('https://calorie.help/terms', '_blank')}
            >
              <FileText className="w-4 h-4 mr-3" />
              Terms & Conditions
              <ExternalLink className="w-3 h-3 ml-auto" />
            </Button>
            <Button 
              variant="ghost" 
              className="w-full justify-start"
              onClick={() => window.open('mailto:support@calorie.help', '_blank')}
            >
              <Mail className="w-4 h-4 mr-3" />
              Contact Support
              <ExternalLink className="w-3 h-3 ml-auto" />
            </Button>
          </CardContent>
        </Card>

        {/* Account */}
        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              variant="ghost" 
              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={handleSignOut}
            >
              <LogOut className="w-4 h-4 mr-3" />
              Sign Out
            </Button>
            <Button 
              variant="ghost" 
              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={handleDeleteAccount}
            >
              <Trash2 className="w-4 h-4 mr-3" />
              Delete Account
            </Button>
          </CardContent>
        </Card>

        {/* App Info */}
        <div className="text-center text-sm text-gray-500 space-y-1">
          <div>Calorie.Help v1.0.0</div>
          <div>Your personal nutrition coach</div>
        </div>
      </div>

      <DeleteAccountDialog 
        open={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        hasActiveSubscription={isSubscriptionActive}
        onManageBilling={handleManageBilling}
      />
    </div>
  );
}
