import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createClient as createAdmin } from "@supabase/supabase-js";
import { createServerSupabase } from "@/lib/supabase/server";

// 🔐 Cliente ADMIN (ignora RLS)
const admin = createAdmin(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST() {
  try {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
    const priceId = process.env.STRIPE_PRICE_ID;

    if (!siteUrl) {
      throw new Error("Missing NEXT_PUBLIC_SITE_URL in env");
    }

    if (!priceId) {
      throw new Error("Missing STRIPE_PRICE_ID in env");
    }

    // 1️⃣ Obtener usuario autenticado
    const supabase = await createServerSupabase();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.redirect(`${siteUrl}/login`, 303);
    }

    const userId = user.id;
    const email = user.email ?? "";

    // 2️⃣ Leer fila premium
    const { data: premiumRow } = await admin
      .from("premium")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    // 3️⃣ Crear Stripe customer si no existe
    let customerId = premiumRow?.stripe_customer_id as string | null;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email,
        metadata: {
          user_id: userId,
        },
      });

      customerId = customer.id;

      await admin
        .from("premium")
        .upsert(
          {
            user_id: userId,
            stripe_customer_id: customerId,
          },
          { onConflict: "user_id" }
        );
    }

    // 4️⃣ Crear sesión Checkout
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${siteUrl}/dashboard?success=1`,
      cancel_url: `${siteUrl}/dashboard?canceled=1`,
      subscription_data: {
        metadata: {
          user_id: userId,
        },
      },
      metadata: {
        user_id: userId,
      },
    });

    // 5️⃣ Guardar session ID
    await admin
      .from("premium")
      .update({ stripe_session_id: session.id })
      .eq("user_id", userId);

    // 🔥 Redirigir correctamente a Stripe
    return NextResponse.redirect(session.url!, 303);

  } catch (error: any) {
    console.error("CHECKOUT ERROR:", error?.message || error);

    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard?error=1`,
      303
    );
  }
}