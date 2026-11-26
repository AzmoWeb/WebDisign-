import Link from "next/link";
import { ForgotForm } from "@/components/account/AuthForms";

export const metadata = { title: "Mot de passe oublié", robots: { index: false } };

export default function ForgotPage() {
  return (
    <>
      <h1 className="display text-[2.6rem]">Mot de passe oublié</h1>
      <p className="mt-3 mb-8 text-graphite">Indiquez votre adresse e-mail : nous vous enverrons un lien pour choisir un nouveau mot de passe.</p>
      <ForgotForm />
      <p className="mt-8 text-sm"><Link href="/compte/connexion" className="link-static">Retour à la connexion</Link></p>
    </>
  );
}
