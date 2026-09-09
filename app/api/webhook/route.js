import { NextResponse } from "next/server";
import { stripe } from "../../../lib/stripe";
import { getBeat, PLANS, saveBeat } from "../../../lib/beats";
import { sendDeliveryEmail, sendCustomOrderNotification, sendSellerPurchaseNotification } from "../../../lib/email";
import { saveOrder, getOrder } from "../../../lib/orders";
import { addOrderForCustomer } from "../../../lib/customer-auth";

export const runtime = "nodejs";

export async function POST(req) {
  const rawBody = await req.text();
  const signature = req.headers.get("stripe-signature");

  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return NextResponse.json({ error: "invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    try {
      await fulfillOrder(event.data.object);
    } catch (err) {
      console.error("fulfillOrder failed:", err);
      return NextResponse.json({ error: "fulfillment failed" }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}

async function fulfillOrder(session) {
  const { beatId, planId, buyerName, isCustom, connectMethod, contactHandle, customRequest, wantsSession } = session.metadata;
  const orderId = session.id;

  const existing = await getOrder(orderId);
  if (existing?.status === "paid") return;

  const beat = await getBeat(beatId);
  const plan = PLANS[planId];
  if (!beat || !plan) throw new Error(`unknown beat/plan: ${beatId}/${planId}`);

  const buyerEmail = session.customer_details?.email || session.customer_email;
  if (!buyerEmail) throw new Error("no buyer email on session");

  if (plan.id === "exclusive" && beat.exclusiveSold) {
    throw new Error(`exclusive beat already sold: ${beat.id}`);
  }

  const purchasedAt = new Date(session.created * 1000).toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" });
  const custom = isCustom === "true";
  const sessionWanted = wantsSession === "true";
  const fileUrl = beat.files?.[plan.id] || null;

  const order = {
    id: orderId,
    status: "paid",
    beatId: beat.id,
    beatTitle: beat.title,
    planId: plan.id,
    buyerEmail,
    buyerName: buyerName || "",
    fileUrl,
    purchasedAt,
    createdAt: new Date().toISOString(),
  };

  await saveOrder(order);
  await addOrderForCustomer(buyerEmail, orderId);

  if (plan.id === "exclusive") await saveBeat({ ...beat, exclusiveSold: true });

  await sendDeliveryEmail({
    to: buyerEmail,
    beat,
    plan,
    orderId,
    buyerName,
    purchasedAt,
    isCustom: custom,
    connectMethod,
    contactHandle,
    customRequest,
    wantsSession: sessionWanted,
  });

  if (custom) {
    await sendCustomOrderNotification({
      beat,
      plan,
      orderId,
      buyerName,
      buyerEmail,
      connectMethod,
      contactHandle,
      customRequest,
      wantsSession: sessionWanted,
    });
  }
}
