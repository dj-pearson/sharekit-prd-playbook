import { supabase } from '@/integrations/supabase/client';

/**
 * Configuration for Stripe price IDs
 * You need to create these products and prices in your Stripe Dashboard
 * and set them in your environment variables
 */
export const STRIPE_CONFIG = {
  prices: {
    pro: {
      monthly: import.meta.env.VITE_STRIPE_PRO_MONTHLY_PRICE_ID || '',
      yearly: import.meta.env.VITE_STRIPE_PRO_YEARLY_PRICE_ID || '',
    },
    business: {
      monthly: import.meta.env.VITE_STRIPE_BUSINESS_MONTHLY_PRICE_ID || '',
      yearly: import.meta.env.VITE_STRIPE_BUSINESS_YEARLY_PRICE_ID || '',
    },
  },
  publishableKey: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '',
};

export type Plan = 'free' | 'pro' | 'business';
export type BillingInterval = 'monthly' | 'yearly';

/**
 * Get the Stripe price ID for a given plan and billing interval
 */
export function getStripePriceId(plan: Plan, interval: BillingInterval): string {
  if (plan === 'free') {
    throw new Error('Free plan does not have a Stripe price ID');
  }

  const priceId = STRIPE_CONFIG.prices[plan][interval];

  if (!priceId) {
    throw new Error(`Stripe price ID not configured for ${plan} ${interval}`);
  }

  return priceId;
}

/**
 * Create a Stripe checkout session
 * This calls the Supabase Edge Function which handles the Stripe API
 */
export async function createCheckoutSession(
  plan: Plan,
  interval: BillingInterval
): Promise<string> {
  try {
    const priceId = getStripePriceId(plan, interval);

    // Get the current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('You must be logged in to upgrade');
    }

    // Call the Edge Function to create a checkout session
    const { data, error } = await supabase.functions.invoke('create-checkout-session', {
      body: {
        priceId,
        userId: user.id,
        userEmail: user.email,
      },
    });

    if (error) {
      console.error('Error creating checkout session:', error);
      throw new Error(error.message || 'Failed to create checkout session');
    }

    if (!data?.url) {
      throw new Error('No checkout URL returned');
    }

    return data.url;
  } catch (error) {
    console.error('Error in createCheckoutSession:', error);
    throw error;
  }
}

/**
 * Create a Stripe Customer Portal session
 * This allows users to manage their subscription, payment methods, and view invoices
 */
export async function createPortalSession(): Promise<string> {
  try {
    // Get the current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('You must be logged in to manage your subscription');
    }

    // Call the Edge Function to create a portal session
    const { data, error } = await supabase.functions.invoke('create-portal-session', {
      body: {
        userId: user.id,
      },
    });

    if (error) {
      console.error('Error creating portal session:', error);
      throw new Error(error.message || 'Failed to create portal session');
    }

    if (!data?.url) {
      throw new Error('No portal URL returned');
    }

    return data.url;
  } catch (error) {
    console.error('Error in createPortalSession:', error);
    throw error;
  }
}

/**
 * Get the plan name from a Stripe price ID
 */
export function getPlanFromPriceId(priceId: string): Plan {
  const config = STRIPE_CONFIG.prices;

  if (priceId === config.pro.monthly || priceId === config.pro.yearly) {
    return 'pro';
  }

  if (priceId === config.business.monthly || priceId === config.business.yearly) {
    return 'business';
  }

  throw new Error(`Unknown price ID: ${priceId}`);
}

/**
 * Format price for display
 */
export function formatPrice(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount / 100); // Stripe amounts are in cents
}
