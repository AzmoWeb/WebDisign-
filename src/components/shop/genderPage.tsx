import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCategories } from "@/lib/catalog";
import { CatalogView } from "./CatalogView";

type SP = Promise<Record<string, string | string[] | undefined>>;
type Params = Promise<{ categorie?: string[] }>;

const label = (g: "femme" | "homme") => (g === "femme" ? "Femme" : "Homme");

export async function genderMetadata(gender: "femme" | "homme", params: Params): Promise<Metadata> {
  const { categorie } = await params;
  const cats = await getCategories();
  const cat = categorie?.[0] ? cats.find((c) => c.gender === gender && c.slug === categorie[0]) : null;
  const what = cat ? `${cat.name} ${gender}` : `Chaussures ${gender}`;
  return {
    title: `${what} à Bar-sur-Seine`,
    description: `${what} chez Aux Jolis Pas, magasin de chaussures à Bar-sur-Seine (Aube). Découvrez la sélection en ligne et en magasin, 110 Grande Rue de la Résistance.`,
    alternates: { canonical: `/${gender}${cat ? `/${cat.slug}` : ""}` },
  };
}

export async function GenderPage({ gender, params, searchParams }: { gender: "femme" | "homme"; params: Params; searchParams: SP }) {
  const [{ categorie }, sp, cats] = await Promise.all([params, searchParams, getCategories()]);
  if (categorie && categorie.length > 1) notFound();
  const genderCats = cats.filter((c) => c.gender === gender);
  const cat = categorie?.[0] ? genderCats.find((c) => c.slug === categorie[0]) : null;
  if (categorie?.[0] && !cat) notFound();
  const L = label(gender);
  return (
    <CatalogView
      kicker={cat ? `Chaussures ${gender}` : "Collection"}
      title={cat ? cat.name : `Chaussures ${gender}`}
      intro={cat?.description ?? undefined}
      base={{ gender, category: cat?.slug }}
      searchParams={sp}
      breadcrumbs={[{ name: "Accueil", href: "/" }, { name: L, href: `/${gender}` }, ...(cat ? [{ name: cat.name, href: `/${gender}/${cat.slug}` }] : [])]}
      subNav={[{ name: "Tout voir", href: `/${gender}`, active: !cat }, ...genderCats.map((c) => ({ name: c.name, href: `/${gender}/${c.slug}`, active: c.slug === cat?.slug }))]}
      seoText={`Aux Jolis Pas, magasin de chaussures à Bar-sur-Seine dans l'Aube, vous présente sa sélection de ${cat ? cat.name.toLowerCase() : "chaussures"} pour ${gender === "femme" ? "femmes" : "hommes"}. Retrouvez ces modèles en ligne ou directement en boutique, au 110 Grande Rue de la Résistance, pour les essayer et choisir votre pointure.`}
    />
  );
}
