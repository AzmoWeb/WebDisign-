"use client";
import Link from "next/link";
import type { PricedLine } from "@/lib/types";
import { formatPrice } from "@/lib/money";
import { ProductMedia } from "@/components/product/ProductMedia";
import { useCart } from "./CartProvider";

export function CartLineItem({ line, compact }: { line: PricedLine; compact?: boolean }) {
  const { setQuantity, remove, changeVariant } = useCart();
  const maxQty = Math.max(1, Math.min(10, line.stock));
  return (
    <li className="flex gap-4 py-5" data-testid="cart-line">
      <Link href={`/produit/${line.slug}`} className={`relative shrink-0 overflow-hidden bg-sand ${compact ? "h-24 w-20" : "h-32 w-28 sm:h-40 sm:w-32"}`}>
        <ProductMedia url={line.imageUrl} alt={line.name} demoShape={line.demoShape} colorHex={line.colorHex} sizes="128px" />
      </Link>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            {line.brand && <p className="label text-mist">{line.brand}</p>}
            <Link href={`/produit/${line.slug}`} className="mt-0.5 block truncate text-[0.95rem] hover:underline">
              {line.name}
            </Link>
            <p className="mt-1 text-xs text-graphite">Coloris : {line.color}</p>
          </div>
          <p className="shrink-0 text-right text-sm tabular-nums">
            {formatPrice(line.unitPriceCents * line.quantity)}
            {line.unitPriceCents < line.originalPriceCents && <s className="block text-xs text-mist">{formatPrice(line.originalPriceCents * line.quantity)}</s>}
          </p>
        </div>
        <div className="mt-auto flex flex-wrap items-end gap-3 pt-3">
          <label className="text-xs text-graphite">
            <span className="mb-1 block">Pointure</span>
            <select
              value={line.variantId}
              onChange={(e) => changeVariant(line.variantId, e.target.value)}
              className="h-9 border border-line bg-paper px-2 text-sm"
              aria-label={`Pointure de ${line.name}`}
            >
              {line.otherSizes.map((s) => (
                <option key={s.variantId} value={s.variantId} disabled={s.stock === 0 && s.variantId !== line.variantId}>
                  {s.size}
                  {s.stock === 0 ? " — épuisé" : ""}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs text-graphite">
            <span className="mb-1 block">Quantité</span>
            <select value={line.quantity} onChange={(e) => setQuantity(line.variantId, Number(e.target.value))} className="h-9 border border-line bg-paper px-2 text-sm" aria-label={`Quantité de ${line.name}`}>
              {Array.from({ length: Math.max(maxQty, line.quantity) }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </label>
          <button type="button" onClick={() => remove(line.variantId)} className="ml-auto pb-2 text-xs text-graphite underline underline-offset-4 hover:text-ink">
            Supprimer
          </button>
        </div>
        {!line.available && (
          <p className="mt-2 text-xs text-oxblood" role="alert">
            {line.stock === 0 ? "Cette pointure n'est plus disponible." : `Seulement ${line.stock} exemplaire${line.stock > 1 ? "s" : ""} disponible${line.stock > 1 ? "s" : ""}.`}
          </p>
        )}
      </div>
    </li>
  );
}
