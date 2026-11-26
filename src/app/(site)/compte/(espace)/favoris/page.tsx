import { getAllProducts } from "@/lib/catalog";
import { FavoritesList } from "@/components/product/FavoritesList";

export const metadata = { title: "Mes favoris", robots: { index: false } };

export default async function AccountFavorites() {
  const products = await getAllProducts();
  return (
    <section>
      <h2 className="display text-2xl">Mes favoris</h2>
      <FavoritesList products={products} />
    </section>
  );
}
