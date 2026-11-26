import { LegalPage, Todo } from "@/components/ui/LegalPage";
import { getSettings } from "@/lib/settings";
import { formatPrice } from "@/lib/money";

export const metadata = { title: "Politique de livraison", alternates: { canonical: "/livraison" } };

export default async function Page() {
  const { shipping: s, store } = await getSettings();
  return (
    <LegalPage title="Livraison" href="/livraison">
      <h2>Livraison à domicile</h2>
      {s.homeDeliveryEnabled && s.homeDeliveryCents != null ? (
        <p>
          Frais de livraison : {s.homeDeliveryCents === 0 ? "offerts" : formatPrice(s.homeDeliveryCents)}
          {s.freeShippingThresholdCents != null && s.homeDeliveryCents > 0 ? `, offerts dès ${formatPrice(s.freeShippingThresholdCents)} d'achat` : ""}.
          {s.deliveryDelayText ? ` ${s.deliveryDelayText}` : ""}
        </p>
      ) : (
        <p><Todo>tarifs de livraison (à configurer dans l&apos;administration)</Todo></p>
      )}
      <p>Zones desservies : <Todo>France métropolitaine ?</Todo> — Transporteur : <Todo>nom</Todo> — Délais : <Todo>délais de préparation et d&apos;acheminement</Todo>.</p>
      <h2>Retrait en magasin</h2>
      {s.pickupEnabled ? (
        <p>Retrait gratuit au magasin, {store.street}, {store.postalCode} {store.city}. {s.pickupText}</p>
      ) : (
        <p>Le retrait en magasin n&apos;est pas proposé pour le moment. <Todo>confirmer si ce service est offert</Todo></p>
      )}
      <h2>Suivi</h2>
      <p>Le statut de votre commande est consultable dans votre espace client. <Todo>modalités de suivi du colis</Todo></p>
    </LegalPage>
  );
}
