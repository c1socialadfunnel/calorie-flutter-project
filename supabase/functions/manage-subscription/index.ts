import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14.21.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ManageSubscriptionRequest {
  action: 'cancel' | 'reactivate' | 'update_payment_method' | 'get_portal_url';
  returnUrl?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeSecretKey) {
      throw new Error('Stripe secret key not configured');
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16',
    });

    // Get the authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    )

    // Verify the user is authenticated
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    if (authError || !user) {
      throw new Error('Unauthorized')
    }

    // Get user profile with subscription info
    const { data: profile, error: profileError } = await supabaseClient
      .from('user_profiles')
      .select('stripe_customer_id, subscription_id, subscription_status')
      .eq('user_id', user.id)
      .single()

    if (profileError || !profile) {
      throw new Error('User profile not found')
    }

    if (!profile.stripe_customer_id) {
      throw new Error('No Stripe customer found')
    }

    // Parse request body
    const { action, returnUrl }: ManageSubscriptionRequest = await req.json()

    let result: any = {};

    switch (action) {
      case 'cancel':
        if (!profile.subscription_id) {
          throw new Error('No active subscription found')
        }
        
        const canceledSubscription = await stripe.subscriptions.update(profile.subscription_id, {
          cancel_at_period_end: true,
        });
        
        result = { 
          success: true, 
          message: 'Subscription will be canceled at the end of the current period',
          subscription: canceledSubscription
        };
        break;

      case 'reactivate':
        if (!profile.subscription_id) {
          throw new Error('No subscription found')
        }
        
        const reactivatedSubscription = await stripe.subscriptions.update(profile.subscription_id, {
          cancel_at_period_end: false,
        });
        
        result = { 
          success: true, 
          message: 'Subscription reactivated',
          subscription: reactivatedSubscription
        };
        break;

      case 'get_portal_url':
        const portalSession = await stripe.billingPortal.sessions.create({
          customer: profile.stripe_customer_id,
          return_url: returnUrl || `${req.headers.get('origin')}/app/profile`,
        });
        
        result = { 
          success: true, 
          url: portalSession.url 
        };
        break;

      default:
        throw new Error('Invalid action');
    }

    return new Response(
      JSON.stringify(result),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Manage subscription error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})
