import Image from "next/image";
import Link from "next/link";
import { getSettings } from "@/lib/settings";
import { directionsUrl } from "@/lib/store";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { PracticalInfo } from "@/components/home/PracticalInfo";
import { CampaignScene } from "@/components/home/CampaignScene";
import { DiagonalCampaign } from "@/components/home/DiagonalCampaign";
import { getCategories } from "@/lib/catalog";

export const metadata = {
  title: "Notre magasin de chaussures à Bar-sur-Seine",
  description: "Aux Jolis Pas, magasin de chaussures femme et homme au 110 Grande Rue de la Résistance à Bar-sur-Seine (Aube). Adresse, téléphone, itinéraire et horaires.",
  alternates: { canonical: "/notre-magasin" },
};

export default async function StorePage() {
  const [settings, cats] = await Promise.all([getSettings(), getCategories()]);
  const { store, storeIntro, campaign } = settings;
  return (
    <>
      <div className="container-site pt-8">
        <Breadcrumbs items={[{ name: "Accueil", href: "/" }, { name: "Notre magasin", href: "/notre-magasin" }]} />
        <div className="mt-10 grid gap-12 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-6">
            <p className="label text-mist">Bar-sur-Seine · Aube</p>
            <h1 className="display mt-4 text-[2.8rem] md:text-[4rem]">Aux Jolis Pas, votre magasin de chaussures</h1>
          </div>
          <div className="lg:col-span-5 lg:col-start-8">
            <p className="text-[1.05rem] leading-relaxed text-graphite">{store.description || storeIntro.text}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href={directionsUrl(store)} target="_blank" rel="noopener noreferrer" className="btn btn-primary">Obtenir l&apos;itinéraire</a>
              <a href={`tel:${store.phoneE164}`} className="btn btn-outline">{store.phone}</a>
            </div>
          </div>
        </div>
      </div>

      <div className="relative mt-14 aspect-[4/5] sm:aspect-[16/9] lg:aspect-[21/9]">
        {storeIntro.imageUrl ? (
          <Image src={storeIntro.imageUrl} alt={`Le magasin ${store.name} à ${store.city}`} fill priority sizes="100vw" className="object-cover" />
        ) : (
          <DiagonalCampaign panels={campaign.panels} className="h-full w-full" />
        )}
      </div>

      <section className="container-site mt-24 grid gap-14 md:grid-cols-2" aria-label="Nos univers">
        {(["femme", "homme"] as const).map((g) => (
          <div key={g}>
            <Link href={`/${g}`} aria-label={`Voir les chaussures ${g}`} className="group relative block aspect-[4/3] overflow-hidden bg-sand">
              <CampaignScene scene={g} className="absolute inset-0 h-full w-full transition-transform duration-[1.6s] group-hover:scale-[1.04]" />
            </Link>
            <h2 className="display mt-8 text-[2rem]">Chaussures {g}</h2>
            <p className="mt-4 text-graphite">
              {g === "femme" ? "Pour les femmes, le magasin propose" : "Pour les hommes, le magasin propose"} des modèles dans les catégories suivantes :
            </p>
            <ul className="mt-5 flex flex-wrap gap-2">
              {cats.filter((c) => c.gender === g).map((c) => (
                <li key={c.slug}><Link href={`/${g}/${c.slug}`} className="inline-block border border-line px-3 py-1.5 text-sm hover:border-ink">{c.name}</Link></li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      <section className="container-site mt-24 max-w-3xl text-center" aria-label="Venir en magasin">
        <p className="label text-mist">Au plus près de chez vous</p>
        <h2 className="display mt-4 text-[2.2rem] md:text-[2.8rem]">Essayez nos modèles directement en boutique</h2>
        <p className="mt-6 leading-relaxed text-graphite">
          Vous habitez Bar-sur-Seine ou ses environs ? Passez au {store.street} pour découvrir les collections, essayer plusieurs pointures et trouver la paire qui vous convient.
        </p>
      </section>

      <div className="mt-24"><PracticalInfo store={store} /></div>
    </>
  );
}
