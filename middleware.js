import { NextResponse } from "next/server";
import { isValidSessionToken, COOKIE_NAME } from "./lib/auth";

export async function middleware(req) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get(COOKIE_NAME)?.value;
  const ok = await isValidSessionToken(token);

  if (pathname.startsWith("/api/dashboard")) {
    if (!ok) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
    return NextResponse.next();
  }

  if (pathname.startsWith("/dashboard") && pathname !== "/dashboard/login") {
    if (!ok) {
      const loginUrl = new URL("/dashboard/login", req.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/api/dashboard/:path*"],
};
