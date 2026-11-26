export type Gender = "femme" | "homme" | "mixte";

export type Category = {
  slug: string;
  name: string;
  gender: "femme" | "homme";
  position: number;
  description?: string | null;
};

export type ProductImage = { url: string; alt: string; color?: string | null };

export type ProductVariant = {
  id: string;
  color: string;
  colorHex: string;
  size: string;
  stock: number;
  sku?: string | null;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  brand: string;
  description: string;
  gender: Gender;
  categorySlug: string;
  categoryName: string;
  priceCents: number;
  salePriceCents: number | null;
  isNew: boolean;
  isBestseller: boolean;
  isFeatured: boolean;
  active: boolean;
  images: ProductImage[];
  variants: ProductVariant[];
  createdAt: string;
  /** Produit fictif de démonstration — jamais vendable. */
  isDemo: boolean;
  /** Forme utilisée pour l'illustration de démonstration. */
  demoShape?: DemoShape;
};

export type DemoShape = "sneaker" | "boot" | "ankle" | "pump" | "loafer" | "sandal" | "derby" | "slipper";

export type SortKey = "pertinence" | "nouveautes" | "prix-asc" | "prix-desc";

export type CatalogFilters = {
  gender?: "femme" | "homme";
  category?: string;
  collection?: "nouveautes" | "promotions" | "coups-de-coeur" | "meilleures-ventes";
  q?: string;
  sizes?: string[];
  brands?: string[];
  colors?: string[];
  categories?: string[];
  minPrice?: number;
  maxPrice?: number;
  sort?: SortKey;
};

export type OpeningHours = { day: string; open: string | null; close: string | null; open2?: string | null; close2?: string | null; closed: boolean }[];

export type StoreInfo = {
  name: string;
  street: string;
  postalCode: string;
  city: string;
  country: string;
  phone: string;
  phoneE164: string;
  email: string | null;
  mapsUrl: string;
  hours: OpeningHours | null;
  hoursNote: string | null;
  description: string | null;
  /** Marques distribuées en magasin (liste fournie par la commerçante). */
  brands: string[];
};

export type AnnouncementSettings = { enabled: boolean; messages: { text: string; href?: string | null }[] };

export type HeroSettings = {
  title: string;
  subtitle: string;
  primaryLabel: string;
  primaryHref: string;
  secondaryLabel: string;
  secondaryHref: string;
  imageUrl: string | null;
  imageAlt: string;
};

export type CampaignPanel = { label: string; href: string; imageUrl: string | null; imageAlt: string; scene: "femme" | "baskets" | "homme" };

export type CampaignSettings = {
  title: string;
  subtitle: string;
  ctaLabel: string;
  ctaHref: string;
  panels: CampaignPanel[];
};

export type ShippingSettings = {
  homeDeliveryEnabled: boolean;
  homeDeliveryCents: number | null;
  freeShippingThresholdCents: number | null;
  deliveryDelayText: string | null;
  pickupEnabled: boolean;
  pickupText: string | null;
};

export type ReviewsSettings = {
  manualRating: number | null;
  manualCount: number | null;
  manualCheckedAt: string | null;
};

export type SiteSettings = {
  announcement: AnnouncementSettings;
  hero: HeroSettings;
  campaign: CampaignSettings;
  store: StoreInfo;
  shipping: ShippingSettings;
  reviews: ReviewsSettings;
  storeIntro: { title: string; text: string; imageUrl: string | null };
};

export type CartLine = { productId: string; variantId: string; quantity: number };

export type PricedLine = {
  productId: string;
  variantId: string;
  slug: string;
  name: string;
  brand: string;
  size: string;
  color: string;
  imageUrl: string | null;
  demoShape?: DemoShape;
  colorHex: string;
  unitPriceCents: number;
  originalPriceCents: number;
  quantity: number;
  stock: number;
  available: boolean;
  isDemo: boolean;
  otherSizes: { variantId: string; size: string; stock: number }[];
};

export type OrderStatus =
  | "pending"
  | "paid"
  | "preparing"
  | "shipped"
  | "ready_for_pickup"
  | "completed"
  | "cancelled"
  | "payment_failed"
  | "refunded";
