"use client";
import Link from "next/link";
import { useState } from "react";
import type { ShippingSettings } from "@/lib/types";
import { formatPrice } from "@/lib/money";
import { computeShipping } from "@/lib/shipping";
import { useCart } from "./CartProvider";
import { usePricedCart } from "./usePricedCart";
import { ProductMedia } from "@/components/product/ProductMedia";

type Prefill = { firstName: string; lastName: string; email: string; phone: string; address: { line1: string; line2: string; postalCode: string; city: string } | null } | null;

function Field({ label, name, error, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string; name: string; error?: string }) {
  return (
    <label className="block">
      <span className="field-label">{label}{props.required && <span aria-hidden="true"> *</span>}</span>
      <input name={name} aria-invalid={Boolean(error)} aria-describedby={error ? `${name}-err` : undefined} className="field" {...props} />
      {error && <span id={`${name}-err`} className="mt-1 block text-xs text-oxblood">{error}</span>}
    </label>
  );
}

export function CheckoutForm({ shipping, storeLabel, paymentsEnabled, prefill }: { shipping: ShippingSettings; storeLabel: string; paymentsEnabled: boolean; prefill: Prefill }) {
  const { lines } = useCart();
  const { data, loading } = usePricedCart();
  const homeAvailable = shipping.homeDeliveryEnabled && shipping.homeDeliveryCents != null;
  const [method, setMethod] = useState<"home" | "pickup">(homeAvailable ? "home" : "pickup");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const subtotal = data?.subtotalCents ?? 0;
  const shippingCents = computeShipping(shipping, method, subtotal);
  const total = subtotal + (shippingCents ?? 0);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage(null);
    setErrors({});
    const fd = new FormData(e.currentTarget);
    const body = {
      firstName: fd.get("firstName"),
      lastName: fd.get("lastName"),
      email: fd.get("email"),
      phone: fd.get("phone"),
      method,
      address: method === "home" ? { line1: fd.get("line1"), line2: fd.get("line2") || "", postalCode: fd.get("postalCode"), city: fd.get("city"), country: "FR" } : undefined,
      notes: fd.get("notes") || "",
      acceptTerms: fd.get("acceptTerms") === "on",
      lines,
    };
    setSubmitting(true);
    try {
      const res = await fetch("/api/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const json = await res.json();
      if (json.ok && json.url) {
        window.location.assign(json.url);
        return;
      }
      if (json.issues) {
        const errs: Record<string, string> = {};
        for (const i of json.issues as { path: string; message: string }[]) errs[i.path.replace("address.", "")] = i.message;
        setErrors(errs);
      }
      setMessage(json.message ?? "Une erreur est survenue.");
    } catch {
      setMessage("Connexion impossible. Vérifiez votre réseau et réessayez.");
    }
    setSubmitting(false);
  }

  if (!loading && (!data || !data.lines.length)) {
    return (
      <div className="container-site pt-12">
        <h1 className="display text-4xl">Commande</h1>
        <p className="mt-6 text-graphite">Votre panier est vide.</p>
        <Link href="/" className="btn btn-primary mt-8">Retour à la boutique</Link>
      </div>
    );
  }

  const disabled = !paymentsEnabled || data?.hasDemo || submitting || shippingCents == null;

  return (
    <div className="container-site pt-10">
      <ol className="flex gap-6 text-[0.7rem] tracking-[0.16em] text-mist uppercase" aria-label="Étapes de commande">
        <li><Link href="/panier" className="hover:text-ink">1. Panier</Link></li>
        <li className="text-ink" aria-current="step">2. Informations</li>
        <li>3. Paiement</li>
      </ol>
      <h1 className="display mt-6 text-[2.6rem] md:text-[3.2rem]">Vos informations</h1>

      <form onSubmit={onSubmit} noValidate className="mt-10 grid gap-12 lg:grid-cols-12">
        <div className="space-y-12 lg:col-span-7">
          <fieldset>
            <legend className="label mb-5">Coordonnées</legend>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Prénom" name="firstName" required autoComplete="given-name" defaultValue={prefill?.firstName} error={errors.firstName} />
              <Field label="Nom" name="lastName" required autoComplete="family-name" defaultValue={prefill?.lastName} error={errors.lastName} />
              <Field label="Adresse e-mail" name="email" type="email" required autoComplete="email" defaultValue={prefill?.email} error={errors.email} />
              <Field label="Téléphone" name="phone" type="tel" required autoComplete="tel" defaultValue={prefill?.phone} error={errors.phone} />
            </div>
            {!prefill && (
              <p className="mt-4 text-sm text-graphite">
                Déjà client ? <Link href="/compte/connexion?next=/commande" className="link-static">Connectez-vous</Link> pour retrouver vos commandes dans votre espace.
              </p>
            )}
          </fieldset>

          <fieldset>
            <legend className="label mb-5">Mode de livraison</legend>
            <div className="grid gap-3">
              {homeAvailable && (
                <label className={`flex cursor-pointer items-start gap-4 border p-5 transition-colors ${method === "home" ? "border-ink" : "border-line"}`}>
                  <input type="radio" name="method" checked={method === "home"} onChange={() => setMethod("home")} className="mt-1 accent-ink" />
                  <span className="flex-1">
                    <span className="flex justify-between"><span>Livraison à domicile</span><span className="tabular-nums">{(() => { const c = computeShipping(shipping, "home", subtotal); return c === 0 ? "Offerte" : c != null ? formatPrice(c) : ""; })()}</span></span>
                    {shipping.deliveryDelayText && <span className="mt-1 block text-sm text-graphite">{shipping.deliveryDelayText}</span>}
                  </span>
                </label>
              )}
              {shipping.pickupEnabled && (
                <label className={`flex cursor-pointer items-start gap-4 border p-5 transition-colors ${method === "pickup" ? "border-ink" : "border-line"}`}>
                  <input type="radio" name="method" checked={method === "pickup"} onChange={() => setMethod("pickup")} className="mt-1 accent-ink" />
                  <span className="flex-1">
                    <span className="flex justify-between"><span>Retrait en magasin</span><span>Gratuit</span></span>
                    <span className="mt-1 block text-sm text-graphite">{storeLabel}{shipping.pickupText ? ` — ${shipping.pickupText}` : ""}</span>
                  </span>
                </label>
              )}
              {!homeAvailable && !shipping.pickupEnabled && <p className="bg-sand p-4 text-sm">Aucun mode de livraison n&apos;est encore configuré.</p>}
            </div>
          </fieldset>

          {method === "home" && (
            <fieldset>
              <legend className="label mb-5">Adresse de livraison</legend>
              <div className="grid gap-4 sm:grid-cols-6">
                <div className="sm:col-span-6"><Field label="Adresse" name="line1" required autoComplete="address-line1" defaultValue={prefill?.address?.line1} error={errors.line1} /></div>
                <div className="sm:col-span-6"><Field label="Complément d'adresse" name="line2" autoComplete="address-line2" defaultValue={prefill?.address?.line2} /></div>
                <div className="sm:col-span-2"><Field label="Code postal" name="postalCode" required inputMode="numeric" autoComplete="postal-code" maxLength={5} defaultValue={prefill?.address?.postalCode} error={errors.postalCode} /></div>
                <div className="sm:col-span-4"><Field label="Ville" name="city" required autoComplete="address-level2" defaultValue={prefill?.address?.city} error={errors.city} /></div>
              </div>
              <p className="mt-3 text-xs text-mist">Livraison en France métropolitaine.</p>
            </fieldset>
          )}

          <fieldset>
            <legend className="label mb-5">Informations complémentaires</legend>
            <label className="block">
              <span className="field-label">Précisions pour votre commande (facultatif)</span>
              <textarea name="notes" maxLength={500} rows={3} className="field" />
            </label>
          </fieldset>
        </div>

        <aside className="lg:col-span-5" aria-label="Récapitulatif de commande">
          <div className="bg-paper p-6 md:p-8 lg:sticky lg:top-36">
            <h2 className="label">Récapitulatif</h2>
            <ul className="mt-5 divide-y divide-line">
              {data?.lines.map((l) => (
                <li key={l.variantId} className="flex gap-4 py-4">
                  <div className="relative h-20 w-16 shrink-0 overflow-hidden bg-sand">
                    <ProductMedia url={l.imageUrl} alt={l.name} demoShape={l.demoShape} colorHex={l.colorHex} sizes="64px" />
                  </div>
                  <div className="flex-1 text-sm">
                    <p>{l.name}</p>
                    <p className="text-xs text-graphite">{l.color} · Pointure {l.size} · Qté {l.quantity}</p>
                  </div>
                  <p className="text-sm tabular-nums">{formatPrice(l.unitPriceCents * l.quantity)}</p>
                </li>
              ))}
            </ul>
            <dl className="mt-4 space-y-2 border-t border-line pt-4 text-sm">
              <div className="flex justify-between"><dt>Sous-total</dt><dd className="tabular-nums">{formatPrice(subtotal)}</dd></div>
              <div className="flex justify-between"><dt>Livraison</dt><dd className="tabular-nums">{shippingCents == null ? "—" : shippingCents === 0 ? "Offerte" : formatPrice(shippingCents)}</dd></div>
              <div className="flex justify-between border-t border-line pt-3 text-base font-medium"><dt>Total TTC</dt><dd className="tabular-nums">{formatPrice(total)}</dd></div>
            </dl>
            <label className="mt-6 flex items-start gap-3 text-sm">
              <input type="checkbox" name="acceptTerms" required className="mt-1 accent-ink" aria-invalid={Boolean(errors.acceptTerms)} />
              <span>J&apos;ai lu et j&apos;accepte les <Link href="/cgv" target="_blank" className="link-static">conditions générales de vente</Link> et la <Link href="/politique-de-confidentialite" target="_blank" className="link-static">politique de confidentialité</Link>.</span>
            </label>
            {errors.acceptTerms && <p className="mt-1 text-xs text-oxblood">{errors.acceptTerms}</p>}
            {message && <p className="mt-4 bg-sand px-3 py-2 text-sm text-oxblood" role="alert">{message}</p>}
            {!paymentsEnabled && <p className="mt-4 bg-[#f3e7c9] p-3 text-xs text-[#4d3a12]">Le paiement en ligne n&apos;est pas encore activé (Stripe et base de données à configurer).</p>}
            <button type="submit" disabled={disabled} className="btn btn-primary mt-6 w-full" data-testid="pay">
              {submitting ? "Redirection vers le paiement…" : `Payer ${formatPrice(total)}`}
            </button>
            <p className="mt-4 text-center text-xs text-mist">Vous serez redirigé vers la page de paiement sécurisée Stripe.</p>
          </div>
        </aside>
      </form>
    </div>
  );
}
