"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/browser";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const router = useRouter();

  // 🔥 Crear cliente UNA sola vez
  const supabase = createClient();

  useEffect(() => {
    let mounted = true;

    const run = async () => {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;

      if (data.session) {
        router.replace("/dashboard");
      }
    };

    run();

    return () => {
      mounted = false;
    };
  }, [router, supabase]);

  const handleLogin = async () => {
    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

    const next = "/arquitectura";

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${siteUrl}/auth/callback?next=${encodeURIComponent(
          next
        )}`,
      },
    });

    if (error) {
      console.error(error);
      alert(error.message);
      return;
    }

    alert("Revisa tu email para iniciar sesión 🚀");
  };

  return (
    <main style={{ padding: 40 }}>
      <h1>Login</h1>

      <input
        type="email"
        placeholder="Tu email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ padding: 8, marginRight: 10 }}
      />

      <button onClick={handleLogin}>Enviar Magic Link</button>
    </main>
  );
}