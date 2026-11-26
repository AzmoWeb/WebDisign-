import Link from "next/link";
import type { SiteSettings } from "@/lib/types";
import { directionsUrl } from "@/lib/store";
import { ManageCookiesButton } from "@/components/consent/ManageCookiesButton";
import { Logo } from "./Logo";
import { HoursTable } from "@/components/ui/HoursTable";

export function Footer({ settings }: { settings: SiteSettings }) {
  const { store, shipping } = settings;
  const reassurance = [
    { title: "Paiement sécurisé", text: "Transactions chiffrées et traitées par Stripe" },
    shipping.homeDeliveryEnabled && shipping.homeDeliveryCents != null ? { title: "Livraison à domicile", text: shipping.deliveryDelayText || "Conditions détaillées dans notre politique de livraison" } : null,
    shipping.pickupEnabled ? { title: "Retrait en magasin", text: shipping.pickupText || `À ${store.city}` } : null,
    { title: "Votre magasin", text: `${store.street}, ${store.city}` },
  ].filter(Boolean) as { title: string; text: string }[];

  return (
    <footer className="mt-24 bg-ink text-ivory">
      <div className="border-b border-ivory/10">
        <ul className="container-site grid grid-cols-2 gap-y-8 py-10 md:grid-cols-4">
          {reassurance.map((r) => (
            <li key={r.title} className="pr-4">
              <p className="text-[0.72rem] font-medium tracking-[0.18em] uppercase">{r.title}</p>
              <p className="mt-1.5 text-sm text-ivory/60">{r.text}</p>
            </li>
          ))}
        </ul>
      </div>

      <div className="container-site grid gap-12 py-16 md:grid-cols-12">
        <div className="md:col-span-4">
          <Logo light />
          <p className="mt-6 max-w-xs text-sm leading-relaxed text-ivory/60">
            Magasin de chaussures femme et homme à {store.city}, dans l&apos;Aube.
          </p>
          <address className="mt-6 text-sm leading-relaxed text-ivory/80 not-italic">
            {store.street}
            <br />
            {store.postalCode} {store.city}
            <br />
            <a href={`tel:${store.phoneE164}`} className="link-underline">
              {store.phone}
            </a>
          </address>
          <a href={directionsUrl(store)} target="_blank" rel="noopener noreferrer" className="mt-6 inline-block text-xs tracking-[0.16em] uppercase underline underline-offset-4 hover:text-sand">
            Obtenir l&apos;itinéraire
          </a>
        </div>

        <FooterCol title="Boutique" links={[["Femme", "/femme"], ["Homme", "/homme"], ["Nouveautés", "/nouveautes"], ["Promotions", "/promotions"], ["Coups de cœur", "/coups-de-coeur"]]} />
        <FooterCol title="Aide" links={[["Contact", "/contact"], ["FAQ", "/faq"], ["Livraison", "/livraison"], ["Retours", "/retours"], ["Mon compte", "/compte"]]} />
        <div className="md:col-span-2">
          <p className="label text-ivory/50">Horaires</p>
          <div className="mt-5 text-sm text-ivory/80">
            {store.hours ? <HoursTable hours={store.hours} compact /> : <p className="text-ivory/60">Horaires communiqués prochainement. Contactez-nous au {store.phone}.</p>}
            {store.hoursNote && <p className="mt-3 text-xs text-ivory/50">{store.hoursNote}</p>}
          </div>
        </div>
        <FooterCol title="Informations" links={[["Notre magasin", "/notre-magasin"], ["Mentions légales", "/mentions-legales"], ["Confidentialité", "/politique-de-confidentialite"], ["Cookies", "/politique-cookies"], ["CGV", "/cgv"]]}>
          <li>
            <ManageCookiesButton className="link-underline text-left text-sm text-ivory/80 hover:text-ivory" />
          </li>
        </FooterCol>
      </div>

      <div className="border-t border-ivory/10">
        <div className="container-site flex flex-col gap-2 py-6 text-xs text-ivory/45 sm:flex-row sm:justify-between">
          <p>© {new Date().getFullYear()} Aux Jolis Pas — Bar-sur-Seine (10)</p>
          <p>Paiements sécurisés par Stripe</p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links, children }: { title: string; links: [string, string][]; children?: React.ReactNode }) {
  return (
    <div className="md:col-span-2">
      <p className="label text-ivory/50">{title}</p>
      <ul className="mt-5 space-y-3 text-sm text-ivory/80">
        {links.map(([l, h]) => (
          <li key={h}>
            <Link href={h} className="link-underline hover:text-ivory">
              {l}
            </Link>
          </li>
        ))}
        {children}
      </ul>
    </div>
  );
}
