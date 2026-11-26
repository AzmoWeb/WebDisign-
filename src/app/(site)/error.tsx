"use client";
import Link from "next/link";
import { useEffect } from "react";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => console.error(error), [error]);
  return (
    <div className="container-site max-w-2xl py-24 text-center">
      <p className="label text-mist">Une erreur est survenue</p>
      <h1 className="display mt-4 text-[2.6rem]">Un faux pas de notre côté</h1>
      <p className="mt-6 text-graphite">Nous n&apos;avons pas pu afficher cette page. Réessayez dans un instant.</p>
      <div className="mt-10 flex justify-center gap-3">
        <button type="button" onClick={reset} className="btn btn-primary">Réessayer</button>
        <Link href="/" className="btn btn-outline">Accueil</Link>
      </div>
    </div>
  );
}
