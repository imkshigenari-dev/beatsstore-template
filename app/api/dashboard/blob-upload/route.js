import { NextResponse } from "next/server";
import { handleUpload } from "@vercel/blob/client";
import { isValidSessionToken, COOKIE_NAME } from "../../../../lib/auth";

export const runtime = "nodejs";

export async function POST(request) {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (!isValidSessionToken(token)) return NextResponse.json({ error: "ログインが必要です" }, { status: 401 });

  try {
    const body = await request.json();
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => ({
        allowedContentTypes: [
          "audio/mpeg", "audio/mp3", "audio/wav", "audio/x-wav", "audio/wave",
          "image/png", "image/jpeg", "image/webp", "application/octet-stream"
        ],
        maximumSizeInBytes: 500 * 1024 * 1024,
      }),
      onUploadCompleted: async () => {},
    });
    return NextResponse.json(jsonResponse);
  } catch (error) {
    console.error("blob client upload error:", error);
    return NextResponse.json({ error: error?.message || "Blob upload authorization failed" }, { status: 400 });
  }
}