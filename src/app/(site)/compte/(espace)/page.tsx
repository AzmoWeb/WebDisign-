import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { ProfileForm } from "@/components/account/ProfileForm";

export const metadata = { title: "Mon compte", robots: { index: false } };

export default async function AccountPage({ searchParams }: { searchParams: Promise<{ mdp?: string }> }) {
  const user = await requireUser();
  const sp = await searchParams;
  return (
    <section>
      <h2 className="display text-2xl">Mes informations</h2>
      {sp.mdp === "ok" && <p className="mt-6 bg-sand px-4 py-3 text-sm" role="status">Votre mot de passe a été modifié.</p>}
      <div className="mt-8"><ProfileForm firstName={user.firstName} lastName={user.lastName} phone={user.phone} email={user.email} /></div>
      <div className="mt-12 border-t border-line pt-8 text-sm text-graphite">
        <p>Mot de passe : <Link href="/compte/mot-de-passe-oublie" className="link-static">recevoir un lien de modification</Link></p>
        <p className="mt-3">Pour exercer vos droits (accès, rectification, suppression de vos données), <Link href="/contact" className="link-static">contactez-nous</Link>.</p>
      </div>
    </section>
  );
}
