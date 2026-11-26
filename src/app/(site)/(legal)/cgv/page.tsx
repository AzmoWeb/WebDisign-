import { LegalPage, Todo } from "@/components/ui/LegalPage";
import { STORE_DEFAULTS as S } from "@/lib/store";

export const metadata = { title: "Conditions générales de vente", alternates: { canonical: "/cgv" } };

export default function Page() {
  return (
    <LegalPage title="Conditions générales de vente" href="/cgv">
      <h2>1. Vendeur</h2>
      <p>{S.name}, <Todo>forme juridique, SIRET, RCS</Todo>, {S.street}, {S.postalCode} {S.city} — {S.phone} — <Todo>e-mail</Todo>.</p>
      <h2>2. Champ d&apos;application</h2>
      <p>Les présentes conditions s&apos;appliquent aux ventes conclues sur le site entre {S.name} et tout client consommateur. <Todo>préciser les zones de livraison</Todo>.</p>
      <h2>3. Produits et prix</h2>
      <p>Les prix sont indiqués en euros toutes taxes comprises, hors frais de livraison indiqués avant la validation de la commande. Les produits sont proposés dans la limite des stocks disponibles. <Todo>conditions des promotions</Todo>.</p>
      <h2>4. Commande</h2>
      <p>Le client sélectionne ses articles, renseigne ses coordonnées, choisit le mode de livraison, accepte les présentes conditions puis procède au paiement. La commande est définitive après confirmation du paiement par le prestataire Stripe ; un e-mail récapitulatif est alors envoyé.</p>
      <h2>5. Paiement</h2>
      <p>Le paiement s&apos;effectue en ligne par l&apos;intermédiaire de Stripe. Moyens acceptés : <Todo>carte bancaire, autres moyens activés dans Stripe</Todo>.</p>
      <h2>6. Livraison</h2>
      <p>Voir la <a href="/livraison">politique de livraison</a>. <Todo>délais, transporteur, conditions de retrait en magasin le cas échéant</Todo>.</p>
      <h2>7. Droit de rétractation</h2>
      <p>Conformément aux articles L.221-18 et suivants du Code de la consommation, le client consommateur dispose d&apos;un délai de quatorze jours à compter de la réception du produit pour exercer son droit de rétractation, sans avoir à justifier de motif. Modalités, frais de retour et remboursement : voir la <a href="/retours">politique de retours</a>. <Todo>formulaire type de rétractation</Todo>.</p>
      <h2>8. Garanties légales</h2>
      <p>Les produits bénéficient de la garantie légale de conformité (articles L.217-3 et suivants du Code de la consommation) et de la garantie des vices cachés (articles 1641 et suivants du Code civil). <Todo>reproduire les mentions légales obligatoires relatives à ces garanties</Todo>.</p>
      <h2>9. Service client et médiation</h2>
      <p>Pour toute réclamation : {S.phone} ou via la page contact. Médiateur de la consommation : <Todo>coordonnées</Todo>.</p>
      <h2>10. Droit applicable</h2>
      <p>Les présentes conditions sont soumises au droit français.</p>
    </LegalPage>
  );
}
