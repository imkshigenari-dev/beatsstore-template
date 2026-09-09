import { NextResponse } from "next/server";
import { getCurrentCustomer, updateCustomer } from "../../../../lib/customer-auth";

export const runtime = "nodejs";

export async function POST(req) {
  const customer = await getCurrentCustomer();
  if (!customer) return NextResponse.json({ error: "ログインが必要です" }, { status: 401 });

  try {
    const { artistName, legalName } = await req.json();
    const updated = await updateCustomer(customer.email, { artistName, legalName });
    return NextResponse.json({ ok: true, customer: { email: updated.email, artistName: updated.artistName, legalName: updated.legalName } });
  } catch {
    return NextResponse.json({ error: "プロフィールの更新に失敗しました" }, { status: 400 });
  }
}
