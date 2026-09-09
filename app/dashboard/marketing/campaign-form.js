"use client";

import { useState } from "react";

export default function CampaignForm() {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [ctaLabel, setCtaLabel] = useState("CHECK IT OUT");
  const [ctaUrl, setCtaUrl] = useState("");
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    setStatus(null);
    try {
      const res = await fetch("/api/campaign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, message, ctaLabel, ctaUrl }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "送信に失敗しました");
      setStatus(`送信完了：${data.sent}名`);
      setSubject("");
      setMessage("");
      setCtaUrl("");
    } catch (err) {
      setStatus(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} style={{ display: "grid", gap: 12, marginTop: 24 }}>
      <input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="件名" required />
      <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="メール本文" rows={8} required />
      <input value={ctaLabel} onChange={(e) => setCtaLabel(e.target.value)} placeholder="ボタン文言" />
      <input value={ctaUrl} onChange={(e) => setCtaUrl(e.target.value)} placeholder="リンクURL（任意）" />
      <button className="buy-button" disabled={loading}>{loading ? "送信中…" : "SUBSCRIBERSへ送信"}</button>
      {status && <p>{status}</p>}
    </form>
  );
}
