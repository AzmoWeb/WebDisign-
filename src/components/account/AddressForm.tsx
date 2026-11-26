"use client";
import { useActionState } from "react";
import { saveAddressAction } from "@/app/actions/account";

type A = { id?: string; label?: string | null; first_name?: string; last_name?: string; line1?: string; line2?: string | null; postal_code?: string; city?: string; phone?: string | null; is_default?: boolean };

export function AddressForm({ address, onDone }: { address?: A; onDone?: () => void }) {
  const [state, action, pending] = useActionState(saveAddressAction, null);
  if (state?.ok && onDone) queueMicrotask(onDone);
  return (
    <form action={action} className="grid gap-4 sm:grid-cols-6">
      {address?.id && <input type="hidden" name="id" value={address.id} />}
      {state?.error && <p className="bg-sand px-4 py-3 text-sm text-oxblood sm:col-span-6" role="alert">{state.error}</p>}
      {state?.message && <p className="bg-sand px-4 py-3 text-sm sm:col-span-6" role="status">{state.message}</p>}
      <label className="sm:col-span-6"><span className="field-label">Nom de l&apos;adresse (facultatif)</span><input name="label" defaultValue={address?.label ?? ""} className="field" maxLength={40} placeholder="Maison, travail…" /></label>
      <label className="sm:col-span-3"><span className="field-label">Prénom</span><input name="first_name" defaultValue={address?.first_name} required className="field" autoComplete="given-name" /></label>
      <label className="sm:col-span-3"><span className="field-label">Nom</span><input name="last_name" defaultValue={address?.last_name} required className="field" autoComplete="family-name" /></label>
      <label className="sm:col-span-6"><span className="field-label">Adresse</span><input name="line1" defaultValue={address?.line1} required className="field" autoComplete="address-line1" /></label>
      <label className="sm:col-span-6"><span className="field-label">Complément</span><input name="line2" defaultValue={address?.line2 ?? ""} className="field" autoComplete="address-line2" /></label>
      <label className="sm:col-span-2"><span className="field-label">Code postal</span><input name="postal_code" defaultValue={address?.postal_code} required inputMode="numeric" maxLength={5} className="field" autoComplete="postal-code" /></label>
      <label className="sm:col-span-4"><span className="field-label">Ville</span><input name="city" defaultValue={address?.city} required className="field" autoComplete="address-level2" /></label>
      <label className="sm:col-span-3"><span className="field-label">Téléphone</span><input name="phone" defaultValue={address?.phone ?? ""} className="field" type="tel" autoComplete="tel" /></label>
      <label className="flex items-center gap-3 text-sm sm:col-span-6"><input type="checkbox" name="is_default" defaultChecked={address?.is_default} className="accent-ink" /> Adresse par défaut</label>
      <div className="sm:col-span-6"><button type="submit" className="btn btn-primary" disabled={pending}>Enregistrer l&apos;adresse</button></div>
    </form>
  );
}
