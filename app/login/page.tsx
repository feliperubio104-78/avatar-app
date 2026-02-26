"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const supabase = createClient();
  const [email, setEmail] = useState("");

  const handleLogin = async () => {
    if (!email) {
      alert("Introduce un email");
      return;
    }

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo:
          "https://autoridad-strategic.vercel.app/dashboard",
      },
    });

    if (error) {
      alert("Error enviando email: " + error.message);
    } else {
      alert("Revisa tu email para iniciar sesión 🚀");
    }
  };

  return (
    <div style={{ padding: 40 }}>
      <h1>Login</h1>

      <input
        type="email"
        placeholder="Tu email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ padding: 8, marginRight: 10 }}
      />

      <button onClick={handleLogin}>
        Enviar Magic Link
      </button>
    </div>
  );
}