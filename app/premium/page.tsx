// app/premium/page.tsx

import { redirect } from "next/navigation";
import { createAuthClient } from "@/lib/supabase/auth-server";
import { getPremiumStatus } from "@/lib/premium";

export const dynamic = "force-dynamic";

export default async function PremiumPage() {
  const supabase = await createAuthClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  // 🔐 Si no hay usuario → login
  if (!user || error) {
    redirect("/login");
  }

  // 🔎 Comprobamos estado premium real en DB
  const premium = await getPremiumStatus(user.id);

  // ✅ IMPORTANTE:
  // Si ya es premium, NO redirigimos automáticamente.
  // Mostramos un mensaje en vez de hacer redirect agresivo.
  if (premium?.isPremium) {
    return (
      <main style={{ maxWidth: 800, margin: "0 auto", padding: 40 }}>
        <h1 style={{ fontSize: 32, fontWeight: 900, marginBottom: 20 }}>
          Ya tienes Premium activo ✅
        </h1>

        <p style={{ fontSize: 18, color: "#4b5563", marginBottom: 30 }}>
          Puedes crear arquitecturas ilimitadas desde tu panel.
        </p>

        <a
          href="/arquitectura"
          style={{
            display: "inline-block",
            padding: "14px 28px",
            borderRadius: 12,
            background: "black",
            color: "white",
            fontWeight: 700,
            textDecoration: "none",
          }}
        >
          Ir a Arquitecturas
        </a>
      </main>
    );
  }

  // 💰 Precio dinámico seguro
  const price = process.env.NEXT_PUBLIC_PREMIUM_PRICE ?? "29";
  const currency = process.env.NEXT_PUBLIC_PREMIUM_CURRENCY ?? "USD";

  const symbol =
    currency === "USD"
      ? "$"
      : currency === "EUR"
      ? "€"
      : currency;

  return (
    <main style={{ maxWidth: 1000, margin: "0 auto", padding: 40 }}>
      {/* ===== HERO ===== */}
      <section style={{ textAlign: "center", marginBottom: 60 }}>
        <h1 style={{ fontSize: 40, fontWeight: 900, marginBottom: 20 }}>
          Deja de improvisar tu negocio.
        </h1>

        <p
          style={{
            fontSize: 20,
            color: "#4b5563",
            maxWidth: 700,
            margin: "0 auto",
            lineHeight: 1.6,
          }}
        >
          El problema no es tu talento.
          Es que no tienes una arquitectura estratégica profesional.
        </p>
      </section>

      {/* ===== MÉTODO ===== */}
      <section
        style={{
          border: "1px solid #e5e7eb",
          borderRadius: 16,
          padding: 32,
          marginBottom: 50,
        }}
      >
        <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 16 }}>
          Método A.U.T.O.R.I.D.A.D.
        </h2>

        <p style={{ color: "#374151", lineHeight: 1.7 }}>
          No es solo generación de texto.
          Es un sistema estructurado que convierte tu conocimiento en una
          arquitectura estratégica clara, monetizable y profesional.
        </p>
      </section>

      {/* ===== COMPARATIVA ===== */}
      <section
        style={{
          border: "1px solid #e5e7eb",
          borderRadius: 16,
          padding: 32,
          marginBottom: 50,
        }}
      >
        <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 20 }}>
          Free vs Premium
        </h2>

        <div style={{ display: "grid", gap: 12 }}>
          <div>Free → 1 arquitectura limitada</div>
          <div>Premium → Arquitecturas ilimitadas</div>
          <div>Premium → Evolución estratégica continua</div>
          <div>Premium → Acceso prioritario a nuevas funciones</div>
          <div>Premium → Gestión profesional del posicionamiento</div>
        </div>
      </section>

      {/* ===== PRECIO ===== */}
      <section
        style={{
          border: "2px solid black",
          borderRadius: 20,
          padding: 40,
          textAlign: "center",
        }}
      >
        <h2 style={{ fontSize: 26, fontWeight: 900, marginBottom: 10 }}>
          Plan Premium
        </h2>

        <div style={{ fontSize: 38, fontWeight: 900 }}>
          {symbol}
          {price} / mes
        </div>

        <p style={{ color: "#6b7280", marginBottom: 16 }}>
          Cancela cuando quieras. Sin compromiso.
        </p>

        <p
          style={{
            fontSize: 14,
            color: "#111827",
            fontWeight: 600,
            marginBottom: 28,
          }}
        >
          Diseñado para coaches que toman su negocio en serio.
        </p>

        {/* 🔐 Stripe checkout seguro */}
        <form action="/api/stripe/checkout" method="POST">
          <button
            type="submit"
            style={{
              padding: "16px 36px",
              borderRadius: 12,
              border: "none",
              background: "black",
              color: "white",
              fontSize: 18,
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            Activar Arquitectura Profesional
          </button>
        </form>

        <p style={{ fontSize: 14, color: "#6b7280", marginTop: 16 }}>
          Acceso inmediato después del pago.
        </p>
      </section>
    </main>
  );
}