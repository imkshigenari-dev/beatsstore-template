import { NextResponse } from "next/server";
import { get } from "@vercel/blob";
import { getOrder } from "../../../../lib/orders";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function extensionForOrder(order) {
  if (order.planId === "rental") return "mp3";
  if (order.planId === "premium" || order.planId === "exclusive") return "wav";

  const raw = String(order.fileUrl || "").split("?")[0];
  const match = raw.match(/\.([a-z0-9]+)$/i);
  return match?.[1]?.toLowerCase() || "bin";
}

function contentTypeForExtension(ext) {
  if (ext === "mp3") return "audio/mpeg";
  if (ext === "wav") return "audio/wav";
  return "application/octet-stream";
}

export async function GET(req, { params }) {
  const order = await getOrder(params.orderId);

  if (!order || order.status !== "paid") {
    return NextResponse.json({ error: "購入情報が確認できません" }, { status: 403 });
  }

  if (!order.fileUrl) {
    return NextResponse.json({ error: "納品ファイルが登録されていません" }, { status: 404 });
  }

  try {
    const blob = await get(order.fileUrl, { access: "private" });

    if (!blob || blob.statusCode !== 200 || !blob.stream) {
      return NextResponse.json({ error: "ファイルを取得できません" }, { status: 404 });
    }

    const ext = extensionForOrder(order);
    const safeTitle = String(order.beatTitle || "WINO-BEAT")
      .replace(/[\\/:*?"<>|]/g, "")
      .trim() || "WINO-BEAT";

    const filename = `${safeTitle}.${ext}`;

    const headers = new Headers({
      "Content-Type": blob.contentType || contentTypeForExtension(ext),
      "Cache-Control": "private, no-store",
      "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`,
    });

    return new NextResponse(blob.stream, { status: 200, headers });
  } catch (err) {
    console.error("private blob download error:", err);
    return NextResponse.json({ error: "ダウンロードに失敗しました" }, { status: 500 });
  }
}
