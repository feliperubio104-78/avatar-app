// app/page.tsx
import Link from "next/link";

export default function HomePage() {
  return (
    <main
      style={{
        maxWidth: 1000,
        margin: "0 auto",
        padding: "80px 24px",
        fontFamily: "system-ui, -apple-system",
        lineHeight: 1.6,
      }}
    >
      {/* ===== HERO ===== */}
      <section style={{ textAlign: "center", marginBottom: 100 }}>
        <h1
          style={{
            fontSize: 42,
            fontWeight: 900,
            marginBottom: 24,
            letterSpacing: "-1px",
          }}
        >
          Deja de improvisar tu negocio.
        </h1>

        <p
          style={{
            fontSize: 20,
            color: "#4b5563",
            maxWidth: 700,
            margin: "0 auto 32px",
          }}
        >
          Diseñado para coaches que toman su negocio en serio.
        </p>

        <Link href="/premium">
          <button
            style={{
              padding: "16px 36px",
              borderRadius: 12,
              border: "none",
              background: "black",
              color: "white",
              fontSize: 16,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Desbloquear Arquitectura Estratégica
          </button>
        </Link>
      </section>

      {/* ===== PROBLEMA ===== */}
      <section style={{ marginBottom: 80 }}>
        <h2 style={{ fontSize: 26, fontWeight: 800, marginBottom: 16 }}>
          El problema no es tu talento.
        </h2>

        <p style={{ color: "#374151", maxWidth: 750 }}>
          Es que no tienes una arquitectura estratégica clara.
          Sin estructura, tu mensaje se diluye, tu posicionamiento
          se debilita y tu monetización se vuelve inestable.
        </p>
      </section>

      {/* ===== MÉTODO ===== */}
      <section
        style={{
          border: "1px solid #e5e7eb",
          borderRadius: 16,
          padding: 40,
          marginBottom: 80,
        }}
      >
        <h2 style={{ fontSize: 26, fontWeight: 900, marginBottom: 20 }}>
          Método A.U.T.O.R.I.D.A.D.
        </h2>

        <p style={{ color: "#374151", maxWidth: 750 }}>
          No es generación automática de texto.
          Es un sistema estructurado que convierte tu conocimiento
          en una arquitectura profesional, clara y monetizable.
        </p>
      </section>

      {/* ===== OFERTA ===== */}
      <section
        style={{
          border: "2px solid black",
          borderRadius: 20,
          padding: 50,
          textAlign: "center",
        }}
      >
        <h2 style={{ fontSize: 28, fontWeight: 900, marginBottom: 12 }}>
          Plan Premium
        </h2>

        <div style={{ fontSize: 38, fontWeight: 900, marginBottom: 10 }}>
          $29 / mes
        </div>

        <p style={{ color: "#6b7280", marginBottom: 30 }}>
          Arquitecturas ilimitadas · Evolución estratégica continua ·
          Acceso prioritario a nuevas funciones.
        </p>

        <Link href="/premium">
          <button
            style={{
              padding: "16px 40px",
              borderRadius: 12,
              border: "none",
              background: "black",
              color: "white",
              fontSize: 18,
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            Activar Premium
          </button>
        </Link>
      </section>
    </main>
  );
}