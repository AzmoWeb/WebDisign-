import Link from "next/link";
import { adminPage } from "@/lib/auth";
import { formatPrice } from "@/lib/money";
import { ORDER_STATUS_LABEL } from "@/lib/order-status";
import type { OrderStatus } from "@/lib/types";
import { PageTitle, Panel, StatusBadge } from "@/components/admin/ui";

export const metadata = { title: "Tableau de bord" };

export default async function Dashboard() {
  const { sb } = await adminPage();
  const since = new Date(Date.now() - 30 * 86400000).toISOString();
  const [products, variants, orders, recent, paid30, newMessages, topItems] = await Promise.all([
    sb.from("products").select("id, active", { count: "exact" }),
    sb.from("product_variants").select("product_id, stock"),
    sb.from("orders").select("status, payment_status, total_cents, discount_cents"),
    sb.from("orders").select("id, order_number, first_name, last_name, total_cents, status, created_at").order("created_at", { ascending: false }).limit(8),
    sb.from("orders").select("paid_at, amount_paid_cents").eq("payment_status", "paid").gte("paid_at", since),
    sb.from("contact_messages").select("id", { count: "exact", head: true }).eq("status", "new"),
    sb.from("order_items").select("name, quantity, order:orders!inner(payment_status)").eq("order.payment_status", "paid").limit(2000),
  ]);

  const allOrders = (orders.data ?? []) as { status: string; payment_status: string; total_cents: number; discount_cents: number }[];
  // Chiffre d'affaires : uniquement les commandes dont le paiement a été confirmé par Stripe
  const revenue = allOrders.filter((o) => o.payment_status === "paid").reduce((s, o) => s + o.total_cents - o.discount_cents, 0);
  const toProcess = allOrders.filter((o) => o.status === "paid" || o.status === "preparing").length;
  const awaitingPayment = allOrders.filter((o) => o.status === "pending").length;

  const stockByProduct = new Map<string, number>();
  for (const v of (variants.data ?? []) as { product_id: string; stock: number }[]) stockByProduct.set(v.product_id, (stockByProduct.get(v.product_id) ?? 0) + v.stock);
  const activeProducts = (products.data ?? []).filter((p: { active: boolean }) => p.active);
  const outOfStock = activeProducts.filter((p: { id: string }) => (stockByProduct.get(p.id) ?? 0) === 0).length;
  const outOfStockSizes = ((variants.data ?? []) as { stock: number }[]).filter((v) => v.stock === 0).length;

  // Ventes payées des 30 derniers jours, par jour
  const days: { d: string; cents: number }[] = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(Date.now() - (29 - i) * 86400000);
    return { d: d.toISOString().slice(0, 10), cents: 0 };
  });
  for (const o of (paid30.data ?? []) as { paid_at: string; amount_paid_cents: number }[]) {
    const slot = days.find((x) => x.d === o.paid_at.slice(0, 10));
    if (slot) slot.cents += o.amount_paid_cents ?? 0;
  }
  const max = Math.max(1, ...days.map((d) => d.cents));
  const total30 = days.reduce((s, d) => s + d.cents, 0);

  const top = new Map<string, number>();
  for (const it of (topItems.data ?? []) as { name: string; quantity: number }[]) top.set(it.name, (top.get(it.name) ?? 0) + it.quantity);
  const topList = [...top.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);

  const kpis = [
    { label: "Produits", value: String(products.count ?? 0), sub: `${activeProducts.length} en ligne`, href: "/admin/produits" },
    { label: "Commandes", value: String(allOrders.length), sub: `${awaitingPayment} en attente de paiement`, href: "/admin/commandes" },
    { label: "À traiter", value: String(toProcess), sub: "payées, à préparer", href: "/admin/commandes?statut=paid" },
    { label: "Chiffre d'affaires", value: formatPrice(revenue), sub: "commandes payées", href: "/admin/commandes?statut=paid" },
    { label: "Ruptures", value: String(outOfStock), sub: `${outOfStockSizes} pointures épuisées`, href: "/admin/produits?stock=rupture" },
    { label: "Messages", value: String(newMessages.count ?? 0), sub: "non lus", href: "/admin/messages" },
  ];

  return (
    <>
      <PageTitle kicker="Vue d'ensemble" title="Tableau de bord">
        <Link href="/admin/produits/nouveau" className="btn btn-primary">Ajouter un produit</Link>
      </PageTitle>
      <div className="grid grid-cols-2 gap-px bg-line md:grid-cols-3 xl:grid-cols-6">
        {kpis.map((k) => (
          <Link key={k.label} href={k.href} className="bg-paper p-5 transition-colors hover:bg-white">
            <p className="text-xs text-mist">{k.label}</p>
            <p className="display mt-2 text-3xl tabular-nums">{k.value}</p>
            <p className="mt-1 text-xs text-graphite">{k.sub}</p>
          </Link>
        ))}
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-3">
        <Panel title="Ventes payées — 30 derniers jours" className="xl:col-span-2" actions={<span className="text-sm tabular-nums">{formatPrice(total30)}</span>}>
          <div className="flex h-44 items-end gap-[3px]" role="img" aria-label={`Ventes des 30 derniers jours : ${formatPrice(total30)}`}>
            {days.map((d) => (
              <div key={d.d} className="group relative flex-1">
                <div className="w-full bg-ink/80 transition-colors group-hover:bg-oxblood" style={{ height: `${Math.max(2, (d.cents / max) * 168)}px`, opacity: d.cents ? 1 : 0.15 }} />
                <span className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 hidden -translate-x-1/2 bg-ink px-2 py-1 text-[0.65rem] whitespace-nowrap text-ivory group-hover:block">
                  {new Date(d.d).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })} · {formatPrice(d.cents)}
                </span>
              </div>
            ))}
          </div>
        </Panel>
        <Panel title="Meilleures ventes">
          {topList.length ? (
            <ol className="space-y-3 text-sm">
              {topList.map(([n, q], i) => <li key={n} className="flex justify-between gap-3"><span className="truncate">{i + 1}. {n}</span><span className="tabular-nums text-graphite">{q}</span></li>)}
            </ol>
          ) : <p className="text-sm text-mist">Aucune vente payée pour l&apos;instant.</p>}
        </Panel>
      </div>

      <Panel title="Dernières commandes" className="mt-6" actions={<Link href="/admin/commandes" className="text-xs underline underline-offset-4">Toutes les commandes</Link>}>
        {recent.data?.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[34rem] text-sm">
              <thead><tr className="border-b border-line text-left text-xs text-mist"><th className="py-2 font-normal">N°</th><th className="font-normal">Client</th><th className="font-normal">Date</th><th className="font-normal">Statut</th><th className="text-right font-normal">Total</th></tr></thead>
              <tbody>
                {recent.data.map((o) => (
                  <tr key={o.id} className="border-b border-line last:border-0">
                    <td className="py-3"><Link href={`/admin/commandes/${o.id}`} className="font-medium underline-offset-4 hover:underline">{o.order_number}</Link></td>
                    <td>{o.first_name} {o.last_name}</td>
                    <td className="text-graphite">{new Date(o.created_at).toLocaleDateString("fr-FR")}</td>
                    <td><StatusBadge status={o.status} label={ORDER_STATUS_LABEL[o.status as OrderStatus]} /></td>
                    <td className="text-right tabular-nums">{formatPrice(o.total_cents)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <p className="text-sm text-mist">Aucune commande pour le moment.</p>}
      </Panel>
    </>
  );
}
