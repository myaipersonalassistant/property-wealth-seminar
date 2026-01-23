/**
 * Stripe Payment Integration
 * 
 * This module provides functions to integrate Stripe for payment processing.
 * 
 * Setup Instructions:
 * 1. Create a Stripe account at stripe.com
 * 2. Get your publishable key from the Stripe dashboard
 * 3. Ensure your backend has the Stripe secret key configured
 * 4. Set up a webhook endpoint to receive Stripe events (e.g., checkout.session.completed)
 * 
 * Environment Variables Needed:
 * - VITE_STRIPE_PUBLISHABLE_KEY: Your Stripe publishable key
 * - Backend should have STRIPE_SECRET_KEY configured
 * - Backend webhook endpoint: /api/webhooks/stripe
 */

const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '';
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3001';
const SUCCESS_URL = import.meta.env.VITE_SUCCESS_URL || `${window.location.origin}/payment-success`;
const CANCEL_URL = import.meta.env.VITE_CANCEL_URL || `${window.location.origin}/`;

export interface CheckoutSessionData {
  name: string;
  email: string;
  phone?: string;
  quantity: number;
  ticketPrice: number;
}

export interface CheckoutSessionResponse {
  url?: string;
  error?: string;
  sessionId?: string;
}

/**
 * Create a Stripe checkout session
 */
export async function createCheckoutSession(
  data: CheckoutSessionData
): Promise<CheckoutSessionResponse> {
  try {
    if (!STRIPE_PUBLISHABLE_KEY) {
      throw new Error('Stripe publishable key is not configured');
    }

    const response = await fetch(`${API_BASE}/api/create-checkout-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: data.name,
        email: data.email,
        phone: data.phone,
        quantity: data.quantity,
        ticketPrice: data.ticketPrice,
        successUrl: SUCCESS_URL,
        cancelUrl: CANCEL_URL,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return {
      error: error instanceof Error ? error.message : 'Failed to create checkout session',
    };
  }
}

/**
 * Verify a Stripe payment session
 */
export async function verifyPaymentSession(sessionId: string): Promise<any> {
  try {
    const response = await fetch(`${API_BASE}/api/verify-session/${sessionId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    console.error('Error verifying payment session:', error);
    throw error;
  }
}

/**
 * Get Stripe publishable key for client-side use
 */
export function getStripePublishableKey(): string {
  if (!STRIPE_PUBLISHABLE_KEY) {
    console.warn('Stripe publishable key is not configured');
  }
  return STRIPE_PUBLISHABLE_KEY;
}

/**
 * Format currency for display
 */
export function formatCurrency(amount: number, currency: string = 'GBP'): string {
  const formatter = new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: currency,
  });
  return formatter.format(amount);
}

/**
 * Load Stripe script
 */
export function loadStripeScript(): Promise<any> {
  return new Promise((resolve, reject) => {
    if ((window as any).Stripe) {
      resolve((window as any).Stripe);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://js.stripe.com/v3/';
    script.async = true;
    script.onload = () => {
      resolve((window as any).Stripe);
    };
    script.onerror = () => {
      reject(new Error('Failed to load Stripe script'));
    };
    document.head.appendChild(script);
  });
}
