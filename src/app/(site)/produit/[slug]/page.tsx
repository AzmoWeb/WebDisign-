import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductBySlug, getRelated } from "@/lib/catalog";
import { getSettings } from "@/lib/settings";
import { ShippingList } from "@/components/ui/ShippingList";
import { productJsonLd } from "@/lib/seo";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Price } from "@/components/product/Price";
import { ProductPurchase } from "@/components/product/ProductPurchase";
import { ProductCard } from "@/components/product/ProductCard";
import { ProductRail, RailItem } from "@/components/product/ProductRail";
import { SectionHeading } from "@/components/home/SectionHeading";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = await getProductBySlug((await params).slug);
  if (!p) return { title: "Produit introuvable" };
  return {
    title: `${p.name}${p.brand ? ` — ${p.brand}` : ""} · ${p.categoryName} ${p.gender}`,
    description: `${p.name}${p.brand ? ` ${p.brand}` : ""} : ${p.description.slice(0, 120)} Disponible chez Aux Jolis Pas à Bar-sur-Seine.`,
    alternates: { canonical: `/produit/${p.slug}` },
    robots: p.isDemo ? { index: false } : undefined,
    openGraph: { images: p.images.filter((i) => i.url).slice(0, 1).map((i) => ({ url: i.url, alt: i.alt })) },
  };
}

export default async function ProductPage({ params }: Props) {
  const p = await getProductBySlug((await params).slug);
  if (!p) notFound();
  const [related, settings] = await Promise.all([getRelated(p), getSettings()]);
  const sh = settings.shipping;
  const G = p.gender === "homme" ? "homme" : "femme";

  return (
    <div className="container-site pt-8">
      <Breadcrumbs
        items={[
          { name: "Accueil", href: "/" },
          { name: G === "femme" ? "Femme" : "Homme", href: `/${G}` },
          ...(p.categorySlug ? [{ name: p.categoryName, href: `/${G}/${p.categorySlug}` }] : []),
          { name: p.name, href: `/produit/${p.slug}` },
        ]}
      />
      <div className="mt-8">
        <ProductPurchase product={p} reservation={settings.reservation} storeAddress={`${settings.store.street}, ${settings.store.postalCode} ${settings.store.city}`}>
          {p.brand && <p className="label text-mist">{p.brand}</p>}
          <h1 className="display mt-2 text-[2.2rem] leading-[1.08] md:text-[2.8rem]">{p.name}</h1>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <Price priceCents={p.priceCents} salePriceCents={p.salePriceCents} size="lg" />
            {p.isNew && <span className="border border-ink px-2 py-0.5 text-[0.65rem] tracking-[0.14em] uppercase">Nouveau</span>}
            {p.isDemo && <span className="bg-[#f3e7c9] px-2 py-0.5 text-[0.65rem] tracking-[0.14em] text-[#4d3a12] uppercase">Démo</span>}
          </div>
          <p className="mt-1 text-xs text-mist">Prix TTC</p>
        </ProductPurchase>
      </div>

      <div className="mt-16 grid gap-x-14 lg:grid-cols-12">
        <div className="divide-y divide-line border-y border-line lg:col-span-5 lg:col-start-8">
          <details open className="group py-5">
            <summary className="flex cursor-pointer list-none items-center justify-between text-[0.72rem] font-medium tracking-[0.18em] uppercase [&::-webkit-details-marker]:hidden">
              Description <span className="text-lg transition-transform group-open:rotate-45" aria-hidden="true">+</span>
            </summary>
            <p className="mt-4 leading-relaxed whitespace-pre-line text-graphite">{p.description}</p>
          </details>
          <details className="group py-5">
            <summary className="flex cursor-pointer list-none items-center justify-between text-[0.72rem] font-medium tracking-[0.18em] uppercase [&::-webkit-details-marker]:hidden">
              Livraison & retrait <span className="text-lg transition-transform group-open:rotate-45" aria-hidden="true">+</span>
            </summary>
            <ul className="mt-4 space-y-2 text-sm leading-relaxed text-graphite">
              <ShippingList shipping={sh} city={settings.store.city} />
              <li>
                <Link href="/livraison" className="link-static">Politique de livraison</Link> · <Link href="/retours" className="link-static">Retours</Link>
              </li>
            </ul>
          </details>
          <details className="group py-5">
            <summary className="flex cursor-pointer list-none items-center justify-between text-[0.72rem] font-medium tracking-[0.18em] uppercase [&::-webkit-details-marker]:hidden">
              Essayer en magasin <span className="text-lg transition-transform group-open:rotate-45" aria-hidden="true">+</span>
            </summary>
            <p className="mt-4 text-sm leading-relaxed text-graphite">
              Vous hésitez sur la pointure ? Contactez le magasin au{" "}
              <a href={`tel:${settings.store.phoneE164}`} className="link-static">{settings.store.phone}</a> ou venez nous voir au {settings.store.street}, {settings.store.city}.
            </p>
          </details>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-24" aria-label="Produits similaires">
          <SectionHeading kicker="Vous aimerez aussi" title="Produits similaires" href={`/${G}${p.categorySlug ? `/${p.categorySlug}` : ""}`} />
          <ProductRail label="Produits similaires">
            {related.map((r) => (
              <RailItem key={r.id}><ProductCard product={r} /></RailItem>
            ))}
          </ProductRail>
        </section>
      )}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: productJsonLd(p) }} />
    </div>
  );
}
