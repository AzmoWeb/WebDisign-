import "server-only";
import { supabaseService } from "./supabase/admin";
import { CODE_PATTERN, normalizeCode, promoDiscount, type PromoCode } from "./promo";

/** Lit un code promo en base (clé serveur : la table n'est pas publique) et calcule la remise. */
export async function checkPromo(rawCode: string, subtotalCents: number) {
  const code = normalizeCode(rawCode);
  if (!CODE_PATTERN.test(code)) return { ok: false as const, reason: "Ce code n'est pas valide.", code };
  const sb = supabaseService();
  if (!sb) return { ok: false as const, reason: "Les codes promo seront actifs après la mise en ligne de la boutique.", code };
  const { data } = await sb.from("promo_codes").select("code, kind, value, min_subtotal_cents, starts_at, ends_at, max_uses, uses, active").eq("code", code).maybeSingle();
  const r = promoDiscount((data as PromoCode | null) ?? null, subtotalCents);
  return { ...r, code };
}
