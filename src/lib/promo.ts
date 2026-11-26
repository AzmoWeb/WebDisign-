import { formatPrice } from "./money";

export type PromoCode = {
  code: string;
  kind: "percent" | "amount";
  value: number; // % (1–90) ou centimes
  min_subtotal_cents: number;
  starts_at: string | null;
  ends_at: string | null;
  max_uses: number | null;
  uses: number;
  active: boolean;
};

export const normalizeCode = (s: string) => s.trim().toUpperCase().replace(/\s+/g, "");
export const CODE_PATTERN = /^[A-Z0-9_-]{3,30}$/;

/** Calcule la remise d'un code sur le sous-total articles (hors livraison). */
export function promoDiscount(p: PromoCode | null, subtotalCents: number, now = new Date()): { ok: true; discountCents: number; label: string } | { ok: false; reason: string } {
  if (!p || !p.active) return { ok: false, reason: "Ce code n'est pas valide." };
  if (p.starts_at && new Date(p.starts_at) > now) return { ok: false, reason: "Ce code n'est pas encore actif." };
  if (p.ends_at && new Date(p.ends_at) < now) return { ok: false, reason: "Ce code a expiré." };
  if (p.max_uses != null && p.uses >= p.max_uses) return { ok: false, reason: "Ce code a atteint son nombre maximal d'utilisations." };
  if (subtotalCents < p.min_subtotal_cents) return { ok: false, reason: `Ce code est valable dès ${formatPrice(p.min_subtotal_cents)} d'achat.` };
  const raw = p.kind === "percent" ? Math.round((subtotalCents * Math.min(p.value, 90)) / 100) : p.value;
  // Jamais plus que le montant des articles : un paiement d'au moins 0,50 € reste exigé par Stripe
  const discountCents = Math.max(0, Math.min(raw, subtotalCents - 50));
  if (discountCents <= 0) return { ok: false, reason: "Ce code ne s'applique pas à ce panier." };
  return { ok: true, discountCents, label: p.kind === "percent" ? `−${p.value} %` : `−${formatPrice(p.value)}` };
}
