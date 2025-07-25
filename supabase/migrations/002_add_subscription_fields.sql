-- Add subscription-related fields to user_profiles table
ALTER TABLE public.user_profiles 
ADD COLUMN stripe_customer_id TEXT,
ADD COLUMN subscription_id TEXT,
ADD COLUMN subscription_status TEXT CHECK (subscription_status IN ('active', 'canceled', 'past_due', 'unpaid', 'incomplete', 'incomplete_expired', 'trialing')),
ADD COLUMN subscription_current_period_start TIMESTAMP WITH TIME ZONE,
ADD COLUMN subscription_current_period_end TIMESTAMP WITH TIME ZONE;

-- Create index for subscription lookups
CREATE INDEX idx_user_profiles_stripe_customer ON public.user_profiles(stripe_customer_id);
CREATE INDEX idx_user_profiles_subscription ON public.user_profiles(subscription_id);
CREATE INDEX idx_user_profiles_subscription_status ON public.user_profiles(subscription_status);

-- Create subscription events table for audit trail
CREATE TABLE public.subscription_events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  subscription_id TEXT,
  event_type TEXT NOT NULL,
  event_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for subscription events
ALTER TABLE public.subscription_events ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for subscription events
CREATE POLICY "Users can view own subscription events" ON public.subscription_events
  FOR ALL USING (auth.uid() = user_id);

-- Create index for subscription events
CREATE INDEX idx_subscription_events_user ON public.subscription_events(user_id, created_at);
CREATE INDEX idx_subscription_events_subscription ON public.subscription_events(subscription_id);
