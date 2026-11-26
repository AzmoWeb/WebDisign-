import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/money";
import { ORDER_STATUS_LABEL } from "@/lib/order-status";
import { shippingLabel } from "@/lib/shipping";
import type { OrderStatus } from "@/lib/types";

export const metadata = { title: "Détail de commande", robots: { index: false } };

export default async function OrderDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/.test(id)) notFound();
  const user = await requireUser(`/compte/commandes/${id}`);
  const sb = (await createSupabaseServerClient())!;
  // La RLS garantit en plus que seul le propriétaire peut lire la commande
  const { data: o } = await sb.from("orders").select("*, items:order_items(*), events:order_events(status, note, created_at)").eq("id", id).eq("user_id", user.id).maybeSingle();
  if (!o) notFound();
  const addr = o.shipping_address as { line1: string; line2?: string; postalCode: string; city: string } | null;
  return (
    <section>
      <Link href="/compte/commandes" className="text-sm underline underline-offset-4">← Mes commandes</Link>
      <h2 className="display mt-6 text-2xl">Commande {o.order_number}</h2>
      <p className="mt-2 text-sm text-graphite">Passée le {new Date(o.created_at).toLocaleDateString("fr-FR")} · {ORDER_STATUS_LABEL[o.status as OrderStatus]}</p>
      {o.tracking_number && (
        <p className="mt-4 text-sm">Suivi : {o.tracking_url ? <a href={o.tracking_url} target="_blank" rel="noopener noreferrer" className="link-static">{o.tracking_number}</a> : o.tracking_number}</p>
      )}
      <ul className="mt-8 divide-y divide-line border-y border-line">
        {o.items.map((it: { id: string; name: string; brand: string; size: string; color: string; quantity: number; unit_price_cents: number }) => (
          <li key={it.id} className="flex justify-between gap-4 py-4 text-sm">
            <span>{it.name}<span className="block text-xs text-graphite">{it.brand ? `${it.brand} · ` : ""}{it.color} · Pointure {it.size} · Qté {it.quantity}</span></span>
            <span className="tabular-nums">{formatPrice(it.unit_price_cents * it.quantity)}</span>
          </li>
        ))}
      </ul>
      <dl className="mt-4 ml-auto max-w-xs space-y-1 text-sm">
        <div className="flex justify-between"><dt>Sous-total</dt><dd>{formatPrice(o.subtotal_cents)}</dd></div>
        <div className="flex justify-between"><dt>Livraison</dt><dd>{formatPrice(o.shipping_cents)}</dd></div>
        {o.discount_cents > 0 && <div className="flex justify-between"><dt>Remise</dt><dd>−{formatPrice(o.discount_cents)}</dd></div>}
        <div className="flex justify-between font-medium"><dt>Total</dt><dd>{formatPrice(o.total_cents - o.discount_cents)}</dd></div>
      </dl>
      <div className="mt-10 grid gap-8 sm:grid-cols-2">
        <div>
          <p className="label text-mist">Livraison</p>
          <p className="mt-2 text-sm">{shippingLabel(o.shipping_method, o.shipping_label)}</p>
          {addr && <p className="mt-1 text-sm">{addr.line1}{addr.line2 ? `, ${addr.line2}` : ""}<br />{addr.postalCode} {addr.city}</p>}
          {o.relay_point && <p className="mt-1 text-sm">Point relais : {o.relay_point}</p>}
        </div>
        <div>
          <p className="label text-mist">Suivi</p>
          <ol className="mt-2 space-y-2 text-sm">
            {[...o.events].sort((a: { created_at: string }, b: { created_at: string }) => a.created_at.localeCompare(b.created_at)).map((e: { status: string; note: string | null; created_at: string }, i: number) => (
              <li key={i}><span className="text-graphite">{new Date(e.created_at).toLocaleDateString("fr-FR")}</span> — {ORDER_STATUS_LABEL[e.status as OrderStatus] ?? e.status}</li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
