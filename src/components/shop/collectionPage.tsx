import { CatalogView } from "./CatalogView";
import type { CatalogFilters } from "@/lib/types";

type SP = Promise<Record<string, string | string[] | undefined>>;

export async function CollectionPage({ collection, title, kicker, href, intro, searchParams }: { collection: NonNullable<CatalogFilters["collection"]>; title: string; kicker: string; href: string; intro: string; searchParams: SP }) {
  const sp = await searchParams;
  const g = sp.genre === "femme" || sp.genre === "homme" ? sp.genre : undefined;
  return (
    <CatalogView
      kicker={kicker}
      title={title}
      intro={intro}
      base={{ collection, gender: g }}
      searchParams={sp}
      breadcrumbs={[{ name: "Accueil", href: "/" }, { name: title, href }]}
      subNav={[
        { name: "Tout", href, active: !g },
        { name: "Femme", href: `${href}?genre=femme`, active: g === "femme" },
        { name: "Homme", href: `${href}?genre=homme`, active: g === "homme" },
      ]}
    />
  );
}
