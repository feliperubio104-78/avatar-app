// app/dashboard/page.tsx

import Link from "next/link";
import { redirect } from "next/navigation";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getPremiumStatus } from "@/lib/premium";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams?: {
    upgrade?: string;
    success?: string;
    canceled?: string;
    error?: string;
  };
}) {
  // ✅ En tu versión de Next esto es ASYNC
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set() {},
        remove() {},
      },
    }
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/login");
  }

  const user = session.user;

  const premium = await getPremiumStatus(user.id);

  const freeLimitReached =
    !premium.isPremium &&
    premium.architecturesLimit !== null &&
    premium.architecturesUsed >= premium.architecturesLimit;

  const remaining =
    premium.architecturesLimit !== null
      ? premium.architecturesLimit - premium.architecturesUsed
      : null;

  const progressPercent =
    premium.architecturesLimit && premium.architecturesLimit > 0
      ? (premium.architecturesUsed / premium.architecturesLimit) * 100
      : 0;

  return (
    <main style={{ padding: 40, maxWidth: 900, margin: "0 auto" }}>
      <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 6 }}>
        Dashboard
      </h1>

      <p style={{ marginTop: 0, color: "#4b5563" }}>
        Hola {user.email}
      </p>

      <div
        style={{
          marginTop: 20,
          padding: 18,
          border: "1px solid #e5e7eb",
          borderRadius: 12,
          maxWidth: 480,
        }}
      >
        <div style={{ fontWeight: 700, marginBottom: 6 }}>
          Plan actual:{" "}
          {premium.isPremium ? (
            <span style={{ color: "#16a34a" }}>Premium</span>
          ) : (
            <span style={{ color: "#f97316" }}>Free</span>
          )}
        </div>

        {!premium.isPremium &&
          premium.architecturesLimit !== null && (
            <>
              <div style={{ fontSize: 14, color: "#374151" }}>
                Arquitecturas usadas: {premium.architecturesUsed} /{" "}
                {premium.architecturesLimit}
              </div>

              <div
                style={{
                  marginTop: 8,
                  height: 8,
                  width: "100%",
                  background: "#e5e7eb",
                  borderRadius: 8,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${progressPercent}%`,
                    background: freeLimitReached
                      ? "#dc2626"
                      : "#f97316",
                    transition: "width 0.4s ease",
                  }}
                />
              </div>

              {!freeLimitReached && remaining === 1 && (
                <div
                  style={{
                    marginTop: 6,
                    fontSize: 13,
                    color: "#b45309",
                    fontWeight: 600,
                  }}
                >
                  Te queda 1 arquitectura disponible.
                </div>
              )}

              {freeLimitReached && (
                <div
                  style={{
                    marginTop: 8,
                    fontSize: 13,
                    color: "#374151",
                    lineHeight: 1.4,
                  }}
                >
                  Has completado tu arquitectura inicial. <br />
                  El siguiente nivel requiere estructura profesional.
                </div>
              )}
            </>
          )}

        {premium.isPremium && premium.periodEnd && (
          <div style={{ fontSize: 14, color: "#065f46", marginTop: 6 }}>
            Renueva el{" "}
            <strong>
              {new Date(premium.periodEnd).toLocaleDateString()}
            </strong>
          </div>
        )}
      </div>

      <div
        style={{
          display: "flex",
          gap: 12,
          marginTop: 32,
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <Link href={freeLimitReached ? "/premium" : "/arquitectura/nueva"}>
          <button
            style={{
              padding: "10px 16px",
              borderRadius: 8,
              border: "none",
              background: "black",
              color: "white",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            {freeLimitReached
              ? "Activar Arquitectura Profesional"
              : "Construir mi Arquitectura"}
          </button>
        </Link>
      </div>
    </main>
  );
}