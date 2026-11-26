import Image from "next/image";
import Link from "next/link";
import { adminPage } from "@/lib/auth";
import { formatPrice } from "@/lib/money";
import { toggleProductAction } from "../actions";
import { PageTitle } from "@/components/admin/ui";

export const metadata = { title: "Produits" };

type Row = { id: string; name: string; brand: string; slug: string; gender: string; price_cents: number; sale_price_cents: number | null; active: boolean; category: { name: string } | null; images: { url: string; position: number }[]; variants: { stock: number }[] };

export default async function ProductsAdmin({ searchParams }: { searchParams: Promise<{ q?: string; genre?: string; stock?: string; supprime?: string }> }) {
  const { sb } = await adminPage();
  const sp = await searchParams;
  let query = sb.from("products").select("id, name, brand, slug, gender, price_cents, sale_price_cents, active, category:categories(name), images:product_images(url, position), variants:product_variants(stock)").order("created_at", { ascending: false });
  if (sp.genre === "femme" || sp.genre === "homme") query = query.eq("gender", sp.genre);
  if (sp.q) query = query.ilike("name", `%${sp.q.replace(/[%_]/g, "").slice(0, 60)}%`);
  const { data } = await query;
  let rows = (data ?? []) as unknown as Row[];
  if (sp.stock === "rupture") rows = rows.filter((r) => r.variants.reduce((s, v) => s + v.stock, 0) === 0);

  return (
    <>
      <PageTitle kicker="Catalogue" title="Produits">
        <Link href="/admin/produits/nouveau" className="btn btn-primary">Ajouter un produit</Link>
      </PageTitle>
      {sp.supprime && <p className="mb-4 bg-sand px-4 py-2 text-sm">Produit supprimé.</p>}
      <form className="mb-6 flex flex-wrap gap-3">
        <input name="q" defaultValue={sp.q} placeholder="Rechercher un produit" className="field max-w-xs min-h-10 py-2" />
        <select name="genre" defaultValue={sp.genre ?? ""} className="field w-auto min-h-10 py-2"><option value="">Femme & homme</option><option value="femme">Femme</option><option value="homme">Homme</option></select>
        <select name="stock" defaultValue={sp.stock ?? ""} className="field w-auto min-h-10 py-2"><option value="">Tous les stocks</option><option value="rupture">En rupture</option></select>
        <button className="btn btn-outline min-h-10">Filtrer</button>
      </form>
      {rows.length === 0 ? (
        <p className="border border-line bg-white/60 p-10 text-center text-graphite">Aucun produit. Commencez par <Link href="/admin/produits/nouveau" className="link-static">ajouter votre premier produit</Link>.</p>
      ) : (
        <div className="overflow-x-auto border border-line bg-white/60">
          <table className="w-full min-w-[48rem] text-sm">
            <thead><tr className="border-b border-line text-left text-xs text-mist"><th className="p-3 font-normal">Produit</th><th className="font-normal">Catégorie</th><th className="font-normal">Prix</th><th className="font-normal">Stock</th><th className="font-normal">Statut</th><th /></tr></thead>
            <tbody>
              {rows.map((p) => {
                const stock = p.variants.reduce((s, v) => s + v.stock, 0);
                const img = [...p.images].sort((a, b) => a.position - b.position)[0];
                return (
                  <tr key={p.id} className="border-b border-line last:border-0">
                    <td className="p-3">
                      <Link href={`/admin/produits/${p.id}`} className="flex items-center gap-3">
                        <span className="relative block h-14 w-12 shrink-0 overflow-hidden bg-sand">{img && <Image src={img.url} alt="" fill sizes="48px" className="object-cover" />}</span>
                        <span><span className="block font-medium hover:underline">{p.name}</span><span className="text-xs text-mist">{p.brand || "—"}</span></span>
                      </Link>
                    </td>
                    <td className="capitalize">{p.gender} · {p.category?.name ?? "—"}</td>
                    <td className="tabular-nums">{p.sale_price_cents ? <><span className="text-oxblood">{formatPrice(p.sale_price_cents)}</span> <s className="text-xs text-mist">{formatPrice(p.price_cents)}</s></> : formatPrice(p.price_cents)}</td>
                    <td className={stock === 0 ? "text-oxblood" : ""}>{stock === 0 ? "Rupture" : stock}</td>
                    <td>
                      <form action={toggleProductAction}>
                        <input type="hidden" name="id" value={p.id} />
                        <input type="hidden" name="active" value={String(!p.active)} />
                        <button className={`px-2 py-0.5 text-xs ${p.active ? "bg-[#e3ead9] text-moss" : "bg-sand text-mist"}`} title={p.active ? "Désactiver" : "Activer"}>{p.active ? "En ligne" : "Hors ligne"}</button>
                      </form>
                    </td>
                    <td className="pr-3 text-right"><Link href={`/admin/produits/${p.id}`} className="text-xs underline underline-offset-4">Modifier</Link></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
