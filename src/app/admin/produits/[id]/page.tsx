import Link from "next/link";
import { notFound } from "next/navigation";
import { adminPage } from "@/lib/auth";
import { PageTitle, Panel } from "@/components/admin/ui";
import { ProductForm } from "@/components/admin/ProductForm";
import { VariantsEditor } from "@/components/admin/VariantsEditor";
import { ImagesManager } from "@/components/admin/ImagesManager";
import { deleteProductAction } from "../../actions";
import { ConfirmButton } from "@/components/admin/ConfirmButton";

export const metadata = { title: "Modifier le produit" };

export default async function EditProduct({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ cree?: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/.test(id)) notFound();
  const { sb } = await adminPage();
  const [{ data: p }, { data: cats }, { count: alerts }] = await Promise.all([
    sb.from("products").select("*, images:product_images(id, url, alt, color, position), variants:product_variants(id, color, color_hex, size, stock, sku)").eq("id", id).maybeSingle(),
    sb.from("categories").select("id, name, gender").order("position"),
    sb.from("stock_alerts").select("id", { count: "exact", head: true }).eq("product_id", id).is("notified_at", null),
  ]);
  if (!p) notFound();
  const sp = await searchParams;
  const images = [...p.images].sort((a: { position: number }, b: { position: number }) => a.position - b.position);
  const variants = [...p.variants].sort((a: { color: string; size: string }, b: { color: string; size: string }) => a.color.localeCompare(b.color) || parseFloat(a.size) - parseFloat(b.size));
  const colors = [...new Set(variants.map((v: { color: string }) => v.color))] as string[];
  return (
    <>
      <Link href="/admin/produits" className="text-sm underline underline-offset-4">← Produits</Link>
      <PageTitle kicker={p.active ? "En ligne" : "Hors ligne"} title={p.name}>
        <Link href={`/produit/${p.slug}`} target="_blank" className="btn btn-outline">Voir sur le site</Link>
      </PageTitle>
      {sp.cree && <p className="mb-4 bg-[#e3ead9] px-4 py-2 text-sm text-moss">Produit créé. Ajoutez maintenant ses pointures, ses stocks et ses photos, puis mettez-le en ligne.</p>}
      <div className="space-y-6">
        <Panel title="Informations"><ProductForm product={p} categories={cats ?? []} /></Panel>
        <Panel title="Pointures, coloris et stocks" actions={alerts ? <span className="text-xs text-oxblood">{alerts} client(s) attendent un retour en stock</span> : undefined}><VariantsEditor productId={p.id} initial={variants} gender={p.gender} /></Panel>
        <Panel title="Photographies"><ImagesManager productId={p.id} images={images} colors={colors} /></Panel>
        <Panel title="Zone sensible">
          <form action={deleteProductAction} className="flex flex-wrap items-center gap-4">
            <input type="hidden" name="id" value={p.id} />
            <p className="text-sm text-graphite">La suppression est définitive (les commandes passées conservent leur historique).</p>
            <ConfirmButton message="Supprimer définitivement ce produit et ses photos ?" className="btn border-oxblood text-oxblood hover:bg-oxblood hover:text-ivory">Supprimer le produit</ConfirmButton>
          </form>
        </Panel>
      </div>
    </>
  );
}
