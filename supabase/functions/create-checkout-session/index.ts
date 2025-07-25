import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14.21.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CreateCheckoutSessionRequest {
  planType: 'steady' | 'intensive' | 'accelerated';
  successUrl: string;
  cancelUrl: string;
}

const planPricing = {
  steady: {
    priceId: 'price_steady_monthly', // Replace with actual Stripe price ID
    amount: 999, // $9.99 in cents
    name: 'Steady Plan',
    description: 'Best combination of visible results and sustainable progress'
  },
  intensive: {
    priceId: 'price_intensive_monthly', // Replace with actual Stripe price ID
    amount: 1499, // $14.99 in cents
    name: 'Intensive Plan',
    description: 'Challenge mode. Maximum results for those ready to commit'
  },
  accelerated: {
    priceId: 'price_accelerated_monthly', // Replace with actual Stripe price ID
    amount: 1999, // $19.99 in cents
    name: 'Accelerated Plan',
    description: 'For the ambitious. Faster results and greater momentum'
  }
};

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

    // Parse request body
    const { planType, successUrl, cancelUrl }: CreateCheckoutSessionRequest = await req.json()

    if (!planType || !planPricing[planType]) {
      throw new Error('Invalid plan type')
    }

    const plan = planPricing[planType];

    // Get or create Stripe customer
    let customerId: string;
    
    // Check if user already has a Stripe customer ID
    const { data: existingProfile } = await supabaseClient
      .from('user_profiles')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .single()

    if (existingProfile?.stripe_customer_id) {
      customerId = existingProfile.stripe_customer_id;
    } else {
      // Create new Stripe customer
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          supabase_user_id: user.id,
        },
      });
      
      customerId = customer.id;

      // Save customer ID to user profile
      await supabaseClient
        .from('user_profiles')
        .update({ stripe_customer_id: customerId })
        .eq('user_id', user.id)
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: plan.name,
              description: plan.description,
            },
            unit_amount: plan.amount,
            recurring: {
              interval: 'month',
            },
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        user_id: user.id,
        plan_type: planType,
      },
      subscription_data: {
        metadata: {
          user_id: user.id,
          plan_type: planType,
        },
      },
    });

    return new Response(
      JSON.stringify({ 
        sessionId: session.id,
        url: session.url 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Create checkout session error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})
