import { getSettings } from "@/lib/settings";
import { directionsUrl, mapEmbedUrl } from "@/lib/store";
import { env } from "@/lib/env";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { ContactForm } from "@/components/ui/ContactForm";
import { HoursTable } from "@/components/ui/HoursTable";
import { MapEmbed } from "@/components/ui/MapEmbed";

export const metadata = {
  title: "Contact — magasin de chaussures à Bar-sur-Seine",
  description: "Contactez Aux Jolis Pas : 110 Grande Rue de la Résistance, 10110 Bar-sur-Seine. Téléphone 03 25 29 86 32. Formulaire de contact, plan d'accès et horaires.",
  alternates: { canonical: "/contact" },
};

export default async function ContactPage() {
  const { store } = await getSettings();
  return (
    <div className="container-site pt-8">
      <Breadcrumbs items={[{ name: "Accueil", href: "/" }, { name: "Contact", href: "/contact" }]} />
      <h1 className="display mt-10 text-[2.8rem] md:text-[3.8rem]">Contact</h1>
      <div className="mt-12 grid gap-16 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <h2 className="label mb-8">Écrivez-nous</h2>
          <ContactForm turnstileSiteKey={env.turnstileSiteKey} />
        </div>
        <aside className="space-y-10 lg:col-span-4 lg:col-start-9">
          <div>
            <h2 className="label text-mist">Magasin</h2>
            <address className="mt-3 leading-relaxed not-italic">{store.name}<br />{store.street}<br />{store.postalCode} {store.city}</address>
            <a href={directionsUrl(store)} target="_blank" rel="noopener noreferrer" className="mt-3 inline-block text-sm underline underline-offset-4">Itinéraire</a>
          </div>
          <div>
            <h2 className="label text-mist">Téléphone</h2>
            <a href={`tel:${store.phoneE164}`} className="display mt-3 block text-3xl">{store.phone}</a>
          </div>
          {store.email && (
            <div>
              <h2 className="label text-mist">E-mail</h2>
              <a href={`mailto:${store.email}`} className="mt-3 block link-underline">{store.email}</a>
            </div>
          )}
          <div>
            <h2 className="label text-mist">Horaires</h2>
            <div className="mt-3 text-sm">{store.hours ? <HoursTable hours={store.hours} /> : <p className="text-graphite">Horaires communiqués prochainement.</p>}</div>
            {store.hoursNote && <p className="mt-2 text-sm text-graphite">{store.hoursNote}</p>}
          </div>
        </aside>
      </div>
      <MapEmbed src={mapEmbedUrl(store)} title={`Plan d'accès — ${store.name}`} className="mt-20 h-[26rem]" />
    </div>
  );
}
