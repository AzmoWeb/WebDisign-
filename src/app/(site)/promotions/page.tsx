import { CollectionPage } from "@/components/shop/collectionPage";

export const metadata = {
  title: "Promotions chaussures femme et homme",
  description: "Chaussures femme et homme à prix réduits chez Aux Jolis Pas, Bar-sur-Seine (Aube).",
  alternates: { canonical: "/promotions" },
};
export default function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  return <CollectionPage collection="promotions" title="Promotions" kicker="Prix réduits" href="/promotions" intro="Une sélection de modèles à prix réduits, dans la limite des stocks disponibles." searchParams={searchParams} />;
}
