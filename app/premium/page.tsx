// app/premium/page.tsx

import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";

export default async function PremiumPage() {
  const supabase = await createServerSupabase();

  // Obtener usuario autenticado
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/login");
  }

  // Buscar estado premium
  const { data: premiumRow, error: premiumError } = await supabase
    .from("premium")
    .select("is_premium, stripe_price_id, current_period_end")
    .eq("user_id", user.id)
    .maybeSingle();

  if (premiumError) {
    console.error("Error fetching premium data:", premiumError);
    redirect("/dashboard?upgrade=1");
  }

  if (!premiumRow || !premiumRow.is_premium) {
    redirect("/dashboard?upgrade=1");
  }

  // Convertir fecha correctamente (Stripe suele guardar en segundos)
  const renewalDate =
    premiumRow.current_period_end
      ? new Date(
          Number(premiumRow.current_period_end) * 1000
        ).toLocaleString()
      : "N/A";

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
          {renewalDate}
        </div>
      </div>
    </main>
  );
}