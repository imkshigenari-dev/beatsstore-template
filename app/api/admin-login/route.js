import { NextResponse } from "next/server";
import { createSessionToken, COOKIE_NAME } from "../../../lib/auth";
import {
  createCustomerAccount,
  createCustomerSessionToken,
  CUSTOMER_SESSION_COOKIE,
  isCustomerSetupAuthorized,
  verifyCustomerCredentials,
} from "../../../lib/customer-access";

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
};

export async function POST(req) {
  try {
    const { email, password, mode = "login" } = await req.json();

    if (mode === "register") {
      if (!(await isCustomerSetupAuthorized())) return NextResponse.json({ error: "セットアップ認証が必要です" }, { status: 403 });
      const account = await createCustomerAccount(email, password);
      const token = await createCustomerSessionToken(account.email);
      const res = NextResponse.json({ ok: true, registered: true });
      res.cookies.set(CUSTOMER_SESSION_COOKIE, token, { ...cookieOptions, maxAge: 60 * 60 * 24 * 30 });
      res.cookies.set("wino_customer_setup", "", { ...cookieOptions, maxAge: 0 });
      return res;
    }

    const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
    const adminOk = normalizedEmail === String(process.env.ADMIN_EMAIL || "").trim().toLowerCase() && password === String(process.env.ADMIN_PASSWORD || "");

    if (adminOk) {
      if (!process.env.ADMIN_SESSION_SECRET) return NextResponse.json({ error: "ADMIN_SESSION_SECRET が設定されていません" }, { status: 500 });
      const token = await createSessionToken();
      const res = NextResponse.json({ ok: true, role: "admin" });
      res.cookies.set(COOKIE_NAME, token, { ...cookieOptions, maxAge: 60 * 60 * 24 * 7 });
      return res;
    }

    if (!(await verifyCustomerCredentials(email, password))) {
      return NextResponse.json({ error: "メールアドレスまたはパスワードが違います" }, { status: 401 });
    }

    const token = await createCustomerSessionToken(email);
    const res = NextResponse.json({ ok: true, role: "customer" });
    res.cookies.set(CUSTOMER_SESSION_COOKIE, token, { ...cookieOptions, maxAge: 60 * 60 * 24 * 30 });
    return res;
  } catch (error) {
    return NextResponse.json({ error: error?.message || "ログインに失敗しました" }, { status: 400 });
  }
}
