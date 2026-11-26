import Link from "next/link";

export default function GlobalNotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center p-8 text-center">
      <p className="label text-mist">Erreur 404</p>
      <h1 className="display mt-4 text-5xl">Page introuvable</h1>
      <Link href="/" className="btn btn-primary mt-10">Retour à l&apos;accueil</Link>
    </main>
  );
}
