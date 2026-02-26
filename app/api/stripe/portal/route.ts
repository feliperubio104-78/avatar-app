import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createAuthClient } from "@/lib/supabase/auth-server";
import { createClient as createAdmin } from "@supabase/supabase-js";

const admin = createAdmin(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

  if (!siteUrl) {
    return NextResponse.redirect("/dashboard?error=1", 303);
  }

  const authClient = await createAuthClient();
  const {
    data: { user },
  } = await authClient.auth.getUser();

  if (!user) {
    return NextResponse.redirect(`${siteUrl}/login`, 303);
  }

  const { data: premium } = await admin
    .from("premium")
    .select("stripe_customer_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!premium?.stripe_customer_id) {
    return NextResponse.redirect(`${siteUrl}/dashboard?error=1`, 303);
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: premium.stripe_customer_id,
    return_url: `${siteUrl}/dashboard`,
  });

  return NextResponse.redirect(session.url, 303);
}