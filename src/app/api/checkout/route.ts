import { NextResponse } from "next/server";
import { CheckoutSchema } from "@/lib/checkout-schema";
import { priceCart } from "@/lib/cart-pricing";
import { getSettings } from "@/lib/settings";
import { computeShipping } from "@/lib/shipping";
import { supabaseService } from "@/lib/supabase/admin";
import { getStripe } from "@/lib/stripe";
import { getCurrentUser } from "@/lib/auth";
import { env, isStripeConfigured } from "@/lib/env";
import { assertSameOrigin, clientIp, hashIp, rateLimit } from "@/lib/security";

const fail = (message: string, status = 400) => NextResponse.json({ ok: false, message }, { status });

/**
 * Création de commande + session Stripe Checkout.
 * Les prix, remises, frais de port et stocks sont recalculés ici, côté serveur.
 * La commande reste "pending" : seul le webhook Stripe signé peut la passer à "paid".
 */
export async function POST(req: Request) {
  if (!(await assertSameOrigin(req))) return fail("Requête refusée", 403);
  const ip = hashIp(await clientIp());
  if (!(await rateLimit(`checkout:${ip}`, 10, 600))) return fail("Trop de tentatives, réessayez dans quelques minutes.", 429);

  const sb = supabaseService();
  const stripe = getStripe();
  if (!sb || !stripe || !isStripeConfigured()) return fail("Le paiement en ligne n'est pas encore activé sur cette boutique.", 503);

  const parsed = CheckoutSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ ok: false, message: "Formulaire incomplet", issues: parsed.error.issues.map((i) => ({ path: i.path.join("."), message: i.message })) }, { status: 422 });
  const input = parsed.data;

  const [cart, settings, user] = await Promise.all([priceCart(input.lines), getSettings(), getCurrentUser()]);
  if (!cart.lines.length || cart.issues.length) return fail("Votre panier a changé, merci de le vérifier.", 409);
  if (cart.hasDemo) return fail("Les articles de démonstration ne peuvent pas être commandés.");
  const unavailable = cart.lines.find((l) => !l.available);
  if (unavailable) return fail(`${unavailable.name} (pointure ${unavailable.size}) n'est plus disponible dans la quantité demandée.`, 409);

  const shippingCents = computeShipping(settings.shipping, input.method, cart.subtotalCents);
  if (shippingCents == null) return fail("Ce mode de livraison n'est pas disponible.");
  const totalCents = cart.subtotalCents + shippingCents;

  const { data: order, error } = await sb
    .from("orders")
    .insert({
      user_id: user?.id ?? null,
      email: input.email,
      first_name: input.firstName,
      last_name: input.lastName,
      phone: input.phone,
      shipping_method: input.method,
      shipping_address: input.method === "home" ? input.address : null,
      notes: input.notes || null,
      subtotal_cents: cart.subtotalCents,
      shipping_cents: shippingCents,
      total_cents: totalCents,
    })
    .select("id, order_number")
    .single();
  if (error || !order) {
    console.error("[checkout] création commande", error?.message);
    return fail("Impossible de créer la commande. Réessayez.", 500);
  }

  const { error: itemsError } = await sb.from("order_items").insert(
    cart.lines.map((l) => ({
      order_id: order.id,
      product_id: l.productId,
      variant_id: l.variantId,
      name: l.name,
      brand: l.brand,
      size: l.size,
      color: l.color,
      image_url: l.imageUrl,
      unit_price_cents: l.unitPriceCents,
      quantity: l.quantity,
    })),
  );
  if (itemsError) {
    await sb.from("orders").delete().eq("id", order.id);
    return fail("Impossible de créer la commande. Réessayez.", 500);
  }
  await sb.from("order_events").insert({ order_id: order.id, status: "pending", note: "Commande créée, en attente de paiement" });

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      locale: "fr",
      customer_email: input.email,
      client_reference_id: order.id,
      metadata: { order_id: order.id, order_number: order.order_number },
      payment_intent_data: { metadata: { order_id: order.id, order_number: order.order_number } },
      allow_promotion_codes: true,
      expires_at: Math.floor(Date.now() / 1000) + 60 * 45,
      line_items: cart.lines.map((l) => ({
        quantity: l.quantity,
        price_data: {
          currency: "eur",
          unit_amount: l.unitPriceCents,
          product_data: { name: `${l.name} — pointure ${l.size}`, description: `${l.brand ? `${l.brand} · ` : ""}${l.color}`, ...(l.imageUrl ? { images: [l.imageUrl] } : {}) },
        },
      })),
      shipping_options: [
        {
          shipping_rate_data: {
            type: "fixed_amount",
            fixed_amount: { amount: shippingCents, currency: "eur" },
            display_name: input.method === "pickup" ? "Retrait en magasin" : "Livraison à domicile",
          },
        },
      ],
      success_url: `${env.siteUrl}/commande/confirmation?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${env.siteUrl}/panier?paiement=annule`,
    });
    await sb.from("orders").update({ stripe_session_id: session.id }).eq("id", order.id);
    return NextResponse.json({ ok: true, url: session.url });
  } catch (e) {
    console.error("[checkout] Stripe", e);
    await sb.from("orders").update({ status: "cancelled", payment_status: "failed" }).eq("id", order.id);
    return fail("Le service de paiement est momentanément indisponible.", 502);
  }
}
