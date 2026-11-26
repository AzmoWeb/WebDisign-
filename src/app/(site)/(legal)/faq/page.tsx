import Link from "next/link";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { getSettings } from "@/lib/settings";
import { safeJson } from "@/lib/seo";

export const metadata = { title: "Questions fréquentes", alternates: { canonical: "/faq" } };

export default async function Page() {
  const { store } = await getSettings();
  const QA: { q: string; a: React.ReactNode; text: string }[] = [
    { q: "Où se trouve le magasin Aux Jolis Pas ?", text: `Au ${store.street}, ${store.postalCode} ${store.city}.`, a: <>Au {store.street}, {store.postalCode} {store.city}. <Link href="/notre-magasin" className="link-static">Voir le plan d&apos;accès</Link>.</> },
    { q: "Comment joindre le magasin ?", text: `Par téléphone au ${store.phone} ou via le formulaire de contact.`, a: <>Par téléphone au <a href={`tel:${store.phoneE164}`} className="link-static">{store.phone}</a> ou via le <Link href="/contact" className="link-static">formulaire de contact</Link>.</> },
    { q: "Le paiement en ligne est-il sécurisé ?", text: "Oui, le paiement est réalisé sur la page sécurisée de Stripe ; vos données bancaires ne transitent pas par notre site.", a: "Oui. Le paiement est réalisé sur la page sécurisée de Stripe : vos données bancaires ne transitent pas par notre site et ne sont jamais conservées par le magasin." },
    { q: "Puis-je retirer ma commande en magasin ?", text: `Oui, le retrait en magasin est gratuit : payez en ligne puis venez chercher votre commande quand vous le souhaitez, aux heures d'ouverture, au ${store.street} à ${store.city}.`, a: <>Oui, c&apos;est gratuit : choisissez « Retrait en magasin » au moment de la commande, payez en ligne, puis venez chercher vos chaussures quand vous le souhaitez, aux heures d&apos;ouverture, au {store.street} à {store.city}.</> },
    { q: "Comment suivre ma commande ?", text: "Depuis votre espace client, rubrique Mes commandes.", a: <>Depuis votre <Link href="/compte/commandes" className="link-static">espace client</Link>, rubrique « Mes commandes ».</> },
    { q: "Comment choisir ma pointure ?", text: "Les pointures sont indiquées en taille française (EU). En cas de doute, contactez le magasin.", a: "Les pointures sont indiquées en taille française (EU). En cas de doute entre deux tailles, contactez le magasin : nous vous conseillerons." },
    { q: "Quels sont les frais et délais de livraison ?", text: "Ils sont détaillés dans la politique de livraison.", a: <>Ils sont détaillés sur la page <Link href="/livraison" className="link-static">Livraison</Link> et rappelés avant le paiement.</> },
    { q: "Puis-je retourner un article ?", text: "Oui, vous disposez d'un délai légal de 14 jours pour exercer votre droit de rétractation.", a: <>Oui, vous disposez d&apos;un délai légal de 14 jours. Consultez notre <Link href="/retours" className="link-static">politique de retours</Link>.</> },
    { q: "Comment modifier mes choix de cookies ?", text: "Via le lien Gérer mes cookies en bas de chaque page.", a: "Via le lien « Gérer mes cookies » présent en bas de chaque page." },
  ];
  return (
    <div className="container-site pt-8">
      <Breadcrumbs items={[{ name: "Accueil", href: "/" }, { name: "FAQ", href: "/faq" }]} />
      <div className="mx-auto mt-10 max-w-3xl">
        <h1 className="display text-[2.6rem] md:text-[3.4rem]">Questions fréquentes</h1>
        <div className="mt-10 divide-y divide-line border-y border-line">
          {QA.map((x) => (
            <details key={x.q} className="group py-6">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-[1.05rem] [&::-webkit-details-marker]:hidden">
                <h2>{x.q}</h2>
                <span className="text-xl transition-transform group-open:rotate-45" aria-hidden="true">+</span>
              </summary>
              <p className="mt-4 leading-relaxed text-graphite">{x.a}</p>
            </details>
          ))}
        </div>
      </div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJson({ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: QA.map((x) => ({ "@type": "Question", name: x.q, acceptedAnswer: { "@type": "Answer", text: x.text } })) }) }} />
    </div>
  );
}
