// app/api/stripe/webhook/route.ts

import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { createClient } from "@supabase/supabase-js";

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
);

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return new NextResponse("Missing stripe signature", { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET as string
    );
  } catch (err: any) {
    console.error("❌ Invalid signature:", err.message);
    return new NextResponse("Invalid signature", { status: 400 });
  }

  try {
    /**
     * 🔥 CHECKOUT COMPLETED
     */
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;

      if (!session.subscription) {
        return NextResponse.json({ received: true });
      }

      const subscriptionId =
        typeof session.subscription === "string"
          ? session.subscription
          : session.subscription.id;

      const subscription = await stripe.subscriptions.retrieve(
        subscriptionId
      );

      const sub = subscription as Stripe.Subscription;

      const userId = sub.metadata?.user_id;
      if (!userId) return NextResponse.json({ received: true });

      const priceId = sub.items.data[0]?.price.id ?? null;
      const periodEnd = (sub as any).current_period_end ?? null;

      await admin
        .from("premium")
        .update({
          stripe_subscription_id: sub.id,
          stripe_price_id: priceId,
          current_period_end: periodEnd
            ? new Date(periodEnd * 1000).toISOString()
            : null,
          is_premium: true,
        })
        .eq("user_id", userId);
    }

    /**
     * 🔥 RENOVACIONES
     */
    if (event.type === "invoice.paid") {
      const invoice = event.data.object as Stripe.Invoice;

      const subscriptionId =
        invoice.lines.data[0]?.subscription as string | undefined;

      if (!subscriptionId) {
        return NextResponse.json({ received: true });
      }

      const subscription = await stripe.subscriptions.retrieve(
        subscriptionId
      );

      const sub = subscription as Stripe.Subscription;

      const userId = sub.metadata?.user_id;
      if (!userId) return NextResponse.json({ received: true });

      const priceId = sub.items.data[0]?.price.id ?? null;
      const periodEnd = (sub as any).current_period_end ?? null;

      await admin
        .from("premium")
        .update({
          stripe_subscription_id: sub.id,
          stripe_price_id: priceId,
          current_period_end: periodEnd
            ? new Date(periodEnd * 1000).toISOString()
            : null,
          is_premium: true,
        })
        .eq("user_id", userId);
    }

    /**
     * 🔥 CANCELACIÓN
     */
    if (event.type === "customer.subscription.deleted") {
      const subscription = event.data.object as Stripe.Subscription;

      const userId = subscription.metadata?.user_id;
      if (!userId) return NextResponse.json({ received: true });

      await admin
        .from("premium")
        .update({
          is_premium: false,
          stripe_subscription_id: null,
          stripe_price_id: null,
          current_period_end: null,
        })
        .eq("user_id", userId);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("🔥 Webhook error:", error);
    return new NextResponse("Webhook failed", { status: 500 });
  }
}