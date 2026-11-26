import { ResetForm } from "@/components/account/AuthForms";

export const metadata = { title: "Nouveau mot de passe", robots: { index: false } };

export default function ResetPage() {
  return (
    <>
      <h1 className="display text-[2.6rem]">Nouveau mot de passe</h1>
      <p className="mt-3 mb-8 text-graphite">Choisissez un nouveau mot de passe pour votre compte.</p>
      <ResetForm />
    </>
  );
}
