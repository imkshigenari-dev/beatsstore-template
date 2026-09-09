import { NextResponse } from "next/server";
import { stripe } from "../../../../lib/stripe";

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const existingAccountId = body.accountId || null;
    const origin = request.headers.get("origin") || process.env.NEXT_PUBLIC_SITE_URL;

    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ error: "Stripe is not configured." }, { status: 503 });
    }
    if (!origin) {
      return NextResponse.json({ error: "Site URL is not configured." }, { status: 500 });
    }

    let accountId = existingAccountId;
    if (!accountId) {
      const account = await stripe.accounts.create({
        controller: {
          stripe_dashboard: { type: "express" },
          fees: { payer: "account" },
          losses: { payments: "stripe" },
        },
      });
      accountId = account.id;
    }

    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${origin}/dashboard?stripe=refresh&account_id=${encodeURIComponent(accountId)}`,
      return_url: `${origin}/dashboard?stripe=return&account_id=${encodeURIComponent(accountId)}`,
      type: "account_onboarding",
    });

    return NextResponse.json({ url: accountLink.url, accountId });
  } catch (error) {
    console.error("Stripe Connect onboarding error:", error);
    return NextResponse.json({ error: "Stripe連携の開始に失敗しました。" }, { status: 500 });
  }
}
