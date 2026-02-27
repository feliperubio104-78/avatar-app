import Link from "next/link";
import { redirect } from "next/navigation";
import { createAuthClient } from "@/lib/supabase/auth-server";
import { createServiceClient } from "@/lib/supabase/server";
import { getPremiumStatus } from "@/lib/premium";

export const dynamic = "force-dynamic";

export default async function ArquitecturaPage() {
  const authClient = await createAuthClient();
  const {
    data: { user },
  } = await authClient.auth.getUser();

  if (!user) redirect("/login");

  const premium = await getPremiumStatus(user.id);

  const service = createServiceClient();

  const { data, error, count } = await service
    .from("architectures")
    .select("id, created_at, niche, problem", { count: "exact" })
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <main style={{ padding: 40 }}>
        <h1>Error cargando arquitecturas</h1>
        <pre>{JSON.stringify(error, null, 2)}</pre>
      </main>
    );
  }

  const used = count ?? 0;
  const freeLimit = 1;
  const canCreate = premium.isPremium || used < freeLimit;

  return (
    <main style={{ padding: 40 }}>
      <h1>Mis Arquitecturas</h1>

      <div
        style={{
          marginTop: 16,
          marginBottom: 24,
          padding: 16,
          borderRadius: 12,
          border: "1px solid #e5e7eb",
          background: premium.isPremium ? "#f0fdf4" : "#f9fafb",
          maxWidth: 420,
        }}
      >
        {premium.isPremium ? (
          <>
            <div style={{ fontWeight: 700, color: "#15803d" }}>
              ✔️ Plan Premium activo
            </div>
            <div style={{ fontSize: 14, marginTop: 4 }}>
              Arquitecturas: Ilimitadas
            </div>
          </>
        ) : (
          <>
            <div style={{ fontWeight: 700 }}>Plan FREE</div>
            <div style={{ fontSize: 14, marginTop: 4 }}>
              {used} / {freeLimit} arquitecturas usadas
            </div>
          </>
        )}
      </div>

      {canCreate ? (
        <div style={{ marginBottom: 20 }}>
          <Link href="/arquitectura/nueva">
            <button
              style={{
                padding: "10px 16px",
                borderRadius: 8,
                border: "none",
                background: "black",
                color: "white",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              + Crear nueva arquitectura
            </button>
          </Link>
        </div>
      ) : (
        <div
          style={{
            marginBottom: 20,
            padding: 14,
            borderRadius: 8,
            background: "#fef2f2",
            border: "1px solid #fecaca",
            maxWidth: 420,
          }}
        >
          <div style={{ fontWeight: 600, marginBottom: 6 }}>
            Has alcanzado el límite FREE
          </div>
          <Link href="/premium">
            <button
              style={{
                padding: "8px 14px",
                borderRadius: 8,
                border: "none",
                background: "#dc2626",
                color: "white",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Desbloquear Premium
            </button>
          </Link>
        </div>
      )}

      {!data?.length && <p>No tienes arquitecturas todavía.</p>}

      {data?.map((item) => (
        <Link
          key={item.id}
          href={`/arquitectura/${item.id}`}
          style={{ textDecoration: "none", color: "inherit" }}
        >
          <div
            style={{
              marginTop: 20,
              padding: 20,
              border: "1px solid #ddd",
              borderRadius: 8,
              cursor: "pointer",
            }}
          >
            <h3 style={{ margin: 0 }}>{item.niche}</h3>
            <p style={{ marginTop: 8, marginBottom: 0 }}>
              {item.problem}
            </p>
          </div>
        </Link>
      ))}
    </main>
  );
}