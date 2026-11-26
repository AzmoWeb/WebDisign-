"use server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const Id = z.string().uuid();

export async function toggleFavoriteAction(productId: string, on: boolean) {
  const user = await getCurrentUser();
  if (!user || !Id.safeParse(productId).success) return { ok: false };
  const sb = (await createSupabaseServerClient())!;
  if (on) await sb.from("favorites").upsert({ user_id: user.id, product_id: productId });
  else await sb.from("favorites").delete().eq("user_id", user.id).eq("product_id", productId);
  return { ok: true };
}
