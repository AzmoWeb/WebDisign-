"use client";
import Link from "next/link";
import Script from "next/script";
import { useActionState, useEffect, useState } from "react";
import { contactAction } from "@/app/actions/contact";

export function ContactForm({ turnstileSiteKey }: { turnstileSiteKey: string }) {
  const [state, action, pending] = useActionState(contactAction, null);
  const [started, setStarted] = useState(0);
  useEffect(() => setStarted(Date.now()), []);
  if (state?.ok) return <p className="bg-sand px-5 py-6" role="status">{state.message}</p>;
  return (
    <form action={action} className="grid gap-5 sm:grid-cols-2" noValidate={false}>
      {state?.error && <p className="bg-sand px-4 py-3 text-sm text-oxblood sm:col-span-2" role="alert">{state.error}</p>}
      <input type="hidden" name="started" value={started} />
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 overflow-hidden">
        <label>Site web<input type="text" name="website" tabIndex={-1} autoComplete="off" /></label>
      </div>
      <label className="block"><span className="field-label">Nom *</span><input name="name" required maxLength={100} autoComplete="name" className="field" /></label>
      <label className="block"><span className="field-label">Adresse e-mail *</span><input name="email" type="email" required autoComplete="email" className="field" /></label>
      <label className="block"><span className="field-label">Téléphone</span><input name="phone" type="tel" autoComplete="tel" maxLength={20} className="field" /></label>
      <label className="block"><span className="field-label">Sujet *</span>
        <select name="subject" required className="field" defaultValue="">
          <option value="" disabled>Choisir…</option>
          <option value="produit">Question sur un produit</option>
          <option value="commande">Suivi de commande</option>
          <option value="retour">Retour / échange</option>
          <option value="magasin">Le magasin</option>
          <option value="autre">Autre demande</option>
        </select>
      </label>
      <label className="block sm:col-span-2"><span className="field-label">Message *</span><textarea name="message" required minLength={10} maxLength={3000} rows={6} className="field" /></label>
      <label className="flex items-start gap-3 text-sm sm:col-span-2">
        <input type="checkbox" name="consent" required className="mt-1 accent-ink" />
        <span>J&apos;accepte que mes données soient utilisées pour traiter ma demande (<Link href="/politique-de-confidentialite" className="link-static">en savoir plus</Link>).</span>
      </label>
      {turnstileSiteKey && (
        <div className="sm:col-span-2">
          <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer />
          <div className="cf-turnstile" data-sitekey={turnstileSiteKey} data-language="fr" />
        </div>
      )}
      <div className="sm:col-span-2"><button type="submit" className="btn btn-primary" disabled={pending}>{pending ? "Envoi…" : "Envoyer le message"}</button></div>
    </form>
  );
}
