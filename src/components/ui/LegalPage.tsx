import { Breadcrumbs } from "./Breadcrumbs";

/** Emplacement d'une information que le commerçant doit fournir. */
export function Todo({ children }: { children: React.ReactNode }) {
  return <mark className="placeholder-legal">[À compléter : {children}]</mark>;
}

export function LegalPage({ title, href, updated, children }: { title: string; href: string; updated?: string; children: React.ReactNode }) {
  return (
    <div className="container-site pt-8">
      <Breadcrumbs items={[{ name: "Accueil", href: "/" }, { name: title, href }]} />
      <div className="mx-auto mt-10 max-w-3xl">
        <h1 className="display text-[2.6rem] md:text-[3.4rem]">{title}</h1>
        {updated && <p className="mt-3 text-sm text-mist">Dernière mise à jour : {updated}</p>}
        <p className="mt-8 border-l-2 border-[#c9a24a] bg-[#f8efd9] px-5 py-4 text-sm text-[#4d3a12]">
          Document à compléter et à faire valider par le commerçant (et, si besoin, par un professionnel du droit) avant la mise en ligne de la boutique. Les mentions surlignées doivent être renseignées.
        </p>
        <div className="prose-ajp mt-10">{children}</div>
      </div>
    </div>
  );
}
