import type { Product, SiteSettings } from "./types";
import { env } from "./env";
import { effectivePrice } from "./money";

/** JSON sûr pour une balise <script> (empêche toute injection de </script>). */
export const safeJson = (o: unknown) => JSON.stringify(o).replace(/</g, "\\u003c").replace(/>/g, "\\u003e").replace(/&/g, "\\u0026");

const DAY_MAP: Record<string, string> = {
  Lundi: "Monday", Mardi: "Tuesday", Mercredi: "Wednesday", Jeudi: "Thursday", Vendredi: "Friday", Samedi: "Saturday", Dimanche: "Sunday",
};

/** Données structurées ShoeStore — uniquement des informations vérifiées (aucune note, aucun horaire inventé). */
export function storeJsonLd(s: SiteSettings) {
  const st = s.store;
  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "ShoeStore",
    "@id": `${env.siteUrl}/#magasin`,
    name: st.name,
    url: env.siteUrl,
    telephone: st.phoneE164,
    image: `${env.siteUrl}/opengraph-image`,
    address: {
      "@type": "PostalAddress",
      streetAddress: st.street,
      postalCode: st.postalCode,
      addressLocality: st.city,
      addressRegion: "Grand Est",
      addressCountry: st.country,
    },
    areaServed: ["Bar-sur-Seine", "Aube"],
    hasMap: st.mapsUrl,
  };
  if (st.email) data.email = st.email;
  if (st.hours?.length) {
    data.openingHoursSpecification = st.hours
      .filter((h) => !h.closed && h.open && h.close)
      .flatMap((h) => {
        const spans = [{ opens: h.open, closes: h.close }];
        if (h.open2 && h.close2) spans.push({ opens: h.open2, closes: h.close2 });
        return spans.map((sp) => ({ "@type": "OpeningHoursSpecification", dayOfWeek: `https://schema.org/${DAY_MAP[h.day] ?? h.day}`, ...sp }));
      });
  }
  return safeJson(data);
}

export function productJsonLd(p: Product) {
  const inStock = p.variants.some((v) => v.stock > 0);
  return safeJson({
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    description: p.description,
    ...(p.brand ? { brand: { "@type": "Brand", name: p.brand } } : {}),
    image: p.images.filter((i) => i.url).map((i) => i.url),
    url: `${env.siteUrl}/produit/${p.slug}`,
    offers: {
      "@type": "Offer",
      priceCurrency: "EUR",
      price: (effectivePrice(p) / 100).toFixed(2),
      availability: inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      seller: { "@id": `${env.siteUrl}/#magasin` },
    },
  });
}

export function breadcrumbJsonLd(items: { name: string; href: string }[]) {
  return safeJson({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.name, item: `${env.siteUrl}${it.href}` })),
  });
}
