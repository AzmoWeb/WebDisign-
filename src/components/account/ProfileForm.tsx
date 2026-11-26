"use client";
import { useActionState } from "react";
import { updateProfileAction } from "@/app/actions/account";

export function ProfileForm({ firstName, lastName, phone, email }: { firstName: string; lastName: string; phone: string; email: string }) {
  const [state, action, pending] = useActionState(updateProfileAction, null);
  return (
    <form action={action} className="max-w-xl space-y-5">
      {state?.error && <p className="bg-sand px-4 py-3 text-sm text-oxblood" role="alert">{state.error}</p>}
      {state?.message && <p className="bg-sand px-4 py-3 text-sm" role="status">{state.message}</p>}
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block"><span className="field-label">Prénom</span><input name="firstName" defaultValue={firstName} required className="field" maxLength={80} autoComplete="given-name" /></label>
        <label className="block"><span className="field-label">Nom</span><input name="lastName" defaultValue={lastName} required className="field" maxLength={80} autoComplete="family-name" /></label>
      </div>
      <label className="block"><span className="field-label">Téléphone</span><input name="phone" type="tel" defaultValue={phone} className="field" maxLength={20} autoComplete="tel" /></label>
      <label className="block"><span className="field-label">Adresse e-mail</span><input value={email} readOnly className="field text-mist" /></label>
      <button type="submit" className="btn btn-primary" disabled={pending}>Enregistrer</button>
    </form>
  );
}
