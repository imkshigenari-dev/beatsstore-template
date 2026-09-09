"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DashboardLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "ログインに失敗しました");
      }
      router.replace("/dashboard");
      router.refresh();
    } catch (e) {
      setError(e.message);
      setLoading(false);
    }
  }

  return (
    <main className="owner-login">
      <div className="owner-login__eyebrow">WINO® / PRIVATE AREA</div>
      <h1>OWNER<br /><span>LOGIN</span></h1>
      <p>WINO BEATS STORE 管理画面。オーナー専用です。</p>

      <form onSubmit={handleLogin}>
        <div className="field">
          <label htmlFor="email">EMAIL</label>
          <input id="email" type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className="field">
          <label htmlFor="password">PASSWORD</label>
          <input id="password" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <button className="buy-button" type="submit" disabled={loading}>
          {loading ? "AUTHENTICATING…" : "ENTER DASHBOARD"}
        </button>
      </form>

      {error && <p className="owner-login__error">{error}</p>}
      <div className="owner-login__note"><span /> Restricted access · owner only</div>
    </main>
  );
}
