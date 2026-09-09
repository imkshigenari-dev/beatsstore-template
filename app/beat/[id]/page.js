import { getBeat } from "../../../lib/beats";
import { notFound } from "next/navigation";
import BeatPurchasePanel from "./purchase-panel";

export default async function BeatPage({ params }) {
  const beat = await getBeat(params.id);
  if (!beat) return notFound();

  const previewUrl = beat.previewFile ? `/api/preview/${beat.id}` : null;

  return (
    <>
      <a href="/" className="beat-page__back">
        ← 一覧に戻る
      </a>

      <div className="beat-head">
        <div
          className="beat-head__reel"
          style={{ "--reel-color": beat.coverColor }}
        />
        <div>
          <h1>{beat.title}</h1>
          <div className="beat-head__meta">
            {beat.bpm} BPM · {beat.key} · prod. {beat.producer || "WINO"}
          </div>
        </div>
      </div>

      {previewUrl ? (
        <audio controls preload="metadata" src={previewUrl} />
      ) : (
        <p className="error-text">試聴音源が登録されていません。</p>
      )}

      <BeatPurchasePanel beat={beat} />
    </>
  );
}
