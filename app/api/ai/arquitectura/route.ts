import { NextResponse } from "next/server";
import OpenAI from "openai";
import { autoridadPrompt } from "@/lib/prompts/autoridad";
import { createServiceClient } from "@/lib/supabase/server";
import { createAuthClient } from "@/lib/supabase/auth-server";
import { getPremiumStatus } from "@/lib/premium";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});
    const body = await req.json();

    const niche = String(body?.niche ?? "").trim();
    const problem = String(body?.problem ?? "").trim();
    const outcome = String(body?.outcome ?? "").trim();
    const differentiator = String(body?.differentiator ?? "").trim();

    if (!niche || !problem || !outcome || !differentiator) {
      return NextResponse.json(
        { error: "Faltan campos del formulario" },
        { status: 400 }
      );
    }

    // 🔐 1️⃣ Usuario autenticado
    const authClient = await createAuthClient();
    const {
      data: { user },
      error: authError,
    } = await authClient.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "No autenticado" },
        { status: 401 }
      );
    }

    const serviceClient = createServiceClient();

    // 🔒 2️⃣ Validar FREE vs PREMIUM
    const premium = await getPremiumStatus(user.id);

    if (!premium.isPremium) {
      const { count, error: countError } = await serviceClient
        .from("architectures")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id);

      if (countError) {
        console.error("Error contando arquitecturas:", countError);
        return NextResponse.json(
          { error: "Error validando límite FREE" },
          { status: 500 }
        );
      }

      if ((count ?? 0) >= 1) {
        return NextResponse.json(
          { error: "Límite FREE alcanzado. Actualiza a Premium." },
          { status: 403 }
        );
      }
    }

    // 🧠 3️⃣ OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.7,
      max_tokens: 900,
      messages: [
        { role: "system", content: autoridadPrompt },
        {
          role: "user",
          content: `
Información del usuario:

1. Nicho: ${niche}
2. Problema: ${problem}
3. Resultado: ${outcome}
4. Diferenciador: ${differentiator}

Devuelve exclusivamente un JSON válido con esta estructura exacta:

{
  "nicho_definido": "...",
  "problema_critico": "...",
  "resultado_transformacional": "...",
  "posicionamiento": "...",
  "declaracion_autoridad": "...",
  "mensaje_redes": "...",
  "enfoque_estrategico": ["...", "...", "..."]
}
`,
        },
      ],
    });

    const raw = completion.choices[0]?.message?.content ?? "";

    let data;
    try {
      data = JSON.parse(raw);
    } catch {
      console.error("La IA no devolvió JSON válido:", raw);
      return NextResponse.json(
        { error: "Error procesando respuesta IA" },
        { status: 500 }
      );
    }

    // 💾 4️⃣ Guardar arquitectura
    const { data: inserted, error: insertError } = await serviceClient
      .from("architectures")
      .insert({
        user_id: user.id,
        niche,
        problem,
        outcome,
        differentiator,
        result: data,
      })
      .select("id")
      .single();

    if (insertError || !inserted) {
      console.error("Error insertando:", insertError);
      return NextResponse.json(
        { error: "Error guardando arquitectura" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      id: inserted.id,
    });

  } catch (e: any) {
    console.error("Error general arquitectura:", e);
    return NextResponse.json(
      { error: e?.message ?? "Error interno del servidor" },
      { status: 500 }
    );
  }
}