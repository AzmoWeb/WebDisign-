import Image from "next/image";
import type { DemoShape } from "@/lib/types";
import { ShoeArt } from "./ShoeArt";

/** Affiche la photo produit, ou l'illustration de démonstration. */
export function ProductMedia({
  url, alt, demoShape, colorHex, sizes, priority, className = "", angle = 0, background,
}: { url?: string | null; alt: string; demoShape?: DemoShape; colorHex?: string; sizes: string; priority?: boolean; className?: string; angle?: 0 | 1 | 2; background?: string }) {
  if (url) return <Image src={url} alt={alt} fill sizes={sizes} priority={priority} className={`object-cover ${className}`} />;
  if (demoShape) return <ShoeArt shape={demoShape} color={colorHex || "#1a1816"} angle={angle} background={background} title={alt} className={`absolute inset-0 h-full w-full ${className}`} />;
  return (
    <div className={`absolute inset-0 flex items-center justify-center bg-sand text-xs text-mist ${className}`} role="img" aria-label={alt}>
      Photo à venir
    </div>
  );
}
