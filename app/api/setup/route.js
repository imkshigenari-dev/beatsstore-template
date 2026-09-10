import { NextResponse } from "next/server";
import { CUSTOMER_SETUP_COOKIE, isValidSetupToken } from "../../../lib/customer-access";
import { createSessionToken, COOKIE_NAME } from "../../../lib/auth";

export async function GET(request) {
  const token = new URL(request.url).searchParams.get("token");

  if (!isValidSetupToken(token)) {
    return NextResponse.json({ error: "Invalid setup token." }, { status: 403 });
  }

  const response = NextResponse.redirect(new URL("/dashboard", request.url));
  const sessionToken = await createSessionToken();
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  };

  response.cookies.set(CUSTOMER_SETUP_COOKIE, token, cookieOptions);
  response.cookies.set(COOKIE_NAME, sessionToken, cookieOptions);
  return response;
}
