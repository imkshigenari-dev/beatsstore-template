import Link from "next/link";
import SubscribeForm from "./subscribe-form";
import { listBeats, PLANS, GENRES } from "../lib/beats";

export default async function HomePage({ searchParams }) {
  const genre = searchParams?.genre || null;
  const beats = await listBeats(genre);

  return (
    <>
      <header className="site-header">
        <Link href="/" className="site-logo">WINO<span>®</span></Link>
        <nav className="site-nav">
          <Link href="/">Beats</Link>
          <Link href="/account">Account</Link>
        </nav>
      </header>

      <section className="hero">
        <div className="hero__art">
          <div className="hero__eyebrow">WINO BEATS / TOKYO — 2026</div>
          <div className="hero__neon-wrap">
            <div className="hero__neon">MoreBeats</div>
            <div className="hero__neon hero__neon--second">MoreBeats</div>
          </div>
          <div className="hero__signal">
            <span>SELECTED BEATS</span><span>FOR ARTISTS</span><span>◉ LIVE / ONLINE</span>
          </div>
        </div>
        <div className="hero__copy">
          <strong>Make music. Keep moving.</strong><br />
          WINOが制作したビートを、ここから直接ライセンス。レンタル / プレミアムリース / 独占購入に対応。
        </div>
      </section>

      <div className="section-head">
        <h2>Beats / {genre ? genre.toUpperCase() : "All"}</h2>
        <div className="section-head__meta">{String(beats.length).padStart(2, "0")} TRACKS</div>
      </div>

      <div className="genre-filter">
        <Link href="/" className={`genre-chip ${!genre ? "genre-chip--active" : ""}`}>ALL</Link>
        {GENRES.map((g) => <Link key={g} href={`/?genre=${g}`} className={`genre-chip ${genre === g ? "genre-chip--active" : ""}`}>{g.toUpperCase()}</Link>)}
      </div>

      <div className="tracklist">
        {beats.length === 0 && <p style={{ color: "#777", padding: "24px 4px" }}>該当するビートがまだありません。</p>}
        {beats.map((beat, i) => (
          <Link key={beat.id} href={`/beat/${beat.id}`} className="track">
            <div className="track__index">{String(i + 1).padStart(2, "0")}</div>
            <div className="track__main">
              {beat.thumbnailUrl ? <img className="track__thumb" src={beat.thumbnailUrl} alt="" /> : <div className="track__reel" style={{ "--reel-color": beat.coverColor || "#789ca0" }} />}
              <div><div className="track__title">{beat.title}</div><div className="track__meta">{beat.bpm} BPM · {beat.key} · {beat.genre}</div></div>
            </div>
            <div className="track__price">¥{PLANS.rental.priceJPY.toLocaleString("ja-JP")}〜</div>
          </Link>
        ))}
      </div>

      <section className="subscribe-panel">
        <div><div className="subscribe-panel__kicker">WINO / PRIVATE LIST</div><h2>FIRST ACCESS<br />TO NEW BEATS.</h2><p>最新ビートや先行公開をメールで受け取る。</p></div>
        <SubscribeForm />
      </section>

      <footer className="site-footer"><span>WINO® BEATS</span><span>MORE BEATS / MORE MUSIC</span></footer>
    </>
  );
}
