import Image from "next/image";
import Link from "next/link";
import type { CampaignPanel } from "@/lib/types";
import { CampaignScene } from "./CampaignScene";

/**
 * Composition publicitaire unique découpée en trois sections diagonales.
 * Chaque section est cliquable et respecte exactement sa découpe (clip-path).
 */
const GEOMETRY = [
  { clip: "polygon(0 0, 40% 0, 26% 100%, 0 100%)", left: "0%", width: "40%", labelLeft: "3%" },
  { clip: "polygon(40% 0, 74% 0, 60% 100%, 26% 100%)", left: "26%", width: "48%", labelLeft: "43%" },
  { clip: "polygon(74% 0, 100% 0, 100% 100%, 60% 100%)", left: "60%", width: "40%", labelLeft: "77%" },
];

export function DiagonalCampaign({ panels, className = "", showLabels = true, priority = false }: { panels: CampaignPanel[]; className?: string; showLabels?: boolean; priority?: boolean }) {
  return (
    <div className={`relative isolate overflow-hidden bg-sand ${className}`}>
      {panels.slice(0, 3).map((p, i) => {
        const g = GEOMETRY[i];
        return (
          <Link key={i} href={p.href} className="group absolute inset-0 block focus-visible:outline-none" style={{ clipPath: g.clip }} aria-label={`${p.label} — ${p.imageAlt}`}>
            <span className="absolute inset-y-0 block overflow-hidden" style={{ left: g.left, width: g.width }}>
              <span className="absolute inset-0 block transition-transform duration-[1.6s] ease-[var(--ease-out-soft)] group-hover:scale-[1.045]">
                {p.imageUrl ? (
                  <Image src={p.imageUrl} alt={p.imageAlt} fill priority={priority} sizes="50vw" className="object-cover" />
                ) : (
                  <CampaignScene scene={p.scene} className="h-full w-full" />
                )}
              </span>
            </span>
            <span className="absolute inset-0 bg-ink/0 transition-colors duration-500 group-hover:bg-ink/[0.06] group-focus-visible:bg-ink/10" />
          </Link>
        );
      })}
      {/* filets de séparation */}
      <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        <line x1="40" y1="0" x2="26" y2="100" stroke="#f7f3ed" strokeWidth="5" vectorEffect="non-scaling-stroke" />
        <line x1="74" y1="0" x2="60" y2="100" stroke="#f7f3ed" strokeWidth="5" vectorEffect="non-scaling-stroke" />
      </svg>
      {showLabels &&
        panels.slice(0, 3).map((p, i) => (
          <span key={i} className="pointer-events-none absolute top-5 text-[0.62rem] font-medium tracking-[0.22em] text-ink uppercase sm:top-7 sm:text-xs" style={{ left: GEOMETRY[i].labelLeft }}>
            <span className="bg-ivory/90 px-2 py-1 sm:px-3 sm:py-1.5">{p.label}</span>
          </span>
        ))}
    </div>
  );
}
