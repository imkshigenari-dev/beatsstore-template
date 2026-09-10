"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const PLAN_LABELS = {
  rental: "レンタル",
  premium: "プレミアムリース",
  exclusive: "独占購入",
};

export default function EditBeatForm({ beat, genres, prices: initialPrices }) {
  const router = useRouter();
  const [title, setTitle] = useState(beat.title || "");
  const [bpm, setBpm] = useState(String(beat.bpm || ""));
  const [key, setKey] = useState(beat.key || "");
  const [genre, setGenre] = useState(beat.genre || genres[0] || "");
  const [visibility, setVisibility] = useState(beat.visibility || "public");
  const [prices, setPrices] = useState(initialPrices);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function setPrice(id, value) {
    setPrices((current) => ({ ...current, [id]: value }));
  }

  async function save() {
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const payload = {
        title: title.trim(),
        bpm: Number(bpm),
        key: key.trim(),
        genre,
        visibility,
        prices: Object.fromEntries(Object.entries(prices).map(([id, value]) => [id, Number(value)])),
      };
      const res = await fetch(`/api/dashboard/beats/${beat.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "保存に失敗しました");
      setMessage("保存しました");
      router.refresh();
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <section style={{ padding: 18, border: "1px solid rgba(255,255,255,.1)", borderRadius: 8, marginBottom: 16 }}>
        <p style={{ fontFamily: "IBM Plex Mono", fontSize: 11, opacity: .6 }}>BASIC</p>
        <div className="field"><label>曲名</label><input value={title} onChange={(e) => setTitle(e.target.value)} /></div>
        <div className="field"><label>BPM</label><input type="number" min="40" max="240" value={bpm} onChange={(e) => setBpm(e.target.value)} /></div>
        <div className="field"><label>Key</label><input value={key} onChange={(e) => setKey(e.target.value)} /></div>
        <div className="field"><label>ジャンル</label><select value={genre} onChange={(e) => setGenre(e.target.value)}>{genres.map((g) => <option key={g} value={g}>{g}</option>)}</select></div>
      </section>

      <section style={{ padding: 18, border: "1px solid rgba(255,255,255,.1)", borderRadius: 8, marginBottom: 16 }}>
        <p style={{ fontFamily: "IBM Plex Mono", fontSize: 11, opacity: .6 }}>PRICING</p>
        {Object.entries(PLAN_LABELS).map(([id, label]) => (
          <div key={id} className="field">
            <label>{label}（円）</label>
            <input type="number" min="0" step="100" value={prices[id]} onChange={(e) => setPrice(id, e.target.value)} />
          </div>
        ))}
        <p style={{ fontSize: 11, opacity: .55, margin: 0 }}>このビートの販売価格を個別に設定できます。</p>
      </section>

      <section style={{ padding: 18, border: "1px solid rgba(255,255,255,.1)", borderRadius: 8, marginBottom: 16 }}>
        <p style={{ fontFamily: "IBM Plex Mono", fontSize: 11, opacity: .6 }}>VISIBILITY</p>
        <div className="field"><label>公開設定</label><select value={visibility} onChange={(e) => setVisibility(e.target.value)}><option value="public">PUBLIC / 公開</option><option value="early_access">EARLY ACCESS / 先行公開</option><option value="draft">DRAFT / 非公開</option></select></div>
      </section>

      <button className="buy-button" onClick={save} disabled={loading}>{loading ? "保存中…" : "変更を保存する"}</button>
      {message && <p style={{ fontSize: 12, marginTop: 12 }}>{message}</p>}
      {error && <p className="error-text">{error}</p>}
    </div>
  );
}
