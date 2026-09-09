import { NextResponse } from "next/server";
import { createSessionToken, COOKIE_NAME } from "../../../lib/auth";

export async function POST(req) {
  try {
    const { email, password } = await req.json();

    const ok =
      typeof email === "string" &&
      typeof password === "string" &&
      email.trim().toLowerCase() === String(process.env.ADMIN_EMAIL || "").trim().toLowerCase() &&
      password === String(process.env.ADMIN_PASSWORD || "");

    if (!ok) {
      return NextResponse.json({ error: "メールアドレスまたはパスワードが違います" }, { status: 401 });
    }

    if (!process.env.ADMIN_SESSION_SECRET) {
      return NextResponse.json({ error: "ADMIN_SESSION_SECRET が設定されていません" }, { status: 500 });
    }

    const token = await createSessionToken();
    const res = NextResponse.json({ ok: true });

    res.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return res;
  } catch {
    return NextResponse.json({ error: "ログインに失敗しました" }, { status: 400 });
  }
}
