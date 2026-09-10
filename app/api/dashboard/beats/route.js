import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { nanoid } from "nanoid";
import { saveBeat } from "../../../../lib/beats";
import { isValidSessionToken, COOKIE_NAME } from "../../../../lib/auth";
import { sendBeatAnnouncement } from "../../../../lib/marketing-email";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function svgThumbnail({ title, bpm, key, genre, coverColor }) {
  const safe = (v) => String(v || "").replace(/[&<>\"']/g, "");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1200" viewBox="0 0 1200 1200"><defs><radialGradient id="g"><stop offset="0" stop-color="${safe(coverColor)}" stop-opacity=".95"/><stop offset=".55" stop-color="#3f4850" stop-opacity=".18"/><stop offset="1" stop-color="#050505"/></radialGradient><filter id="b"><feGaussianBlur stdDeviation="30"/></filter></defs><rect width="1200" height="1200" fill="#050505"/><circle cx="350" cy="320" r="360" fill="${safe(coverColor)}" opacity=".34" filter="url(#b)"/><circle cx="920" cy="930" r="300" fill="#a47f92" opacity=".18" filter="url(#b)"/><rect width="1200" height="1200" fill="url(#g)"/><text x="72" y="96" fill="#777" font-family="Arial" font-size="22" letter-spacing="7">WINO / BEAT STORE</text><text x="72" y="1000" fill="#d5d0c5" font-family="Arial" font-size="88" font-weight="800">${safe(title)}</text><text x="74" y="1060" fill="#777" font-family="Arial" font-size="22" letter-spacing="4">${safe(genre).toUpperCase()}   ${safe(bpm)} BPM   ${safe(key).toUpperCase()}</text><text x="1090" y="1080" fill="#7f9990" font-family="Arial" font-size="18" text-anchor="end" letter-spacing="5">MORE BEATS</text></svg>`;
}

async function requireAdmin(req) {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  return isValidSessionToken(token);
}

export async function POST(req) {
  let stage = "start";
  try {
    if (!(await requireAdmin(req))) return NextResponse.json({ error: "ログインが必要です" }, { status: 401 });
    const data = await req.json();
    const { id, title, bpm, key, genre, prices, coverColor, coverMode, thumbnailUrl, previewUrl, files = {}, visibility, notifySubscribers } = data;

    if (!title || !Number.isFinite(Number(bpm)) || Number(bpm) < 40 || Number(bpm) > 240 || !key || !previewUrl) {
      return NextResponse.json({ error: "タイトル・BPM・Key・試聴用ファイルを確認してください" }, { status: 400 });
    }
    if (!["public", "early_access", "draft"].includes(visibility)) return NextResponse.json({ error: "公開設定が不正です" }, { status: 400 });
    if (!["auto", "upload"].includes(coverMode)) return NextResponse.json({ error: "サムネイル設定が不正です" }, { status: 400 });

    const normalizedPrices = {};
    for (const planId of ["rental", "premium", "exclusive"]) {
      const value = Number(prices?.[planId]);
      if (!Number.isInteger(value) || value < 0) return NextResponse.json({ error: "価格は0円以上の整数で設定してください" }, { status: 400 });
      normalizedPrices[planId] = value;
    }

    const finalId = String(id || nanoid(12));
    let finalThumbnailUrl = thumbnailUrl || null;

    if (!finalThumbnailUrl) {
      stage = "auto thumbnail upload";
      const svg = svgThumbnail({ title, bpm, key, genre, coverColor });
      const blob = await put(`thumbnails/${finalId}-${nanoid(8)}.svg`, new Blob([svg], { type: "image/svg+xml" }), {
        access: "public", addRandomSuffix: true, contentType: "image/svg+xml",
      });
      finalThumbnailUrl = blob.url;
    }

    stage = "database save";
    const beat = {
      id: finalId,
      title: String(title).trim(),
      genre: String(genre || ""),
      bpm: Number(bpm),
      key: String(key).trim(),
      producer: process.env.SELLER_LEGAL_NAME || "WINO",
      coverColor: coverColor || "#789ca0",
      thumbnailUrl: finalThumbnailUrl,
      previewFile: previewUrl,
      files: Object.fromEntries(Object.entries(files).filter(([, url]) => Boolean(url))),
      prices: normalizedPrices,
      visibility,
      createdAt: new Date().toISOString(),
    };
    await saveBeat(beat);

    if (notifySubscribers && visibility !== "draft") {
      try {
        await sendBeatAnnouncement({ beat, earlyAccess: visibility === "early_access" });
      } catch (emailError) {
        console.error("beat announcement error:", emailError);
      }
    }

    return NextResponse.json({ ok: true, beat });
  } catch (err) {
    console.error("beat upload error:", { stage, error: err });
    return NextResponse.json({ error: `アップロードに失敗しました（${stage}）。${err?.message || "Vercel設定を確認してください。"}` }, { status: 500 });
  }
}
