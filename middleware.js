import { NextResponse } from "next/server";
import { isValidSessionToken, COOKIE_NAME } from "./lib/auth";
import { isCustomerSetupAuthorized } from "./lib/customer-access";

export async function middleware(req) {
  const { pathname } = req.nextUrl;
  const adminToken = req.cookies.get(COOKIE_NAME)?.value;
  const adminOk = await isValidSessionToken(adminToken);
  const customerOk = await isCustomerSetupAuthorized();
  const ok = adminOk || customerOk;

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
