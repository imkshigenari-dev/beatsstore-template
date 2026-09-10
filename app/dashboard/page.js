import Link from "next/link";
import { listBeats } from "../../lib/beats";
import DeleteBeatButton from "./delete-button";
import VisibilityButton from "./visibility-button";
import StripeStatus from "./stripe-status";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const beats = await listBeats(null, { includeHidden: true });

  return (
    <div style={{ maxWidth: 860, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 24, gap: 16, flexWrap: "wrap" }}>
        <div>
          <p style={{ fontFamily: "IBM Plex Mono", fontSize: 10, opacity: .55, margin: "0 0 6px" }}>PRODUCER / STORE DASHBOARD</p>
          <h1 style={{ margin: 0 }}>ダッシュボード</h1>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Link href="/dashboard/marketing" className="buy-button" style={{ display: "inline-block", padding: "10px 16px", width: "auto" }}>MARKETING</Link>
          <Link href="/dashboard/new" className="buy-button" style={{ display: "inline-block", padding: "10px 16px", width: "auto" }}>+ 新しいビート</Link>
        </div>
      </div>

      <section style={{ marginBottom: 24, padding: "14px 16px", border: "1px solid #333", fontFamily: "IBM Plex Mono", fontSize: 10, lineHeight: 1.7 }}>
        <div style={{ opacity: .5, letterSpacing: ".08em" }}>TEST PROGRAM</div>
        <div style={{ marginTop: 2 }}>SETUP FEE ¥0 · PLATFORM FEE 0% · PUBLIC BEATS MAX 10</div>
        <div style={{ marginTop: 3, opacity: .45 }}>テスト導入期間は販売機能・Stripe接続・ビート管理を確認するための無料運用です。</div>
      </section>

      <StripeStatus />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 }}>
        <div>
          <p style={{ fontFamily: "IBM Plex Mono", fontSize: 10, opacity: .55, margin: 0 }}>BEATS</p>
          <h2 style={{ margin: "4px 0 0" }}>ビート管理 <span style={{ fontSize: 12, opacity: .45 }}>({beats.length})</span></h2>
        </div>
        <span style={{ fontFamily: "IBM Plex Mono", fontSize: 10, opacity: .45 }}>PUBLIC LIMIT / 10</span>
      </div>

      {beats.length === 0 && <p style={{ fontFamily: "IBM Plex Mono", fontSize: 13 }}>まだビートが登録されていません。</p>}
      <div className="tracklist">
        {beats.map((beat) => (
          <div key={beat.id} className="track" style={{ textDecoration: "none" }}>
            <div className="track__index">·</div>
            <div className="track__main">
              {beat.thumbnailUrl ? <img className="track__thumb" src={beat.thumbnailUrl} alt="" /> : <div className="track__reel" style={{ "--reel-color": beat.coverColor || "#1f4fb6" }} />}
              <div style={{ minWidth: 0 }}>
                <div className="track__title">{beat.title}</div>
                <div className="track__meta">{beat.genre} · {beat.bpm} BPM · {beat.key} · {beat.visibility || "public"}</div>
                <div style={{ marginTop: 5, fontFamily: "IBM Plex Mono", fontSize: 10, opacity: .55 }}>
                  ¥{(beat.prices?.rental ?? 5500).toLocaleString()} / ¥{(beat.prices?.premium ?? 15000).toLocaleString()} / ¥{(beat.prices?.exclusive ?? 33000).toLocaleString()}
                </div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap", justifyContent: "flex-end" }}>
              <Link href={`/dashboard/edit/${beat.id}`} className="buy-button" style={{ width: "auto", padding: "7px 10px", fontSize: 10 }}>EDIT</Link>
              <VisibilityButton beatId={beat.id} visibility={beat.visibility || "public"} />
              <DeleteBeatButton beatId={beat.id} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
