import type { ShippingSettings } from "./types";

/** La vente en ligne n'est ouverte que si les règles de livraison ont été configurées. */
export function shippingReady(s: ShippingSettings) {
  return (s.homeDeliveryEnabled && s.homeDeliveryCents != null) || s.pickupEnabled;
}

/** Frais de livraison calculés exclusivement à partir des règles configurées. null = méthode indisponible. */
export function computeShipping(s: ShippingSettings, method: "home" | "pickup", subtotalCents: number): number | null {
  if (method === "pickup") return s.pickupEnabled ? 0 : null;
  if (!s.homeDeliveryEnabled || s.homeDeliveryCents == null) return null;
  if (s.freeShippingThresholdCents != null && subtotalCents >= s.freeShippingThresholdCents) return 0;
  return s.homeDeliveryCents;
}
