import { NextResponse } from "next/server";
import { isValidSessionToken, COOKIE_NAME } from "./lib/auth";

const CUSTOMER_SESSION_COOKIE = "wino_customer_session";
const CUSTOMER_SETUP_COOKIE = "wino_customer_setup";
const SESSION_MAX_AGE_MS = 1000 * 60 * 60 * 24 * 30;
const encoder = new TextEncoder();

function safeEqual(a, b) {
  if (typeof a !== "string" || typeof b !== "string" || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function bytesToHex(buffer) {
  return Array.from(new Uint8Array(buffer)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function isValidCustomerSessionToken(token) {
  if (!token) return false;
  const secret = process.env.CUSTOMER_SESSION_SECRET || process.env.ADMIN_SESSION_SECRET;
  if (!secret) return false;
  try {
    const decoded = atob(token);
    const separator = decoded.lastIndexOf(".");
    if (separator < 0) return false;
    const payload = decoded.slice(0, separator);
    const signature = decoded.slice(separator + 1);
    const parts = payload.split(":");
    if (parts.length !== 3 || parts[0] !== "customer" || !parts[1] || !signature) return false;
    const timestamp = Number(parts[2]);
    const now = Date.now();
    if (!Number.isFinite(timestamp) || now - timestamp > SESSION_MAX_AGE_MS || timestamp > now + 60_000) return false;
    const key = await crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
    const expected = bytesToHex(await crypto.subtle.sign("HMAC", key, encoder.encode(payload)));
    return safeEqual(expected, signature);
  } catch {
    return false;
  }
}

export async function middleware(req) {
  const { pathname } = req.nextUrl;
  const adminToken = req.cookies.get(COOKIE_NAME)?.value;
  const customerToken = req.cookies.get(CUSTOMER_SESSION_COOKIE)?.value;
  const setupToken = req.cookies.get(CUSTOMER_SETUP_COOKIE)?.value;
  const adminOk = await isValidSessionToken(adminToken);
  const customerOk = await isValidCustomerSessionToken(customerToken);
  const setupOk = !!setupToken && !!process.env.CUSTOMER_SETUP_TOKEN && safeEqual(setupToken, process.env.CUSTOMER_SETUP_TOKEN);
  const ok = adminOk || customerOk || setupOk;

  if (pathname.startsWith("/api/dashboard")) {
    if (!ok) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    return NextResponse.next();
  }

  if (pathname.startsWith("/dashboard") && pathname !== "/dashboard/login") {
    if (!ok) return NextResponse.redirect(new URL("/dashboard/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/api/dashboard/:path*"],
};
