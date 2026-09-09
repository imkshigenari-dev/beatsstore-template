import { NextResponse } from "next/server";
import { isValidSessionToken, COOKIE_NAME } from "../../../lib/auth";
import { listActiveSubscribers } from "../../../lib/subscribers";
import { Resend } from "resend";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req) {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!(await isValidSessionToken(token))) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  try {
    const { subject, message, ctaLabel, ctaUrl } = await req.json();
    if (!subject?.trim() || !message?.trim()) return NextResponse.json({ error: "件名と本文を入力してください" }, { status: 400 });

    const recipients = await listActiveSubscribers();
    if (!recipients.length) return NextResponse.json({ sent: 0 });

    const resend = new Resend(process.env.RESEND_API_KEY);
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
    const body = [
      message.trim(),
      ctaUrl ? `\n${ctaLabel?.trim() || "CHECK IT OUT"}: ${ctaUrl.trim()}` : "",
      "",
      "WINO BEATS",
      "配信停止: {{UNSUBSCRIBE_URL}}",
    ].join("\n");

    let sent = 0;
    for (let i = 0; i < recipients.length; i += 50) {
      const chunk = recipients.slice(i, i + 50);
      const result = await resend.batch.send(chunk.map((email) => ({
        from: process.env.MAIL_FROM,
        to: email,
        subject: subject.trim(),
        text: body.replace("{{UNSUBSCRIBE_URL}}", `${siteUrl}/unsubscribe?email=${encodeURIComponent(email)}`),
      })));
      if (result?.error) throw new Error(result.error.message || "campaign failed");
      sent += chunk.length;
    }
    return NextResponse.json({ sent });
  } catch (err) {
    console.error("campaign error:", err);
    return NextResponse.json({ error: err?.message || "送信に失敗しました" }, { status: 500 });
  }
}
