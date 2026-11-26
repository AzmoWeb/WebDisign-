"use client";
import { IconHeart } from "@/components/ui/Icons";
import { useFavorites } from "./FavoritesProvider";

export function FavoriteButton({ productId, name, className = "" }: { productId: string; name: string; className?: string }) {
  const { has, toggle, ready } = useFavorites();
  const on = ready && has(productId);
  return (
    <button
      type="button"
      aria-pressed={on}
      aria-label={on ? `Retirer ${name} des favoris` : `Ajouter ${name} aux favoris`}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(productId);
      }}
      className={`flex h-10 w-10 items-center justify-center transition-transform duration-300 hover:scale-110 ${on ? "text-oxblood" : "text-ink"} ${className}`}
    >
      <IconHeart filled={on} className="h-[19px] w-[19px]" />
    </button>
  );
}
