import { NextResponse } from "next/server";
import { deleteBeat, getBeat, saveBeat } from "../../../../../lib/beats";
import { isValidSessionToken, COOKIE_NAME } from "../../../../../lib/auth";
import { isCustomerSetupAuthorized } from "../../../../../lib/customer-access";

async function requireDashboardAccess(req) {
  const adminToken = req.cookies.get(COOKIE_NAME)?.value;
  if (await isValidSessionToken(adminToken)) return true;
  return isCustomerSetupAuthorized();
}

export async function DELETE(req, { params }) {
  try {
    if (!(await requireDashboardAccess(req))) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    const beat = await getBeat(params.id);
    if (!beat) return NextResponse.json({ error: "ビートが見つかりません" }, { status: 404 });
    await deleteBeat(params.id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "削除に失敗しました" }, { status: 500 });
  }
}

export async function PATCH(req, { params }) {
  try {
    if (!(await requireDashboardAccess(req))) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    const beat = await getBeat(params.id);
    if (!beat) return NextResponse.json({ error: "ビートが見つかりません" }, { status: 404 });

    const body = await req.json();
    const updated = { ...beat };

    if (body.visibility !== undefined) {
      if (!["public", "early_access", "draft"].includes(body.visibility)) return NextResponse.json({ error: "公開設定が不正です" }, { status: 400 });
      updated.visibility = body.visibility;
    }
    if (body.title !== undefined) {
      const title = String(body.title).trim();
      if (!title) return NextResponse.json({ error: "曲名を入力してください" }, { status: 400 });
      updated.title = title.slice(0, 120);
    }
    if (body.bpm !== undefined) {
      const bpm = Number(body.bpm);
      if (!Number.isFinite(bpm) || bpm < 40 || bpm > 240) return NextResponse.json({ error: "BPMは40〜240で設定してください" }, { status: 400 });
      updated.bpm = bpm;
    }
    if (body.key !== undefined) updated.key = String(body.key).trim().slice(0, 40);
    if (body.genre !== undefined) updated.genre = String(body.genre).trim().slice(0, 40);

    if (body.prices !== undefined) {
      const prices = {};
      for (const planId of ["rental", "premium", "exclusive"]) {
        const value = Number(body.prices[planId]);
        if (!Number.isInteger(value) || value < 0) return NextResponse.json({ error: "価格は0円以上の整数で設定してください" }, { status: 400 });
        prices[planId] = value;
      }
      updated.prices = prices;
    }

    await saveBeat(updated);
    return NextResponse.json({ ok: true, beat: updated });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "ビート設定の更新に失敗しました" }, { status: 500 });
  }
}
