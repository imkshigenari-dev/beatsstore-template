"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginForm({ setupMode = false }) {
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
    <>
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
    </>
  );
}
