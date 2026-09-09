"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AccountLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/account/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "ログインに失敗しました");
      router.replace("/account");
      router.refresh();
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }

  return (
    <main className="owner-login">
      <div className="owner-login__eyebrow">WINO® / CUSTOMER AREA</div>
      <h1>MY<br /><span>ACCOUNT</span></h1>
      <p>購入履歴、ライセンス情報、購入したビートのダウンロードを確認できます。</p>
      <form onSubmit={submit}>
        <div className="field"><label htmlFor="email">EMAIL</label><input id="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
        <div className="field"><label htmlFor="password">PASSWORD</label><input id="password" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required /></div>
        <button className="buy-button" type="submit" disabled={loading}>{loading ? "AUTHENTICATING…" : "LOGIN"}</button>
      </form>
      {error && <p className="owner-login__error">{error}</p>}
      <p style={{ marginTop: 22 }}>アカウントをお持ちでない方 → <Link href="/account/register">CREATE ACCOUNT</Link></p>
    </main>
  );
}
