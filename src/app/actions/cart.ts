"use server";
import type { CartLine } from "@/lib/types";
import { priceCart } from "@/lib/cart-pricing";
import { getSettings } from "@/lib/settings";
import { availableShipping, shippingReady } from "@/lib/shipping";

export async function priceCartAction(lines: CartLine[]) {
  const [priced, settings] = await Promise.all([priceCart(lines), getSettings()]);
  const s = settings.shipping;
  const options = availableShipping(s, priced.subtotalCents);
  const paid = options.filter((o) => o.type !== "pickup");
  // Prochain seuil de gratuité pas encore atteint (pour l'incitation dans le panier)
  const nextFree = paid
    .map((o) => s.methods.find((m) => m.id === o.id)?.freeFromCents ?? null)
    .filter((x): x is number => x != null && x > priced.subtotalCents);
  return {
    ...priced,
    shipping: {
      ready: shippingReady(s),
      cheapestCents: options.length ? Math.min(...options.map((o) => o.priceCents)) : null,
      nextFreeThresholdCents: nextFree.length ? Math.min(...nextFree) : null,
    },
  };
}
export type PricedCart = Awaited<ReturnType<typeof priceCartAction>>;
