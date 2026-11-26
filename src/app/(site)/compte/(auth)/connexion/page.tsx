import Link from "next/link";
import { redirect } from "next/navigation";
import { SignInForm } from "@/components/account/AuthForms";
import { getCurrentUser } from "@/lib/auth";
import { safeNext } from "@/lib/security";

export const metadata = { title: "Connexion", robots: { index: false } };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string; erreur?: string }> }) {
  const sp = await searchParams;
  const next = safeNext(sp.next);
  if (await getCurrentUser()) redirect(next);
  return (
    <>
      <h1 className="display text-[2.6rem]">Connexion</h1>
      <p className="mt-3 mb-8 text-graphite">Accédez à vos commandes, vos favoris et vos adresses.</p>
      {sp.erreur === "lien" && <p className="mb-6 bg-sand px-4 py-3 text-sm text-oxblood">Ce lien est invalide ou a expiré.</p>}
      <SignInForm next={next} />
      <div className="mt-12 border-t border-line pt-8">
        <p className="label">Nouveau client ?</p>
        <Link href="/compte/inscription" className="btn btn-outline mt-5 w-full">Créer un compte</Link>
      </div>
    </>
  );
}
