// lib/supabase/server.ts
import "server-only";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

/**
 * Server Components: SOLO LECTURA.
 * No podemos modificar cookies aquí (Next 16 lo prohíbe),
 * así que set/remove son NO-OP.
 */
export async function createServerSupabase() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set() {
          // NO-OP (Server Components no permiten set cookies)
        },
        remove() {
          // NO-OP
        },
      },
    }
  );
}