import { LegalPage, Todo } from "@/components/ui/LegalPage";
import { ManageCookiesButton } from "@/components/consent/ManageCookiesButton";
import { CONSENT_MAX_AGE_DAYS, CONSENT_POLICY_VERSION } from "@/lib/consent";

export const metadata = { title: "Politique de cookies", alternates: { canonical: "/politique-cookies" } };

const ROWS: [string, string, string, string][] = [
  ["ajp_consent", "Nécessaire", "Mémorise vos choix en matière de cookies", `${Math.round(CONSENT_MAX_AGE_DAYS / 30)} mois`],
  ["sb-…-auth-token", "Nécessaire", "Session de connexion à votre compte (Supabase)", "Durée de la session"],
  ["ajp_cart (stockage local)", "Nécessaire", "Contenu de votre panier", "Jusqu'à la vidange du panier"],
  ["ajp_favorites (stockage local)", "Nécessaire", "Produits ajoutés à vos favoris", "Jusqu'à suppression"],
  ["ajp_pref_size (stockage local)", "Préférences", "Mémorise votre pointure habituelle", "Jusqu'au retrait du consentement"],
  ["_ga, _ga_*", "Statistiques", "Google Analytics — mesure d'audience (si activé)", "13 mois maximum"],
  ["_fbp", "Marketing", "Meta — mesure des campagnes publicitaires (si activé)", "3 mois"],
];

export default function Page() {
  return (
    <LegalPage title="Politique de cookies" href="/politique-cookies" updated={CONSENT_POLICY_VERSION}>
      <p>Un cookie est un petit fichier déposé sur votre appareil lors de la consultation d&apos;un site. Nous utilisons aussi le stockage local du navigateur, soumis aux mêmes règles.</p>
      <h2>Votre consentement</h2>
      <p>Lors de votre première visite, vous pouvez tout accepter, tout refuser ou personnaliser vos choix. Aucun cookie non nécessaire n&apos;est déposé avant votre accord, et l&apos;absence de choix vaut refus. Votre choix est conservé {Math.round(CONSENT_MAX_AGE_DAYS / 30)} mois ; il vous sera redemandé à l&apos;issue de ce délai ou si cette politique évolue.</p>
      <p><ManageCookiesButton className="btn btn-outline" /></p>
      <h2>Liste des traceurs</h2>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[36rem] border-collapse text-sm">
          <thead><tr className="border-b border-ink text-left"><th className="py-2 pr-3 font-medium">Nom</th><th className="py-2 pr-3 font-medium">Catégorie</th><th className="py-2 pr-3 font-medium">Finalité</th><th className="py-2 font-medium">Durée</th></tr></thead>
          <tbody>{ROWS.map((r) => <tr key={r[0]} className="border-b border-line">{r.map((c, i) => <td key={i} className="py-2.5 pr-3 align-top">{c}</td>)}</tr>)}</tbody>
        </table>
      </div>
      <h2>Contenus tiers</h2>
      <p>La carte Google Maps n&apos;est chargée que lorsque vous cliquez sur « Afficher la carte » (ou si vous avez accepté les cookies marketing). Google peut alors déposer ses propres cookies.</p>
      <p>Outils effectivement activés sur le site : <Todo>confirmer la liste (Google Analytics, Meta Pixel…) avant publication</Todo>.</p>
    </LegalPage>
  );
}
