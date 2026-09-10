import { NextResponse } from "next/server";
import { CUSTOMER_SETUP_COOKIE, isValidSetupToken } from "../../../lib/customer-access";

export async function GET(request) {
  const token = new URL(request.url).searchParams.get("token");

  if (!isValidSetupToken(token)) {
    return NextResponse.json({ error: "Invalid setup token." }, { status: 403 });
  }

  const response = NextResponse.redirect(new URL("/dashboard/login?setup=1", request.url));
  response.cookies.set(CUSTOMER_SETUP_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60,
  });
  return response;
}
