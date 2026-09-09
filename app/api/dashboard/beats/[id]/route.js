import { NextResponse } from "next/server";
import { deleteBeat, getBeat, saveBeat } from "../../../../../lib/beats";
import { isValidSessionToken, COOKIE_NAME } from "../../../../../lib/auth";

export async function DELETE(req, { params }) {
  try {
    await deleteBeat(params.id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "削除に失敗しました" }, { status: 500 });
  }
}

export async function PATCH(req, { params }) {
  try {
    const token = req.cookies.get(COOKIE_NAME)?.value;
    if (!(await isValidSessionToken(token))) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

    const beat = await getBeat(params.id);
    if (!beat) return NextResponse.json({ error: "ビートが見つかりません" }, { status: 404 });

    const { visibility } = await req.json();
    if (!["public", "early_access", "draft"].includes(visibility)) {
      return NextResponse.json({ error: "公開設定が不正です" }, { status: 400 });
    }

    const updated = await saveBeat({ ...beat, visibility });
    return NextResponse.json({ ok: true, beat: updated });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "公開設定の更新に失敗しました" }, { status: 500 });
  }
}
