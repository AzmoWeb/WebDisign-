"use client";
import { useActionState } from "react";
import { updateOrderAction } from "@/app/admin/actions";
import { ORDER_STATUS_LABEL } from "@/lib/order-status";
import type { OrderStatus } from "@/lib/types";

export function OrderUpdateForm({ id, status, allowed, tracking, trackingUrl }: { id: string; status: OrderStatus; allowed: OrderStatus[]; tracking: string | null; trackingUrl: string | null }) {
  const [state, action, pending] = useActionState(updateOrderAction, null);
  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="id" value={id} />
      {state?.error && <p className="bg-[#f1dcd8] px-3 py-2 text-sm text-oxblood">{state.error}</p>}
      {state?.message && <p className="bg-[#e3ead9] px-3 py-2 text-sm text-moss">{state.message}</p>}
      <label className="block"><span className="field-label">Statut</span>
        <select name="status" defaultValue={status} className="field" disabled={!allowed.length}>
          <option value={status}>{ORDER_STATUS_LABEL[status]} (actuel)</option>
          {allowed.map((s) => <option key={s} value={s}>{ORDER_STATUS_LABEL[s]}</option>)}
        </select>
      </label>
      {!allowed.length && <p className="text-xs text-mist">{status === "pending" || status === "payment_failed" ? "Le statut « payée » ne peut être attribué que par la confirmation Stripe." : "Aucun changement de statut possible."}</p>}
      <label className="block"><span className="field-label">N° de suivi</span><input name="tracking_number" defaultValue={tracking ?? ""} className="field" maxLength={80} /></label>
      <label className="block"><span className="field-label">Lien de suivi (https://…)</span><input name="tracking_url" defaultValue={trackingUrl ?? ""} className="field" maxLength={300} /></label>
      <label className="block"><span className="field-label">Note interne</span><textarea name="note" rows={2} className="field" maxLength={500} /></label>
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="notify" defaultChecked className="accent-ink" /> Prévenir le client par e-mail du changement de statut</label>
      <button className="btn btn-primary w-full" disabled={pending}>Mettre à jour</button>
    </form>
  );
}
