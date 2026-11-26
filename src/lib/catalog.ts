import "server-only";
import { cache } from "react";
import type { CatalogFilters, Category, Product } from "./types";
import { DEMO_PRODUCTS } from "./demo-data";
import { DEFAULT_CATEGORIES } from "./categories";
import { applyFilters, sizeOrder } from "./catalog-filters";
import { supabasePublic } from "./supabase/public";

/* eslint-disable @typescript-eslint/no-explicit-any */
const PRODUCT_SELECT =
  "id, slug, name, brand, description, gender, price_cents, sale_price_cents, is_new, is_bestseller, is_featured, active, created_at, category:categories(slug, name), images:product_images(url, alt, color, position), variants:product_variants(id, color, color_hex, size, stock, sku)";

export function mapProductRow(r: any): Product {
  return {
    id: r.id,
    slug: r.slug,
    name: r.name,
    brand: r.brand ?? "",
    description: r.description ?? "",
    gender: r.gender,
    categorySlug: r.category?.slug ?? "",
    categoryName: r.category?.name ?? "",
    priceCents: r.price_cents,
    salePriceCents: r.sale_price_cents,
    isNew: r.is_new,
    isBestseller: r.is_bestseller,
    isFeatured: r.is_featured,
    active: r.active,
    createdAt: r.created_at,
    images: [...(r.images ?? [])].sort((a: any, b: any) => a.position - b.position).map((i: any) => ({ url: i.url, alt: i.alt || r.name, color: i.color })),
    variants: [...(r.variants ?? [])]
      .map((v: any) => ({ id: v.id, color: v.color, colorHex: v.color_hex, size: v.size, stock: v.stock, sku: v.sku }))
      .sort((a, b) => sizeOrder(a.size) - sizeOrder(b.size)),
    isDemo: false,
  };
}


/** Tous les produits actifs (catalogue d'une boutique physique : quelques centaines d'articles au plus). */
export const getAllProducts = cache(async (): Promise<Product[]> => {
  const sb = supabasePublic();
  if (!sb) return DEMO_PRODUCTS;
  const { data, error } = await sb.from("products").select(PRODUCT_SELECT).eq("active", true).order("created_at", { ascending: false });
  if (error) {
    console.error("[catalog] lecture produits impossible", error.message);
    return [];
  }
  return (data ?? []).map(mapProductRow);
});

export const getCategories = cache(async (): Promise<Category[]> => {
  const sb = supabasePublic();
  if (!sb) return DEFAULT_CATEGORIES;
  const { data, error } = await sb.from("categories").select("slug, name, gender, position, description").eq("active", true).order("position");
  if (error || !data) return DEFAULT_CATEGORIES;
  return data as Category[];
});

export const getProductBySlug = cache(async (slug: string) => {
  const all = await getAllProducts();
  return all.find((p) => p.slug === slug) ?? null;
});

export async function getProducts(f: CatalogFilters) {
  return applyFilters(await getAllProducts(), f);
}

export async function getRelated(p: Product, limit = 8) {
  const all = await getAllProducts();
  const same = all.filter((x) => x.id !== p.id && x.gender === p.gender && x.categorySlug === p.categorySlug);
  const others = all.filter((x) => x.id !== p.id && x.gender === p.gender && x.categorySlug !== p.categorySlug);
  return [...same, ...others].slice(0, limit);
}

export { applyFilters, parseSearchParams, computeFacets, normalize } from "./catalog-filters";
export type { Facets } from "./catalog-filters";
