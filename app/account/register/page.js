"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AccountRegisterPage() {
  const [form, setForm] = useState({ email: "", password: "", artistName: "", legalName: "" });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  function set(name, value) {
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/account/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "アカウント作成に失敗しました");
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
      <h1>CREATE<br /><span>ACCOUNT</span></h1>
      <p>購入履歴とライセンスをまとめて管理できます。</p>
      <form onSubmit={submit}>
        <div className="field"><label>ARTIST NAME</label><input value={form.artistName} onChange={(e) => set("artistName", e.target.value)} placeholder="アーティスト名" /></div>
        <div className="field"><label>LEGAL NAME</label><input value={form.legalName} onChange={(e) => set("legalName", e.target.value)} placeholder="本名（契約書用）" /></div>
        <div className="field"><label>EMAIL</label><input type="email" autoComplete="email" value={form.email} onChange={(e) => set("email", e.target.value)} required /></div>
        <div className="field"><label>PASSWORD</label><input type="password" autoComplete="new-password" minLength={8} value={form.password} onChange={(e) => set("password", e.target.value)} required /><small style={{ color: "#555", display: "block", marginTop: 7 }}>8文字以上</small></div>
        <button className="buy-button" type="submit" disabled={loading}>{loading ? "CREATING…" : "CREATE ACCOUNT"}</button>
      </form>
      {error && <p className="owner-login__error">{error}</p>}
      <p style={{ marginTop: 22 }}>すでにアカウントをお持ちの方 → <Link href="/account/login">LOGIN</Link></p>
    </main>
  );
}
