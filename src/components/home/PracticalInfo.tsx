import type { StoreInfo } from "@/lib/types";
import { directionsUrl, mapEmbedUrl } from "@/lib/store";
import { HoursTable } from "@/components/ui/HoursTable";
import { MapEmbed } from "@/components/ui/MapEmbed";

export function PracticalInfo({ store, headingLevel = "h2" }: { store: StoreInfo; headingLevel?: "h2" | "h3" }) {
  const H = headingLevel;
  return (
    <section aria-labelledby="infos-title" className="bg-sand/60">
      <div className="container-site grid gap-12 py-20 md:py-24 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <p className="label text-mist">Informations pratiques</p>
          <H id="infos-title" className="display mt-3 text-[2.25rem] md:text-[2.75rem]">Venir au magasin</H>
          <dl className="mt-10 space-y-8 text-[0.95rem]">
            <div>
              <dt className="label text-mist">Adresse</dt>
              <dd className="mt-2 leading-relaxed">
                {store.street}
                <br />
                {store.postalCode} {store.city}
              </dd>
            </div>
            <div>
              <dt className="label text-mist">Téléphone</dt>
              <dd className="mt-2">
                <a href={`tel:${store.phoneE164}`} className="link-underline">{store.phone}</a>
              </dd>
            </div>
            <div>
              <dt className="label text-mist">Horaires</dt>
              <dd className="mt-2 max-w-sm">
                {store.hours ? <HoursTable hours={store.hours} /> : <p className="text-graphite">Les horaires seront prochainement indiqués ici. Pour toute question, appelez-nous.</p>}
                {store.hoursNote && <p className="mt-3 text-sm text-graphite">{store.hoursNote}</p>}
              </dd>
            </div>
          </dl>
          <div className="mt-10 flex flex-wrap gap-3">
            <a href={directionsUrl(store)} target="_blank" rel="noopener noreferrer" className="btn btn-primary">Obtenir l&apos;itinéraire</a>
            <a href={`tel:${store.phoneE164}`} className="btn btn-outline">Appeler le magasin</a>
          </div>
        </div>
        <MapEmbed src={mapEmbedUrl(store)} title={`Plan d'accès — ${store.name}, ${store.city}`} className="min-h-[22rem] lg:col-span-7" />
      </div>
    </section>
  );
}
