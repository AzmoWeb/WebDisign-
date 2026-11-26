"use client";
import { useEffect, useMemo, useState } from "react";
import type { Product } from "@/lib/types";
import { useCart } from "@/components/cart/CartProvider";
import { useConsent } from "@/components/consent/ConsentProvider";
import { FavoriteButton } from "./FavoriteButton";
import { ProductGallery } from "./ProductGallery";
import { StockAlert } from "./StockAlert";
import { ReserveInStore } from "./ReserveInStore";

export function ProductPurchase({ product: p, children, reservation, storeAddress }: { product: Product; children: React.ReactNode; reservation: { enabled: boolean; holdHours: number }; storeAddress: string }) {
  const colors = useMemo(() => [...new Map(p.variants.map((v) => [v.color, v.colorHex])).entries()].map(([name, hex]) => ({ name, hex })), [p.variants]);
  const [color, setColor] = useState(colors[0]?.name ?? "");
  const [variantId, setVariantId] = useState<string | null>(null);
  const [qty, setQty] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [added, setAdded] = useState(false);
  const { add, setDrawerOpen } = useCart();
  const { choices } = useConsent();

  const variants = p.variants.filter((v) => v.color === color);
  const selected = variants.find((v) => v.id === variantId) ?? null;
  const colorHex = colors.find((c) => c.name === color)?.hex ?? "#1a1816";
  const images = p.images.filter((i) => !i.color || i.color === color);

  // Préférence (avec consentement) : pré-sélection de la pointure habituelle
  useEffect(() => {
    if (!choices.preferences) return;
    try {
      const pref = localStorage.getItem("ajp_pref_size");
      const v = variants.find((x) => x.size === pref && x.stock > 0);
      if (v) setVariantId(v.id);
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [color, choices.preferences]);

  const onAdd = () => {
    if (!selected) {
      setError("Veuillez sélectionner votre pointure.");
      document.getElementById("size-picker")?.focus();
      return;
    }
    if (selected.stock < qty) {
      setError("Quantité indisponible pour cette pointure.");
      return;
    }
    add({ productId: p.id, variantId: selected.id, quantity: qty });
    if (choices.preferences) try { localStorage.setItem("ajp_pref_size", selected.size); } catch {}
    setAdded(true);
    setDrawerOpen(true);
    setTimeout(() => setAdded(false), 2500);
  };

  const outOfStock = !p.variants.some((v) => v.stock > 0);

  return (
    <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
      <div className="min-w-0 lg:col-span-7">
        <ProductGallery images={images.length ? images : p.images} demoShape={p.demoShape} colorHex={colorHex} name={p.name} />
      </div>
      <div className="min-w-0 lg:col-span-5">
        <div className="lg:sticky lg:top-36">
          {children}

          {colors.length > 0 && (
            <fieldset className="mt-8">
              <legend className="text-sm">
                Coloris : <span className="text-graphite">{color}</span>
              </legend>
              <div className="mt-3 flex flex-wrap gap-3">
                {colors.map((c) => (
                  <button key={c.name} type="button" onClick={() => { setColor(c.name); setVariantId(null); setError(null); }}
                    aria-pressed={c.name === color} aria-label={c.name}
                    className={`h-9 w-9 rounded-full border border-ink/15 transition-shadow ${c.name === color ? "ring-1 ring-ink ring-offset-[3px] ring-offset-ivory" : "hover:ring-1 hover:ring-stone hover:ring-offset-[3px] hover:ring-offset-ivory"}`}
                    style={{ background: c.hex }} />
                ))}
              </div>
            </fieldset>
          )}

          <fieldset className="mt-8">
            <div className="flex items-baseline justify-between">
              <legend className="text-sm">
                Pointure {selected && <span className="text-graphite">: {selected.size}</span>}
              </legend>
              <span className="text-xs text-mist">Pointures françaises (EU)</span>
            </div>
            <div id="size-picker" tabIndex={-1} className="mt-3 grid grid-cols-5 gap-2 sm:grid-cols-6" role="radiogroup" aria-label="Choisir une pointure" aria-invalid={Boolean(error && !selected)}>
              {variants.map((v) => {
                const disabled = v.stock === 0;
                const on = v.id === variantId;
                return (
                  <button key={v.id} type="button" role="radio" aria-checked={on} disabled={disabled}
                    aria-label={`Pointure ${v.size}${disabled ? ", indisponible" : ""}`}
                    onClick={() => { setVariantId(v.id); setError(null); setQty(1); }}
                    className={`relative h-12 border text-sm tabular-nums transition-colors ${on ? "border-ink bg-ink text-ivory" : disabled ? "cursor-not-allowed border-line text-stone" : "border-line hover:border-ink"}`}>
                    {v.size}
                    {disabled && <span className="pointer-events-none absolute inset-0" aria-hidden="true" style={{ background: "linear-gradient(to top right, transparent calc(50% - 0.5px), #d9cbb7 50%, transparent calc(50% + 0.5px))" }} />}
                  </button>
                );
              })}
            </div>
            <p className="mt-3 min-h-5 text-sm" aria-live="polite">
              {error ? (
                <span className="text-oxblood">{error}</span>
              ) : selected ? (
                selected.stock <= 2 ? <span className="text-oxblood">Plus que {selected.stock} en stock</span> : <span className="text-moss">En stock · {selected.stock} disponibles</span>
              ) : outOfStock ? (
                <span className="text-oxblood">Ce modèle est actuellement épuisé.</span>
              ) : (
                <span className="text-mist">Les pointures barrées sont indisponibles.</span>
              )}
            </p>
          </fieldset>

          <div className="mt-6 flex gap-3">
            <label className="sr-only" htmlFor="qty">Quantité</label>
            <select id="qty" value={qty} onChange={(e) => setQty(Number(e.target.value))} className="h-[3.25rem] w-20 border border-line bg-paper px-3" disabled={!selected}>
              {Array.from({ length: Math.max(1, Math.min(10, selected?.stock ?? 1)) }, (_, i) => i + 1).map((n) => <option key={n}>{n}</option>)}
            </select>
            <button type="button" onClick={onAdd} disabled={outOfStock} className="btn btn-primary h-[3.25rem] flex-1" data-testid="add-to-cart">
              {added ? "Ajouté au panier" : outOfStock ? "Épuisé" : "Ajouter au panier"}
            </button>
            <FavoriteButton productId={p.id} name={p.name} className="h-[3.25rem] w-[3.25rem] border border-line" />
          </div>
          {reservation.enabled && !outOfStock && (
            <ReserveInStore
              variant={selected}
              productName={p.name}
              holdHours={reservation.holdHours}
              storeAddress={storeAddress}
              onNeedSize={() => {
                setError("Choisissez d'abord votre pointure.");
                document.getElementById("size-picker")?.focus();
              }}
            />
          )}
          <div className="mt-4">
            <StockAlert key={color} soldOut={variants.filter((v) => v.stock === 0)} />
          </div>
          {p.isDemo && <p className="mt-3 text-xs text-[#6b5320]">Article de démonstration : il peut être placé dans le panier pour tester le parcours, mais ne peut pas être commandé.</p>}
        </div>
      </div>
    </div>
  );
}
