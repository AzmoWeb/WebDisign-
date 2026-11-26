"use client";
import { useEffect, useRef, useState } from "react";
import type { DemoShape, ProductImage } from "@/lib/types";
import { ProductMedia } from "./ProductMedia";
import { IconClose } from "@/components/ui/Icons";

type Slide = { url: string; alt: string; colorHex?: string; angle: 0 | 1 | 2 };

export function ProductGallery({ images, demoShape, colorHex, name }: { images: ProductImage[]; demoShape?: DemoShape; colorHex: string; name: string }) {
  const slides: Slide[] = demoShape
    ? ([0, 2, 1] as const).map((angle, i) => ({ url: "", alt: `${name} — vue ${i + 1} (illustration de démonstration)`, colorHex, angle }))
    : images.map((im) => ({ url: im.url, alt: im.alt, angle: 0 as const }));
  const [index, setIndex] = useState(0);
  const [zoom, setZoom] = useState<{ x: number; y: number } | null>(null);
  const [lightbox, setLightbox] = useState(false);
  const track = useRef<HTMLDivElement>(null);

  useEffect(() => setIndex(0), [colorHex]);
  useEffect(() => {
    if (!lightbox) return;
    const k = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(false);
      if (e.key === "ArrowRight") setIndex((i) => (i + 1) % slides.length);
      if (e.key === "ArrowLeft") setIndex((i) => (i - 1 + slides.length) % slides.length);
    };
    document.addEventListener("keydown", k);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", k);
      document.body.style.overflow = "";
    };
  }, [lightbox, slides.length]);

  if (!slides.length) return <div className="relative aspect-[4/5] bg-sand"><ProductMedia alt={name} sizes="50vw" /></div>;
  const s = slides[index];

  return (
    <div className="lg:grid lg:grid-cols-[5.5rem_1fr] lg:gap-4">
      {/* vignettes (desktop) */}
      <ul className="hidden flex-col gap-3 lg:flex" aria-label="Vues du produit">
        {slides.map((sl, i) => (
          <li key={i}>
            <button type="button" onClick={() => setIndex(i)} aria-label={`Afficher la vue ${i + 1}`} aria-current={i === index}
              className={`relative block aspect-[4/5] w-full overflow-hidden bg-sand transition-opacity ${i === index ? "ring-1 ring-ink" : "opacity-60 hover:opacity-100"}`}>
              <ProductMedia url={sl.url} alt="" demoShape={demoShape} colorHex={sl.colorHex} angle={sl.angle} sizes="88px" />
            </button>
          </li>
        ))}
      </ul>

      {/* image principale avec zoom (desktop) */}
      <div className="relative hidden aspect-[4/5] cursor-zoom-in overflow-hidden bg-sand lg:block"
        onMouseMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          setZoom({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
        }}
        onMouseLeave={() => setZoom(null)}
        onClick={() => setLightbox(true)}
        role="button"
        tabIndex={0}
        aria-label="Agrandir l'image"
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setLightbox(true)}
      >
        <div className="absolute inset-0 transition-transform duration-200 ease-out" style={zoom ? { transform: "scale(2)", transformOrigin: `${zoom.x}% ${zoom.y}%` } : undefined}>
          <ProductMedia url={s.url} alt={s.alt} demoShape={demoShape} colorHex={s.colorHex} angle={s.angle} priority sizes="(min-width:1024px) 50vw, 100vw" />
        </div>
      </div>

      {/* carrousel tactile (mobile / tablette) */}
      <div className="lg:hidden">
        <div ref={track} className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto"
          onScroll={(e) => setIndex(Math.round(e.currentTarget.scrollLeft / e.currentTarget.clientWidth))}>
          {slides.map((sl, i) => (
            <button type="button" key={i} onClick={() => setLightbox(true)} className="relative aspect-[4/5] w-full shrink-0 snap-center bg-sand" aria-label={`Agrandir la vue ${i + 1}`}>
              <ProductMedia url={sl.url} alt={sl.alt} demoShape={demoShape} colorHex={sl.colorHex} angle={sl.angle} priority={i === 0} sizes="100vw" />
            </button>
          ))}
        </div>
        <div className="mt-4 flex justify-center gap-2" aria-hidden="true">
          {slides.map((_, i) => (
            <span key={i} className={`h-[2px] transition-all duration-300 ${i === index ? "w-8 bg-ink" : "w-4 bg-stone"}`} />
          ))}
        </div>
      </div>

      {lightbox && (
        <div className="fixed inset-0 z-[70] bg-paper animate-fade" role="dialog" aria-modal="true" aria-label={`Galerie — ${name}`}>
          <button type="button" onClick={() => setLightbox(false)} className="absolute top-4 right-4 z-10 p-2" aria-label="Fermer la galerie" autoFocus>
            <IconClose className="h-7 w-7" />
          </button>
          <div className="no-scrollbar flex h-full snap-x snap-mandatory overflow-x-auto" style={{ touchAction: "pan-x pinch-zoom" }}>
            <div className="relative h-full w-full shrink-0">
              <ProductMedia url={s.url} alt={s.alt} demoShape={demoShape} colorHex={s.colorHex} angle={s.angle} sizes="100vw" className="object-contain" />
            </div>
          </div>
          {slides.length > 1 && (
            <div className="absolute inset-x-0 bottom-6 flex justify-center gap-3">
              {slides.map((_, i) => (
                <button key={i} type="button" onClick={() => setIndex(i)} aria-label={`Vue ${i + 1}`} className={`h-2.5 w-2.5 rounded-full ${i === index ? "bg-ink" : "bg-stone"}`} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
