"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function DashboardLoginPage() {
  const searchParams = useSearchParams();
  const setupMode = searchParams.get("setup") === "1";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, mode: setupMode ? "register" : "login" }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || (setupMode ? "登録に失敗しました" : "ログインに失敗しました"));
      router.replace("/dashboard");
      router.refresh();
    } catch (e) {
      setError(e.message);
      setLoading(false);
    }
  }

  return (
    <main className="owner-login">
      <div className="owner-login__eyebrow">BEAT STORE / PRIVATE AREA</div>
      <h1>{setupMode ? <>CREATE<br /><span>ACCOUNT</span></> : <>STORE<br /><span>LOGIN</span></>}</h1>
      <p>{setupMode ? "あなた専用の管理画面を作成します。" : "メールアドレスとパスワードでログインしてください。"}</p>

      <form onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="email">EMAIL</label>
          <input id="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className="field">
          <label htmlFor="password">{setupMode ? "PASSWORD（10文字以上）" : "PASSWORD"}</label>
          <input id="password" type="password" autoComplete={setupMode ? "new-password" : "current-password"} value={password} onChange={(e) => setPassword(e.target.value)} minLength={10} required />
        </div>
        <button className="buy-button" type="submit" disabled={loading}>
          {loading ? "AUTHENTICATING…" : setupMode ? "CREATE ACCOUNT" : "ENTER DASHBOARD"}
        </button>
      </form>

      {error && <p className="owner-login__error">{error}</p>}
      <div className="owner-login__note"><span /> Secure customer access</div>
    </main>
  );
}
