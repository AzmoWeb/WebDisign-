"use client";
import Link from "next/link";
import { useEffect } from "react";
import { formatPrice } from "@/lib/money";
import { useCart } from "./CartProvider";
import { usePricedCart } from "./usePricedCart";
import { CartLineItem } from "./CartLineItem";

export function CartPageClient() {
  const { data, loading } = usePricedCart();
  const { lines, remove } = useCart();

  // Retire du panier les articles qui n'existent plus
  useEffect(() => {
    if (!data) return;
    const known = new Set(data.lines.map((l) => l.variantId));
    lines.filter((l) => !known.has(l.variantId)).forEach((l) => remove(l.variantId));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const savings = data ? data.originalCents - data.subtotalCents : 0;
  const blocked = !data || data.lines.some((l) => !l.available) || data.hasDemo || !data.shipping.ready;

  return (
    <div className="container-site pt-10">
      <h1 className="display text-[2.6rem] md:text-[3.4rem]">Mon panier</h1>
      {loading && !data ? (
        <p className="mt-10 text-mist">Chargement de votre panier…</p>
      ) : !data || data.lines.length === 0 ? (
        <div className="mt-10 border-t border-line pt-10">
          <p className="text-graphite">Votre panier est vide.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/femme" className="btn btn-primary">Chaussures femme</Link>
            <Link href="/homme" className="btn btn-outline">Chaussures homme</Link>
          </div>
        </div>
      ) : (
        <div className="mt-10 grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-8">
            {data.issues.map((i) => (
              <p key={i} className="mb-4 bg-sand px-4 py-3 text-sm" role="status">{i}</p>
            ))}
            <ul className="divide-y divide-line border-y border-line">
              {data.lines.map((l) => (
                <CartLineItem key={l.variantId} line={l} />
              ))}
            </ul>
            <Link href="/" className="mt-6 inline-block text-sm underline underline-offset-4">Continuer mes achats</Link>
          </div>
          <aside className="lg:col-span-4" aria-label="Récapitulatif">
            <div className="bg-paper p-6 md:p-8 lg:sticky lg:top-36">
              <h2 className="label">Récapitulatif</h2>
              <dl className="mt-6 space-y-3 text-sm">
                <div className="flex justify-between"><dt>Sous-total</dt><dd className="tabular-nums">{formatPrice(data.originalCents)}</dd></div>
                {savings > 0 && <div className="flex justify-between text-oxblood"><dt>Promotions</dt><dd className="tabular-nums">−{formatPrice(savings)}</dd></div>}
                <div className="flex justify-between text-graphite">
                  <dt>Livraison</dt>
                  <dd className="text-right">
                    {data.shipping.cheapestCents == null ? "À configurer" : data.shipping.cheapestCents === 0 ? "Offerte" : `à partir de ${formatPrice(data.shipping.cheapestCents)}`}
                  </dd>
                </div>
                {data.shipping.nextFreeThresholdCents != null && (
                  <p className="text-xs text-mist">Livraison offerte dès {formatPrice(data.shipping.nextFreeThresholdCents)} — encore {formatPrice(data.shipping.nextFreeThresholdCents - data.subtotalCents)}.</p>
                )}
                <div className="flex justify-between border-t border-line pt-4 text-base"><dt>Total articles</dt><dd className="tabular-nums">{formatPrice(data.subtotalCents)}</dd></div>
              </dl>
              <p className="mt-2 text-xs text-mist">Prix TTC. Les codes promotionnels se saisissent à l&apos;étape du paiement.</p>
              {data.hasDemo ? (
                <p className="mt-6 bg-[#f3e7c9] p-3 text-xs text-[#4d3a12]">Votre panier contient des articles de démonstration : la commande est désactivée.</p>
              ) : !data.shipping.ready ? (
                <p className="mt-6 bg-sand p-3 text-xs">La commande en ligne ouvrira prochainement. En attendant, contactez le magasin.</p>
              ) : data.lines.some((l) => !l.available) ? (
                <p className="mt-6 text-xs text-oxblood">Modifiez les articles indisponibles pour continuer.</p>
              ) : null}
              {blocked ? (
                <button type="button" disabled className="btn btn-primary mt-6 w-full">Passer commande</button>
              ) : (
                <Link href="/commande" className="btn btn-primary mt-6 w-full" data-testid="go-checkout">Passer commande</Link>
              )}
              <p className="mt-4 text-center text-xs text-mist">Paiement sécurisé par Stripe</p>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
