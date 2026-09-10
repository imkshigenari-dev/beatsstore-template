import Stripe from "stripe";

let client;

export function getStripe() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) throw new Error("STRIPE_SECRET_KEY is not configured");
  if (!client) {
    client = new Stripe(secretKey, { apiVersion: "2024-06-20" });
  }
  return client;
}

export const stripe = new Proxy({}, {
  get(_target, property) {
    return getStripe()[property];
  },
});
