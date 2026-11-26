import Link from "next/link";
import { ShoeArt } from "@/components/product/ShoeArt";

export default function NotFound() {
  return (
    <div className="container-site grid items-center gap-10 py-20 md:grid-cols-2">
      <div>
        <p className="label text-mist">Erreur 404</p>
        <h1 className="display mt-4 text-[3rem] md:text-[4.5rem]">Ce pas mène nulle part</h1>
        <p className="mt-6 max-w-md text-graphite">La page que vous cherchez n&apos;existe pas ou a été déplacée. Reprenons le bon chemin.</p>
        <div className="mt-10 flex flex-wrap gap-3">
          <Link href="/" className="btn btn-primary">Retour à l&apos;accueil</Link>
          <Link href="/nouveautes" className="btn btn-outline">Voir les nouveautés</Link>
        </div>
      </div>
      <div className="relative aspect-[4/3] overflow-hidden">
        <ShoeArt shape="pump" color="#7d2a22" background="#ebe2d5" className="absolute inset-0 h-full w-full" />
      </div>
    </div>
  );
}
