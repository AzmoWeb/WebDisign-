"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/compte", label: "Mes informations" },
  { href: "/compte/commandes", label: "Mes commandes" },
  { href: "/compte/favoris", label: "Mes favoris" },
  { href: "/compte/adresses", label: "Mes adresses" },
];

export function AccountNav({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname();
  const links = isAdmin ? [...LINKS, { href: "/admin", label: "Administration" }] : LINKS;
  return (
    <nav aria-label="Espace client" className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 lg:mx-0 lg:flex-col lg:gap-0 lg:px-0">
      {links.map((l) => {
        const active = l.href === "/compte" ? pathname === "/compte" : pathname.startsWith(l.href);
        return (
          <Link key={l.href} href={l.href} aria-current={active ? "page" : undefined}
            className={`shrink-0 border px-4 py-2 text-sm lg:border-0 lg:border-l-2 lg:px-4 lg:py-2.5 ${active ? "border-ink bg-ink text-ivory lg:border-ink lg:bg-transparent lg:text-ink" : "border-line lg:border-transparent lg:text-graphite hover:lg:text-ink"}`}>
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}
