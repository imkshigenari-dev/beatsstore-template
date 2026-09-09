"use client";

import { useState } from "react";

export default function ProfileForm({ customer }) {
  const [artistName, setArtistName] = useState(customer.artistName || "");
  const [legalName, setLegalName] = useState(customer.legalName || "");
  const [message, setMessage] = useState("");

  async function save(e) {
    e.preventDefault();
    setMessage("");
    const res = await fetch("/api/account/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ artistName, legalName }),
    });
    const data = await res.json();
    setMessage(res.ok ? "保存しました" : (data.error || "保存に失敗しました"));
  }

  return (
    <form onSubmit={save}>
      <div className="field"><label>ARTIST NAME</label><input value={artistName} onChange={(e) => setArtistName(e.target.value)} /></div>
      <div className="field"><label>LEGAL NAME / CONTRACT</label><input value={legalName} onChange={(e) => setLegalName(e.target.value)} /></div>
      <button className="buy-button" type="submit">SAVE PROFILE</button>
      {message && <p style={{ color: "#829987", fontSize: 10, marginTop: 10 }}>{message}</p>}
    </form>
  );
}
