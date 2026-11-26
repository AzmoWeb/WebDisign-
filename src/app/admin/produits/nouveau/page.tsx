import Link from "next/link";
import { adminPage } from "@/lib/auth";
import { PageTitle, Panel } from "@/components/admin/ui";
import { ProductForm } from "@/components/admin/ProductForm";

export const metadata = { title: "Nouveau produit" };

export default async function NewProduct() {
  const { sb } = await adminPage();
  const { data: cats } = await sb.from("categories").select("id, name, gender").order("position");
  return (
    <>
      <Link href="/admin/produits" className="text-sm underline underline-offset-4">← Produits</Link>
      <PageTitle kicker="Catalogue" title="Nouveau produit" />
      <Panel><ProductForm categories={cats ?? []} /></Panel>
      <p className="mt-4 text-sm text-graphite">Après création, vous pourrez ajouter les photos, les pointures et les stocks.</p>
    </>
  );
}
