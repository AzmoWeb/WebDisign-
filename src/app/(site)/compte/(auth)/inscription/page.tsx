import Link from "next/link";
import { SignUpForm } from "@/components/account/AuthForms";

export const metadata = { title: "Créer un compte", robots: { index: false } };

export default function SignUpPage() {
  return (
    <>
      <h1 className="display text-[2.6rem]">Créer un compte</h1>
      <p className="mt-3 mb-8 text-graphite">Suivez vos commandes et retrouvez vos favoris.</p>
      <SignUpForm />
      <p className="mt-8 text-sm text-graphite">Déjà un compte ? <Link href="/compte/connexion" className="link-static">Se connecter</Link></p>
    </>
  );
}
