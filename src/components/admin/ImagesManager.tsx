"use client";
import Image from "next/image";
import { useActionState } from "react";
import { updateImageAction, uploadProductImageAction } from "@/app/admin/actions";

type Img = { id: string; url: string; alt: string; color: string | null };

export function ImagesManager({ productId, images, colors }: { productId: string; images: Img[]; colors: string[] }) {
  const [state, action, pending] = useActionState(uploadProductImageAction, null);
  return (
    <div>
      {images.length > 0 && (
        <ul className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
          {images.map((im, i) => (
            <li key={im.id} className="border border-line bg-paper">
              <div className="relative aspect-[4/5] bg-sand"><Image src={im.url} alt={im.alt} fill sizes="200px" className="object-cover" />{i === 0 && <span className="absolute top-2 left-2 bg-ink px-2 py-0.5 text-[0.65rem] text-ivory">Principale</span>}</div>
              <form action={updateImageAction} className="space-y-2 p-3">
                <input type="hidden" name="id" value={im.id} />
                <input name="alt" defaultValue={im.alt} placeholder="Texte alternatif" className="field min-h-8 py-1 text-xs" aria-label="Texte alternatif" />
                <select name="color" defaultValue={im.color ?? ""} className="field min-h-8 py-1 text-xs" aria-label="Coloris associé">
                  <option value="">Tous coloris</option>
                  {colors.map((c) => <option key={c}>{c}</option>)}
                </select>
                <div className="flex flex-wrap gap-2 text-xs">
                  <button name="op" value="meta" className="underline">Enregistrer</button>
                  <button name="op" value="up" className="underline" disabled={i === 0}>↑</button>
                  <button name="op" value="down" className="underline" disabled={i === images.length - 1}>↓</button>
                  <button name="op" value="delete" className="ml-auto text-oxblood underline">Supprimer</button>
                </div>
              </form>
            </li>
          ))}
        </ul>
      )}
      <form action={action} className="grid items-end gap-3 border border-dashed border-stone p-4 sm:grid-cols-6">
        <input type="hidden" name="product_id" value={productId} />
        <label className="sm:col-span-6"><span className="field-label">Photos (JPEG, PNG, WebP ou AVIF — 5 Mo max., 10 à la fois)</span><input type="file" name="files" multiple accept="image/jpeg,image/png,image/webp,image/avif" required className="block w-full text-sm" /></label>
        <label className="sm:col-span-3"><span className="field-label">Texte alternatif (décrit la photo)</span><input name="alt" maxLength={200} className="field min-h-10 py-2" placeholder="Bottine en cuir noir, vue de profil" /></label>
        <label className="sm:col-span-2"><span className="field-label">Coloris</span><select name="color" className="field min-h-10 py-2"><option value="">Tous</option>{colors.map((c) => <option key={c}>{c}</option>)}</select></label>
        <button className="btn btn-primary min-h-10" disabled={pending}>{pending ? "Envoi…" : "Ajouter"}</button>
        {state?.error && <p className="text-sm text-oxblood sm:col-span-6" role="alert">{state.error}</p>}
        {state?.message && <p className="text-sm text-moss sm:col-span-6" role="status">{state.message}</p>}
      </form>
    </div>
  );
}
