import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { supabaseService } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/email";
import { formatPrice } from "@/lib/money";

/**
 * Webhook Stripe — SEULE source de vérité pour le statut de paiement.
 * La signature est vérifiée avec STRIPE_WEBHOOK_SECRET sur le corps brut.
 */
export async function POST(req: Request) {
  const stripe = getStripe();
  const sb = supabaseService();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !sb || !secret) return NextResponse.json({ error: "not_configured" }, { status: 503 });

  const signature = req.headers.get("stripe-signature");
  if (!signature) return NextResponse.json({ error: "missing_signature" }, { status: 400 });
  const body = await req.text();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, secret);
  } catch {
    return NextResponse.json({ error: "invalid_signature" }, { status: 400 });
  }

  // Idempotence : un événement déjà traité est ignoré
  const { error: dupError } = await sb.from("stripe_events").insert({ id: event.id, type: event.type });
  if (dupError) {
    if (dupError.code === "23505") return NextResponse.json({ received: true, duplicate: true });
    return NextResponse.json({ error: "db" }, { status: 500 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
      case "checkout.session.async_payment_succeeded": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.payment_status !== "paid") break; // paiement différé : on attend async_payment_succeeded
        const orderId = session.metadata?.order_id;
        if (!orderId) break;
        const { data: order } = await sb.from("orders").select("id, stripe_session_id, order_number, email, first_name, total_cents").eq("id", orderId).maybeSingle();
        if (!order || order.stripe_session_id !== session.id) {
          console.error("[webhook] session inconnue pour la commande", orderId);
          break;
        }
        const pi = typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id ?? null;
        const { data: result, error } = await sb.rpc("finalize_paid_order", {
          p_order_id: orderId,
          p_payment_intent: pi,
          p_amount_cents: session.amount_total ?? 0,
          p_discount_cents: session.total_details?.amount_discount ?? 0,
        });
        if (error) throw error;
        if (result === "ok") {
          await sendEmail(order.email, `Confirmation de votre commande ${order.order_number}`,
            `Bonjour ${order.first_name},\n\nNous avons bien reçu le paiement de votre commande ${order.order_number} (${formatPrice(session.amount_total ?? 0)}).\nVous pouvez suivre son statut depuis votre espace client.\n\nAux Jolis Pas\n110 Grande Rue de la Résistance, 10110 Bar-sur-Seine\n03 25 29 86 32`);
          if (process.env.STORE_NOTIFICATION_EMAIL)
            await sendEmail(process.env.STORE_NOTIFICATION_EMAIL, `Nouvelle commande payée ${order.order_number}`, `Commande ${order.order_number} payée : ${formatPrice(session.amount_total ?? 0)}. Détails dans l'administration.`);
        }
        break;
      }
      case "checkout.session.async_payment_failed":
      case "checkout.session.expired": {
        const session = event.data.object as Stripe.Checkout.Session;
        const orderId = session.metadata?.order_id;
        if (!orderId) break;
        const failed = event.type === "checkout.session.async_payment_failed";
        await sb
          .from("orders")
          .update({ status: failed ? "payment_failed" : "cancelled", payment_status: failed ? "failed" : "expired" })
          .eq("id", orderId)
          .eq("payment_status", "unpaid");
        await sb.from("order_events").insert({ order_id: orderId, status: failed ? "payment_failed" : "cancelled", note: failed ? "Paiement refusé" : "Session de paiement expirée" });
        break;
      }
      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge;
        const pi = typeof charge.payment_intent === "string" ? charge.payment_intent : null;
        if (pi && charge.refunded) {
          const { data: order } = await sb.from("orders").update({ status: "refunded", payment_status: "refunded" }).eq("stripe_payment_intent_id", pi).select("id").maybeSingle();
          if (order) await sb.from("order_events").insert({ order_id: order.id, status: "refunded", note: "Remboursement intégral effectué via Stripe" });
        }
        break;
      }
    }
  } catch (e) {
    console.error("[webhook] erreur de traitement", e);
    // Permet à Stripe de renvoyer l'événement
    await sb.from("stripe_events").delete().eq("id", event.id);
    return NextResponse.json({ error: "processing" }, { status: 500 });
  }
  return NextResponse.json({ received: true });
}
