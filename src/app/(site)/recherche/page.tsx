import { CatalogView } from "@/components/shop/CatalogView";

export const metadata = { title: "Recherche", robots: { index: false, follow: true } };

export default async function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const q = (Array.isArray(sp.q) ? sp.q[0] : sp.q)?.slice(0, 80) ?? "";
  return (
    <CatalogView
      kicker="Recherche"
      title={q ? `« ${q} »` : "Rechercher"}
      base={{ q: q || undefined }}
      searchParams={sp}
      breadcrumbs={[{ name: "Accueil", href: "/" }, { name: "Recherche", href: "/recherche" }]}
    />
  );
}
