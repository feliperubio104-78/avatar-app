// app/premium/page.tsx

import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";

export default async function PremiumPage() {
  const supabase = await createServerSupabase();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: premiumRow } = await supabase
    .from("premium")
    .select("is_premium, stripe_price_id, current_period_end")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!premiumRow || !premiumRow.is_premium) {
    redirect("/dashboard?upgrade=1");
  }

  return (
    <main style={{ padding: 40 }}>
      <h1>Contenido Premium 🔒</h1>
      <p>Bienvenido a tu contenido premium.</p>

      <div style={{ marginTop: 20 }}>
        <div>
          <strong>Plan:</strong>{" "}
          {premiumRow.stripe_price_id ?? "N/A"}
        </div>

        <div>
          <strong>Renueva el:</strong>{" "}
          {premiumRow.current_period_end
            ? new Date(
                premiumRow.current_period_end
              ).toLocaleString()
            : "N/A"}
        </div>
      </div>
    </main>
  );
}