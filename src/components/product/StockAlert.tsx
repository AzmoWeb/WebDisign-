"use client";
import { useState, useTransition } from "react";
import type { ProductVariant } from "@/lib/types";
import { stockAlertAction } from "@/app/actions/product";

/** « Votre pointure est épuisée ? » — inscription à l'alerte de retour en stock. */
export function StockAlert({ soldOut }: { soldOut: ProductVariant[] }) {
  const [open, setOpen] = useState(false);
  const [variantId, setVariantId] = useState(soldOut[0]?.id ?? "");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);
  const [pending, start] = useTransition();
  if (!soldOut.length) return null;
  if (!open)
    return (
      <button type="button" onClick={() => setOpen(true)} className="mt-1 text-sm underline underline-offset-4">
        Votre pointure est épuisée ? Être prévenu(e) de son retour
      </button>
    );
  if (result?.ok) return <p className="mt-2 bg-sand px-4 py-3 text-sm" role="status">{result.message}</p>;
  return (
    <form
      className="mt-3 space-y-3 border border-line bg-paper p-4"
      onSubmit={(e) => {
        e.preventDefault();
        start(async () => setResult(await stockAlertAction(variantId, email, website)));
      }}
    >
      <p className="text-sm font-medium">Prévenez-moi du retour en stock</p>
      <div className="grid gap-3 sm:grid-cols-[7rem_1fr]">
        <label className="block"><span className="field-label">Pointure</span>
          <select value={variantId} onChange={(e) => setVariantId(e.target.value)} className="field min-h-11 py-2">
            {soldOut.map((v) => <option key={v.id} value={v.id}>{v.size}</option>)}
          </select>
        </label>
        <label className="block"><span className="field-label">Adresse e-mail</span>
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" className="field min-h-11 py-2" />
        </label>
      </div>
      <input type="text" tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} className="hidden" aria-hidden="true" />
      <p className="text-xs text-mist">Un seul e-mail vous sera envoyé, au retour de cette pointure. Votre adresse n&apos;est utilisée pour rien d&apos;autre.</p>
      {result && !result.ok && <p className="text-sm text-oxblood" role="alert">{result.message}</p>}
      <div className="flex gap-3">
        <button className="btn btn-primary min-h-11" disabled={pending}>{pending ? "Envoi…" : "Me prévenir"}</button>
        <button type="button" onClick={() => setOpen(false)} className="text-sm underline underline-offset-4">Annuler</button>
      </div>
    </form>
  );
}
