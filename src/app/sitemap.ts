import type { MetadataRoute } from "next";
import { env } from "@/lib/env";
import { getAllProducts, getCategories } from "@/lib/catalog";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, cats] = await Promise.all([getAllProducts(), getCategories()]);
  const now = new Date();
  const statics = ["", "/femme", "/homme", "/nouveautes", "/promotions", "/coups-de-coeur", "/notre-magasin", "/contact", "/faq", "/livraison", "/retours", "/cgv", "/mentions-legales", "/politique-de-confidentialite", "/politique-cookies"];
  return [
    ...statics.map((p) => ({ url: `${env.siteUrl}${p}`, lastModified: now, changeFrequency: "weekly" as const, priority: p === "" ? 1 : p.match(/femme|homme|notre-magasin/) ? 0.9 : 0.5 })),
    ...cats.map((c) => ({ url: `${env.siteUrl}/${c.gender}/${c.slug}`, lastModified: now, changeFrequency: "weekly" as const, priority: 0.8 })),
    // Les produits de démonstration ne sont jamais référencés
    ...products.filter((p) => !p.isDemo).map((p) => ({ url: `${env.siteUrl}/produit/${p.slug}`, lastModified: new Date(p.createdAt), changeFrequency: "weekly" as const, priority: 0.7 })),
  ];
}
