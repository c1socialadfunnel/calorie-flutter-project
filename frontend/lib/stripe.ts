import { supabase } from './supabase'

export interface CreateCheckoutSessionRequest {
  planType: 'steady' | 'intensive' | 'accelerated';
  successUrl: string;
  cancelUrl: string;
}

export interface CreateCheckoutSessionResponse {
  sessionId: string;
  url: string;
}

export interface ManageSubscriptionRequest {
  action: 'cancel' | 'reactivate' | 'get_portal_url';
  returnUrl?: string;
}

export interface ManageSubscriptionResponse {
  success: boolean;
  message?: string;
  url?: string;
  subscription?: any;
}

export const stripeApi = {
  async createCheckoutSession(request: CreateCheckoutSessionRequest): Promise<CreateCheckoutSessionResponse> {
    const { data, error } = await supabase.functions.invoke('create-checkout-session', {
      body: request
    })

    if (error) throw error
    return data
  },

  async manageSubscription(request: ManageSubscriptionRequest): Promise<ManageSubscriptionResponse> {
    const { data, error } = await supabase.functions.invoke('manage-subscription', {
      body: request
    })

    if (error) throw error
    return data
  },

  async redirectToCheckout(sessionId: string) {
    // This would typically use Stripe.js in a real implementation
    // For now, we'll redirect to the URL returned from the session
    const { data } = await supabase.functions.invoke('create-checkout-session', {
      body: { sessionId }
    })
    
    if (data?.url) {
      window.location.href = data.url
    }
  },

  async redirectToBillingPortal(returnUrl?: string) {
    const response = await this.manageSubscription({
      action: 'get_portal_url',
      returnUrl
    })

    if (response.url) {
      window.location.href = response.url
    }
  }
}

export const planPricing = {
  steady: {
    name: 'Steady Plan',
    price: '$9.99/month',
    description: 'Best combination of visible results and sustainable progress, with moderate effort required',
    features: [
      'Weekly Weight Loss: 1 lb',
      'Daily Calorie Cut: -500 kcal',
      'Duration: 39 weeks',
      'AI Food Analysis',
      '24/7 Health Coach',
      'Progress Tracking'
    ]
  },
  intensive: {
    name: 'Intensive Plan',
    price: '$14.99/month',
    description: 'Challenge mode. Maximum results for those ready to commit to significant lifestyle changes',
    features: [
      'Weekly Weight Loss: 2 lb',
      'Daily Calorie Cut: -1000 kcal',
      'Duration: 20 weeks',
      'AI Food Analysis',
      '24/7 Health Coach',
      'Progress Tracking',
      'Advanced Analytics'
    ]
  },
  accelerated: {
    name: 'Accelerated Plan',
    price: '$19.99/month',
    description: 'For the ambitious. Faster results and greater momentum, but requires more planning and dedication',
    features: [
      'Weekly Weight Loss: 3+ lb',
      'Daily Calorie Cut: -750 kcal',
      'Duration: 26 weeks',
      'AI Food Analysis',
      '24/7 Health Coach',
      'Progress Tracking',
      'Advanced Analytics',
      'Priority Support'
    ]
  }
}
