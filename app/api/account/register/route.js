import { NextResponse } from "next/server";
import { createCustomer, createCustomerSession, CUSTOMER_COOKIE_NAME } from "../../../../lib/customer-auth";

export const runtime = "nodejs";

export async function POST(req) {
  try {
    const { email, password, artistName, legalName } = await req.json();
    const normalized = String(email || "").trim().toLowerCase();

    if (!normalized || !normalized.includes("@")) {
      return NextResponse.json({ error: "有効なメールアドレスを入力してください" }, { status: 400 });
    }
    if (String(password || "").length < 8) {
      return NextResponse.json({ error: "パスワードは8文字以上で設定してください" }, { status: 400 });
    }

    const customer = await createCustomer({ email: normalized, password, artistName, legalName });
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
  } catch (err) {
    return NextResponse.json({ error: err?.message || "アカウント作成に失敗しました" }, { status: 400 });
  }
}
