import { LegalPage, Todo } from "@/components/ui/LegalPage";
import { STORE_DEFAULTS as S } from "@/lib/store";

export const metadata = { title: "Politique de confidentialité", alternates: { canonical: "/politique-de-confidentialite" } };

export default function Page() {
  return (
    <LegalPage title="Politique de confidentialité" href="/politique-de-confidentialite">
      <h2>Responsable du traitement</h2>
      <p>{S.name}, {S.street}, {S.postalCode} {S.city} — <Todo>adresse e-mail dédiée aux demandes relatives aux données personnelles</Todo>.</p>

      <h2>Données collectées et finalités</h2>
      <h3>Compte client</h3>
      <p>Nom, prénom, adresse e-mail, téléphone, adresses de livraison, favoris. Finalité : gestion de votre compte. Base légale : exécution du contrat. Conservation : <Todo>durée, par exemple jusqu&apos;à la suppression du compte ou 3 ans d&apos;inactivité</Todo>.</p>
      <h3>Commandes</h3>
      <p>Identité, coordonnées, adresse de livraison, contenu et montant de la commande. Finalités : traitement, livraison, service après-vente, obligations comptables. Base légale : exécution du contrat et obligation légale. Conservation : <Todo>durée — les pièces comptables sont conservées 10 ans</Todo>.</p>
      <p>Les données de carte bancaire sont saisies directement sur la page sécurisée de Stripe et ne sont jamais transmises ni stockées par {S.name}.</p>
      <h3>Formulaire de contact</h3>
      <p>Nom, e-mail, téléphone (facultatif), message. Finalité : répondre à votre demande. Base légale : votre consentement / intérêt légitime. Conservation : <Todo>durée, par exemple 3 ans</Todo>. Une empreinte non réversible de l&apos;adresse IP est conservée pour lutter contre le spam.</p>
      <h3>Consentement aux cookies</h3>
      <p>Identifiant aléatoire, choix effectués, date et version de la politique, empreinte de l&apos;adresse IP. Finalité : prouver le recueil de votre consentement. Conservation : <Todo>durée</Todo>.</p>

      <h2>Destinataires et sous-traitants</h2>
      <ul>
        <li>Supabase — hébergement de la base de données et authentification.</li>
        <li>Stripe — traitement sécurisé des paiements.</li>
        <li>Hébergeur du site — <Todo>nom</Todo>.</li>
        <li>Service d&apos;envoi d&apos;e-mails, s&apos;il est activé — <Todo>nom (ex. Resend)</Todo>.</li>
        <li>Outils de mesure d&apos;audience et partenaires publicitaires, uniquement avec votre consentement (voir la politique de cookies).</li>
      </ul>
      <p>Transferts hors de l&apos;Union européenne : <Todo>préciser les éventuels transferts et garanties (clauses contractuelles types, cadre UE–États-Unis)</Todo>.</p>

      <h2>Vos droits</h2>
      <p>Vous disposez d&apos;un droit d&apos;accès, de rectification, d&apos;effacement, de limitation, d&apos;opposition et de portabilité, ainsi que du droit de définir des directives post-mortem. Pour les exercer : <Todo>adresse e-mail ou postale</Todo>. Vous pouvez introduire une réclamation auprès de la CNIL (www.cnil.fr).</p>

      <h2>Sécurité</h2>
      <p>Les échanges sont chiffrés (HTTPS), les mots de passe sont stockés sous forme hachée par Supabase Auth, et l&apos;accès aux données est restreint par des règles de sécurité au niveau de la base de données.</p>
    </LegalPage>
  );
}
