// lib/supabase/server.ts

import "server-only";
import { createClient } from "@supabase/supabase-js";

/**
 * Cliente exclusivo para backend (API routes)
 * Usa SERVICE ROLE para poder hacer inserts sin RLS.
 */
export function createServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}