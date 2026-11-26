"use server";
import type { CartLine } from "@/lib/types";
import { priceCart } from "@/lib/cart-pricing";
import { getSettings } from "@/lib/settings";
import { computeShipping, shippingReady } from "@/lib/shipping";

export async function priceCartAction(lines: CartLine[]) {
  const [priced, settings] = await Promise.all([priceCart(lines), getSettings()]);
  const s = settings.shipping;
  return {
    ...priced,
    shipping: {
      ready: shippingReady(s),
      home: computeShipping(s, "home", priced.subtotalCents),
      pickup: computeShipping(s, "pickup", priced.subtotalCents),
      freeThresholdCents: s.freeShippingThresholdCents,
    },
  };
}
export type PricedCart = Awaited<ReturnType<typeof priceCartAction>>;
