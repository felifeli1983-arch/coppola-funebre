import 'server-only';
import Stripe from 'stripe';

let _stripe: Stripe | null = null;

export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

/** Lazily-created Stripe server client. Throws a clear error if not configured. */
export function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error('Stripe not configured (STRIPE_SECRET_KEY missing)');
  if (!_stripe) {
    // Use the SDK's pinned default API version (avoids type drift on upgrades).
    _stripe = new Stripe(key, { typescript: true });
  }
  return _stripe;
}
