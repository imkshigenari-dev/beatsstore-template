const encoder = new TextEncoder();

async function getKey() {
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(process.env.ADMIN_SESSION_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

function toHex(buffer) {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function safeEqual(a, b) {
  if (typeof a !== "string" || typeof b !== "string" || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function createSessionToken() {
  const payload = `admin:${Date.now()}`;
  const key = await getKey();
  const sigBuffer = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
  const signature = toHex(sigBuffer);
  return btoa(`${payload}.${signature}`);
}

export async function isValidSessionToken(token) {
  if (!token || !process.env.ADMIN_SESSION_SECRET) return false;
  try {
    const decoded = atob(token);
    const separator = decoded.lastIndexOf(".");
    if (separator < 0) return false;
    const payload = decoded.slice(0, separator);
    const signature = decoded.slice(separator + 1);
    if (!payload.startsWith("admin:") || !signature) return false;

    const timestamp = Number(payload.slice("admin:".length));
    if (!Number.isFinite(timestamp)) return false;
    const maxAgeMs = 1000 * 60 * 60 * 24 * 7;
    if (Date.now() - timestamp > maxAgeMs || timestamp > Date.now() + 60_000) return false;

    const key = await getKey();
    const sigBuffer = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
    const expected = toHex(sigBuffer);
    return safeEqual(expected, signature);
  } catch {
    return false;
  }
}

export const COOKIE_NAME = "wino_admin_session";
