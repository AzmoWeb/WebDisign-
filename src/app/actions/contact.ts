"use server";
import { z } from "zod";
import { supabaseService } from "@/lib/supabase/admin";
import { clientIp, hashIp, rateLimit, verifyTurnstile } from "@/lib/security";
import { sendEmail } from "@/lib/email";
import type { FormState } from "./auth";

const Schema = z.object({
  name: z.string().trim().min(2, "Indiquez votre nom").max(100),
  email: z.string().trim().toLowerCase().email("Adresse e-mail invalide").max(160),
  phone: z.string().trim().regex(/^[+0-9 ().-]{0,20}$/, "Téléphone invalide").optional().default(""),
  subject: z.enum(["produit", "commande", "magasin", "retour", "autre"], { error: "Choisissez un sujet" }),
  message: z.string().trim().min(10, "Votre message est trop court").max(3000),
  consent: z.literal("on", { error: "Merci d'accepter le traitement de votre demande" }),
});

const SUBJECTS: Record<string, string> = { produit: "Question sur un produit", commande: "Suivi de commande", magasin: "Le magasin", retour: "Retour / échange", autre: "Autre demande" };

export async function contactAction(_: FormState, fd: FormData): Promise<FormState> {
  // Pot de miel : champ invisible rempli uniquement par les robots
  if (String(fd.get("website") ?? "") !== "") return { ok: true, message: "Merci, votre message a bien été envoyé." };
  // Délai minimal de saisie
  const started = Number(fd.get("started") ?? 0);
  if (!started || Date.now() - started < 3000) return { error: "Merci de patienter quelques secondes avant d'envoyer." };

  const parsed = Schema.safeParse(Object.fromEntries(fd));
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const ip = await clientIp();
  const ipHash = hashIp(ip);
  if (!(await rateLimit(`contact:${ipHash}`, 5, 3600))) return { error: "Vous avez envoyé plusieurs messages récemment. Réessayez plus tard ou appelez le magasin." };
  if (!(await verifyTurnstile(String(fd.get("cf-turnstile-response") ?? "") || null, ip))) return { error: "Vérification anti-robot échouée. Réessayez." };
  // Limite les liens (spam)
  if ((parsed.data.message.match(/https?:\/\//g) ?? []).length > 2) return { error: "Votre message contient trop de liens." };

  const sb = supabaseService();
  if (!sb) return { error: "Le formulaire sera actif dès la configuration de la base de données. En attendant, appelez le 03 25 29 86 32." };
  const { error } = await sb.from("contact_messages").insert({
    name: parsed.data.name,
    email: parsed.data.email,
    phone: parsed.data.phone || null,
    subject: SUBJECTS[parsed.data.subject],
    message: parsed.data.message,
    ip_hash: ipHash,
  });
  if (error) return { error: "Envoi impossible pour le moment. Appelez-nous au 03 25 29 86 32." };
  if (process.env.STORE_NOTIFICATION_EMAIL)
    await sendEmail(process.env.STORE_NOTIFICATION_EMAIL, `[Site] ${SUBJECTS[parsed.data.subject]} — ${parsed.data.name}`, `${parsed.data.name} <${parsed.data.email}> ${parsed.data.phone}\n\n${parsed.data.message}`);
  return { ok: true, message: "Merci, votre message a bien été envoyé. Nous vous répondrons rapidement." };
}
