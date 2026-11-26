"use client";
import { useActionState } from "react";
import { bulkSaleAction, savePromoCodeAction } from "@/app/admin/actions";

function Status({ state }: { state: { error?: string; message?: string } | null }) {
  if (!state) return null;
  return state.error ? <p className="bg-[#f1dcd8] px-3 py-2 text-sm text-oxblood" role="alert">{state.error}</p> : <p className="bg-[#e3ead9] px-3 py-2 text-sm text-moss" role="status">{state.message}</p>;
}

export function BulkSaleForm({ categories }: { categories: { id: string; name: string; gender: string }[] }) {
  const [state, action, pending] = useActionState(bulkSaleAction, null);
  return (
    <form action={action} className="grid items-end gap-3 sm:grid-cols-6">
      <div className="sm:col-span-6"><Status state={state} /></div>
      <label className="sm:col-span-3"><span className="field-label">Produits concernés</span>
        <select name="scope" className="field min-h-11 py-2">
          <option value="all">Tous les produits</option>
          <option value="femme">Tout l&apos;univers femme</option>
          <option value="homme">Tout l&apos;univers homme</option>
          {categories.map((c) => <option key={c.id} value={`cat:${c.id}`}>{c.gender === "femme" ? "Femme" : "Homme"} — {c.name}</option>)}
        </select>
      </label>
      <label className="sm:col-span-1"><span className="field-label">Remise (%)</span><input name="percent" type="number" min={5} max={80} defaultValue={30} className="field min-h-11 py-2" /></label>
      <button name="op" value="apply" className="btn btn-primary min-h-11 sm:col-span-1" disabled={pending}>Appliquer</button>
      <button name="op" value="remove" className="btn btn-outline min-h-11 sm:col-span-1" disabled={pending}>Retirer</button>
      <p className="text-xs text-mist sm:col-span-6">« Appliquer » remplace le prix promotionnel des produits choisis (ex. −30 % : 100 € → 70 €). « Retirer » remet ces produits à leur prix normal. Ils apparaissent automatiquement dans la page Promotions.</p>
    </form>
  );
}

export function PromoCodeForm() {
  const [state, action, pending] = useActionState(savePromoCodeAction, null);
  return (
    <form action={action} className="grid gap-3 sm:grid-cols-6">
      <div className="sm:col-span-6"><Status state={state} /></div>
      <label className="sm:col-span-2"><span className="field-label">Code *</span><input name="code" required maxLength={30} placeholder="BIENVENUE10" className="field min-h-11 py-2 uppercase" /></label>
      <label className="sm:col-span-2"><span className="field-label">Type</span>
        <select name="kind" className="field min-h-11 py-2"><option value="percent">Pourcentage (%)</option><option value="amount">Montant (€)</option></select>
      </label>
      <label className="sm:col-span-2"><span className="field-label">Valeur * (10 = 10 % ou 10 €)</span><input name="value" required inputMode="decimal" className="field min-h-11 py-2" /></label>
      <label className="sm:col-span-2"><span className="field-label">Achat minimum (€)</span><input name="min" inputMode="decimal" placeholder="0" className="field min-h-11 py-2" /></label>
      <label className="sm:col-span-2"><span className="field-label">Valable du</span><input name="starts_at" type="date" className="field min-h-11 py-2" /></label>
      <label className="sm:col-span-2"><span className="field-label">au (inclus)</span><input name="ends_at" type="date" className="field min-h-11 py-2" /></label>
      <label className="sm:col-span-2"><span className="field-label">Utilisations max. (vide = illimité)</span><input name="max_uses" type="number" min={1} className="field min-h-11 py-2" /></label>
      <label className="sm:col-span-4"><span className="field-label">Note interne</span><input name="description" maxLength={200} placeholder="Ex. offre de bienvenue newsletter" className="field min-h-11 py-2" /></label>
      <label className="flex items-center gap-2 text-sm sm:col-span-6"><input type="checkbox" name="active" defaultChecked className="accent-ink" /> Actif</label>
      <div className="sm:col-span-6"><button className="btn btn-primary" disabled={pending}>Créer le code</button></div>
    </form>
  );
}
