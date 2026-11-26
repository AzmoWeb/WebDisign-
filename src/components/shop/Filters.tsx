"use client";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import type { Facets } from "@/lib/catalog-filters";
import { IconClose, IconFilter } from "@/components/ui/Icons";

const SORTS = [
  { v: "pertinence", l: "Pertinence" },
  { v: "nouveautes", l: "Nouveautés" },
  { v: "prix-asc", l: "Prix croissant" },
  { v: "prix-desc", l: "Prix décroissant" },
];

function useParamUpdater() {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const [pending, start] = useTransition();
  const update = (mut: (p: URLSearchParams) => void) => {
    const p = new URLSearchParams(sp.toString());
    mut(p);
    start(() => router.replace(`${pathname}${p.toString() ? `?${p}` : ""}`, { scroll: false }));
  };
  return { sp, update, pending };
}

const getList = (sp: URLSearchParams, k: string) => (sp.get(k) ? sp.get(k)!.split(",") : []);

export function SortSelect() {
  const { sp, update } = useParamUpdater();
  return (
    <label className="flex items-center gap-3 text-sm">
      <span className="hidden text-graphite sm:inline">Trier par</span>
      <select
        value={sp.get("tri") ?? "pertinence"}
        onChange={(e) => update((p) => (e.target.value === "pertinence" ? p.delete("tri") : p.set("tri", e.target.value)))}
        className="h-10 border-b border-line bg-transparent pr-6 focus:border-ink focus:outline-none"
        aria-label="Trier les produits"
      >
        {SORTS.map((s) => (
          <option key={s.v} value={s.v}>{s.l}</option>
        ))}
      </select>
    </label>
  );
}

function Group({ title, children, defaultOpen = true }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  return (
    <details open={defaultOpen} className="group border-b border-line py-5">
      <summary className="flex cursor-pointer list-none items-center justify-between text-[0.72rem] font-medium tracking-[0.18em] uppercase [&::-webkit-details-marker]:hidden">
        {title}
        <span className="text-lg leading-none transition-transform group-open:rotate-45" aria-hidden="true">+</span>
      </summary>
      <div className="pt-4">{children}</div>
    </details>
  );
}

function FilterBody({ facets, showCategories }: { facets: Facets; showCategories: boolean }) {
  const { sp, update } = useParamUpdater();
  const toggle = (k: string, v: string) =>
    update((p) => {
      const cur = getList(p, k);
      const next = cur.includes(v) ? cur.filter((x) => x !== v) : [...cur, v];
      if (next.length) p.set(k, next.join(","));
      else p.delete(k);
    });
  const sizes = getList(sp, "pointure");
  const brands = getList(sp, "marque");
  const colors = getList(sp, "couleur");
  const cats = getList(sp, "categorie");
  const [min, setMin] = useState(sp.get("prix_min") ?? "");
  const [max, setMax] = useState(sp.get("prix_max") ?? "");
  useEffect(() => {
    setMin(sp.get("prix_min") ?? "");
    setMax(sp.get("prix_max") ?? "");
  }, [sp]);

  return (
    <div>
      <Group title="Pointure">
        <div className="grid grid-cols-5 gap-1.5" role="group" aria-label="Pointures">
          {facets.sizes.map((s) => (
            <button key={s} type="button" aria-pressed={sizes.includes(s)} onClick={() => toggle("pointure", s)}
              className={`h-10 border text-sm tabular-nums transition-colors ${sizes.includes(s) ? "border-ink bg-ink text-ivory" : "border-line hover:border-ink"}`}>
              {s}
            </button>
          ))}
        </div>
      </Group>
      {showCategories && facets.categories.length > 1 && (
        <Group title="Catégorie">
          <ul className="space-y-2.5">
            {facets.categories.map((c) => (
              <li key={c.slug}>
                <label className="flex cursor-pointer items-center gap-3 text-sm">
                  <input type="checkbox" checked={cats.includes(c.slug)} onChange={() => toggle("categorie", c.slug)} className="h-4 w-4 accent-ink" />
                  {c.name}
                </label>
              </li>
            ))}
          </ul>
        </Group>
      )}
      <Group title="Prix">
        <form
          className="flex items-end gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            update((p) => {
              if (min) p.set("prix_min", String(Math.max(0, Math.floor(+min)))); else p.delete("prix_min");
              if (max) p.set("prix_max", String(Math.max(0, Math.ceil(+max)))); else p.delete("prix_max");
            });
          }}
        >
          <label className="flex-1 text-xs text-graphite">Min (€)
            <input type="number" inputMode="numeric" min={0} value={min} onChange={(e) => setMin(e.target.value)} placeholder={String(facets.priceRange.min)} className="field mt-1 min-h-10 py-2" />
          </label>
          <label className="flex-1 text-xs text-graphite">Max (€)
            <input type="number" inputMode="numeric" min={0} value={max} onChange={(e) => setMax(e.target.value)} placeholder={String(facets.priceRange.max)} className="field mt-1 min-h-10 py-2" />
          </label>
          <button type="submit" className="h-10 border border-ink px-3 text-xs tracking-[0.14em] uppercase hover:bg-ink hover:text-ivory">OK</button>
        </form>
      </Group>
      {facets.brands.length > 0 && (
        <Group title="Marque">
          <ul className="space-y-2.5">
            {facets.brands.map((b) => (
              <li key={b}>
                <label className="flex cursor-pointer items-center gap-3 text-sm">
                  <input type="checkbox" checked={brands.includes(b)} onChange={() => toggle("marque", b)} className="h-4 w-4 accent-ink" />
                  {b}
                </label>
              </li>
            ))}
          </ul>
        </Group>
      )}
      <Group title="Couleur">
        <ul className="grid grid-cols-2 gap-2.5">
          {facets.colors.map((c) => (
            <li key={c.name}>
              <button type="button" aria-pressed={colors.includes(c.name)} onClick={() => toggle("couleur", c.name)} className="flex items-center gap-2.5 text-sm">
                <span className={`h-5 w-5 rounded-full border ${colors.includes(c.name) ? "ring-1 ring-ink ring-offset-2 ring-offset-ivory" : ""} border-ink/15`} style={{ background: c.hex }} aria-hidden="true" />
                <span className={colors.includes(c.name) ? "underline underline-offset-4" : ""}>{c.name}</span>
              </button>
            </li>
          ))}
        </ul>
      </Group>
    </div>
  );
}

const FILTER_KEYS = ["pointure", "marque", "couleur", "categorie", "prix_min", "prix_max"];

export function ActiveFilters() {
  const { sp, update } = useParamUpdater();
  const chips: { k: string; v: string; label: string }[] = [];
  for (const k of ["pointure", "marque", "couleur", "categorie"]) for (const v of getList(sp, k)) chips.push({ k, v, label: k === "pointure" ? `Pointure ${v}` : v });
  if (sp.get("prix_min")) chips.push({ k: "prix_min", v: "", label: `Dès ${sp.get("prix_min")} €` });
  if (sp.get("prix_max")) chips.push({ k: "prix_max", v: "", label: `Jusqu'à ${sp.get("prix_max")} €` });
  if (!chips.length) return null;
  return (
    <div className="mb-6 flex flex-wrap items-center gap-2">
      {chips.map((c) => (
        <button key={c.k + c.v} type="button" onClick={() => update((p) => {
          if (!c.v) return p.delete(c.k);
          const n = getList(p, c.k).filter((x) => x !== c.v);
          if (n.length) p.set(c.k, n.join(",")); else p.delete(c.k);
        })} className="flex items-center gap-2 border border-line bg-paper px-3 py-1.5 text-xs hover:border-ink" aria-label={`Retirer le filtre ${c.label}`}>
          {c.label} <IconClose className="h-3 w-3" />
        </button>
      ))}
      <button type="button" onClick={() => update((p) => FILTER_KEYS.forEach((k) => p.delete(k)))} className="px-2 text-xs underline underline-offset-4">
        Tout effacer
      </button>
    </div>
  );
}

export function FilterSidebar({ facets, showCategories }: { facets: Facets; showCategories: boolean }) {
  return (
    <aside className="hidden lg:block" aria-label="Filtres">
      <FilterBody facets={facets} showCategories={showCategories} />
    </aside>
  );
}

export function MobileFilters({ facets, showCategories, count }: { facets: Facets; showCategories: boolean; count: number }) {
  const [open, setOpen] = useState(false);
  const { pending } = useParamUpdater();
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="flex h-10 items-center gap-2 border border-ink px-4 text-xs tracking-[0.14em] uppercase lg:hidden">
        <IconFilter /> Filtrer
      </button>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Filtres">
          <button type="button" aria-label="Fermer les filtres" className="absolute inset-0 bg-ink/40 animate-fade" onClick={() => setOpen(false)} />
          <div className="absolute inset-x-0 bottom-0 flex max-h-[88dvh] flex-col rounded-t-[10px] bg-paper animate-fade-up">
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <p className="label">Filtrer</p>
              <button type="button" onClick={() => setOpen(false)} aria-label="Fermer" className="-mr-2 p-2"><IconClose className="h-6 w-6" /></button>
            </div>
            <div className="flex-1 overflow-y-auto px-5">
              <FilterBody facets={facets} showCategories={showCategories} />
            </div>
            <div className="border-t border-line p-4">
              <button type="button" onClick={() => setOpen(false)} className="btn btn-primary w-full">
                {pending ? "Mise à jour…" : `Voir ${count} produit${count > 1 ? "s" : ""}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
