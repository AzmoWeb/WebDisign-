import { getAllProducts } from "@/lib/catalog";
import { FavoritesList } from "@/components/product/FavoritesList";

export const metadata = { title: "Mes favoris", robots: { index: false } };

export default async function FavoritesPage() {
  const products = await getAllProducts();
  return (
    <div className="container-site pt-10">
      <h1 className="display text-[2.6rem] md:text-[3.4rem]">Mes favoris</h1>
      <FavoritesList products={products} />
    </div>
  );
}
