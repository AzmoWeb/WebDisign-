"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { IconClose } from "@/components/ui/Icons";
import { formatPrice } from "@/lib/money";
import { useCart } from "./CartProvider";
import { usePricedCart } from "./usePricedCart";
import { CartLineItem } from "./CartLineItem";

export function CartDrawer() {
  const { drawerOpen, setDrawerOpen } = useCart();
  const pathname = usePathname();
  const { data, loading } = usePricedCart(drawerOpen);

  useEffect(() => setDrawerOpen(false), [pathname, setDrawerOpen]);
  useEffect(() => {
    if (!drawerOpen) return;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setDrawerOpen(false);
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
    };
  }, [drawerOpen, setDrawerOpen]);

  if (!drawerOpen) return null;
  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-labelledby="drawer-title">
      <button type="button" aria-label="Fermer le panier" className="absolute inset-0 bg-ink/40 animate-fade" onClick={() => setDrawerOpen(false)} />
      <div className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-paper animate-drawer-right">
        <div className="flex h-16 items-center justify-between border-b border-line px-6">
          <p id="drawer-title" className="label">Votre panier</p>
          <button type="button" onClick={() => setDrawerOpen(false)} aria-label="Fermer le panier" className="-mr-2 p-2" autoFocus>
            <IconClose className="h-6 w-6" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6">
          {loading && !data ? (
            <p className="py-10 text-sm text-mist">Chargement…</p>
          ) : data && data.lines.length ? (
            <ul className="divide-y divide-line">
              {data.lines.map((l) => (
                <CartLineItem key={l.variantId} line={l} compact />
              ))}
            </ul>
          ) : (
            <p className="py-10 text-sm text-graphite">Votre panier est vide.</p>
          )}
        </div>
        {data && data.lines.length > 0 && (
          <div className="border-t border-line px-6 py-6">
            <div className="flex justify-between text-sm">
              <span>Sous-total</span>
              <span className="tabular-nums">{formatPrice(data.subtotalCents)}</span>
            </div>
            <p className="mt-1 text-xs text-mist">Frais de livraison calculés à l&apos;étape suivante.</p>
            <div className="mt-5 grid gap-3">
              <Link href="/panier" className="btn btn-primary w-full">
                Voir mon panier
              </Link>
              <button type="button" onClick={() => setDrawerOpen(false)} className="btn btn-outline w-full">
                Continuer mes achats
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
