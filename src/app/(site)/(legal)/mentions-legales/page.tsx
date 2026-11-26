import { LegalPage, Todo } from "@/components/ui/LegalPage";
import { STORE_DEFAULTS as S } from "@/lib/store";

export const metadata = { title: "Mentions légales", alternates: { canonical: "/mentions-legales" } };

export default function Page() {
  return (
    <LegalPage title="Mentions légales" href="/mentions-legales">
      <h2>Éditeur du site</h2>
      <p>
        Le site est édité par <strong>{S.name}</strong>, <Todo>forme juridique et capital social</Todo>.<br />
        Siège : {S.street}, {S.postalCode} {S.city}, France.<br />
        Téléphone : {S.phone} — E-mail : <Todo>adresse e-mail de contact</Todo><br />
        Immatriculation : <Todo>RCS / RNE et numéro SIRET</Todo><br />
        TVA intracommunautaire : <Todo>numéro de TVA</Todo>
      </p>
      <p>Directeur de la publication : <Todo>nom du responsable de la publication</Todo></p>
      <h2>Hébergement</h2>
      <p>Site hébergé par : <Todo>nom, adresse et téléphone de l&apos;hébergeur (ex. : société d&apos;hébergement retenue au déploiement)</Todo>.</p>
      <p>Base de données et authentification : Supabase, <Todo>région d&apos;hébergement du projet Supabase (ex. Union européenne)</Todo>.</p>
      <h2>Propriété intellectuelle</h2>
      <p>Les contenus du site (textes, visuels, logotype) sont la propriété de {S.name} ou de leurs auteurs respectifs. Toute reproduction sans autorisation est interdite. Les marques de chaussures citées appartiennent à leurs titulaires respectifs.</p>
      <h2>Médiation de la consommation</h2>
      <p>Conformément à l&apos;article L.612-1 du Code de la consommation, le client peut recourir gratuitement à un médiateur : <Todo>nom et coordonnées du médiateur de la consommation choisi</Todo>.</p>
      <h2>Données personnelles</h2>
      <p>Voir notre <a href="/politique-de-confidentialite">politique de confidentialité</a> et notre <a href="/politique-cookies">politique de cookies</a>.</p>
    </LegalPage>
  );
}
