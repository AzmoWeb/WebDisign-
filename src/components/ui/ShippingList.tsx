import type { ShippingSettings } from "@/lib/types";
import { availableShipping } from "@/lib/shipping";
import { formatPrice } from "@/lib/money";

/** Liste des modes de livraison réellement proposés (tarif renseigné). */
export function ShippingList({ shipping, city, empty = "Les conditions de livraison seront communiquées prochainement." }: { shipping: ShippingSettings; city: string; empty?: string }) {
  const options = availableShipping(shipping, 0);
  if (!options.length) return <li>{empty}</li>;
  return (
    <>
      {options.map((o) => (
        <li key={o.id}>
          {o.type === "pickup" ? `Retrait en magasin à ${city} : gratuit` : `${o.label} : ${o.priceCents === 0 ? "offerte" : formatPrice(o.priceCents)}`}
          {o.freeFromCents != null && o.priceCents > 0 && `, offerte dès ${formatPrice(o.freeFromCents)} d'achat`}
          {o.delayText && ` — ${o.delayText}`}
        </li>
      ))}
    </>
  );
}

/** Plus petit seuil de gratuité parmi les modes proposés. */
export function lowestFreeThreshold(shipping: ShippingSettings) {
  const t = availableShipping(shipping, 0)
    .map((o) => o.freeFromCents)
    .filter((x): x is number => x != null);
  return t.length ? Math.min(...t) : null;
}
