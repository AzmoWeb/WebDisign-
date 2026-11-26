/** Icônes fonctionnelles minimalistes (trait 1.4px), uniquement là où elles aident la navigation. */
type P = { className?: string };
const base = { fill: "none", stroke: "currentColor", strokeWidth: 1.4, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true };

export const IconSearch = ({ className = "h-5 w-5" }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...base}><circle cx="10.5" cy="10.5" r="6.5" /><path d="m20 20-4.8-4.8" /></svg>
);
export const IconUser = ({ className = "h-5 w-5" }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...base}><circle cx="12" cy="8" r="4" /><path d="M4 21c1.2-4 4.3-6 8-6s6.8 2 8 6" /></svg>
);
export const IconHeart = ({ className = "h-5 w-5", filled }: P & { filled?: boolean }) => (
  <svg viewBox="0 0 24 24" className={className} {...base} fill={filled ? "currentColor" : "none"}><path d="M12 20s-7.5-4.4-7.5-10.1A4.4 4.4 0 0 1 12 7.3a4.4 4.4 0 0 1 7.5 2.6C19.5 15.6 12 20 12 20Z" /></svg>
);
export const IconBag = ({ className = "h-5 w-5" }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...base}><path d="M5 8h14l-1 12.5H6L5 8Z" /><path d="M9 10V6.5a3 3 0 0 1 6 0V10" /></svg>
);
export const IconMenu = ({ className = "h-5 w-5" }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...base}><path d="M3 7h18M3 12h18M3 17h12" /></svg>
);
export const IconClose = ({ className = "h-5 w-5" }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...base}><path d="M6 6l12 12M18 6 6 18" /></svg>
);
export const IconChevron = ({ className = "h-4 w-4", dir = "right" }: P & { dir?: "right" | "left" | "down" | "up" }) => (
  <svg viewBox="0 0 24 24" className={className} {...base} style={{ transform: { right: "none", left: "rotate(180deg)", down: "rotate(90deg)", up: "rotate(-90deg)" }[dir] }}><path d="m9 5 7 7-7 7" /></svg>
);
export const IconArrow = ({ className = "h-4 w-4" }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...base}><path d="M4 12h16M14 6l6 6-6 6" /></svg>
);
export const IconStar = ({ className = "h-4 w-4", fill = 1 }: P & { fill?: number }) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
    <defs><linearGradient id={`s${Math.round(fill * 100)}`}><stop offset={fill} stopColor="currentColor" /><stop offset={fill} stopColor="currentColor" stopOpacity="0.2" /></linearGradient></defs>
    <path d="m12 2.8 2.8 5.9 6.4.8-4.7 4.4 1.2 6.4L12 17.2l-5.7 3.1 1.2-6.4-4.7-4.4 6.4-.8L12 2.8Z" fill={`url(#s${Math.round(fill * 100)})`} />
  </svg>
);
export const IconFilter = ({ className = "h-4 w-4" }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...base}><path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M20 18h0" /><circle cx="16" cy="6" r="2" /><circle cx="10" cy="12" r="2" /><circle cx="18" cy="18" r="2" /></svg>
);
