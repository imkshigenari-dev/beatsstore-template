"use client";

import { useState } from "react";

export default function SubscribeForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    setStatus(null);
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "登録に失敗しました");
      setEmail("");
      setStatus("登録完了。次のビートをいち早く届けます。");
    } catch (err) {
      setStatus(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="subscribe-form" onSubmit={submit}>
      <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="YOUR EMAIL" aria-label="メールアドレス" />
      <button className="buy-button" type="submit" disabled={loading}>{loading ? "登録中…" : "GET EARLY ACCESS"}</button>
      {status && <p className="subscribe-form__status">{status}</p>}
    </form>
  );
}
