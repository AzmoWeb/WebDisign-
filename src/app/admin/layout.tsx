import Link from "next/link";
import { isServiceRoleConfigured, isStripeConfigured, isSupabaseConfigured } from "@/lib/env";
import { requireAdmin } from "@/lib/auth";
import { AdminNav } from "@/components/admin/AdminNav";
import { signOutAction } from "@/app/actions/auth";

export const dynamic = "force-dynamic";
export const metadata = { title: { default: "Administration", template: "%s · Administration Aux Jolis Pas" }, robots: { index: false, follow: false } };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  if (!isSupabaseConfigured()) {
    return (
      <main className="mx-auto max-w-2xl px-6 py-20">
        <p className="label text-mist">Administration</p>
        <h1 className="display mt-3 text-4xl">Configuration requise</h1>
        <p className="mt-6 leading-relaxed text-graphite">
          Le tableau de bord nécessite la base de données Supabase. Renseignez les variables <code>NEXT_PUBLIC_SUPABASE_URL</code>, <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> et <code>SUPABASE_SERVICE_ROLE_KEY</code>, appliquez les migrations puis créez le compte administrateur (voir <code>docs/INSTALLATION.md</code>).
        </p>
        <Link href="/" className="btn btn-outline mt-10">Retour au site</Link>
      </main>
    );
  }
  const user = await requireAdmin();
  const warnings = [
    !isServiceRoleConfigured() && "SUPABASE_SERVICE_ROLE_KEY manquante : commandes, contact et journal de consentement inactifs.",
    !isStripeConfigured() && "Stripe non configuré : le paiement en ligne est désactivé.",
  ].filter(Boolean) as string[];
  return (
    <div className="min-h-dvh bg-paper lg:grid lg:grid-cols-[15rem_1fr]">
      <aside className="border-b border-line bg-ink text-ivory lg:sticky lg:top-0 lg:h-dvh lg:border-0">
        <div className="flex items-center justify-between px-5 py-5 lg:block">
          <Link href="/admin" className="block">
            <span className="text-[0.55rem] tracking-[0.5em] uppercase opacity-60">Aux</span>
            <span className="display block text-xl tracking-[0.1em] uppercase">Jolis Pas</span>
            <span className="mt-1 block text-[0.65rem] tracking-[0.2em] text-ivory/50 uppercase">Administration</span>
          </Link>
          <Link href="/" className="text-xs underline underline-offset-4 lg:hidden">Voir le site</Link>
        </div>
        <AdminNav />
        <div className="hidden px-5 pt-8 text-xs text-ivory/50 lg:block">
          <p className="truncate">{user.email}</p>
          <div className="mt-3 flex gap-4">
            <Link href="/" className="underline underline-offset-4 hover:text-ivory">Voir le site</Link>
            <form action={signOutAction}><button type="submit" className="underline underline-offset-4 hover:text-ivory">Déconnexion</button></form>
          </div>
        </div>
      </aside>
      <main className="min-w-0 px-4 py-8 md:px-10 md:py-10">
        {warnings.map((w) => <p key={w} className="mb-4 border-l-2 border-[#c9a24a] bg-[#f8efd9] px-4 py-2.5 text-sm text-[#4d3a12]">{w}</p>)}
        {children}
      </main>
    </div>
  );
}
