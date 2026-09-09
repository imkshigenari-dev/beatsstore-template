import Link from "next/link";
import { listBeats } from "../../lib/beats";
import DeleteBeatButton from "./delete-button";
import VisibilityButton from "./visibility-button";

export default async function DashboardPage() {
  const beats = await listBeats(null, { includeHidden: true });
  return (
    <div style={{ maxWidth: 720, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h1>ダッシュボード</h1>
        <div style={{ display: "flex", gap: 8 }}>
          <Link href="/dashboard/marketing" className="buy-button" style={{ display: "inline-block", padding: "10px 20px", width: "auto" }}>MARKETING</Link>
          <Link href="/dashboard/new" className="buy-button" style={{ display: "inline-block", padding: "10px 20px", width: "auto" }}>+ 新しいビートを投稿</Link>
        </div>
      </div>
      {beats.length === 0 && <p style={{ fontFamily: "IBM Plex Mono", fontSize: 13 }}>まだビートが登録されていません。</p>}
      <div className="tracklist">
        {beats.map((beat) => (
          <div key={beat.id} className="track" style={{ textDecoration: "none" }}>
            <div className="track__index">·</div>
            <div className="track__main">
              {beat.thumbnailUrl ? <img className="track__thumb" src={beat.thumbnailUrl} alt="" /> : <div className="track__reel" style={{ "--reel-color": beat.coverColor || "#1f4fb6" }} />}
              <div>
                <div className="track__title">{beat.title}</div>
                <div className="track__meta">{beat.genre} · {beat.bpm} BPM · {beat.key} · {beat.visibility || "public"}</div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}><VisibilityButton beatId={beat.id} visibility={beat.visibility || "public"} /><DeleteBeatButton beatId={beat.id} /></div>
          </div>
        ))}
      </div>
    </div>
  );
}
