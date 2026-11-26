import { LegalPage, Todo } from "@/components/ui/LegalPage";
import { ShippingList } from "@/components/ui/ShippingList";
import { getSettings } from "@/lib/settings";
import { shippingReady } from "@/lib/shipping";

export const metadata = { title: "Politique de livraison", alternates: { canonical: "/livraison" } };

export default async function Page() {
  const { shipping: s, store } = await getSettings();
  return (
    <LegalPage title="Livraison" href="/livraison">
      <h2>Transporteurs</h2>
      <p>Nous expédions nos colis avec La Poste (Colissimo) et Mondial Relay, à domicile ou en point relais selon le mode choisi lors de la commande.</p>
      <h2>Modes et tarifs</h2>
      {shippingReady(s) ? (
        <ul>
          <ShippingList shipping={s} city={store.city} />
        </ul>
      ) : (
        <p><Todo>tarifs de livraison par transporteur (à saisir dans l&apos;administration)</Todo></p>
      )}
      <p>Les commandes sont expédiées sous 24 h. Zones desservies : <Todo>France métropolitaine ?</Todo></p>
      <h2>Point relais</h2>
      <p>Pour une livraison en point relais, indiquez le point choisi lors de la commande. Vous êtes prévenu par le transporteur à l&apos;arrivée du colis et disposez d&apos;un délai fixé par celui-ci pour le retirer, muni d&apos;une pièce d&apos;identité.</p>
      <h2>Retrait en magasin</h2>
      {s.pickupEnabled ? (
        <p>Retrait gratuit au magasin, {store.street}, {store.postalCode} {store.city}. {s.pickupText}</p>
      ) : (
        <p>Le retrait en magasin n&apos;est pas proposé pour le moment. <Todo>confirmer si ce service est offert</Todo></p>
      )}
      <h2>Suivi</h2>
      <p>Le statut de votre commande et, dès l&apos;expédition, le numéro de suivi du transporteur sont consultables dans votre espace client.</p>
    </LegalPage>
  );
}
