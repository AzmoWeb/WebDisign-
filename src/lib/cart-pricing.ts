import "server-only";
import { z } from "zod";
import type { CartLine, PricedLine } from "./types";
import { getAllProducts } from "./catalog";
import { effectivePrice } from "./money";

export const CartLinesSchema = z
  .array(
    z.object({
      productId: z.string().min(1).max(64),
      variantId: z.string().min(1).max(64),
      quantity: z.number().int().min(1).max(10),
    }),
  )
  .max(30);

/**
 * Recalcule le panier à partir de la base : prix, promotions et stocks
 * ne proviennent JAMAIS du navigateur.
 */
export async function priceCart(lines: CartLine[]) {
  const parsed = CartLinesSchema.safeParse(lines);
  if (!parsed.success) return { lines: [] as PricedLine[], subtotalCents: 0, originalCents: 0, hasDemo: false, issues: ["Panier invalide"] };
  const products = await getAllProducts();
  const out: PricedLine[] = [];
  const issues: string[] = [];
  for (const l of parsed.data) {
    const p = products.find((x) => x.id === l.productId);
    const v = p?.variants.find((x) => x.id === l.variantId);
    if (!p || !v) {
      issues.push("Un article de votre panier n'est plus disponible et a été retiré.");
      continue;
    }
    const unit = effectivePrice(p);
    const img = p.images.find((i) => i.color === v.color) ?? p.images[0];
    out.push({
      productId: p.id,
      variantId: v.id,
      slug: p.slug,
      name: p.name,
      brand: p.brand,
      size: v.size,
      color: v.color,
      colorHex: v.colorHex,
      imageUrl: img?.url || null,
      demoShape: p.demoShape,
      unitPriceCents: unit,
      originalPriceCents: p.priceCents,
      quantity: Math.min(l.quantity, Math.max(v.stock, 0)) || l.quantity,
      stock: v.stock,
      available: v.stock >= l.quantity,
      isDemo: p.isDemo,
      otherSizes: p.variants.filter((x) => x.color === v.color).map((x) => ({ variantId: x.id, size: x.size, stock: x.stock })),
    });
  }
  const subtotalCents = out.reduce((s, l) => s + l.unitPriceCents * l.quantity, 0);
  const originalCents = out.reduce((s, l) => s + l.originalPriceCents * l.quantity, 0);
  return { lines: out, subtotalCents, originalCents, hasDemo: out.some((l) => l.isDemo), issues };
}
