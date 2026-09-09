import { NextResponse } from "next/server";
import { createCustomerSession, getCustomerByEmail, verifyPassword, CUSTOMER_COOKIE_NAME } from "../../../../lib/customer-auth";

export const runtime = "nodejs";

export async function POST(req) {
  try {
    const { email, password } = await req.json();
    const normalized = String(email || "").trim().toLowerCase();
    const customer = await getCustomerByEmail(normalized);

    if (!customer || !verifyPassword(password, customer.passwordHash)) {
      return NextResponse.json({ error: "メールアドレスまたはパスワードが違います" }, { status: 401 });
    }

    const token = await createCustomerSession(customer.email);
    const res = NextResponse.json({ ok: true });
    res.cookies.set(CUSTOMER_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
    return res;
  } catch {
    return NextResponse.json({ error: "ログインに失敗しました" }, { status: 400 });
  }
}
