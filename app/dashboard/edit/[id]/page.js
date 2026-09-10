import { notFound } from "next/navigation";
import Link from "next/link";
import { getBeat, GENRES, PLANS } from "../../../../lib/beats";
import EditBeatForm from "./edit-beat-form";

export const dynamic = "force-dynamic";

export default async function EditBeatPage({ params }) {
  const beat = await getBeat(params.id);
  if (!beat) notFound();

  const prices = {
    rental: beat.prices?.rental ?? PLANS.rental.priceJPY,
    premium: beat.prices?.premium ?? PLANS.premium.priceJPY,
    exclusive: beat.prices?.exclusive ?? PLANS.exclusive.priceJPY,
  };

  return (
    <div style={{ maxWidth: 620, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <p style={{ fontFamily: "IBM Plex Mono", fontSize: 11, opacity: .6, marginBottom: 6 }}>BEAT SETTINGS</p>
          <h1 style={{ margin: 0 }}>「{beat.title}」を編集</h1>
        </div>
        <Link href="/dashboard" className="buy-button" style={{ width: "auto", padding: "9px 14px" }}>戻る</Link>
      </div>
      <EditBeatForm beat={beat} genres={GENRES} prices={prices} />
    </div>
  );
}
