import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { createClient } from "@supabase/supabase-js";

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
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
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error("Invalid signature:", err.message);
    return new NextResponse("Invalid signature", { status: 400 });
  }

  try {
    /**
     * ============================================
     * ACTIVACIÓN + RENOVACIÓN
     * ============================================
     */
    if (
      event.type === "checkout.session.completed" ||
      event.type === "invoice.paid"
    ) {
      let subscriptionId: string | null = null;

      if (event.type === "checkout.session.completed") {
        const session = event.data.object as Stripe.Checkout.Session;

        if (typeof session.subscription === "string") {
          subscriptionId = session.subscription;
        }
      }

      if (event.type === "invoice.paid") {
        const invoice = event.data.object as Stripe.Invoice;

        // Stripe v14: subscription está en lines
        const line = invoice.lines.data[0];

        if (line && typeof line.subscription === "string") {
          subscriptionId = line.subscription;
        }
      }

      if (!subscriptionId) {
        return NextResponse.json({ received: true });
      }

      const subscription = await stripe.subscriptions.retrieve(
        subscriptionId
      );

      const customerId = subscription.customer as string;

      const { data: premiumRow } = await admin
        .from("premium")
        .select("user_id")
        .eq("stripe_customer_id", customerId)
        .maybeSingle();

      if (!premiumRow) {
        console.error("No premium row found for:", customerId);
        return NextResponse.json({ received: true });
      }

      const userId = premiumRow.user_id;

      const priceId =
        subscription.items.data[0]?.price.id ?? null;

      // Stripe v14: current_period_end está en el item
      const periodEnd =
        subscription.items.data[0]?.current_period_end ?? null;

      const isoPeriodEnd = periodEnd
        ? new Date(periodEnd * 1000).toISOString()
        : null;

      await admin
        .from("premium")
        .update({
          stripe_subscription_id: subscription.id,
          stripe_price_id: priceId,
          current_period_end: isoPeriodEnd,
          is_premium: true,
        })
        .eq("user_id", userId);

      await admin
        .from("profiles")
        .update({
          is_premium: true,
        })
        .eq("id", userId);

      console.log("Premium activated:", userId);
    }

    /**
     * ============================================
     * CANCELACIÓN
     * ============================================
     */
    if (event.type === "customer.subscription.deleted") {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription.customer as string;

      const { data: premiumRow } = await admin
        .from("premium")
        .select("user_id")
        .eq("stripe_customer_id", customerId)
        .maybeSingle();

      if (!premiumRow) {
        return NextResponse.json({ received: true });
      }

      const userId = premiumRow.user_id;

      await admin
        .from("premium")
        .update({
          is_premium: false,
          stripe_subscription_id: null,
          stripe_price_id: null,
          current_period_end: null,
        })
        .eq("user_id", userId);

      await admin
        .from("profiles")
        .update({
          is_premium: false,
        })
        .eq("id", userId);

      console.log("Premium cancelled:", userId);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return new NextResponse("Webhook failed", { status: 500 });
  }
}