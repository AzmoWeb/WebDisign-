"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { Category } from "@/lib/types";
import { Logo } from "./Logo";
import { SearchBox } from "./SearchBox";
import { IconBag, IconChevron, IconClose, IconHeart, IconMenu, IconSearch, IconUser } from "@/components/ui/Icons";
import { useCart } from "@/components/cart/CartProvider";
import { useFavorites } from "@/components/product/FavoritesProvider";
import { CampaignScene } from "@/components/home/CampaignScene";
import { Portal } from "@/components/ui/Portal";

type NavItem = { label: string; href: string; mega?: "femme" | "homme" };
const NAV: NavItem[] = [
  { label: "Accueil", href: "/" },
  { label: "Femme", href: "/femme", mega: "femme" },
  { label: "Homme", href: "/homme", mega: "homme" },
  { label: "Nouveautés", href: "/nouveautes" },
  { label: "Promotions", href: "/promotions" },
  { label: "Notre magasin", href: "/notre-magasin" },
  { label: "Contact", href: "/contact" },
];

export function Header({ categories, loggedIn }: { categories: Category[]; loggedIn: boolean }) {
  const pathname = usePathname();
  const { count, ready } = useCart();
  const fav = useFavorites();
  const [mega, setMega] = useState<"femme" | "homme" | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  useEffect(() => {
    setMega(null);
    setMobileOpen(false);
    setSearchOpen(false);
  }, [pathname]);
  useEffect(() => {
    document.body.style.overflow = mobileOpen || searchOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen, searchOpen]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setMega(null); setMobileOpen(false); setSearchOpen(false); }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const openMega = (g: "femme" | "homme" | undefined) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setMega(g ?? null);
  };
  const scheduleClose = () => {
    closeTimer.current = setTimeout(() => setMega(null), 140);
  };
  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <header className={`sticky top-0 z-40 border-b bg-ivory/95 backdrop-blur-[6px] transition-[border-color,box-shadow] duration-300 ${scrolled ? "border-line shadow-[0_8px_30px_-22px_rgba(20,18,16,0.4)]" : "border-transparent"}`}>
      <div className="container-site">
        <div className={`grid grid-cols-[1fr_auto_1fr] items-center gap-4 transition-[height] duration-300 lg:grid-cols-[1fr_auto_1fr] ${scrolled ? "h-16" : "h-[4.5rem] lg:h-20"}`}>
          {/* gauche */}
          <div className="flex items-center gap-1">
            <button type="button" className="-ml-2 p-2 lg:hidden" aria-label="Ouvrir le menu" aria-expanded={mobileOpen} onClick={() => setMobileOpen(true)}>
              <IconMenu className="h-6 w-6" />
            </button>
            <button type="button" className="p-2 lg:hidden" aria-label="Rechercher" onClick={() => setSearchOpen(true)}>
              <IconSearch />
            </button>
            <div className="hidden w-full max-w-[18rem] lg:block">
              <SearchBox />
            </div>
          </div>
          {/* logo */}
          <Logo className={`transition-transform duration-300 ${scrolled ? "scale-[0.9]" : ""}`} />
          {/* droite */}
          <div className="flex items-center justify-end gap-0.5 sm:gap-2">
            <Link href={loggedIn ? "/compte" : "/compte/connexion"} className="hidden items-center gap-2 p-2 text-xs tracking-[0.12em] uppercase hover:opacity-70 sm:flex" aria-label="Mon compte">
              <IconUser />
              <span className="hidden xl:inline">{loggedIn ? "Mon compte" : "Se connecter"}</span>
            </Link>
            <Link href="/favoris" className="relative p-2 hover:opacity-70" aria-label={`Mes favoris${fav.ready && fav.ids.length ? ` (${fav.ids.length})` : ""}`}>
              <IconHeart />
              {fav.ready && fav.ids.length > 0 && <span className="absolute top-1 right-0.5 h-1.5 w-1.5 rounded-full bg-oxblood" aria-hidden="true" />}
            </Link>
            <Link href="/panier" className="relative flex items-center gap-2 p-2 hover:opacity-70" aria-label={`Panier, ${ready ? count : 0} article${count > 1 ? "s" : ""}`} data-testid="header-cart">
              <IconBag />
              <span className="min-w-[1.1rem] rounded-full bg-ink px-1 text-center text-[0.65rem] leading-[1.1rem] text-ivory tabular-nums" aria-hidden="true">
                {ready ? count : 0}
              </span>
            </Link>
          </div>
        </div>

        {/* navigation principale */}
        <nav aria-label="Navigation principale" className="hidden lg:block" onMouseLeave={scheduleClose}>
          <ul className="flex items-center justify-center gap-9 pb-3.5">
            {NAV.map((item) => (
              <li key={item.href} onMouseEnter={() => openMega(item.mega)}>
                <Link
                  href={item.href}
                  aria-current={isActive(item.href) ? "page" : undefined}
                  aria-haspopup={item.mega ? "true" : undefined}
                  aria-expanded={item.mega ? mega === item.mega : undefined}
                  onFocus={() => openMega(item.mega)}
                  className={`link-underline py-1 text-[0.72rem] font-medium tracking-[0.18em] uppercase ${item.label === "Promotions" ? "text-oxblood" : ""}`}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* mega menu */}
      {mega && (
        <div className="absolute inset-x-0 top-full hidden border-t border-line bg-paper shadow-[0_30px_60px_-40px_rgba(20,18,16,0.5)] lg:block animate-fade" onMouseEnter={() => openMega(mega)} onMouseLeave={scheduleClose}>
          <MegaMenu gender={mega} categories={categories.filter((c) => c.gender === mega)} />
        </div>
      )}

      {/* menu mobile */}
      {mobileOpen && (
        <Portal>
          <MobileMenu categories={categories} loggedIn={loggedIn} onClose={() => setMobileOpen(false)} />
        </Portal>
      )}

      {/* recherche mobile */}
      {searchOpen && (
        <Portal>
        <div className="fixed inset-0 z-50 bg-paper animate-fade lg:hidden" role="dialog" aria-modal="true" aria-label="Recherche">
          <div className="container-site pt-5">
            <div className="flex justify-end">
              <button type="button" className="-mr-2 p-2" aria-label="Fermer la recherche" onClick={() => setSearchOpen(false)}>
                <IconClose className="h-6 w-6" />
              </button>
            </div>
            <div className="mt-6">
              <SearchBox autoFocus variant="overlay" onNavigate={() => setSearchOpen(false)} />
            </div>
          </div>
        </div>
        </Portal>
      )}
    </header>
  );
}

function MegaMenu({ gender, categories }: { gender: "femme" | "homme"; categories: Category[] }) {
  return (
    <div className="container-site grid grid-cols-12 gap-10 py-10">
      <div className="col-span-3">
        <p className="label text-mist">{gender === "femme" ? "Chaussures femme" : "Chaussures homme"}</p>
        <ul className="mt-5 space-y-3">
          {categories.map((c) => (
            <li key={c.slug}>
              <Link href={`/${gender}/${c.slug}`} className="link-underline text-[0.95rem]">
                {c.name}
              </Link>
            </li>
          ))}
          <li className="pt-2">
            <Link href={`/${gender}`} className="link-static text-sm">
              Tout voir
            </Link>
          </li>
        </ul>
      </div>
      <div className="col-span-3">
        <p className="label text-mist">Sélections</p>
        <ul className="mt-5 space-y-3 text-[0.95rem]">
          <li><Link href={`/nouveautes?genre=${gender}`} className="link-underline">Nouveautés</Link></li>
          <li><Link href={`/promotions?genre=${gender}`} className="link-underline text-oxblood">Promotions</Link></li>
          <li><Link href={`/coups-de-coeur?genre=${gender}`} className="link-underline">Coups de cœur</Link></li>
        </ul>
      </div>
      <Link href={`/${gender}`} className="group relative col-span-6 block aspect-[16/7] overflow-hidden bg-sand">
        <CampaignScene scene={gender === "femme" ? "femme" : "homme"} className="absolute inset-0 h-full w-full transition-transform duration-[1.4s] ease-[var(--ease-out-soft)] group-hover:scale-[1.04]" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/55 via-transparent to-transparent" />
        <div className="absolute bottom-6 left-6 text-ivory">
          <p className="label opacity-80">Collection</p>
          <p className="display mt-1 text-3xl">{gender === "femme" ? "Femme" : "Homme"}</p>
          <span className="mt-3 inline-block text-xs tracking-[0.16em] uppercase underline underline-offset-4">Découvrir</span>
        </div>
      </Link>
    </div>
  );
}

function MobileMenu({ categories, loggedIn, onClose }: { categories: Category[]; loggedIn: boolean; onClose: () => void }) {
  const [panel, setPanel] = useState<"femme" | "homme" | null>(null);
  return (
    <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Menu">
      <button type="button" aria-label="Fermer le menu" className="absolute inset-0 bg-ink/40 animate-fade" onClick={onClose} />
      <div className="absolute inset-y-0 left-0 flex w-[88%] max-w-sm flex-col bg-paper animate-drawer-left">
        <div className="flex h-16 items-center justify-between border-b border-line px-5">
          {panel ? (
            <button type="button" onClick={() => setPanel(null)} className="-ml-1 flex items-center gap-2 text-xs tracking-[0.16em] uppercase">
              <IconChevron dir="left" /> Retour
            </button>
          ) : (
            <span className="label">Menu</span>
          )}
          <button type="button" onClick={onClose} aria-label="Fermer le menu" className="-mr-2 p-2">
            <IconClose className="h-6 w-6" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {!panel ? (
            <ul className="divide-y divide-line">
              {NAV.map((item) => (
                <li key={item.href}>
                  {item.mega ? (
                    <button type="button" onClick={() => setPanel(item.mega!)} className="flex w-full items-center justify-between px-5 py-4 text-left text-[0.95rem] tracking-[0.12em] uppercase">
                      {item.label} <IconChevron />
                    </button>
                  ) : (
                    <Link href={item.href} className={`block px-5 py-4 text-[0.95rem] tracking-[0.12em] uppercase ${item.label === "Promotions" ? "text-oxblood" : ""}`}>
                      {item.label}
                    </Link>
                  )}
                </li>
              ))}
              <li>
                <Link href={loggedIn ? "/compte" : "/compte/connexion"} className="flex items-center gap-3 px-5 py-4 text-sm">
                  <IconUser /> {loggedIn ? "Mon compte" : "Se connecter / Créer un compte"}
                </Link>
              </li>
              <li>
                <Link href="/favoris" className="flex items-center gap-3 px-5 py-4 text-sm">
                  <IconHeart /> Mes favoris
                </Link>
              </li>
            </ul>
          ) : (
            <div className="animate-fade">
              <p className="display px-5 pt-6 pb-3 text-3xl">{panel === "femme" ? "Femme" : "Homme"}</p>
              <ul className="divide-y divide-line">
                <li><Link href={`/${panel}`} className="block px-5 py-4 text-sm font-medium">Tout voir</Link></li>
                {categories.filter((c) => c.gender === panel).map((c) => (
                  <li key={c.slug}>
                    <Link href={`/${panel}/${c.slug}`} className="block px-5 py-4 text-sm">{c.name}</Link>
                  </li>
                ))}
                <li><Link href={`/nouveautes?genre=${panel}`} className="block px-5 py-4 text-sm">Nouveautés</Link></li>
                <li><Link href={`/promotions?genre=${panel}`} className="block px-5 py-4 text-sm text-oxblood">Promotions</Link></li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
