import { CollectionPage } from "@/components/shop/collectionPage";

export const metadata = {
  title: "Nouveautés chaussures femme et homme",
  description: "Les dernières chaussures arrivées chez Aux Jolis Pas, magasin de chaussures à Bar-sur-Seine (Aube).",
  alternates: { canonical: "/nouveautes" },
};
export default function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  return <CollectionPage collection="nouveautes" title="Nouveautés" kicker="Fraîchement arrivées" href="/nouveautes" intro="Les derniers modèles femme et homme arrivés en boutique." searchParams={searchParams} />;
}
