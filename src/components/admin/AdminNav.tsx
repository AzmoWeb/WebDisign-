"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/admin", label: "Tableau de bord" },
  { href: "/admin/commandes", label: "Commandes" },
  { href: "/admin/reservations", label: "Réservations" },
  { href: "/admin/produits", label: "Produits" },
  { href: "/admin/categories", label: "Catégories" },
  { href: "/admin/promotions", label: "Promotions" },
  { href: "/admin/contenu", label: "Contenus du site" },
  { href: "/admin/magasin", label: "Magasin & livraison" },
  { href: "/admin/avis", label: "Avis Google" },
  { href: "/admin/messages", label: "Messages clients" },
];

export function AdminNav() {
  const p = usePathname();
  return (
    <nav aria-label="Administration" className="no-scrollbar flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-col lg:px-3 lg:pb-0">
      {LINKS.map((l) => {
        const active = l.href === "/admin" ? p === "/admin" : p.startsWith(l.href);
        return (
          <Link key={l.href} href={l.href} aria-current={active ? "page" : undefined}
            className={`shrink-0 px-3 py-2 text-sm transition-colors ${active ? "bg-ivory text-ink" : "text-ivory/75 hover:bg-ivory/10 hover:text-ivory"}`}>
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}
