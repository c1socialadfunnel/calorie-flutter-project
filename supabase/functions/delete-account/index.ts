import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14.21.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    // Create Supabase client with service role key for admin operations
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Create regular client to verify user
    const supabaseUserClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    )

    // Verify the user is authenticated
    const { data: { user }, error: authError } = await supabaseUserClient.auth.getUser()
    if (authError || !user) {
      throw new Error('Unauthorized')
    }

    console.log(`Processing account deletion for user ${user.id}`)

    // Check if user has active subscription
    const { data: profile, error: profileError } = await supabaseClient
      .from('user_profiles')
      .select('subscription_status, subscription_id, stripe_customer_id')
      .eq('user_id', user.id)
      .single()

    if (profileError) {
      console.error('Error fetching user profile:', profileError)
      throw new Error('Failed to fetch user profile')
    }

    // Check for active subscription
    if (profile?.subscription_status === 'active') {
      throw new Error('Cannot delete account with active subscription. Please cancel your subscription first.')
    }

    // Initialize Stripe if we have customer data
    let stripe: Stripe | null = null;
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (stripeSecretKey && profile?.stripe_customer_id) {
      stripe = new Stripe(stripeSecretKey, {
        apiVersion: '2023-10-16',
      });
    }

    // Start transaction-like deletion process
    console.log('Starting account deletion process...')

    try {
      // 1. Delete chat messages
      const { error: messagesError } = await supabaseClient
        .from('chat_messages')
        .delete()
        .in('session_id', 
          supabaseClient
            .from('chat_sessions')
            .select('id')
            .eq('user_id', user.id)
        )

      if (messagesError) {
        console.error('Error deleting chat messages:', messagesError)
      }

      // 2. Delete chat sessions
      const { error: sessionsError } = await supabaseClient
        .from('chat_sessions')
        .delete()
        .eq('user_id', user.id)

      if (sessionsError) {
        console.error('Error deleting chat sessions:', sessionsError)
      }

      // 3. Delete food logs
      const { error: foodLogsError } = await supabaseClient
        .from('food_logs')
        .delete()
        .eq('user_id', user.id)

      if (foodLogsError) {
        console.error('Error deleting food logs:', foodLogsError)
      }

      // 4. Delete subscription events
      const { error: subscriptionEventsError } = await supabaseClient
        .from('subscription_events')
        .delete()
        .eq('user_id', user.id)

      if (subscriptionEventsError) {
        console.error('Error deleting subscription events:', subscriptionEventsError)
      }

      // 5. Delete user profile
      const { error: profileDeleteError } = await supabaseClient
        .from('user_profiles')
        .delete()
        .eq('user_id', user.id)

      if (profileDeleteError) {
        console.error('Error deleting user profile:', profileDeleteError)
        throw new Error('Failed to delete user profile')
      }

      // 6. Delete from users table
      const { error: userDeleteError } = await supabaseClient
        .from('users')
        .delete()
        .eq('id', user.id)

      if (userDeleteError) {
        console.error('Error deleting user record:', userDeleteError)
        throw new Error('Failed to delete user record')
      }

      // 7. Delete Stripe customer if exists
      if (stripe && profile?.stripe_customer_id) {
        try {
          await stripe.customers.del(profile.stripe_customer_id);
          console.log(`Deleted Stripe customer: ${profile.stripe_customer_id}`)
        } catch (stripeError) {
          console.error('Error deleting Stripe customer:', stripeError)
          // Don't fail the entire operation for Stripe errors
        }
      }

      // 8. Delete from Supabase Auth (this should be last)
      const { error: authDeleteError } = await supabaseClient.auth.admin.deleteUser(user.id)

      if (authDeleteError) {
        console.error('Error deleting auth user:', authDeleteError)
        throw new Error('Failed to delete authentication record')
      }

      console.log(`Successfully deleted account for user ${user.id}`)

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Account deleted successfully' 
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        },
      )

    } catch (deletionError) {
      console.error('Error during account deletion:', deletionError)
      throw new Error(`Account deletion failed: ${deletionError.message}`)
    }

  } catch (error) {
    console.error('Delete account error:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})
