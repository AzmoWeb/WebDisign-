import Link from "next/link";
import { getStripe } from "@/lib/stripe";
import { supabaseService } from "@/lib/supabase/admin";
import { formatPrice } from "@/lib/money";
import { ClearCartOnPaid } from "@/components/cart/ClearCartOnPaid";

export const metadata = { title: "Confirmation de commande", robots: { index: false } };

/**
 * Page de retour Stripe. Elle n'écrit RIEN : le statut affiché est celui enregistré par le webhook.
 */
export default async function ConfirmationPage({ searchParams }: { searchParams: Promise<{ session_id?: string }> }) {
  const { session_id } = await searchParams;
  const sb = supabaseService();
  const stripe = getStripe();
  let order: { order_number: string; payment_status: string; total_cents: number; email: string; shipping_method: string } | null = null;
  if (session_id && /^cs_[A-Za-z0-9_]+$/.test(session_id) && sb && stripe) {
    const { data } = await sb.from("orders").select("order_number, payment_status, total_cents, email, shipping_method").eq("stripe_session_id", session_id).maybeSingle();
    order = data;
  }
  const paid = order?.payment_status === "paid";
  return (
    <div className="container-site max-w-2xl pt-16 text-center">
      {paid && <ClearCartOnPaid />}
      <p className="label text-mist">{paid ? "Paiement confirmé" : order ? "Paiement en cours de confirmation" : "Commande"}</p>
      <h1 className="display mt-4 text-[2.6rem] md:text-[3.4rem]">{paid ? "Merci pour votre commande" : order ? "Nous vérifions votre paiement" : "Commande introuvable"}</h1>
      {order ? (
        <>
          <p className="mt-6 text-graphite">
            Commande <strong className="font-medium text-ink">{order.order_number}</strong> — {formatPrice(order.total_cents)}
          </p>
          <p className="mt-3 text-graphite">
            {paid
              ? `Un récapitulatif est envoyé à ${order.email}. ${(order.shipping_method === "retrait-magasin" || order.shipping_method === "pickup") ? "Nous vous préviendrons lorsque votre commande sera prête en magasin." : "Nous préparons votre colis."}`
              : "La confirmation de Stripe peut prendre quelques instants. Actualisez cette page dans un moment ; aucune commande n'est considérée comme payée sans confirmation de Stripe."}
          </p>
        </>
      ) : (
        <p className="mt-6 text-graphite">Si vous venez de payer, vérifiez votre boîte e-mail ou contactez le magasin.</p>
      )}
      <div className="mt-10 flex flex-wrap justify-center gap-3">
        {!paid && order && <Link href={`/commande/confirmation?session_id=${session_id}`} className="btn btn-primary">Actualiser</Link>}
        <Link href="/compte/commandes" className="btn btn-outline">Mes commandes</Link>
        <Link href="/" className="btn btn-outline">Retour à la boutique</Link>
      </div>
    </div>
  );
}
