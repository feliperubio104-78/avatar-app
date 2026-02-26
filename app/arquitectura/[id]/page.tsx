import Link from "next/link";
import { redirect } from "next/navigation";
import { createAuthClient } from "@/lib/supabase/auth-server";
import { createServiceClient } from "@/lib/supabase/server";
import { getPremiumStatus } from "@/lib/premium";

function Card({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        border: "1px solid #e5e7eb",
        borderRadius: 12,
        padding: 16,
        background: "white",
        marginBottom: 12,
      }}
    >
      <div style={{ fontWeight: 900, marginBottom: 8 }}>
        {title}
      </div>
      <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.5 }}>
        {children}
      </div>
    </div>
  );
}

export default async function ArquitecturaDetallePage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;

  // 🔐 1. Verificar login
  const authClient = await createAuthClient();
  const {
    data: { user },
  } = await authClient.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // 🔐 2. Verificar premium
  const premium = await getPremiumStatus(user.id);

  if (!premium.isPremium) {
    redirect("/premium");
  }

  // 🔐 3. Obtener registro
  const service = createServiceClient();

  const { data, error } = await service
    .from("architectures")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) {
    return (
      <main style={{ padding: 40 }}>
        <h1>No encontrado</h1>
        <Link href="/arquitectura">← Volver</Link>
      </main>
    );
  }

  // 🔐 4. Seguridad extra: que solo vea su propio registro
  if (data.user_id !== user.id) {
    return (
      <main style={{ padding: 40 }}>
        <h1>Sin permiso</h1>
        <Link href="/arquitectura">← Volver</Link>
      </main>
    );
  }

  const r: any = data.result ?? {};

  return (
    <main style={{ padding: 40, maxWidth: 900, margin: "0 auto" }}>
      <Link href="/arquitectura">← Volver</Link>

      <h1 style={{ fontSize: 24, fontWeight: 900, marginTop: 16 }}>
        Arquitectura Estratégica
      </h1>

      <Card title="Input original">
        {`Nicho: ${data.niche}
Problema: ${data.problem}
Resultado: ${data.outcome}
Diferenciador: ${data.differentiator}`}
      </Card>

      <Card title="🟦 Nicho Definido">
        {r.nicho_definido ?? "-"}
      </Card>

      <Card title="🟥 Problema Crítico">
        {r.problema_critico ?? "-"}
      </Card>

      <Card title="🟩 Resultado Transformacional">
        {r.resultado_transformacional ?? "-"}
      </Card>

      <Card title="🟪 Posicionamiento Estratégico">
        {r.posicionamiento ?? "-"}
      </Card>

      <Card title="🟨 Declaración de Autoridad">
        {r.declaracion_autoridad ?? "-"}
      </Card>

      <Card title="🟫 Mensaje para Redes">
        {r.mensaje_redes ?? "-"}
      </Card>

      <Card title="⬛ Enfoque Estratégico Inicial">
        {Array.isArray(r.enfoque_estrategico)
          ? r.enfoque_estrategico
              .map((x: string) => `• ${x}`)
              .join("\n")
          : "-"}
      </Card>
    </main>
  );
}