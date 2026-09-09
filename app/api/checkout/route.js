import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { stripe } from "../../../lib/stripe";
import { getBeat, PLANS, CUSTOM_ORDER_PRICE_JPY } from "../../../lib/beats";
import { CUSTOMER_COOKIE_NAME, getCustomerFromToken } from "../../../lib/customer-auth";

export const runtime = "nodejs";

export async function POST(req) {
  try {
    const {
      beatId,
      planId,
      buyerName,
      isCustom,
      connectMethod,
      contactHandle,
      customRequest,
      wantsSession,
    } = await req.json();

    if (!beatId || !planId || !buyerName?.trim()) {
      return NextResponse.json({ error: "購入情報が不足しています" }, { status: 400 });
    }

    const beat = await getBeat(beatId);
    const plan = PLANS[planId];

    if (!beat || !plan) {
      return NextResponse.json({ error: "ビートまたは購入プランが見つかりません" }, { status: 400 });
    }

    if (beat.visibility !== "public" && beat.visibility !== "early_access") {
      return NextResponse.json({ error: "このビートは現在購入できません" }, { status: 400 });
    }

    if (planId === "exclusive" && beat.exclusiveSold) {
      return NextResponse.json({ error: "このビートの独占購入権はすでに販売済みです" }, { status: 409 });
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
    if (!siteUrl) throw new Error("NEXT_PUBLIC_SITE_URL is not configured");

    const custom = Boolean(isCustom);
    const totalPrice = plan.priceJPY + (custom ? CUSTOM_ORDER_PRICE_JPY : 0);
    const productName = custom ? `${beat.title} - ${plan.label} (カスタムオーダー)` : `${beat.title} - ${plan.label}`;

    const customerToken = cookies().get(CUSTOMER_COOKIE_NAME)?.value;
    const customer = await getCustomerFromToken(customerToken);
    const customerEmail = customer?.email || undefined;

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [{
        price_data: {
          currency: "jpy",
          product_data: { name: productName, description: plan.description },
          unit_amount: totalPrice,
        },
        quantity: 1,
      }],
      ...(customerEmail ? { customer_email: customerEmail } : {}),
      metadata: {
        beatId: beat.id,
        planId: plan.id,
        buyerName: buyerName.trim().slice(0, 200),
        isCustom: custom ? "true" : "false",
        connectMethod: connectMethod || "text",
        contactHandle: (contactHandle || "").slice(0, 100),
        customRequest: (customRequest || "").slice(0, 400),
        wantsSession: wantsSession ? "true" : "false",
      },
      customer_creation: "always",
      success_url: `${siteUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/beat/${beat.id}`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("checkout session failed:", err);
    return NextResponse.json({ error: err?.message || "決済ページの作成に失敗しました" }, { status: 500 });
  }
}
