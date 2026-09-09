import { cookies } from "next/headers";
import { createHash, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { Redis } from "@upstash/redis";

const kv = Redis.fromEnv();

export const CUSTOMER_COOKIE_NAME = "wino_customer_session";
const USER_PREFIX = "customer:user:";
const ORDER_PREFIX = "customer:orders:";
const SESSION_PREFIX = "customer:session:";

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function userKey(email) {
  return USER_PREFIX + normalizeEmail(email);
}

function orderKey(email) {
  return ORDER_PREFIX + createHash("sha256").update(normalizeEmail(email)).digest("hex");
}

function sessionKey(token) {
  return SESSION_PREFIX + token;
}

export function normalizeCustomerEmail(email) {
  return normalizeEmail(email);
}

export function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(String(password), salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password, stored) {
  try {
    const [salt, expectedHex] = String(stored || "").split(":");
    if (!salt || !expectedHex) return false;
    const actual = scryptSync(String(password), salt, 64);
    const expected = Buffer.from(expectedHex, "hex");
    return actual.length === expected.length && timingSafeEqual(actual, expected);
  } catch {
    return false;
  }
}

export async function getCustomerByEmail(email) {
  const normalized = normalizeEmail(email);
  if (!normalized) return null;
  return kv.get(userKey(normalized));
}

export async function createCustomer({ email, password, artistName = "", legalName = "" }) {
  const normalized = normalizeEmail(email);
  const existing = await getCustomerByEmail(normalized);
  if (existing) throw new Error("このメールアドレスはすでに登録されています");

  const customer = {
    email: normalized,
    artistName: String(artistName || "").trim().slice(0, 120),
    legalName: String(legalName || "").trim().slice(0, 120),
    passwordHash: hashPassword(password),
    createdAt: new Date().toISOString(),
  };

  await kv.set(userKey(normalized), customer);
  return customer;
}

export async function updateCustomer(email, updates) {
  const customer = await getCustomerByEmail(email);
  if (!customer) return null;

  const updated = {
    ...customer,
    artistName: String(updates.artistName ?? customer.artistName ?? "").trim().slice(0, 120),
    legalName: String(updates.legalName ?? customer.legalName ?? "").trim().slice(0, 120),
  };

  await kv.set(userKey(customer.email), updated);
  return updated;
}

export async function createCustomerSession(email) {
  const token = randomBytes(32).toString("hex");
  await kv.set(sessionKey(token), {
    email: normalizeEmail(email),
    createdAt: new Date().toISOString(),
  }, { ex: 60 * 60 * 24 * 30 });
  return token;
}

export async function destroyCustomerSession(token) {
  if (token) await kv.del(sessionKey(token));
}

export async function getCustomerFromToken(token) {
  if (!token) return null;
  const session = await kv.get(sessionKey(token));
  if (!session?.email) return null;
  return getCustomerByEmail(session.email);
}

export async function getCurrentCustomer() {
  const token = cookies().get(CUSTOMER_COOKIE_NAME)?.value;
  return getCustomerFromToken(token);
}

export async function addOrderForCustomer(email, orderId) {
  const normalized = normalizeEmail(email);
  if (!normalized || !orderId) return;
  const key = orderKey(normalized);
  const ids = (await kv.get(key)) || [];
  if (!ids.includes(orderId)) {
    await kv.set(key, [...ids, String(orderId)]);
  }
}

export async function getCustomerOrderIds(email) {
  const normalized = normalizeEmail(email);
  if (!normalized) return [];
  return (await kv.get(orderKey(normalized))) || [];
}
