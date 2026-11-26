import Link from "next/link";
import { isSupabaseConfigured } from "@/lib/env";
import { requireUser } from "@/lib/auth";
import { signOutAction } from "@/app/actions/auth";
import { AccountNav } from "@/components/account/AccountNav";

export default async function EspaceLayout({ children }: { children: React.ReactNode }) {
  if (!isSupabaseConfigured()) {
    return (
      <div className="container-site max-w-xl pt-16">
        <h1 className="display text-[2.6rem]">Mon compte</h1>
        <p className="mt-6 bg-[#f3e7c9] p-4 text-sm text-[#4d3a12]">L&apos;espace client sera actif dès la connexion de la base de données Supabase.</p>
        <Link href="/" className="btn btn-outline mt-8">Retour à la boutique</Link>
      </div>
    );
  }
  const user = await requireUser();
  return (
    <div className="container-site pt-10">
      <p className="label text-mist">Mon compte</p>
      <h1 className="display mt-2 text-[2.4rem] md:text-[3rem]">Bonjour{user.firstName ? ` ${user.firstName}` : ""}</h1>
      <div className="mt-10 grid gap-10 lg:grid-cols-[14rem_1fr]">
        <aside>
          <AccountNav isAdmin={user.role === "admin"} />
          <form action={signOutAction} className="mt-6 border-t border-line pt-6">
            <button type="submit" className="text-sm underline underline-offset-4">Se déconnecter</button>
          </form>
        </aside>
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
