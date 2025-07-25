import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Manual webhook signature verification for Deno
async function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): Promise<boolean> {
  try {
    const elements = signature.split(',')
    const signatureElements: { [key: string]: string } = {}
    
    for (const element of elements) {
      const [key, value] = element.split('=')
      signatureElements[key] = value
    }

    const timestamp = signatureElements.t
    const v1 = signatureElements.v1

    if (!timestamp || !v1) {
      return false
    }

    // Check if timestamp is within tolerance (5 minutes)
    const timestampSeconds = parseInt(timestamp, 10)
    const now = Math.floor(Date.now() / 1000)
    const tolerance = 300 // 5 minutes

    if (Math.abs(now - timestampSeconds) > tolerance) {
      console.error('Webhook timestamp outside tolerance')
      return false
    }

    // Create the signed payload
    const signedPayload = `${timestamp}.${payload}`
    
    // Create HMAC signature
    const encoder = new TextEncoder()
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    )
    
    const signature_bytes = await crypto.subtle.sign(
      'HMAC',
      key,
      encoder.encode(signedPayload)
    )
    
    // Convert to hex
    const signature_array = Array.from(new Uint8Array(signature_bytes))
    const signature_hex = signature_array.map(b => b.toString(16).padStart(2, '0')).join('')
    
    // Compare signatures
    return signature_hex === v1
  } catch (error) {
    console.error('Signature verification error:', error)
    return false
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const stripeWebhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
    
    if (!stripeWebhookSecret) {
      throw new Error('Stripe webhook secret not configured');
    }

    // Create Supabase client with service role key for admin operations
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get the raw body and signature
    const body = await req.text()
    const signature = req.headers.get('stripe-signature')

    if (!signature) {
      throw new Error('No Stripe signature found')
    }

    // Verify the webhook signature manually
    const isValid = await verifyWebhookSignature(body, signature, stripeWebhookSecret)
    if (!isValid) {
      console.error('Webhook signature verification failed')
      return new Response('Webhook signature verification failed', { status: 400 })
    }

    // Parse the event
    let event: any
    try {
      event = JSON.parse(body)
    } catch (err) {
      console.error('Failed to parse webhook body:', err)
      return new Response('Invalid JSON', { status: 400 })
    }

    console.log('Received Stripe webhook:', event.type)

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object
        await handleCheckoutCompleted(supabaseClient, session)
        break
      }
      
      case 'customer.subscription.created': {
        const subscription = event.data.object
        await handleSubscriptionCreated(supabaseClient, subscription)
        break
      }
      
      case 'customer.subscription.updated': {
        const subscription = event.data.object
        await handleSubscriptionUpdated(supabaseClient, subscription)
        break
      }
      
      case 'customer.subscription.deleted': {
        const subscription = event.data.object
        await handleSubscriptionDeleted(supabaseClient, subscription)
        break
      }
      
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object
        await handlePaymentSucceeded(supabaseClient, invoice)
        break
      }
      
      case 'invoice.payment_failed': {
        const invoice = event.data.object
        await handlePaymentFailed(supabaseClient, invoice)
        break
      }
      
      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    // Log the event for audit trail
    await logSubscriptionEvent(supabaseClient, event)

    return new Response('Webhook handled successfully', { 
      status: 200,
      headers: corsHeaders 
    })
  } catch (error) {
    console.error('Webhook error:', error)
    return new Response(`Webhook error: ${error.message}`, { 
      status: 400,
      headers: corsHeaders 
    })
  }
})

async function handleCheckoutCompleted(supabase: any, session: any) {
  const userId = session.metadata?.user_id
  const planType = session.metadata?.plan_type
  
  if (!userId || !planType) {
    console.error('Missing user_id or plan_type in session metadata')
    return
  }

  console.log(`Processing checkout completion for user ${userId} with plan ${planType}`)

  // Update user profile with subscription info
  const { error } = await supabase
    .from('user_profiles')
    .update({
      subscription_status: 'active',
      subscription_id: session.subscription,
      plan_type: planType,
      updated_at: new Date().toISOString()
    })
    .eq('user_id', userId)

  if (error) {
    console.error('Error updating user profile after checkout:', error)
  } else {
    console.log(`Checkout completed for user ${userId} with plan ${planType}`)
  }
}

async function handleSubscriptionCreated(supabase: any, subscription: any) {
  const userId = subscription.metadata?.user_id
  const planType = subscription.metadata?.plan_type
  
  if (!userId) {
    console.error('Missing user_id in subscription metadata')
    return
  }

  console.log(`Processing subscription creation for user ${userId}`)

  const { error } = await supabase
    .from('user_profiles')
    .update({
      subscription_status: subscription.status,
      subscription_id: subscription.id,
      plan_type: planType,
      subscription_current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      subscription_current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('user_id', userId)

  if (error) {
    console.error('Error creating subscription record:', error)
  } else {
    console.log(`Subscription created for user ${userId}`)
  }
}

async function handleSubscriptionUpdated(supabase: any, subscription: any) {
  const userId = subscription.metadata?.user_id
  
  if (!userId) {
    // Try to find user by subscription_id if metadata is missing
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('user_id')
      .eq('subscription_id', subscription.id)
      .single()
    
    if (!profile) {
      console.error('Cannot find user for subscription:', subscription.id)
      return
    }
  }

  console.log(`Processing subscription update for subscription ${subscription.id}`)

  const updateData: any = {
    subscription_status: subscription.status,
    subscription_current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
    subscription_current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
    updated_at: new Date().toISOString()
  }

  const { error } = await supabase
    .from('user_profiles')
    .update(updateData)
    .eq(userId ? 'user_id' : 'subscription_id', userId || subscription.id)

  if (error) {
    console.error('Error updating subscription:', error)
  } else {
    console.log(`Subscription updated for subscription ${subscription.id}`)
  }
}

async function handleSubscriptionDeleted(supabase: any, subscription: any) {
  const userId = subscription.metadata?.user_id
  
  if (!userId) {
    // Try to find user by subscription_id if metadata is missing
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('user_id')
      .eq('subscription_id', subscription.id)
      .single()
    
    if (!profile) {
      console.error('Cannot find user for subscription:', subscription.id)
      return
    }
  }

  console.log(`Processing subscription deletion for subscription ${subscription.id}`)

  const { error } = await supabase
    .from('user_profiles')
    .update({
      subscription_status: 'canceled',
      updated_at: new Date().toISOString()
    })
    .eq(userId ? 'user_id' : 'subscription_id', userId || subscription.id)

  if (error) {
    console.error('Error canceling subscription:', error)
  } else {
    console.log(`Subscription canceled for subscription ${subscription.id}`)
  }
}

async function handlePaymentSucceeded(supabase: any, invoice: any) {
  const subscriptionId = invoice.subscription
  
  if (!subscriptionId) {
    console.error('No subscription ID in invoice')
    return
  }

  console.log(`Processing payment success for subscription ${subscriptionId}`)

  const { error } = await supabase
    .from('user_profiles')
    .update({
      subscription_status: 'active',
      updated_at: new Date().toISOString()
    })
    .eq('subscription_id', subscriptionId)

  if (error) {
    console.error('Error updating payment success:', error)
  } else {
    console.log(`Payment succeeded for subscription ${subscriptionId}`)
  }
}

async function handlePaymentFailed(supabase: any, invoice: any) {
  const subscriptionId = invoice.subscription
  
  if (!subscriptionId) {
    console.error('No subscription ID in invoice')
    return
  }

  console.log(`Processing payment failure for subscription ${subscriptionId}`)

  const { error } = await supabase
    .from('user_profiles')
    .update({
      subscription_status: 'past_due',
      updated_at: new Date().toISOString()
    })
    .eq('subscription_id', subscriptionId)

  if (error) {
    console.error('Error updating payment failure:', error)
  } else {
    console.log(`Payment failed for subscription ${subscriptionId}`)
  }
}

async function logSubscriptionEvent(supabase: any, event: any) {
  try {
    // Extract user_id from event metadata or find by subscription_id
    let userId = null
    
    if (event.data?.object?.metadata?.user_id) {
      userId = event.data.object.metadata.user_id
    } else if (event.data?.object?.subscription) {
      // For invoice events, find user by subscription_id
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('user_id')
        .eq('subscription_id', event.data.object.subscription)
        .single()
      
      if (profile) {
        userId = profile.user_id
      }
    }

    if (userId) {
      await supabase
        .from('subscription_events')
        .insert({
          user_id: userId,
          subscription_id: event.data?.object?.id || event.data?.object?.subscription,
          event_type: event.type,
          event_data: event.data,
        })
    }
  } catch (error) {
    console.error('Error logging subscription event:', error)
    // Don't throw - this is just for audit trail
  }
}
