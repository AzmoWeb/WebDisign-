import { Suspense } from "react";
import type { CatalogFilters } from "@/lib/types";
import { getProducts, parseSearchParams } from "@/lib/catalog";
import { ProductCard } from "@/components/product/ProductCard";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { ActiveFilters, FilterSidebar, MobileFilters, SortSelect } from "./Filters";
import Link from "next/link";

type Props = {
  title: string;
  kicker?: string;
  intro?: string;
  base: CatalogFilters;
  searchParams: Record<string, string | string[] | undefined>;
  breadcrumbs: { name: string; href: string }[];
  subNav?: { name: string; href: string; active?: boolean }[];
  seoText?: string;
};

export async function CatalogView({ title, kicker, intro, base, searchParams, breadcrumbs, subNav, seoText }: Props) {
  const f = { ...parseSearchParams(searchParams), ...base };
  const { products, facets } = await getProducts(f);
  const showCategories = !base.category;
  return (
    <div className="container-site pt-8 pb-10">
      <Breadcrumbs items={breadcrumbs} />
      <header className="mt-8 mb-8 md:mb-12">
        {kicker && <p className="label text-mist">{kicker}</p>}
        <h1 className="display mt-2 text-[2.6rem] md:text-[3.6rem]">{title}</h1>
        {intro && <p className="mt-4 max-w-2xl text-graphite">{intro}</p>}
        {subNav && subNav.length > 0 && (
          <nav aria-label="Sous-catégories" className="no-scrollbar -mx-4 mt-8 flex gap-2 overflow-x-auto px-4">
            {subNav.map((s) => (
              <Link key={s.href} href={s.href} aria-current={s.active ? "page" : undefined}
                className={`shrink-0 border px-4 py-2 text-xs tracking-[0.12em] uppercase transition-colors ${s.active ? "border-ink bg-ink text-ivory" : "border-line hover:border-ink"}`}>
                {s.name}
              </Link>
            ))}
          </nav>
        )}
      </header>
      <Suspense>
        <div className="grid gap-10 lg:grid-cols-[15rem_1fr] xl:grid-cols-[16.5rem_1fr]">
          <FilterSidebar facets={facets} showCategories={showCategories} />
          <div>
            <div className="mb-6 flex items-center justify-between gap-4 border-b border-line pb-4">
              <p className="text-sm text-graphite" aria-live="polite">
                {products.length} produit{products.length > 1 ? "s" : ""}
              </p>
              <div className="flex items-center gap-3">
                <MobileFilters facets={facets} showCategories={showCategories} count={products.length} />
                <SortSelect />
              </div>
            </div>
            <ActiveFilters />
            {products.length ? (
              <ul className="grid grid-cols-2 gap-x-4 gap-y-12 md:grid-cols-3 md:gap-x-6">
                {products.map((p, i) => (
                  <li key={p.id}>
                    <ProductCard product={p} priority={i < 3} />
                  </li>
                ))}
              </ul>
            ) : (
              <div className="py-20 text-center">
                <p className="display text-2xl">Aucun produit ne correspond</p>
                <p className="mt-3 text-graphite">Essayez de retirer certains filtres.</p>
              </div>
            )}
          </div>
        </div>
      </Suspense>
      {seoText && (
        <section className="mt-24 max-w-3xl border-t border-line pt-10 text-sm leading-relaxed text-graphite">
          <p>{seoText}</p>
        </section>
      )}
    </div>
  );
}
