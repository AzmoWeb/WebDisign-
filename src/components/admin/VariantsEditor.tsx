"use client";
import { useState, useTransition } from "react";
import { saveVariantsAction } from "@/app/admin/actions";

type V = { id?: string; color: string; color_hex: string; size: string; stock: number; sku?: string | null };

export function VariantsEditor({ productId, initial, gender }: { productId: string; initial: V[]; gender: string }) {
  const [rows, setRows] = useState<V[]>(initial);
  const [msg, setMsg] = useState<{ ok?: boolean; text: string } | null>(null);
  const [pending, start] = useTransition();
  const [bulk, setBulk] = useState({ color: "", hex: "#1a1816", from: gender === "homme" ? "39" : "35", to: gender === "homme" ? "46" : "42", stock: "0" });

  const set = (i: number, patch: Partial<V>) => setRows((r) => r.map((x, k) => (k === i ? { ...x, ...patch } : x)));
  const addBulk = () => {
    const from = parseInt(bulk.from), to = parseInt(bulk.to);
    if (!bulk.color.trim() || !Number.isFinite(from) || !Number.isFinite(to) || to < from || to - from > 20) return setMsg({ text: "Renseignez un coloris et une plage de pointures valide." });
    const add: V[] = [];
    for (let s = from; s <= to; s++) if (!rows.some((r) => r.color === bulk.color.trim() && r.size === String(s))) add.push({ color: bulk.color.trim(), color_hex: bulk.hex, size: String(s), stock: Math.max(0, parseInt(bulk.stock) || 0) });
    setRows((r) => [...r, ...add]);
    setMsg(null);
  };
  const save = () => start(async () => {
    const res = await saveVariantsAction(productId, rows.map((r) => ({ ...r, stock: Number(r.stock) || 0 })));
    setMsg({ ok: res?.ok, text: res?.error ?? res?.message ?? "" });
  });
  const total = rows.reduce((s, r) => s + (Number(r.stock) || 0), 0);

  return (
    <div>
      <div className="grid items-end gap-3 border border-dashed border-stone p-4 sm:grid-cols-6">
        <label className="sm:col-span-2"><span className="field-label">Coloris</span><input value={bulk.color} onChange={(e) => setBulk({ ...bulk, color: e.target.value })} className="field min-h-10 py-2" placeholder="Noir" /></label>
        <label><span className="field-label">Teinte</span><input type="color" value={bulk.hex} onChange={(e) => setBulk({ ...bulk, hex: e.target.value })} className="h-10 w-full border border-line bg-paper" /></label>
        <label><span className="field-label">Pointures de</span><input value={bulk.from} onChange={(e) => setBulk({ ...bulk, from: e.target.value })} inputMode="numeric" className="field min-h-10 py-2" /></label>
        <label><span className="field-label">à</span><input value={bulk.to} onChange={(e) => setBulk({ ...bulk, to: e.target.value })} inputMode="numeric" className="field min-h-10 py-2" /></label>
        <label><span className="field-label">Stock initial</span><input value={bulk.stock} onChange={(e) => setBulk({ ...bulk, stock: e.target.value })} inputMode="numeric" className="field min-h-10 py-2" /></label>
        <button type="button" onClick={addBulk} className="btn btn-outline min-h-10 sm:col-span-6">Ajouter ces pointures</button>
      </div>

      {rows.length > 0 && (
        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[36rem] text-sm">
            <thead><tr className="text-left text-xs text-mist"><th className="py-2 font-normal">Coloris</th><th className="font-normal">Teinte</th><th className="font-normal">Pointure</th><th className="font-normal">Stock</th><th className="font-normal">Réf.</th><th /></tr></thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={r.id ?? `n${i}`} className="border-t border-line">
                  <td className="py-1.5 pr-2"><input value={r.color} onChange={(e) => set(i, { color: e.target.value })} className="field min-h-9 py-1" aria-label="Coloris" /></td>
                  <td className="pr-2"><input type="color" value={r.color_hex} onChange={(e) => set(i, { color_hex: e.target.value })} className="h-9 w-12 border border-line" aria-label="Teinte" /></td>
                  <td className="pr-2"><input value={r.size} onChange={(e) => set(i, { size: e.target.value })} className="field min-h-9 w-20 py-1" aria-label="Pointure" /></td>
                  <td className="pr-2"><input type="number" min={0} value={r.stock} onChange={(e) => set(i, { stock: Number(e.target.value) })} className={`field min-h-9 w-24 py-1 ${Number(r.stock) === 0 ? "text-oxblood" : ""}`} aria-label="Stock" /></td>
                  <td className="pr-2"><input value={r.sku ?? ""} onChange={(e) => set(i, { sku: e.target.value })} className="field min-h-9 w-28 py-1" aria-label="Référence" /></td>
                  <td><button type="button" onClick={() => setRows((x) => x.filter((_, k) => k !== i))} className="text-xs text-oxblood underline">Retirer</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className="mt-5 flex flex-wrap items-center gap-4">
        <button type="button" onClick={save} disabled={pending} className="btn btn-primary">{pending ? "Enregistrement…" : "Enregistrer les stocks"}</button>
        <span className="text-sm text-graphite">{rows.length} déclinaison(s) · {total} paire(s) en stock</span>
        {msg && <span className={`text-sm ${msg.ok ? "text-moss" : "text-oxblood"}`} role="status">{msg.text}</span>}
      </div>
    </div>
  );
}
