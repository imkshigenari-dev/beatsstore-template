import { NextResponse } from "next/server";
import { stripe } from "../../../../../lib/stripe";

export async function POST(request) {
  try {
    const { accountId } = await request.json();
    if (!accountId) return NextResponse.json({ connected: false });
    const account = await stripe.accounts.retrieve(accountId);
    return NextResponse.json({
      connected: true,
      accountId: account.id,
      detailsSubmitted: !!account.details_submitted,
      chargesEnabled: !!account.charges_enabled,
      payoutsEnabled: !!account.payouts_enabled,
    });
  } catch {
    return NextResponse.json({ connected: false });
  }
}
