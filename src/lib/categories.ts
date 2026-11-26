import type { Category } from "./types";

/** Taxonomie par défaut (modifiable en base via l'administration). */
export const DEFAULT_CATEGORIES: Category[] = [
  { slug: "baskets", name: "Baskets", gender: "femme", position: 1 },
  { slug: "bottines", name: "Bottines", gender: "femme", position: 2 },
  { slug: "bottes", name: "Bottes", gender: "femme", position: 3 },
  { slug: "escarpins", name: "Escarpins", gender: "femme", position: 4 },
  { slug: "mocassins", name: "Mocassins", gender: "femme", position: 5 },
  { slug: "sandales", name: "Sandales", gender: "femme", position: 6 },
  { slug: "chaussures-de-ville", name: "Chaussures de ville", gender: "femme", position: 7 },
  { slug: "chaussons", name: "Chaussons", gender: "femme", position: 8 },
  { slug: "baskets", name: "Baskets", gender: "homme", position: 1 },
  { slug: "chaussures-de-ville", name: "Chaussures de ville", gender: "homme", position: 2 },
  { slug: "mocassins", name: "Mocassins", gender: "homme", position: 3 },
  { slug: "chaussures-habillees", name: "Chaussures habillées", gender: "homme", position: 4 },
  { slug: "bottines", name: "Bottines", gender: "homme", position: 5 },
  { slug: "sandales", name: "Sandales", gender: "homme", position: 6 },
  { slug: "chaussons", name: "Chaussons", gender: "homme", position: 7 },
];

export const COLLECTIONS = [
  { slug: "nouveautes", name: "Nouveautés", href: "/nouveautes" },
  { slug: "promotions", name: "Promotions", href: "/promotions" },
  { slug: "coups-de-coeur", name: "Coups de cœur", href: "/coups-de-coeur" },
] as const;

export const genderLabel = (g: "femme" | "homme") => (g === "femme" ? "Femme" : "Homme");
