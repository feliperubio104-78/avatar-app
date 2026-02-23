"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: "http://localhost:3000/dashboard",
      },
    });

    if (error) {
      alert("Error enviando email");
    } else {
      alert("Revisa tu email para iniciar sesión 🚀");
    }
  };

  return (
    <div>
      <h1>Login</h1>
      <input
        type="email"
        placeholder="Tu email"
        onChange={(e) => setEmail(e.target.value)}
      />
      <button onClick={handleLogin}>
        Enviar Magic Link
      </button>
    </div>
  );
}

