import { Redis } from "@upstash/redis";

const CONNECTED_ACCOUNT_KEY = "stripe:connected_account_id";
let kv;

function getKV() {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) return null;
  if (!kv) kv = Redis.fromEnv();
  return kv;
}

export async function getConnectedAccountId() {
  const db = getKV();
  if (!db) return null;
  return (await db.get(CONNECTED_ACCOUNT_KEY)) || null;
}

export async function saveConnectedAccountId(accountId) {
  const db = getKV();
  if (!db) throw new Error("UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN are required");
  await db.set(CONNECTED_ACCOUNT_KEY, accountId);
  return accountId;
}

export const PLATFORM_FEE_BPS = 0;
export const PLATFORM_FEE_ENABLED = false;
