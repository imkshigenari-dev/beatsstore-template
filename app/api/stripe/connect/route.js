import { NextResponse } from "next/server";
import { getStripe } from "../../../../lib/stripe";
import { isCustomerSetupAuthorized } from "../../../../lib/customer-access";
import { getConnectedAccountId, saveConnectedAccountId } from "../../../../lib/stripe-connect";

export async function POST(request) {
  try {
    if (!(await isCustomerSetupAuthorized())) {
      return NextResponse.json({ error: "Customer setup authorization is required." }, { status: 401 });
    }

    const origin = request.headers.get("origin") || process.env.NEXT_PUBLIC_SITE_URL;
    if (!process.env.STRIPE_SECRET_KEY) return NextResponse.json({ error: "Stripe is not configured." }, { status: 503 });
    if (!origin) return NextResponse.json({ error: "Site URL is not configured." }, { status: 500 });

    const stripe = getStripe();
    let accountId = await getConnectedAccountId();

    if (!accountId) {
      const account = await stripe.accounts.create({
        controller: {
          stripe_dashboard: { type: "express" },
          fees: { payer: "account" },
          losses: { payments: "stripe" },
        },
      });
      accountId = account.id;
      await saveConnectedAccountId(accountId);
    }

    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${origin}/dashboard?stripe=refresh`,
      return_url: `${origin}/dashboard?stripe=return`,
      type: "account_onboarding",
    });

    return NextResponse.json({ url: accountLink.url });
  } catch (error) {
    console.error("Stripe Connect onboarding error:", error);
    return NextResponse.json({ error: "Stripe連携の開始に失敗しました。" }, { status: 500 });
  }
}
