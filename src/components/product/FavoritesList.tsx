"use client";
import Link from "next/link";
import type { Product } from "@/lib/types";
import { ProductCard } from "./ProductCard";
import { useFavorites } from "./FavoritesProvider";

export function FavoritesList({ products }: { products: Product[] }) {
  const { ids, ready } = useFavorites();
  if (!ready) return <p className="mt-8 text-mist">Chargement…</p>;
  const list = products.filter((p) => ids.includes(p.id));
  if (!list.length)
    return (
      <div className="mt-8">
        <p className="text-graphite">Vous n&apos;avez pas encore de favoris. Touchez le cœur d&apos;un produit pour l&apos;enregistrer.</p>
        <Link href="/nouveautes" className="btn btn-primary mt-8">Découvrir les nouveautés</Link>
      </div>
    );
  return (
    <ul className="mt-8 grid grid-cols-2 gap-x-4 gap-y-12 md:grid-cols-3 lg:grid-cols-4 md:gap-x-6">
      {list.map((p) => <li key={p.id}><ProductCard product={p} /></li>)}
    </ul>
  );
}
