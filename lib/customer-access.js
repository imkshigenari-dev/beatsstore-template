import { cookies } from "next/headers";

export const CUSTOMER_SETUP_COOKIE = "wino_customer_setup";

export function isValidSetupToken(token) {
  const expected = process.env.CUSTOMER_SETUP_TOKEN;
  if (!token || !expected) return false;
  return token === expected;
}

export async function isCustomerSetupAuthorized() {
  const cookieStore = await cookies();
  return isValidSetupToken(cookieStore.get(CUSTOMER_SETUP_COOKIE)?.value);
}
