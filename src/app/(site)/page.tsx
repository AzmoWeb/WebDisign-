import Image from "next/image";
import Link from "next/link";
import { getProducts } from "@/lib/catalog";
import { getSettings } from "@/lib/settings";
import { getReviews } from "@/lib/reviews";
import { DiagonalCampaign } from "@/components/home/DiagonalCampaign";
import { CampaignScene } from "@/components/home/CampaignScene";
import { SectionHeading } from "@/components/home/SectionHeading";
import { GoogleReviews } from "@/components/home/GoogleReviews";
import { PracticalInfo } from "@/components/home/PracticalInfo";
import { ProductCard } from "@/components/product/ProductCard";
import { ProductRail, RailItem } from "@/components/product/ProductRail";
import { IconArrow } from "@/components/ui/Icons";
import type { Product } from "@/lib/types";

export const metadata = {
  title: { absolute: "Aux Jolis Pas — Magasin de chaussures femme et homme à Bar-sur-Seine (Aube)" },
  alternates: { canonical: "/" },
};

function Rail({ products, label }: { products: Product[]; label: string }) {
  return (
    <ProductRail label={label}>
      {products.map((p) => (
        <RailItem key={p.id}>
          <ProductCard product={p} />
        </RailItem>
      ))}
    </ProductRail>
  );
}

export default async function HomePage() {
  const settings = await getSettings();
  const [news, best, featured, promos, reviews] = await Promise.all([
    getProducts({ collection: "nouveautes", sort: "nouveautes" }),
    getProducts({ collection: "meilleures-ventes" }),
    getProducts({ collection: "coups-de-coeur" }),
    getProducts({ collection: "promotions" }),
    getReviews(settings),
  ]);
  const { hero, campaign, storeIntro, store } = settings;

  return (
    <>
      {/* HERO */}
      <section className="relative" aria-labelledby="hero-title">
        <div className="grid lg:min-h-[min(84vh,52rem)] lg:grid-cols-12">
          <div className="order-2 flex flex-col justify-end px-4 pt-10 pb-14 md:px-8 lg:order-1 lg:col-span-5 lg:justify-center lg:py-20 lg:pr-12 lg:pl-12 xl:pl-[max(3rem,calc((100vw-90rem)/2+3rem))]">
            <p className="label text-mist animate-fade-up">Aux Jolis Pas · Bar-sur-Seine</p>
            <h1 id="hero-title" className="display mt-5 text-[2.9rem] uppercase sm:text-[3.4rem] xl:text-[4.1rem] animate-fade-up [animation-delay:80ms]">
              {hero.title}
            </h1>
            <p className="mt-6 max-w-md text-[1.05rem] leading-relaxed text-graphite animate-fade-up [animation-delay:160ms]">{hero.subtitle}</p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row animate-fade-up [animation-delay:240ms]">
              <Link href={hero.primaryHref} className="btn btn-primary">
                {hero.primaryLabel}
              </Link>
              <Link href={hero.secondaryHref} className="btn btn-outline">
                {hero.secondaryLabel}
              </Link>
            </div>
          </div>
          <div className="relative order-1 aspect-[4/5] sm:aspect-[16/11] lg:order-2 lg:col-span-7 lg:aspect-auto lg:min-h-[min(84vh,52rem)]">
            {hero.imageUrl ? (
              <Image src={hero.imageUrl} alt={hero.imageAlt} fill priority sizes="(min-width:1024px) 58vw, 100vw" className="object-cover" />
            ) : (
              <div className="absolute inset-0"><DiagonalCampaign panels={campaign.panels} className="h-full w-full" priority /></div>
            )}
          </div>
        </div>
      </section>

      {/* 1. GRANDE BANNIÈRE */}
      <section className="container-site mt-20 md:mt-28" aria-label="Promotions en cours">
        <Link href="/promotions" className="group relative block overflow-hidden bg-ink text-ivory">
          <div className="grid md:grid-cols-2">
            <div className="relative order-2 flex flex-col justify-center px-7 py-12 md:order-1 md:px-14 md:py-20">
              <p className="label text-ivory/60">Sélection</p>
              <p className="display mt-4 text-[2.4rem] leading-[1.02] md:text-[3.5rem]">Promotions</p>
              <p className="mt-5 max-w-sm text-ivory/70">Une sélection de modèles femme et homme à prix réduits, dans la limite des stocks disponibles.</p>
              <span className="mt-8 inline-flex items-center gap-3 text-xs tracking-[0.18em] uppercase">
                Voir les promotions <IconArrow className="h-4 w-4 transition-transform duration-500 group-hover:translate-x-1.5" />
              </span>
            </div>
            <div className="relative order-1 aspect-[16/10] overflow-hidden md:order-2 md:aspect-auto md:min-h-[26rem]">
              <CampaignScene scene="baskets" className="absolute inset-0 h-full w-full transition-transform duration-[1.6s] group-hover:scale-[1.04]" />
            </div>
          </div>
        </Link>
      </section>

      {/* 2. ACCÈS RAPIDE FEMME / HOMME */}
      <section className="container-site mt-20 md:mt-28" aria-labelledby="univers-title">
        <h2 id="univers-title" className="sr-only">Nos collections</h2>
        <div className="grid gap-4 md:grid-cols-2 md:gap-6">
          {(["femme", "homme"] as const).map((g) => (
            <Link key={g} href={`/${g}`} className="group relative block aspect-[4/5] overflow-hidden bg-sand sm:aspect-[5/4] md:aspect-[4/5] lg:aspect-[5/6]">
              <CampaignScene scene={g} className="absolute inset-0 h-full w-full transition-transform duration-[1.6s] ease-[var(--ease-out-soft)] group-hover:scale-[1.04]" />
              <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-ink/60 to-transparent" />
              <div className="absolute bottom-7 left-7 text-ivory md:bottom-10 md:left-10">
                <p className="label opacity-80">Chaussures</p>
                <p className="display mt-1 text-5xl md:text-6xl">{g === "femme" ? "Femme" : "Homme"}</p>
                <span className="mt-5 inline-flex items-center gap-3 border-b border-ivory/60 pb-1 text-xs tracking-[0.18em] uppercase">
                  Découvrir <IconArrow className="h-4 w-4 transition-transform duration-500 group-hover:translate-x-1.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. NOUVEAUTÉS */}
      {news.products.length > 0 && (
        <section className="container-site mt-24 md:mt-32" aria-labelledby="h-nouveautes">
          <div id="h-nouveautes"><SectionHeading kicker="Fraîchement arrivées" title="Nouveautés" href="/nouveautes" /></div>
          <Rail products={news.products.slice(0, 10)} label="Nouveautés" />
        </section>
      )}

      {/* 4. MEILLEURES VENTES */}
      {best.products.length > 0 && (
        <section className="container-site mt-24 md:mt-32" aria-label="Meilleures ventes">
          <SectionHeading kicker="Les plus demandées" title="Meilleures ventes" href="/femme?tri=pertinence" linkLabel="Voir la boutique" />
          <Rail products={best.products.slice(0, 10)} label="Meilleures ventes" />
        </section>
      )}

      {/* 5. COUPS DE CŒUR */}
      {featured.products.length > 0 && (
        <section className="container-site mt-24 md:mt-32" aria-label="Coups de cœur">
          <SectionHeading kicker="Notre sélection" title="Coups de cœur" href="/coups-de-coeur" />
          <div className="grid gap-x-4 gap-y-10 md:grid-cols-12 md:gap-x-6">
            <Link href="/coups-de-coeur" className="group relative col-span-full block aspect-[4/5] overflow-hidden bg-sand md:col-span-6 md:row-span-2 md:aspect-auto">
              <CampaignScene scene="femme" className="absolute inset-0 h-full w-full transition-transform duration-[1.6s] group-hover:scale-[1.04]" />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/60 to-transparent p-8 pt-24 text-ivory">
                <p className="display text-4xl">Le style commence par les détails</p>
              </div>
            </Link>
            <div className="col-span-full grid grid-cols-2 gap-x-4 gap-y-10 md:col-span-6 md:gap-x-6">
              {featured.products.slice(0, 4).map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 6. PROMOTIONS */}
      {promos.products.length > 0 && (
        <section className="container-site mt-24 md:mt-32" aria-label="Promotions">
          <SectionHeading kicker="Prix réduits" title="Promotions" href="/promotions" tone="sale" />
          <Rail products={promos.products.slice(0, 10)} label="Promotions" />
        </section>
      )}

      {/* 7. CAMPAGNE DIAGONALE */}
      <section className="mt-24 md:mt-32" aria-labelledby="campagne-title">
        <div className="container-site mb-10 grid gap-6 md:grid-cols-2 md:items-end">
          <div>
            <p className="label text-mist">{campaign.subtitle}</p>
            <h2 id="campagne-title" className="display mt-3 text-[2.4rem] uppercase md:text-[3.6rem]">{campaign.title}</h2>
          </div>
          <div className="md:text-right">
            <Link href={campaign.ctaHref} className="btn btn-outline">{campaign.ctaLabel}</Link>
          </div>
        </div>
        <DiagonalCampaign panels={campaign.panels} className="aspect-[4/5] sm:aspect-[16/10] lg:aspect-[21/9]" />
      </section>

      {/* 8. LE MAGASIN */}
      <section className="container-site mt-24 md:mt-32" aria-labelledby="magasin-title">
        <div className="grid items-center gap-10 md:grid-cols-12 md:gap-16">
          <div className="relative aspect-[4/5] overflow-hidden bg-sand md:col-span-6 lg:col-span-5">
            {storeIntro.imageUrl ? (
              <Image src={storeIntro.imageUrl} alt={`Le magasin ${store.name} à ${store.city}`} fill sizes="(min-width:768px) 45vw, 100vw" className="object-cover" />
            ) : (
              <CampaignScene scene="homme" className="absolute inset-0 h-full w-full" />
            )}
          </div>
          <div className="md:col-span-6 lg:col-span-6 lg:col-start-7">
            <p className="label text-mist">Notre magasin</p>
            <h2 id="magasin-title" className="display mt-3 text-[2.25rem] md:text-[3rem]">{storeIntro.title}</h2>
            <p className="mt-6 max-w-lg text-[1.05rem] leading-relaxed text-graphite">{storeIntro.text}</p>
            <p className="mt-8 text-sm">
              {store.street}, {store.postalCode} {store.city} ·{" "}
              <a href={`tel:${store.phoneE164}`} className="link-underline">{store.phone}</a>
            </p>
            <Link href="/notre-magasin" className="btn btn-primary mt-10">Découvrir notre magasin</Link>
          </div>
        </div>
      </section>

      {/* 9. AVIS GOOGLE */}
      <GoogleReviews data={reviews} />

      {/* 10. INFOS PRATIQUES */}
      <PracticalInfo store={store} />
    </>
  );
}
