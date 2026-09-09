import { Resend } from "resend";

function getResend() {
  const key = process.env.RESEND_API_KEY;\n  if (!key) throw new Error("RESEND_API_KEY is not configured");\n  return new Resend(key);\n}

export async function sendBeatAnnouncement({ beat, earlyAccess = false }) {
  const { listActiveSubscribers } = await import("./subscribers");
  const recipients = await listActiveSubscribers();
  if (recipients.length === 0) return { sent: 0 };

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  const beatUrl = `${siteUrl}/beat/${beat.id}`;
  const eyebrow = earlyAccess ? "EARLY ACCESS / WINO" : "NEW BEAT / WINO";
  const subject = earlyAccess
    ? `【先行公開】${beat.title} — WINO BEATS`
    : `【NEW BEAT】${beat.title} — WINO BEATS`;

  const text = [
    eyebrow,
    "",
    beat.title,
    `${beat.bpm} BPM / ${beat.key} / ${beat.genre}`,
    "",
    earlyAccess
      ? "一般公開前に、このビートを先行でチェックできます。"
      : "WINOに新しいビートが追加されました。",
    "",
    beatUrl,
    "",
    "WINO BEATS",
    `配信停止: ${siteUrl}/api/subscribe?email={{email}}`,
  ].join("\n");

  const chunks = [];
  for (let i = 0; i < recipients.length; i += 50) chunks.push(recipients.slice(i, i + 50));
  let sent = 0;
  for (const chunk of chunks) {
    const result = await getResend().batch.send(
      chunk.map((email) => ({
        from: process.env.MAIL_FROM,
        to: email,
        subject,
        text: text.replace("{{email}}", encodeURIComponent(email)),
      }))
    );
    if (result?.error) throw new Error(result.error.message || "announcement failed");
    sent += chunk.length;
  }
  return { sent };
}
