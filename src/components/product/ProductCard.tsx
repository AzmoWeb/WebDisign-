import Link from "next/link";
import type { Product } from "@/lib/types";
import { discountPercent } from "@/lib/money";
import { ProductMedia } from "./ProductMedia";
import { FavoriteButton } from "./FavoriteButton";
import { Price } from "./Price";

export function ProductCard({ product: p, priority }: { product: Product; priority?: boolean }) {
  const first = p.images[0];
  const second = p.images[1];
  const firstHex = p.variants.find((v) => v.color === first?.color)?.colorHex ?? p.variants[0]?.colorHex;
  const secondHex = p.variants.find((v) => v.color === second?.color)?.colorHex;
  const pct = discountPercent(p);
  const colors = [...new Map(p.variants.map((v) => [v.color, v.colorHex])).entries()];
  const outOfStock = !p.variants.some((v) => v.stock > 0);
  return (
    <article className="group relative">
      <Link href={`/produit/${p.slug}`} className="block" tabIndex={-1} aria-hidden="true">
        <div className="relative aspect-[4/5] overflow-hidden bg-sand">
          <ProductMedia
            url={first?.url}
            alt={first?.alt ?? p.name}
            demoShape={p.demoShape}
            colorHex={firstHex}
            priority={priority}
            sizes="(min-width:1280px) 22vw, (min-width:768px) 30vw, 50vw"
            className="transition-[transform,opacity] duration-[900ms] ease-[var(--ease-out-soft)] group-hover:scale-[1.035]"
          />
          {second?.url && (
            <ProductMedia
              url={second?.url}
              alt=""
              
              colorHex={secondHex ?? firstHex}
              angle={2}
              background="#e4dbcd"
              sizes="(min-width:1280px) 22vw, (min-width:768px) 30vw, 50vw"
              className="opacity-0 transition-opacity duration-700 group-hover:opacity-100"
            />
          )}
          <div className="absolute top-3 left-3 flex flex-col items-start gap-1.5">
            {pct > 0 && <span className="bg-oxblood px-2 py-1 text-[0.65rem] font-medium tracking-[0.1em] text-ivory">−{pct} %</span>}
            {p.isNew && <span className="bg-ivory px-2 py-1 text-[0.65rem] font-medium tracking-[0.14em] uppercase">Nouveau</span>}
            {p.isDemo && <span className="bg-[#f3e7c9] px-2 py-1 text-[0.6rem] tracking-[0.14em] text-[#4d3a12] uppercase">Démo</span>}
          </div>
          {outOfStock && <span className="absolute inset-x-0 bottom-0 bg-ivory/90 py-2 text-center text-xs tracking-[0.14em] uppercase">Épuisé</span>}
        </div>
      </Link>
      <FavoriteButton productId={p.id} name={p.name} className="absolute top-2 right-2" />
      <div className="mt-3.5 space-y-1 pr-2">
        {p.brand && <p className="label text-mist">{p.brand}</p>}
        <h3 className="text-[0.95rem] leading-snug">
          <Link href={`/produit/${p.slug}`} className="link-underline">
            {p.name}
          </Link>
        </h3>
        <Price priceCents={p.priceCents} salePriceCents={p.salePriceCents} />
        {colors.length > 1 && (
          <p className="flex items-center gap-1.5 pt-1">
            <span className="sr-only">{`${colors.length} coloris : ${colors.map(([n]) => n).join(", ")}`}</span>
            {colors.slice(0, 5).map(([n, hex]) => (
              <span key={n} className="h-2.5 w-2.5 rounded-full border border-ink/15" style={{ background: hex }} aria-hidden="true" />
            ))}
          </p>
        )}
      </div>
    </article>
  );
}
