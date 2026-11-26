import { LegalPage, Todo } from "@/components/ui/LegalPage";

export const metadata = { title: "Retours et rétractation", alternates: { canonical: "/retours" } };

export default function Page() {
  return (
    <LegalPage title="Retours" href="/retours">
      <h2>Droit de rétractation</h2>
      <p>Vous disposez d&apos;un délai légal de 14 jours à compter de la réception de votre commande pour vous rétracter, sans avoir à motiver votre décision.</p>
      <h2>Modalités de retour</h2>
      <p><Todo>procédure de retour (prise de contact, adresse de retour, état des produits attendu, emballage)</Todo></p>
      <p>Frais de retour : <Todo>à la charge du client ou du magasin</Todo>.</p>
      <p>Retour possible en magasin : <Todo>oui / non</Todo>.</p>
      <h2>Remboursement</h2>
      <p>Le remboursement intervient au plus tard dans les 14 jours suivant la notification de la rétractation, par le moyen de paiement utilisé lors de la commande. Il peut être différé jusqu&apos;à réception des produits ou de la preuve de leur expédition.</p>
      <h2>Échanges</h2>
      <p><Todo>politique d&apos;échange de pointure</Todo></p>
    </LegalPage>
  );
}
