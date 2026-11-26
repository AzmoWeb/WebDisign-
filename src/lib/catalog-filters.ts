import type { CatalogFilters, Product } from "./types";
import { effectivePrice } from "./money";

const sizeOrder = (s: string) => {
  const n = parseFloat(s.replace(",", "."));
  return Number.isFinite(n) ? n : 999;
};
export { sizeOrder };

export function applyFilters(all: Product[], f: CatalogFilters) {
  let list = all.filter((p) => p.active);
  if (f.gender) list = list.filter((p) => p.gender === f.gender || p.gender === "mixte");
  if (f.category) list = list.filter((p) => p.categorySlug === f.category);
  if (f.collection === "nouveautes") list = list.filter((p) => p.isNew);
  if (f.collection === "promotions") list = list.filter((p) => p.salePriceCents != null);
  if (f.collection === "coups-de-coeur") list = list.filter((p) => p.isFeatured);
  if (f.collection === "meilleures-ventes") list = list.filter((p) => p.isBestseller);
  if (f.q) {
    const terms = normalize(f.q).split(/\s+/).filter(Boolean);
    list = list.filter((p) => {
      const hay = normalize(`${p.name} ${p.brand} ${p.categoryName} ${p.gender} ${p.variants.map((v) => v.color).join(" ")}`);
      return terms.every((t) => hay.includes(t));
    });
  }

  // Facettes calculées avant les filtres de facettes, pour rester navigables
  const facets = computeFacets(list);

  if (f.categories?.length) list = list.filter((p) => f.categories!.includes(p.categorySlug));
  if (f.brands?.length) list = list.filter((p) => f.brands!.includes(p.brand));
  if (f.colors?.length) list = list.filter((p) => p.variants.some((v) => f.colors!.includes(v.color)));
  if (f.sizes?.length) list = list.filter((p) => p.variants.some((v) => f.sizes!.includes(v.size) && v.stock > 0));
  if (f.minPrice != null) list = list.filter((p) => effectivePrice(p) >= f.minPrice! * 100);
  if (f.maxPrice != null) list = list.filter((p) => effectivePrice(p) <= f.maxPrice! * 100);

  switch (f.sort) {
    case "prix-asc":
      list = [...list].sort((a, b) => effectivePrice(a) - effectivePrice(b));
      break;
    case "prix-desc":
      list = [...list].sort((a, b) => effectivePrice(b) - effectivePrice(a));
      break;
    case "nouveautes":
      list = [...list].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      break;
    default:
      list = [...list].sort((a, b) => Number(b.isFeatured) + Number(b.isBestseller) - (Number(a.isFeatured) + Number(a.isBestseller)));
  }
  return { products: list, facets };
}

export function computeFacets(list: Product[]) {
  const sizes = new Set<string>();
  const brands = new Set<string>();
  const colors = new Map<string, string>();
  const categories = new Map<string, string>();
  let min = Infinity;
  let max = 0;
  for (const p of list) {
    if (p.brand) brands.add(p.brand);
    categories.set(p.categorySlug, p.categoryName);
    for (const v of p.variants) {
      sizes.add(v.size);
      colors.set(v.color, v.colorHex);
    }
    const e = effectivePrice(p);
    min = Math.min(min, e);
    max = Math.max(max, e);
  }
  return {
    sizes: [...sizes].sort((a, b) => sizeOrder(a) - sizeOrder(b)),
    brands: [...brands].sort(),
    colors: [...colors.entries()].map(([name, hex]) => ({ name, hex })),
    categories: [...categories.entries()].filter(([s]) => s).map(([slug, name]) => ({ slug, name })),
    priceRange: list.length ? { min: Math.floor(min / 100), max: Math.ceil(max / 100) } : { min: 0, max: 0 },
  };
}
export type Facets = ReturnType<typeof computeFacets>;

export const normalize = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();

/** Lecture des paramètres d'URL des listes produits. */
export function parseSearchParams(sp: Record<string, string | string[] | undefined>): CatalogFilters {
  const list = (k: string) => {
    const v = sp[k];
    const arr = Array.isArray(v) ? v : v ? v.split(",") : [];
    return arr.map((x) => x.slice(0, 60)).filter(Boolean).slice(0, 30);
  };
  const num = (k: string) => {
    const v = Array.isArray(sp[k]) ? sp[k]![0] : sp[k];
    const n = v ? Number(v) : NaN;
    return Number.isFinite(n) && n >= 0 ? n : undefined;
  };
  const sortRaw = Array.isArray(sp.tri) ? sp.tri[0] : sp.tri;
  const sort = (["pertinence", "nouveautes", "prix-asc", "prix-desc"] as const).find((s) => s === sortRaw);
  const q = Array.isArray(sp.q) ? sp.q[0] : sp.q;
  return {
    sizes: list("pointure"),
    brands: list("marque"),
    colors: list("couleur"),
    categories: list("categorie"),
    minPrice: num("prix_min"),
    maxPrice: num("prix_max"),
    sort,
    q: q ? q.slice(0, 80) : undefined,
  };
}
