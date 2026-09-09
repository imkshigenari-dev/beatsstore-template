import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { CUSTOMER_COOKIE_NAME, destroyCustomerSession } from "../../../../lib/customer-auth";

export const runtime = "nodejs";

export async function POST() {
  const token = cookies().get(CUSTOMER_COOKIE_NAME)?.value;
  await destroyCustomerSession(token);

  const res = NextResponse.json({ ok: true });
  res.cookies.set(CUSTOMER_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return res;
}
