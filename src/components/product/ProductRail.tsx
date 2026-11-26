"use client";
import { useRef } from "react";
import { IconChevron } from "@/components/ui/Icons";

/** Carrousel horizontal défilable au doigt (scroll-snap) avec flèches au clavier / souris. */
export function ProductRail({ children, label }: { children: React.ReactNode; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const scroll = (dir: 1 | -1) => ref.current?.scrollBy({ left: dir * ref.current.clientWidth * 0.8, behavior: "smooth" });
  return (
    <div className="relative">
      <div ref={ref} className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-4 px-4 md:-mx-8 md:gap-6 md:scroll-px-8 md:px-8 xl:-mx-12 xl:scroll-px-12 xl:px-12" role="region" aria-label={label} tabIndex={0}>
        {children}
      </div>
      <div className="mt-6 hidden justify-end gap-2 md:flex">
        <button type="button" onClick={() => scroll(-1)} aria-label="Produits précédents" className="flex h-11 w-11 items-center justify-center border border-line transition-colors hover:border-ink">
          <IconChevron dir="left" />
        </button>
        <button type="button" onClick={() => scroll(1)} aria-label="Produits suivants" className="flex h-11 w-11 items-center justify-center border border-line transition-colors hover:border-ink">
          <IconChevron />
        </button>
      </div>
    </div>
  );
}

export function RailItem({ children }: { children: React.ReactNode }) {
  return <div className="w-[68%] shrink-0 snap-start sm:w-[42%] md:w-[30%] lg:w-[23%]">{children}</div>;
}
