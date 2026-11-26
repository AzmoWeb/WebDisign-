import Link from "next/link";

/** Logotype typographique Aux Jolis Pas. */
export function Logo({ className = "", light = false }: { className?: string; light?: boolean }) {
  return (
    <Link href="/" aria-label="Aux Jolis Pas — accueil" className={`group inline-flex flex-col items-center leading-none ${light ? "text-ivory" : "text-ink"} ${className}`}>
      <span className="text-[0.55rem] tracking-[0.5em] uppercase opacity-70 sm:text-[0.6rem]">Aux</span>
      <span className="display mt-0.5 text-[1.45rem] tracking-[0.12em] uppercase sm:text-[1.75rem]">
        Jolis <span className="italic">Pas</span>
      </span>
    </Link>
  );
}
