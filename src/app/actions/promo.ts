"use server";
import type { CartLine } from "@/lib/types";
import { priceCart } from "@/lib/cart-pricing";
import { checkPromo } from "@/lib/promo-server";
import { clientIp, hashIp, rateLimit } from "@/lib/security";

/** Vérifie un code promo pour le panier courant (montant recalculé côté serveur). */
export async function applyPromoAction(code: string, lines: CartLine[]) {
  if (typeof code !== "string" || code.length > 40) return { ok: false as const, reason: "Ce code n'est pas valide." };
  // Limite les essais successifs (protection contre la recherche de codes au hasard)
  if (!(await rateLimit(`promo:${hashIp(await clientIp())}`, 15, 600))) return { ok: false as const, reason: "Trop d'essais. Réessayez dans quelques minutes." };
  const cart = await priceCart(lines);
  if (cart.hasDemo) return { ok: false as const, reason: "Les codes promo ne s'appliquent pas aux articles de démonstration." };
  return checkPromo(code, cart.subtotalCents);
}
