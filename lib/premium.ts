import "server-only";
import { createServiceClient } from "@/lib/supabase/server";

export type PremiumStatus = {
  isPremium: boolean;
  priceId: string | null;
  periodEnd: string | null;
  architecturesUsed: number;
  architecturesLimit: number | null;
};

export async function getPremiumStatus(
  userId: string
): Promise<PremiumStatus> {
  const service = createServiceClient();

  // 1️⃣ Obtener premium
  const { data } = await service
    .from("premium")
    .select("is_premium, stripe_price_id, current_period_end")
    .eq("user_id", userId)
    .maybeSingle();

  const isPremium = Boolean(data?.is_premium);

  // 2️⃣ Contar arquitecturas usadas
  const { count } = await service
    .from("architectures")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId);

  const architecturesUsed = count ?? 0;

  return {
    isPremium,
    priceId: data?.stripe_price_id ?? null,
    periodEnd: data?.current_period_end ?? null,
    architecturesUsed,
    architecturesLimit: isPremium ? null : 1,
  };
}