import type { ShippingMethod, ShippingSettings } from "./types";

/** Identifiant réservé au retrait en magasin. */
export const PICKUP_ID = "retrait-magasin";

export type ShippingOption = { id: string; type: "home" | "relay" | "pickup"; carrier: string; label: string; delayText: string | null; priceCents: number; freeFromCents: number | null };

const usable = (m: ShippingMethod) => m.enabled && m.priceCents != null;

/** Modes réellement proposables : activés ET avec un tarif renseigné. */
export function availableShipping(s: ShippingSettings, subtotalCents: number): ShippingOption[] {
  const out: ShippingOption[] = (s.methods ?? []).filter(usable).map((m) => ({
    id: m.id,
    type: m.type,
    carrier: m.carrier,
    label: m.label,
    delayText: m.delayText,
    priceCents: m.freeFromCents != null && subtotalCents >= m.freeFromCents ? 0 : m.priceCents!,
    freeFromCents: m.freeFromCents,
  }));
  if (s.pickupEnabled) out.push({ id: PICKUP_ID, type: "pickup", carrier: "magasin", label: "Retrait en magasin", delayText: s.pickupText, priceCents: 0, freeFromCents: null });
  return out;
}

/** La vente en ligne n'est ouverte que si au moins un mode de livraison est configuré. */
export function shippingReady(s: ShippingSettings) {
  return (s.methods ?? []).some(usable) || s.pickupEnabled;
}

/** Frais calculés exclusivement à partir des règles configurées. null = mode indisponible. */
export function computeShipping(s: ShippingSettings, methodId: string, subtotalCents: number): number | null {
  return availableShipping(s, subtotalCents).find((o) => o.id === methodId)?.priceCents ?? null;
}

export function findShipping(s: ShippingSettings, methodId: string, subtotalCents: number) {
  return availableShipping(s, subtotalCents).find((o) => o.id === methodId) ?? null;
}

/** Libellé d'un mode enregistré sur une commande. */
export function shippingLabel(methodId: string, savedLabel?: string | null) {
  if (savedLabel) return savedLabel;
  if (methodId === PICKUP_ID || methodId === "pickup") return "Retrait en magasin";
  return "Livraison à domicile";
}
