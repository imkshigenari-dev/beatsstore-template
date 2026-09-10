import { cookies } from "next/headers";
import { Redis } from "@upstash/redis";

export const CUSTOMER_SETUP_COOKIE = "wino_customer_setup";
export const CUSTOMER_SESSION_COOKIE = "wino_customer_session";
const CUSTOMER_KEY = "customer:account";
const SESSION_MAX_AGE_MS = 1000 * 60 * 60 * 24 * 30;
const encoder = new TextEncoder();
let db;

function getDB() {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) return null;
  if (!db) db = Redis.fromEnv();
  return db;
}

function bytesToHex(buffer) {
  return Array.from(new Uint8Array(buffer)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

function hexToBytes(hex) {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i += 1) bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  return bytes;
}

function safeEqual(a, b) {
  if (typeof a !== "string" || typeof b !== "string" || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function randomHex(byteLength = 16) {
  const bytes = new Uint8Array(byteLength);
  crypto.getRandomValues(bytes);
  return bytesToHex(bytes);
}

async function hashPassword(password, saltHex) {
  const key = await crypto.subtle.importKey("raw", encoder.encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", salt: hexToBytes(saltHex), iterations: 210000, hash: "SHA-256" }, key, 256);
  return bytesToHex(bits);
}

async function getSessionKey() {
  const secret = process.env.CUSTOMER_SESSION_SECRET || process.env.ADMIN_SESSION_SECRET;
  if (!secret) throw new Error("CUSTOMER_SESSION_SECRET or ADMIN_SESSION_SECRET is required");
  return crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
}

export function isValidSetupToken(token) {
  const expected = process.env.CUSTOMER_SETUP_TOKEN;
  if (!token || !expected) return false;
  return safeEqual(token, expected);
}

export async function isCustomerSetupAuthorized() {
  const cookieStore = await cookies();
  const setupOk = isValidSetupToken(cookieStore.get(CUSTOMER_SETUP_COOKIE)?.value);
  if (setupOk) return true;
  return isValidCustomerSessionToken(cookieStore.get(CUSTOMER_SESSION_COOKIE)?.value);
}

export async function getCustomerAccount() {
  const store = getDB();
  if (!store) return null;
  return (await store.get(CUSTOMER_KEY)) || null;
}

export async function createCustomerAccount(email, password) {
  const store = getDB();
  if (!store) throw new Error("UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN are required");
  const normalizedEmail = String(email || "").trim().toLowerCase();
  if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) throw new Error("有効なメールアドレスを入力してください");
  if (typeof password !== "string" || password.length < 10) throw new Error("パスワードは10文字以上で設定してください");
  const existing = await store.get(CUSTOMER_KEY);
  if (existing) throw new Error("アカウントはすでに登録されています");
  const salt = randomHex(16);
  const passwordHash = await hashPassword(password, salt);
  const account = { email: normalizedEmail, passwordHash, salt, createdAt: new Date().toISOString() };
  await store.set(CUSTOMER_KEY, account);
  return account;
}

export async function verifyCustomerCredentials(email, password) {
  const account = await getCustomerAccount();
  if (!account) return false;
  const normalizedEmail = String(email || "").trim().toLowerCase();
  if (!safeEqual(normalizedEmail, account.email)) return false;
  const hash = await hashPassword(password, account.salt);
  return safeEqual(hash, account.passwordHash);
}

export async function createCustomerSessionToken(email) {
  const payload = `customer:${String(email).trim().toLowerCase()}:${Date.now()}`;
  const key = await getSessionKey();
  const signature = bytesToHex(await crypto.subtle.sign("HMAC", key, encoder.encode(payload)));
  return btoa(`${payload}.${signature}`);
}

export async function isValidCustomerSessionToken(token) {
  if (!token) return false;
  try {
    const decoded = atob(token);
    const separator = decoded.lastIndexOf(".");
    if (separator < 0) return false;
    const payload = decoded.slice(0, separator);
    const signature = decoded.slice(separator + 1);
    const parts = payload.split(":");
    if (parts.length !== 3 || parts[0] !== "customer" || !signature) return false;
    const timestamp = Number(parts[2]);
    if (!Number.isFinite(timestamp) || Date.now() - timestamp > SESSION_MAX_AGE_MS || timestamp > Date.now() + 60_000) return false;
    const account = await getCustomerAccount();
    if (!account || !safeEqual(parts[1], account.email)) return false;
    const key = await getSessionKey();
    const expected = bytesToHex(await crypto.subtle.sign("HMAC", key, encoder.encode(payload)));
    return safeEqual(expected, signature);
  } catch {
    return false;
  }
}
