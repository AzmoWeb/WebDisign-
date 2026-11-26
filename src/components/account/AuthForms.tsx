"use client";
import Link from "next/link";
import { useActionState, useState } from "react";
import { forgotPasswordAction, resetPasswordAction, signInAction, signUpAction, type FormState } from "@/app/actions/auth";

function Status({ state }: { state: FormState }) {
  if (!state) return null;
  if (state.error) return <p className="bg-sand px-4 py-3 text-sm text-oxblood" role="alert">{state.error}</p>;
  if (state.message) return <p className="bg-sand px-4 py-3 text-sm" role="status">{state.message}</p>;
  return null;
}

function PasswordField({ name = "password", label = "Mot de passe", autoComplete }: { name?: string; label?: string; autoComplete: string }) {
  const [show, setShow] = useState(false);
  return (
    <label className="block">
      <span className="field-label">{label}</span>
      <span className="relative block">
        <input name={name} type={show ? "text" : "password"} required autoComplete={autoComplete} className="field pr-24" maxLength={128} />
        <button type="button" onClick={() => setShow((s) => !s)} className="absolute inset-y-0 right-3 text-xs text-graphite underline underline-offset-4">
          {show ? "Masquer" : "Afficher"}
        </button>
      </span>
    </label>
  );
}

export function SignInForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState(signInAction, null);
  return (
    <form action={action} className="space-y-5">
      <Status state={state} />
      <input type="hidden" name="next" value={next} />
      <label className="block">
        <span className="field-label">Adresse e-mail</span>
        <input name="email" type="email" required autoComplete="email" className="field" />
      </label>
      <PasswordField autoComplete="current-password" />
      <div className="flex justify-end">
        <Link href="/compte/mot-de-passe-oublie" className="text-sm underline underline-offset-4">Mot de passe oublié ?</Link>
      </div>
      <button type="submit" className="btn btn-primary w-full" disabled={pending}>{pending ? "Connexion…" : "Se connecter"}</button>
    </form>
  );
}

export function SignUpForm() {
  const [state, action, pending] = useActionState(signUpAction, null);
  if (state?.ok) return <Status state={state} />;
  return (
    <form action={action} className="space-y-5">
      <Status state={state} />
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block"><span className="field-label">Prénom</span><input name="firstName" required autoComplete="given-name" className="field" maxLength={80} /></label>
        <label className="block"><span className="field-label">Nom</span><input name="lastName" required autoComplete="family-name" className="field" maxLength={80} /></label>
      </div>
      <label className="block"><span className="field-label">Adresse e-mail</span><input name="email" type="email" required autoComplete="email" className="field" /></label>
      <PasswordField autoComplete="new-password" />
      <p className="-mt-2 text-xs text-mist">10 caractères minimum, avec majuscule, minuscule et chiffre.</p>
      <label className="flex items-start gap-3 text-sm">
        <input type="checkbox" name="consent" required className="mt-1 accent-ink" />
        <span>J&apos;accepte que mes données soient traitées pour la gestion de mon compte, conformément à la <Link href="/politique-de-confidentialite" className="link-static" target="_blank">politique de confidentialité</Link>.</span>
      </label>
      <button type="submit" className="btn btn-primary w-full" disabled={pending}>{pending ? "Création…" : "Créer mon compte"}</button>
    </form>
  );
}

export function ForgotForm() {
  const [state, action, pending] = useActionState(forgotPasswordAction, null);
  return (
    <form action={action} className="space-y-5">
      <Status state={state} />
      <label className="block"><span className="field-label">Adresse e-mail</span><input name="email" type="email" required autoComplete="email" className="field" /></label>
      <button type="submit" className="btn btn-primary w-full" disabled={pending}>Recevoir un lien</button>
    </form>
  );
}

export function ResetForm() {
  const [state, action, pending] = useActionState(resetPasswordAction, null);
  return (
    <form action={action} className="space-y-5">
      <Status state={state} />
      <PasswordField label="Nouveau mot de passe" autoComplete="new-password" />
      <PasswordField name="confirm" label="Confirmer le mot de passe" autoComplete="new-password" />
      <button type="submit" className="btn btn-primary w-full" disabled={pending}>Enregistrer</button>
    </form>
  );
}
