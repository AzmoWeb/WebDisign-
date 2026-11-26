import Link from "next/link";
import { notFound } from "next/navigation";
import { adminPage } from "@/lib/auth";
import { formatPrice } from "@/lib/money";
import { ADMIN_TRANSITIONS, ORDER_STATUS_LABEL } from "@/lib/order-status";
import type { OrderStatus } from "@/lib/types";
import { PageTitle, Panel, StatusBadge } from "@/components/admin/ui";
import { OrderUpdateForm } from "@/components/admin/OrderUpdateForm";
import { shippingLabel } from "@/lib/shipping";

export const metadata = { title: "Commande" };

export default async function OrderAdmin({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/.test(id)) notFound();
  const { sb } = await adminPage();
  const { data: o } = await sb.from("orders").select("*, items:order_items(*), events:order_events(*)").eq("id", id).maybeSingle();
  if (!o) notFound();
  const addr = o.shipping_address as { line1: string; line2?: string; postalCode: string; city: string } | null;
  const status = o.status as OrderStatus;
  const live = process.env.STRIPE_SECRET_KEY?.startsWith("sk_live") ? "" : "test/";
  return (
    <>
      <Link href="/admin/commandes" className="text-sm underline underline-offset-4">← Commandes</Link>
      <PageTitle kicker={new Date(o.created_at).toLocaleString("fr-FR", { dateStyle: "long", timeStyle: "short" })} title={`Commande ${o.order_number}`}>
        <StatusBadge status={status} label={ORDER_STATUS_LABEL[status]} />
      </PageTitle>
      <div className="grid gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <Panel title="Articles">
            <ul className="divide-y divide-line">
              {o.items.map((it: { id: string; name: string; brand: string; size: string; color: string; quantity: number; unit_price_cents: number; product_id: string | null }) => (
                <li key={it.id} className="flex justify-between gap-4 py-3 text-sm">
                  <span>{it.product_id ? <Link href={`/admin/produits/${it.product_id}`} className="hover:underline">{it.name}</Link> : it.name}<span className="block text-xs text-graphite">{it.brand ? `${it.brand} · ` : ""}{it.color} · Pointure {it.size} · Qté {it.quantity} × {formatPrice(it.unit_price_cents)}</span></span>
                  <span className="tabular-nums">{formatPrice(it.unit_price_cents * it.quantity)}</span>
                </li>
              ))}
            </ul>
            <dl className="mt-4 ml-auto max-w-xs space-y-1 border-t border-line pt-4 text-sm">
              <div className="flex justify-between"><dt>Sous-total</dt><dd>{formatPrice(o.subtotal_cents)}</dd></div>
              <div className="flex justify-between"><dt>Livraison</dt><dd>{formatPrice(o.shipping_cents)}</dd></div>
              {o.discount_cents > 0 && <div className="flex justify-between"><dt>Remise (code promo)</dt><dd>−{formatPrice(o.discount_cents)}</dd></div>}
              <div className="flex justify-between font-medium"><dt>Total</dt><dd>{formatPrice(o.total_cents - o.discount_cents)}</dd></div>
            </dl>
          </Panel>
          <div className="grid gap-6 md:grid-cols-2">
            <Panel title="Client">
              <p className="text-sm leading-relaxed">{o.first_name} {o.last_name}<br /><a href={`mailto:${o.email}`} className="underline">{o.email}</a><br /><a href={`tel:${o.phone}`}>{o.phone}</a></p>
              {o.notes && <p className="mt-4 bg-sand p-3 text-sm">« {o.notes} »</p>}
            </Panel>
            <Panel title="Livraison">
              <p className="mb-2 text-sm font-medium">{shippingLabel(o.shipping_method, o.shipping_label)}</p>
              {addr ? (
                <p className="text-sm leading-relaxed">{addr.line1}{addr.line2 ? <><br />{addr.line2}</> : null}<br />{addr.postalCode} {addr.city}</p>
              ) : o.relay_point ? (
                <p className="text-sm leading-relaxed">Point relais choisi : {o.relay_point}</p>
              ) : (
                <p className="text-sm">Le client retire sa commande au magasin.</p>
              )}
            </Panel>
          </div>
          <Panel title="Paiement">
            <dl className="grid gap-2 text-sm sm:grid-cols-2">
              <div><dt className="text-xs text-mist">Statut du paiement</dt><dd>{{ paid: "Payé (confirmé par Stripe)", unpaid: "Non payé", failed: "Échec", refunded: "Remboursé", expired: "Session expirée" }[o.payment_status as string]}</dd></div>
              <div><dt className="text-xs text-mist">Montant encaissé</dt><dd>{o.amount_paid_cents != null ? formatPrice(o.amount_paid_cents) : "—"}</dd></div>
              <div><dt className="text-xs text-mist">Payé le</dt><dd>{o.paid_at ? new Date(o.paid_at).toLocaleString("fr-FR") : "—"}</dd></div>
              <div><dt className="text-xs text-mist">Référence Stripe</dt><dd className="truncate">{o.stripe_payment_intent_id ? <a href={`https://dashboard.stripe.com/${live}payments/${o.stripe_payment_intent_id}`} target="_blank" rel="noopener noreferrer" className="underline">{o.stripe_payment_intent_id}</a> : "—"}</dd></div>
            </dl>
            <p className="mt-4 text-xs text-mist">Les remboursements se font depuis le tableau de bord Stripe ; le statut est alors mis à jour automatiquement.</p>
          </Panel>
        </div>
        <div className="space-y-6">
          <Panel title="Traitement">
            <OrderUpdateForm id={o.id} status={status} allowed={ADMIN_TRANSITIONS[status] ?? []} tracking={o.tracking_number} trackingUrl={o.tracking_url} />
          </Panel>
          <Panel title="Historique">
            <ol className="space-y-3 text-sm">
              {[...o.events].sort((a: { id: number }, b: { id: number }) => b.id - a.id).map((e: { id: number; status: string; note: string | null; created_at: string }) => (
                <li key={e.id}><span className="text-xs text-mist">{new Date(e.created_at).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" })}</span><br />{ORDER_STATUS_LABEL[e.status as OrderStatus] ?? e.status}{e.note && <span className="block text-graphite">{e.note}</span>}</li>
              ))}
            </ol>
          </Panel>
        </div>
      </div>
    </>
  );
}
