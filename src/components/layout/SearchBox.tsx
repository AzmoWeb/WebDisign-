"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { IconClose, IconSearch } from "@/components/ui/Icons";
import { formatPrice } from "@/lib/money";

type Hit = { slug: string; name: string; brand: string; price: number; sale: number | null; category: string; gender: string };

export function SearchBox({ autoFocus, onNavigate, variant = "header" }: { autoFocus?: boolean; onNavigate?: () => void; variant?: "header" | "overlay" }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<Hit[]>([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [loading, setLoading] = useState(false);
  const listId = useId();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const term = q.trim();
    if (term.length < 2) {
      setHits([]);
      return;
    }
    const ctrl = new AbortController();
    setLoading(true);
    const t = setTimeout(() => {
      fetch(`/api/search?q=${encodeURIComponent(term)}`, { signal: ctrl.signal })
        .then((r) => r.json())
        .then((d: { hits: Hit[] }) => {
          setHits(d.hits);
          setActive(-1);
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }, 160);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [q]);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (active >= 0 && hits[active]) {
      router.push(`/produit/${hits[active].slug}`);
    } else if (q.trim()) {
      router.push(`/recherche?q=${encodeURIComponent(q.trim())}`);
    }
    setOpen(false);
    onNavigate?.();
  };

  const showPanel = open && q.trim().length >= 2;

  return (
    <div ref={ref} className="relative w-full">
      <form role="search" onSubmit={submit} className={`flex items-center gap-3 border-b ${variant === "overlay" ? "border-ink pb-3" : "border-line pb-1.5 focus-within:border-ink"} transition-colors`}>
        <IconSearch className={variant === "overlay" ? "h-6 w-6" : "h-[18px] w-[18px] text-graphite"} />
        <label htmlFor={`${listId}-input`} className="sr-only">
          Rechercher un produit
        </label>
        <input
          id={`${listId}-input`}
          type="search"
          value={q}
          autoFocus={autoFocus}
          autoComplete="off"
          maxLength={80}
          role="combobox"
          aria-expanded={showPanel}
          aria-controls={listId}
          aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
          placeholder="Rechercher une chaussure, une marque…"
          onFocus={() => setOpen(true)}
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(true);
          }}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => Math.min(hits.length - 1, a + 1)); }
            if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => Math.max(-1, a - 1)); }
            if (e.key === "Escape") setOpen(false);
          }}
          className={`w-full bg-transparent placeholder:text-mist focus:outline-none [&::-webkit-search-cancel-button]:hidden ${variant === "overlay" ? "text-xl" : "text-sm"}`}
        />
        {q && (
          <button type="button" aria-label="Effacer la recherche" onClick={() => setQ("")} className="text-mist hover:text-ink">
            <IconClose className="h-4 w-4" />
          </button>
        )}
      </form>
      {showPanel && (
        <div className={`${variant === "overlay" ? "mt-6" : "absolute top-full right-0 left-0 z-50 mt-3 min-w-[22rem] border border-line bg-paper shadow-[0_20px_50px_-24px_rgba(20,18,16,0.35)]"} animate-fade`}>
          <ul id={listId} role="listbox" aria-label="Suggestions">
            {hits.map((h, i) => (
              <li key={h.slug} id={`${listId}-${i}`} role="option" aria-selected={i === active}>
                <Link
                  href={`/produit/${h.slug}`}
                  onClick={() => { setOpen(false); onNavigate?.(); }}
                  className={`flex items-baseline justify-between gap-4 px-4 py-3 transition-colors hover:bg-sand/50 ${i === active ? "bg-sand/50" : ""}`}
                >
                  <span>
                    <span className="block text-sm">{h.name}</span>
                    <span className="block text-xs text-mist">{h.brand} · {h.category} {h.gender}</span>
                  </span>
                  <span className={`shrink-0 text-sm ${h.sale ? "text-oxblood" : ""}`}>{formatPrice(h.sale ?? h.price)}</span>
                </Link>
              </li>
            ))}
          </ul>
          {!loading && hits.length === 0 && <p className="px-4 py-4 text-sm text-mist">Aucun produit ne correspond à « {q.trim()} ».</p>}
          {hits.length > 0 && (
            <button type="button" onClick={submit as unknown as React.MouseEventHandler} className="block w-full border-t border-line px-4 py-3 text-left text-xs tracking-[0.14em] uppercase hover:bg-sand/50">
              Voir tous les résultats
            </button>
          )}
        </div>
      )}
    </div>
  );
}
