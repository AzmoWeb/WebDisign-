"use client";
import { useActionState } from "react";
import { saveProductAction } from "@/app/admin/actions";

type Cat = { id: string; name: string; gender: string };
type P = { id: string; name: string; slug: string; brand: string; description: string; gender: string; category_id: string | null; price_cents: number; sale_price_cents: number | null; is_new: boolean; is_bestseller: boolean; is_featured: boolean; active: boolean };

const eur = (c: number | null | undefined) => (c == null ? "" : (c / 100).toFixed(2).replace(".", ","));

export function ProductForm({ product, categories }: { product?: P; categories: Cat[] }) {
  const [state, action, pending] = useActionState(saveProductAction, null);
  return (
    <form action={action} className="grid gap-5 md:grid-cols-6">
      {product && <input type="hidden" name="id" value={product.id} />}
      {state?.error && <p className="bg-[#f1dcd8] px-4 py-2 text-sm text-oxblood md:col-span-6" role="alert">{state.error}</p>}
      {state?.message && <p className="bg-[#e3ead9] px-4 py-2 text-sm text-moss md:col-span-6" role="status">{state.message}</p>}
      <label className="md:col-span-4"><span className="field-label">Nom du produit *</span><input name="name" defaultValue={product?.name} required maxLength={160} className="field" /></label>
      <label className="md:col-span-2"><span className="field-label">Marque</span><input name="brand" defaultValue={product?.brand} maxLength={80} className="field" /></label>
      <label className="md:col-span-6"><span className="field-label">Adresse de la page (slug) — générée depuis le nom si vide</span><input name="slug" defaultValue={product?.slug} maxLength={90} pattern="[a-z0-9-]*" className="field" placeholder="ex. bottine-cuir-noir" /></label>
      <label className="md:col-span-6"><span className="field-label">Description</span><textarea name="description" defaultValue={product?.description} rows={5} maxLength={5000} className="field" /></label>
      <label className="md:col-span-2"><span className="field-label">Univers *</span>
        <select name="gender" defaultValue={product?.gender ?? "femme"} className="field"><option value="femme">Femme</option><option value="homme">Homme</option><option value="mixte">Mixte</option></select>
      </label>
      <label className="md:col-span-4"><span className="field-label">Catégorie</span>
        <select name="category_id" defaultValue={product?.category_id ?? ""} className="field">
          <option value="">— Aucune —</option>
          {["femme", "homme"].map((g) => (
            <optgroup key={g} label={g === "femme" ? "Femme" : "Homme"}>
              {categories.filter((c) => c.gender === g).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </optgroup>
          ))}
        </select>
      </label>
      <label className="md:col-span-3"><span className="field-label">Prix TTC (€) *</span><input name="price" defaultValue={eur(product?.price_cents)} required inputMode="decimal" pattern="[0-9]+([,.][0-9]{1,2})?" className="field" /></label>
      <label className="md:col-span-3"><span className="field-label">Prix promotionnel TTC (€) — vide si aucune promotion</span><input name="sale_price" defaultValue={eur(product?.sale_price_cents)} inputMode="decimal" pattern="[0-9]+([,.][0-9]{1,2})?" className="field" /></label>
      <fieldset className="flex flex-wrap gap-x-8 gap-y-3 text-sm md:col-span-6">
        <legend className="field-label">Mise en avant</legend>
        {[["is_new", "Nouveauté", product?.is_new], ["is_bestseller", "Meilleure vente", product?.is_bestseller], ["is_featured", "Coup de cœur", product?.is_featured]].map(([n, l, v]) => (
          <label key={n as string} className="flex items-center gap-2"><input type="checkbox" name={n as string} defaultChecked={Boolean(v)} className="accent-ink" />{l}</label>
        ))}
      </fieldset>
      <label className="flex items-center gap-3 border-t border-line pt-5 text-sm md:col-span-6">
        <input type="checkbox" name="active" defaultChecked={product?.active ?? false} className="accent-ink" />
        <span><strong className="font-medium">Produit en ligne</strong> — visible et vendable sur la boutique</span>
      </label>
      <div className="md:col-span-6"><button className="btn btn-primary" disabled={pending}>{pending ? "Enregistrement…" : product ? "Enregistrer" : "Créer le produit"}</button></div>
    </form>
  );
}
