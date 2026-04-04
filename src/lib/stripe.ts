import Stripe from "stripe";

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key || key.startsWith("sk_test_...")) {
      throw new Error("Stripe non configurato: aggiungi STRIPE_SECRET_KEY in .env.local");
    }
    _stripe = new Stripe(key);
  }
  return _stripe;
}

export const STRIPE_PRICE_ID = process.env.STRIPE_PRICE_ID!;
export const PLAN_PRICE_EUR = 37;
export const TRIAL_DAYS = 14;
