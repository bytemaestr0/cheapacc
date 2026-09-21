/**
 * Payment provider abstraction.
 *
 * No provider is wired up yet. When you're ready, implement one of:
 *   - lib/payments/stripe.ts   (Stripe Checkout Sessions)
 *   - lib/payments/paddle.ts   (Paddle Billing / Checkout)
 * and swap the export below.
 *
 * Each implementation just needs to create a hosted checkout session
 * and return a URL to redirect the buyer to, then confirm payment via
 * webhook (see app/api/webhooks/<provider>/route.ts, not yet created).
 */

export interface CreateCheckoutInput {
  orderId: string;
  totalCents: number;
  currency: string;
  buyerEmail: string;
  successUrl: string;
  cancelUrl: string;
}

export interface CreateCheckoutResult {
  url: string;
  provider: "stripe" | "paddle" | "manual";
}

export interface PaymentProvider {
  createCheckout(input: CreateCheckoutInput): Promise<CreateCheckoutResult>;
}

/**
 * Manual/no-op provider: marks the order pending and sends the buyer
 * straight to the order confirmation page. Useful for testing the
 * fulfillment flow before a real payment processor is connected, or
 * for a pay-by-invoice / manual-payment-confirmation flow.
 */
export const manualProvider: PaymentProvider = {
  async createCheckout({ orderId, successUrl }) {
    return {
      url: `${successUrl}?order=${orderId}&provider=manual`,
      provider: "manual",
    };
  },
};

// Swap this for stripeProvider / paddleProvider once you've implemented one.
export const paymentProvider: PaymentProvider = manualProvider;
