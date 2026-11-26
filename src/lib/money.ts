const fmt = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" });
export const formatPrice = (cents: number) => fmt.format(cents / 100);
export const effectivePrice = (p: { priceCents: number; salePriceCents: number | null }) =>
  p.salePriceCents != null && p.salePriceCents < p.priceCents ? p.salePriceCents : p.priceCents;
export const discountPercent = (p: { priceCents: number; salePriceCents: number | null }) =>
  p.salePriceCents != null && p.salePriceCents < p.priceCents ? Math.round((1 - p.salePriceCents / p.priceCents) * 100) : 0;
