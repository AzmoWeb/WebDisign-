import type { DemoShape, Product, ProductVariant } from "./types";
import { DEFAULT_CATEGORIES } from "./categories";

/**
 * ⚠️ DONNÉES DE DÉMONSTRATION
 * Ces produits sont FICTIFS. Ils servent uniquement à présenter la mise en page
 * tant que la base Supabase n'est pas connectée. Ils sont marqués `isDemo: true`,
 * affichés avec un badge « Démo » et ne peuvent jamais être commandés.
 */

const COLORS = {
  noir: { name: "Noir", hex: "#1a1816" },
  cognac: { name: "Cognac", hex: "#8a5432" },
  blanc: { name: "Blanc", hex: "#f1ede6" },
  taupe: { name: "Taupe", hex: "#8b7f73" },
  marine: { name: "Marine", hex: "#1f2a3a" },
  beige: { name: "Beige", hex: "#d6c4a8" },
  bordeaux: { name: "Bordeaux", hex: "#5c1f22" },
  camel: { name: "Camel", hex: "#b2854f" },
  gris: { name: "Gris", hex: "#9b9893" },
} as const;
type ColorKey = keyof typeof COLORS;

type Seed = {
  name: string;
  gender: "femme" | "homme";
  category: string;
  shape: DemoShape;
  price: number;
  sale?: number;
  colors: ColorKey[];
  isNew?: boolean;
  best?: boolean;
  featured?: boolean;
  description: string;
};

const SEEDS: Seed[] = [
  // FEMME
  { name: "Basket basse cuir lisse", gender: "femme", category: "baskets", shape: "sneaker", price: 8900, colors: ["blanc", "noir"], isNew: true, best: true, description: "Basket basse à lacets, tige en cuir lisse et semelle en gomme. Article de démonstration." },
  { name: "Basket à plateforme", gender: "femme", category: "baskets", shape: "sneaker", price: 9500, sale: 6900, colors: ["beige", "blanc"], featured: true, description: "Silhouette rehaussée par une semelle plateforme. Article de démonstration." },
  { name: "Basket running rétro", gender: "femme", category: "baskets", shape: "sneaker", price: 7900, colors: ["gris", "marine"], isNew: true, description: "Inspiration running, empiècements en suède. Article de démonstration." },
  { name: "Bottine à talon bloc", gender: "femme", category: "bottines", shape: "ankle", price: 12900, colors: ["noir", "cognac"], best: true, featured: true, description: "Bottine zippée en cuir, talon bloc de 6 cm. Article de démonstration." },
  { name: "Bottine chelsea", gender: "femme", category: "bottines", shape: "ankle", price: 11900, sale: 8900, colors: ["noir", "taupe"], description: "Élastiques latéraux et tirant arrière. Article de démonstration." },
  { name: "Bottine lacée crantée", gender: "femme", category: "bottines", shape: "ankle", price: 13500, colors: ["noir"], isNew: true, description: "Semelle crantée et laçage complet. Article de démonstration." },
  { name: "Botte cavalière", gender: "femme", category: "bottes", shape: "boot", price: 18900, colors: ["cognac", "noir"], featured: true, description: "Tige haute en cuir, talon plat. Article de démonstration." },
  { name: "Botte à talon fin", gender: "femme", category: "bottes", shape: "boot", price: 19900, sale: 14900, colors: ["bordeaux", "noir"], description: "Botte élancée au genou, talon de 8 cm. Article de démonstration." },
  { name: "Escarpin pointu verni", gender: "femme", category: "escarpins", shape: "pump", price: 9900, colors: ["noir", "beige"], best: true, description: "Escarpin bout pointu, talon de 7 cm. Article de démonstration." },
  { name: "Escarpin slingback", gender: "femme", category: "escarpins", shape: "pump", price: 10500, colors: ["bordeaux", "noir"], isNew: true, featured: true, description: "Bride arrière ajustable, talon kitten. Article de démonstration." },
  { name: "Mocassin à mors", gender: "femme", category: "mocassins", shape: "loafer", price: 11500, colors: ["noir", "bordeaux"], best: true, description: "Mocassin en cuir orné d'un mors métallique. Article de démonstration." },
  { name: "Mocassin plateforme", gender: "femme", category: "mocassins", shape: "loafer", price: 11900, sale: 8500, colors: ["noir"], description: "Semelle épaisse et cuir brossé. Article de démonstration." },
  { name: "Sandale à brides fines", gender: "femme", category: "sandales", shape: "sandal", price: 7900, colors: ["camel", "noir"], isNew: true, description: "Brides fines et talon bas. Article de démonstration." },
  { name: "Sandale compensée", gender: "femme", category: "sandales", shape: "sandal", price: 8500, sale: 5900, colors: ["beige"], description: "Compensée en corde, bride cheville. Article de démonstration." },
  { name: "Derby femme souple", gender: "femme", category: "chaussures-de-ville", shape: "derby", price: 10900, colors: ["noir", "cognac"], featured: true, description: "Derby en cuir souple, semelle légère. Article de démonstration." },
  { name: "Ballerine cuir", gender: "femme", category: "chaussures-de-ville", shape: "loafer", price: 8900, colors: ["noir", "beige", "bordeaux"], best: true, description: "Ballerine en cuir nappa. Article de démonstration." },
  { name: "Chausson mule douillet", gender: "femme", category: "chaussons", shape: "slipper", price: 3900, colors: ["beige", "gris"], isNew: true, description: "Mule d'intérieur doublée. Article de démonstration." },
  { name: "Chausson ballerine", gender: "femme", category: "chaussons", shape: "slipper", price: 3500, sale: 2500, colors: ["bordeaux"], description: "Chausson fermé, semelle antidérapante. Article de démonstration." },
  // HOMME
  { name: "Basket cuir épurée", gender: "homme", category: "baskets", shape: "sneaker", price: 9900, colors: ["blanc", "noir"], best: true, featured: true, description: "Basket minimaliste en cuir pleine fleur. Article de démonstration." },
  { name: "Basket suède montante", gender: "homme", category: "baskets", shape: "sneaker", price: 10900, sale: 7900, colors: ["taupe", "marine"], description: "Tige montante en croûte de cuir velours. Article de démonstration." },
  { name: "Basket technique", gender: "homme", category: "baskets", shape: "sneaker", price: 11900, colors: ["gris", "noir"], isNew: true, description: "Mesh respirant et semelle amortissante. Article de démonstration." },
  { name: "Derby cuir grainé", gender: "homme", category: "chaussures-de-ville", shape: "derby", price: 13900, colors: ["noir", "cognac"], best: true, description: "Derby en cuir grainé, semelle gomme. Article de démonstration." },
  { name: "Derby semelle crantée", gender: "homme", category: "chaussures-de-ville", shape: "derby", price: 14500, colors: ["noir"], isNew: true, featured: true, description: "Derby moderne sur semelle épaisse. Article de démonstration." },
  { name: "Mocassin penny", gender: "homme", category: "mocassins", shape: "loafer", price: 12900, colors: ["cognac", "noir"], featured: true, description: "Mocassin à patte découpée. Article de démonstration." },
  { name: "Mocassin velours", gender: "homme", category: "mocassins", shape: "loafer", price: 11900, sale: 8900, colors: ["marine", "bordeaux"], description: "Velours de cuir, semelle cousue. Article de démonstration." },
  { name: "Richelieu bout droit", gender: "homme", category: "chaussures-habillees", shape: "derby", price: 16900, colors: ["noir"], best: true, description: "Richelieu classique en box-calf. Article de démonstration." },
  { name: "Richelieu fleuri", gender: "homme", category: "chaussures-habillees", shape: "derby", price: 17900, sale: 12900, colors: ["cognac"], description: "Bout fleuri et perforations. Article de démonstration." },
  { name: "Boots chelsea", gender: "homme", category: "bottines", shape: "ankle", price: 15900, colors: ["noir", "cognac"], isNew: true, featured: true, description: "Chelsea boots en cuir, semelle légère. Article de démonstration." },
  { name: "Bottine lacée cuir gras", gender: "homme", category: "bottines", shape: "ankle", price: 16900, sale: 11900, colors: ["cognac"], description: "Cuir gras résistant, semelle crantée. Article de démonstration." },
  { name: "Sandale cuir deux brides", gender: "homme", category: "sandales", shape: "sandal", price: 6900, colors: ["noir", "camel"], isNew: true, description: "Deux brides réglables, semelle liège. Article de démonstration." },
  { name: "Chausson charentaise", gender: "homme", category: "chaussons", shape: "slipper", price: 4500, colors: ["gris", "marine"], best: true, description: "Chausson d'intérieur en feutre. Article de démonstration." },
  { name: "Chausson mule homme", gender: "homme", category: "chaussons", shape: "slipper", price: 3900, sale: 2900, colors: ["taupe"], description: "Mule doublée, semelle souple. Article de démonstration." },
];

const FEMME_SIZES = ["35", "36", "37", "38", "39", "40", "41", "42"];
const HOMME_SIZES = ["39", "40", "41", "42", "43", "44", "45", "46"];

// Générateur pseudo-aléatoire déterministe (stocks de démonstration reproductibles)
function rng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

const slugify = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

export const DEMO_PRODUCTS: Product[] = SEEDS.map((s, i) => {
  const rand = rng(i + 7);
  const sizes = s.gender === "femme" ? FEMME_SIZES : HOMME_SIZES;
  const variants: ProductVariant[] = [];
  for (const ck of s.colors) {
    for (const size of sizes) {
      const r = rand();
      variants.push({
        id: `demo-${i}-${ck}-${size}`,
        color: COLORS[ck].name,
        colorHex: COLORS[ck].hex,
        size,
        stock: r < 0.22 ? 0 : Math.ceil(r * 6),
        sku: null,
      });
    }
  }
  const cat = DEFAULT_CATEGORIES.find((c) => c.slug === s.category && c.gender === s.gender)!;
  const date = new Date(Date.UTC(2026, 10, 20) - i * 86400000 * (s.isNew ? 1 : 9));
  return {
    id: `demo-${i}`,
    slug: `${slugify(s.name)}-${s.gender}-demo`,
    name: s.name,
    brand: "Marque démo",
    description: s.description,
    gender: s.gender,
    categorySlug: s.category,
    categoryName: cat.name,
    priceCents: s.price,
    salePriceCents: s.sale ?? null,
    isNew: Boolean(s.isNew),
    isBestseller: Boolean(s.best),
    isFeatured: Boolean(s.featured),
    active: true,
    images: s.colors.map((ck) => ({ url: "", alt: `${s.name} coloris ${COLORS[ck].name.toLowerCase()} — illustration de démonstration`, color: COLORS[ck].name })),
    variants,
    createdAt: date.toISOString(),
    isDemo: true,
    demoShape: s.shape,
  };
});
