import { cookies } from "next/headers";
import crypto from "node:crypto";

export const CUSTOMER_SETUP_COOKIE = "wino_customer_setup";

function safeEqual(a, b) {
  if (!a || !b) return false;
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && crypto.timingSafeEqual(left, right);
}

export function isValidSetupToken(token) {
  return safeEqual(token, process.env.CUSTOMER_SETUP_TOKEN);
}

export async function isCustomerSetupAuthorized() {
  const cookieStore = await cookies();
  return isValidSetupToken(cookieStore.get(CUSTOMER_SETUP_COOKIE)?.value);
}
