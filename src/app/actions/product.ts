"use server";
import { z } from "zod";
import { supabaseService } from "@/lib/supabase/admin";
import { getCurrentUser } from "@/lib/auth";
import { getSettings } from "@/lib/settings";
import { clientIp, hashIp, rateLimit } from "@/lib/security";
import { sendEmail } from "@/lib/email";
import { formatPrice } from "@/lib/money";

type Result = { ok: boolean; message: string };
const NOT_LIVE: Result = { ok: false, message: "Ce service sera disponible dès la mise en ligne de la boutique. En attendant, appelez le magasin au 03 25 29 86 32." };

const Email = z.string().trim().toLowerCase().email().max(160);
const Id = z.string().uuid();

/** « Prévenez-moi » : alerte e-mail au retour en stock d'une pointure épuisée. */
export async function stockAlertAction(variantId: string, email: string, website: string): Promise<Result> {
  if (website) return { ok: true, message: "C'est noté !" }; // pot de miel
  const e = Email.safeParse(email);
  if (!e.success) return { ok: false, message: "Adresse e-mail invalide." };
  if (!Id.safeParse(variantId).success) return NOT_LIVE;
  const sb = supabaseService();
  if (!sb) return NOT_LIVE;
  if (!(await rateLimit(`alert:${hashIp(await clientIp())}`, 10, 3600))) return { ok: false, message: "Trop de demandes. Réessayez plus tard." };

  const { data: v } = await sb.from("product_variants").select("id, stock, product_id, products!inner(active)").eq("id", variantId).maybeSingle();
  if (!v) return { ok: false, message: "Cette pointure n'existe plus." };
  if (v.stock > 0) return { ok: false, message: "Bonne nouvelle : cette pointure est disponible, vous pouvez la commander dès maintenant." };
  const { error } = await sb.from("stock_alerts").insert({ variant_id: v.id, product_id: v.product_id, email: e.data });
  if (error && error.code !== "23505") return { ok: false, message: "Enregistrement impossible, réessayez." };
  return { ok: true, message: "C'est noté ! Nous vous écrirons dès que cette pointure sera de retour." };
}

const ReserveSchema = z.object({
  variantId: Id,
  firstName: z.string().trim().min(1, "Prénom requis").max(80),
  lastName: z.string().trim().min(1, "Nom requis").max(80),
  email: Email,
  phone: z.string().trim().regex(/^[+0-9 ().-]{8,20}$/, "Téléphone invalide"),
  consent: z.literal(true, { error: "Merci d'accepter le traitement de votre demande" }),
});

/** Réserver en ligne, payer en magasin : la paire est mise de côté (et retirée de la vente en ligne). */
export async function reserveAction(input: unknown, website: string): Promise<Result & { number?: string; hours?: number }> {
  if (website) return { ok: false, message: "Demande refusée." };
  const settings = await getSettings();
  if (!settings.reservation.enabled) return { ok: false, message: "La réservation en ligne n'est pas proposée pour le moment." };
  const raw = input as Record<string, unknown>;
  if (typeof raw?.variantId === "string" && !Id.safeParse(raw.variantId).success) return NOT_LIVE;
  const parsed = ReserveSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0].message };
  const sb = supabaseService();
  if (!sb) return NOT_LIVE;
  if (!(await rateLimit(`reserve:${hashIp(await clientIp())}`, 6, 3600))) return { ok: false, message: "Trop de demandes. Réessayez plus tard ou appelez le magasin." };

  const d = parsed.data;
  const user = await getCurrentUser();
  const hours = settings.reservation.holdHours;
  const { data, error } = await sb.rpc("create_reservation", {
    p_variant_id: d.variantId, p_user_id: user?.id ?? null, p_first_name: d.firstName, p_last_name: d.lastName, p_email: d.email, p_phone: d.phone, p_hold_hours: hours,
  });
  const row = Array.isArray(data) ? data[0] : null;
  if (error || !row) return { ok: false, message: "Réservation impossible pour le moment. Appelez le magasin au 03 25 29 86 32." };
  if (row.result === "out_of_stock") return { ok: false, message: "Désolé, cette pointure vient d'être réservée ou vendue." };
  if (row.result === "too_many") return { ok: false, message: "Vous avez déjà 3 réservations en cours : passez au magasin ou contactez-nous." };
  if (row.result !== "ok") return { ok: false, message: "Ce produit n'est plus disponible." };

  const { data: r } = await sb.from("reservations").select("product_name, brand, size, color, price_cents, expires_at").eq("id", row.reservation_id).single();
  const s = settings.store;
  if (r) {
    const until = new Date(r.expires_at).toLocaleString("fr-FR", { dateStyle: "full", timeStyle: "short", timeZone: "Europe/Paris" });
    await sendEmail(d.email, `Votre réservation ${row.reservation_number} — ${s.name}`,
      `Bonjour ${d.firstName},\n\nNous mettons de côté pour vous :\n${r.product_name}${r.brand ? ` (${r.brand})` : ""} — ${r.color}, pointure ${r.size} — ${formatPrice(r.price_cents)}\n\nRéservation n° ${row.reservation_number}, valable jusqu'au ${until}.\nLe paiement se fait au magasin.\n\n${s.name}\n${s.street}, ${s.postalCode} ${s.city}\n${s.phone}`);
    if (process.env.STORE_NOTIFICATION_EMAIL)
      await sendEmail(process.env.STORE_NOTIFICATION_EMAIL, `Nouvelle réservation ${row.reservation_number}`,
        `${d.firstName} ${d.lastName} (${d.phone}, ${d.email}) réserve ${r.product_name} — ${r.color}, pointure ${r.size}. À mettre de côté jusqu'au ${until}.`);
  }
  return { ok: true, number: row.reservation_number, hours, message: `Réservation n° ${row.reservation_number} confirmée.` };
}
