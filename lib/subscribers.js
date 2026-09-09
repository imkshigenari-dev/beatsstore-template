import { Redis } from "@upstash/redis";

const kv = Redis.fromEnv();

const SUBSCRIBERS_KEY = "marketing:subscribers";
const subscriberKey = (email) => "marketing:subscriber:" + email.toLowerCase();

export async function subscribeEmail(email) {
  const normalized = String(email || "").trim().toLowerCase();
  if (!normalized || !/^\S+@\S+\.\S+$/.test(normalized)) {
    throw new Error("invalid email");
  }

  const existing = await kv.get(subscriberKey(normalized));
  const subscriber = existing || {
    email: normalized,
    createdAt: new Date().toISOString(),
    active: true,
  };
  subscriber.active = true;
  subscriber.updatedAt = new Date().toISOString();

  await kv.set(subscriberKey(normalized), subscriber);
  const emails = (await kv.get(SUBSCRIBERS_KEY)) || [];
  if (!emails.includes(normalized)) {
    emails.unshift(normalized);
    await kv.set(SUBSCRIBERS_KEY, emails);
  }
  return subscriber;
}

export async function unsubscribeEmail(email) {
  const normalized = String(email || "").trim().toLowerCase();
  if (!normalized) return false;
  const subscriber = await kv.get(subscriberKey(normalized));
  if (!subscriber) return false;
  subscriber.active = false;
  subscriber.updatedAt = new Date().toISOString();
  await kv.set(subscriberKey(normalized), subscriber);
  return true;
}

export async function listActiveSubscribers() {
  const emails = (await kv.get(SUBSCRIBERS_KEY)) || [];
  if (emails.length === 0) return [];
  const rows = await Promise.all(emails.map((email) => kv.get(subscriberKey(email))));
  return rows.filter((row) => row?.active).map((row) => row.email);
}
