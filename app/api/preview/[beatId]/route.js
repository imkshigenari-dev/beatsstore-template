import { NextResponse } from "next/server";
import { getBeat } from "../../../../lib/beats";
import { head } from "@vercel/blob";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req, { params }) {
  const beat = await getBeat(params.beatId);

  if (!beat || beat.visibility === "draft" || !beat.previewFile) {
    return NextResponse.json({ error: "試聴音源が見つかりません" }, { status: 404 });
  }

  try {
    // Blob URLをHEADで検証し、公開Blobならそのまま返す。
    // Private Blobの場合は、環境に応じた署名URL処理へフォールバックする。
    const blobUrl = beat.previewFile;
    const blob = await head(blobUrl);

    if (blob?.url) {
      return NextResponse.redirect(blob.url, 302);
    }

    return NextResponse.json({ error: "試聴音源URLを取得できません" }, { status: 404 });
  } catch (err) {
    console.error("preview error:", err);
    return NextResponse.json({ error: "試聴音源の再生に失敗しました" }, { status: 500 });
  }
}
