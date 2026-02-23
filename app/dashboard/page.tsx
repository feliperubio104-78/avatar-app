import { createServerSupabase } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ upgrade?: string; success?: string; error?: string }>;
}) {
  const resolvedParams = await searchParams;

  const supabase = await createServerSupabase();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: premiumRow } = await supabase
    .from("premium")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  const isPremium = premiumRow?.is_premium ?? false;

  return (
    <main style={{ padding: 40 }}>
      <h1>Bienvenido {user.email} 🚀</h1>
      <p>Estás autenticado correctamente con Supabase.</p>

      {resolvedParams.error && (
        <p style={{ color: "red" }}>
          Error creando sesión de pago.
        </p>
      )}

      {resolvedParams.success && (
        <p style={{ color: "green" }}>
          Pago completado correctamente 🎉
        </p>
      )}

      {resolvedParams.upgrade && !isPremium && (
        <p style={{ color: "red" }}>
          Necesitas ser Premium para acceder.
        </p>
      )}

      {!isPremium && (
        <div style={{ marginTop: 20 }}>
          <h3>Haz upgrade a Premium 🔥</h3>

          <form action="/api/stripe/checkout" method="POST">
            <button
              type="submit"
              style={{
                padding: "10px 20px",
                background: "black",
                color: "white",
                border: "none",
                cursor: "pointer",
              }}
            >
              Suscribirse
            </button>
          </form>
        </div>
      )}

      {isPremium && (
        <div style={{ marginTop: 20 }}>
          <h3>🎉 Eres usuario Premium</h3>
        </div>
      )}
    </main>
  );
}