import { redirect } from "next/navigation";
import { createAuthClient } from "@/lib/supabase/auth-server";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = await createAuthClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <main style={{ padding: 40 }}>
      <h1>Dashboard</h1>
      <p>Hola {user.email}</p>

      <form action="/api/logout" method="POST">
        <button style={{ marginTop: 20 }}>
          Cerrar sesión
        </button>
      </form>
    </main>
  );
}