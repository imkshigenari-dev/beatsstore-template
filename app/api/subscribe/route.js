import { NextResponse } from "next/server";
import { subscribeEmail, unsubscribeEmail } from "../../../lib/subscribers";

export async function POST(req) {
  try {
    const { email } = await req.json();
    await subscribeEmail(email);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "有効なメールアドレスを入力してください" }, { status: 400 });
  }
}

export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");
    await unsubscribeEmail(email);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "unsubscribe failed" }, { status: 400 });
  }
}
