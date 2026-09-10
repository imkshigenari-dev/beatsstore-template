import { NextResponse } from "next/server";
import { isValidSessionToken, COOKIE_NAME } from "./lib/auth";
import { CUSTOMER_SESSION_COOKIE, isCustomerSetupAuthorized, isValidCustomerSessionToken } from "./lib/customer-access";

export async function middleware(req) {
  const { pathname } = req.nextUrl;
  const adminToken = req.cookies.get(COOKIE_NAME)?.value;
  const customerToken = req.cookies.get(CUSTOMER_SESSION_COOKIE)?.value;
  const adminOk = await isValidSessionToken(adminToken);
  const customerOk = await isValidCustomerSessionToken(customerToken);
  const setupOk = await isCustomerSetupAuthorized();
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
