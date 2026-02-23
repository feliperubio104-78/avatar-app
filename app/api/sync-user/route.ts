import { NextResponse } from "next/server";
import { createRouteSupabase } from "@/lib/supabase/route";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST() {
  try {
    // Cliente SSR con cookies (correcto en Route Handlers)
    const supabase = await createRouteSupabase();

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Crear registro premium si no existe
    await supabaseAdmin
      .from("premium")
      .upsert(
        {
          user_id: user.id,
          email: user.email ?? null,
          is_premium: false,
        },
        { onConflict: "user_id" }
      );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("SYNC USER ERROR:", error);
    return NextResponse.json(
      { error: error.message ?? "Server error" },
      { status: 500 }
    );
  }
}