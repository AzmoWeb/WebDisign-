import { discountPercent, formatPrice } from "@/lib/money";

export function Price({ priceCents, salePriceCents, size = "md" }: { priceCents: number; salePriceCents: number | null; size?: "md" | "lg" }) {
  const onSale = salePriceCents != null && salePriceCents < priceCents;
  const big = size === "lg";
  return (
    <p className={`flex flex-wrap items-baseline gap-x-2.5 tabular-nums ${big ? "text-2xl" : "text-[0.95rem]"}`}>
      {onSale ? (
        <>
          <span className="sr-only">Prix promotionnel :</span>
          <span className="font-medium text-oxblood">{formatPrice(salePriceCents)}</span>
          <span className="sr-only">au lieu de</span>
          <s className={`text-mist ${big ? "text-base" : "text-sm"}`}>{formatPrice(priceCents)}</s>
          {big && <span className="label text-oxblood">−{discountPercent({ priceCents, salePriceCents })} %</span>}
        </>
      ) : (
        <span>{formatPrice(priceCents)}</span>
      )}
    </p>
  );
}
