import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/money";
import { ORDER_STATUS_LABEL } from "@/lib/order-status";
import type { OrderStatus } from "@/lib/types";

export const metadata = { title: "Mes commandes", robots: { index: false } };

export default async function OrdersPage() {
  const user = await requireUser("/compte/commandes");
  const sb = (await createSupabaseServerClient())!;
  const { data: orders } = await sb.from("orders").select("id, order_number, created_at, total_cents, status").eq("user_id", user.id).order("created_at", { ascending: false });
  return (
    <section>
      <h2 className="display text-2xl">Mes commandes</h2>
      {!orders?.length ? (
        <p className="mt-6 text-graphite">Vous n&apos;avez pas encore passé de commande.</p>
      ) : (
        <ul className="mt-8 divide-y divide-line border-y border-line">
          {orders.map((o) => (
            <li key={o.id}>
              <Link href={`/compte/commandes/${o.id}`} className="grid grid-cols-2 gap-2 py-5 text-sm hover:bg-paper sm:grid-cols-4 sm:items-center sm:px-3">
                <span className="font-medium">{o.order_number}</span>
                <span className="text-graphite">{new Date(o.created_at).toLocaleDateString("fr-FR")}</span>
                <span>{ORDER_STATUS_LABEL[o.status as OrderStatus]}</span>
                <span className="tabular-nums sm:text-right">{formatPrice(o.total_cents)}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
