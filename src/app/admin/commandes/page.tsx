import Link from "next/link";
import { adminPage } from "@/lib/auth";
import { formatPrice } from "@/lib/money";
import { ORDER_STATUS_LABEL } from "@/lib/order-status";
import type { OrderStatus } from "@/lib/types";
import { PageTitle, StatusBadge } from "@/components/admin/ui";

export const metadata = { title: "Commandes" };

export default async function OrdersAdmin({ searchParams }: { searchParams: Promise<{ statut?: string; q?: string }> }) {
  const { sb } = await adminPage();
  const sp = await searchParams;
  let q = sb.from("orders").select("id, order_number, first_name, last_name, email, total_cents, status, payment_status, shipping_method, created_at").order("created_at", { ascending: false }).limit(200);
  if (sp.statut && sp.statut in ORDER_STATUS_LABEL) q = q.eq("status", sp.statut);
  if (sp.q) {
    const term = sp.q.replace(/[%_,()]/g, "").slice(0, 60);
    q = q.or(`order_number.ilike.%${term}%,email.ilike.%${term}%,last_name.ilike.%${term}%`);
  }
  const { data } = await q;
  return (
    <>
      <PageTitle kicker="Ventes" title="Commandes" />
      <form className="mb-6 flex flex-wrap gap-3">
        <input name="q" defaultValue={sp.q} placeholder="N°, e-mail ou nom" className="field max-w-xs min-h-10 py-2" />
        <select name="statut" defaultValue={sp.statut ?? ""} className="field w-auto min-h-10 py-2">
          <option value="">Tous les statuts</option>
          {Object.entries(ORDER_STATUS_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <button className="btn btn-outline min-h-10">Filtrer</button>
      </form>
      {!data?.length ? (
        <p className="border border-line bg-white/60 p-10 text-center text-graphite">Aucune commande.</p>
      ) : (
        <div className="overflow-x-auto border border-line bg-white/60">
          <table className="w-full min-w-[46rem] text-sm">
            <thead><tr className="border-b border-line text-left text-xs text-mist"><th className="p-3 font-normal">N°</th><th className="font-normal">Date</th><th className="font-normal">Client</th><th className="font-normal">Mode</th><th className="font-normal">Statut</th><th className="pr-3 text-right font-normal">Total</th></tr></thead>
            <tbody>
              {data.map((o) => (
                <tr key={o.id} className="border-b border-line last:border-0 hover:bg-paper">
                  <td className="p-3"><Link href={`/admin/commandes/${o.id}`} className="font-medium hover:underline">{o.order_number}</Link></td>
                  <td className="text-graphite">{new Date(o.created_at).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" })}</td>
                  <td>{o.first_name} {o.last_name}<span className="block text-xs text-mist">{o.email}</span></td>
                  <td>{o.shipping_method === "pickup" ? "Retrait" : "Domicile"}</td>
                  <td><StatusBadge status={o.status} label={ORDER_STATUS_LABEL[o.status as OrderStatus]} /></td>
                  <td className="pr-3 text-right tabular-nums">{formatPrice(o.total_cents)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
