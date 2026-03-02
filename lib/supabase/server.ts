// lib/supabase/server.ts

import "server-only";
import { createClient } from "@supabase/supabase-js";

/**
 * Cliente exclusivo para backend (API routes, cron jobs, server actions privadas).
 * Usa SERVICE ROLE → ignora RLS.
 * ⚠️ NUNCA usar en frontend.
 */
export function createServiceClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL");
  }

  if (!serviceRoleKey) {
    throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY");
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}