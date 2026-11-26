/** Marques distribuées en magasin — présentation typographique (aucun logo reproduit sans autorisation). */
export function BrandsBand({ brands, title = "Les marques du magasin" }: { brands: string[]; title?: string }) {
  if (!brands.length) return null;
  return (
    <section aria-labelledby="marques-title" className="border-y border-line">
      <div className="container-site py-14 text-center md:py-20">
        <p className="label text-mist">Femme & homme</p>
        <h2 id="marques-title" className="display mt-3 text-[2rem] md:text-[2.6rem]">{title}</h2>
        <ul className="mx-auto mt-10 flex max-w-5xl flex-wrap items-center justify-center gap-x-3 gap-y-4 md:gap-x-5">
          {brands.map((b, i) => (
            <li key={b} className="flex items-center gap-3 md:gap-5">
              <span className="display text-[1.35rem] tracking-[0.06em] uppercase md:text-[1.75rem]">{b}</span>
              {i < brands.length - 1 && <span className="h-1 w-1 rounded-full bg-stone" aria-hidden="true" />}
            </li>
          ))}
        </ul>
        <p className="mt-10 text-sm text-graphite">À découvrir en magasin, au 110 Grande Rue de la Résistance à Bar-sur-Seine.</p>
      </div>
    </section>
  );
}
