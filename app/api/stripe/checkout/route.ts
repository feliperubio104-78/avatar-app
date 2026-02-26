import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createClient } from "@supabase/supabase-js";
import { createAuthClient } from "@/lib/supabase/auth-server";

// 🔐 Cliente ADMIN (ignora RLS)
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

export async function POST() {
  try {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL!;
    const priceId = process.env.STRIPE_PRICE_ID!;

    if (!siteUrl) {
      throw new Error("Missing NEXT_PUBLIC_SITE_URL");
    }

    if (!priceId) {
      throw new Error("Missing STRIPE_PRICE_ID");
    }

    // 🔐 1. Obtener usuario autenticado
    const authClient = await createAuthClient();
    const {
      data: { user },
    } = await authClient.auth.getUser();

    if (!user) {
      return NextResponse.redirect(`${siteUrl}/login`, 303);
    }

    const userId = user.id;
    const email = user.email ?? "";

    // 🔎 2. Buscar fila premium existente
    const { data: premiumRow } = await admin
      .from("premium")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    let customerId = premiumRow?.stripe_customer_id ?? null;

    // 👤 3. Crear customer si no existe
    if (!customerId) {
      const customer = await stripe.customers.create({
        email,
        metadata: {
          user_id: userId,
        },
      });

      customerId = customer.id;

      await admin.from("premium").upsert(
        {
          user_id: userId,
          stripe_customer_id: customerId,
          is_premium: false,
        },
        { onConflict: "user_id" }
      );
    }

    // 💳 4. Crear sesión Checkout
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
      cancel_url: `${siteUrl}/premium?canceled=1`,
      subscription_data: {
        metadata: {
          user_id: userId,
        },
      },
      metadata: {
        user_id: userId,
      },
    });

    if (!session.url) {
      throw new Error("Stripe session has no URL");
    }

    // 📝 5. Guardar session ID
    await admin.from("premium").upsert(
      {
        user_id: userId,
        stripe_session_id: session.id,
      },
      { onConflict: "user_id" }
    );

    // 🔁 6. Redirigir a Stripe
    return NextResponse.redirect(session.url, 303);

  } catch (error: any) {
    console.error("CHECKOUT ERROR:", error?.message || error);

    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_SITE_URL}/premium?error=1`,
      303
    );
  }
}