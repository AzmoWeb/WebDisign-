import { CollectionPage } from "@/components/shop/collectionPage";

export const metadata = {
  title: "Nos coups de cœur",
  description: "La sélection coups de cœur d'Aux Jolis Pas : chaussures femme et homme à Bar-sur-Seine.",
  alternates: { canonical: "/coups-de-coeur" },
};
export default function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  return <CollectionPage collection="coups-de-coeur" title="Coups de cœur" kicker="Notre sélection" href="/coups-de-coeur" intro="Les modèles que nous avons particulièrement aimés cette saison." searchParams={searchParams} />;
}
