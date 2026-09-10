import { NextResponse } from "next/server";
import { getStripe } from "../../../../../lib/stripe";
import { isCustomerSetupAuthorized } from "../../../../../lib/customer-access";
import { getConnectedAccountId } from "../../../../../lib/stripe-connect";

export async function POST() {
  try {
    if (!(await isCustomerSetupAuthorized())) return NextResponse.json({ connected: false }, { status: 401 });

    const accountId = await getConnectedAccountId();
    if (!accountId) return NextResponse.json({ connected: false });

    const account = await getStripe().accounts.retrieve(accountId);
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
