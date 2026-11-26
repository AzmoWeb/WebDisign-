"use server";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { env } from "@/lib/env";
import { clientIp, hashIp, rateLimit, safeNext } from "@/lib/security";

export type FormState = { ok?: boolean; error?: string; message?: string; fields?: Record<string, string> } | null;

const Email = z.string().trim().toLowerCase().email("Adresse e-mail invalide").max(160);
const Password = z
  .string()
  .min(10, "10 caractères minimum")
  .max(128)
  .regex(/[a-z]/, "Au moins une minuscule")
  .regex(/[A-Z]/, "Au moins une majuscule")
  .regex(/[0-9]/, "Au moins un chiffre");

const NOT_CONFIGURED: FormState = { error: "L'espace client sera disponible dès la configuration de la base de données." };

export async function signInAction(_: FormState, fd: FormData): Promise<FormState> {
  const sb = await createSupabaseServerClient();
  if (!sb) return NOT_CONFIGURED;
  const email = Email.safeParse(fd.get("email"));
  const password = String(fd.get("password") ?? "");
  if (!email.success || !password) return { error: "Identifiants invalides." };
  const ip = hashIp(await clientIp());
  // Limitation des tentatives : par IP et par compte
  const [okIp, okAccount] = await Promise.all([rateLimit(`login:ip:${ip}`, 20, 900), rateLimit(`login:acct:${email.data}`, 8, 900)]);
  if (!okIp || !okAccount) return { error: "Trop de tentatives. Réessayez dans 15 minutes." };
  const { error } = await sb.auth.signInWithPassword({ email: email.data, password });
  if (error) return { error: error.message.includes("confirm") ? "Veuillez confirmer votre adresse e-mail avant de vous connecter." : "Identifiants invalides." };
  redirect(safeNext(fd.get("next")));
}

export async function signUpAction(_: FormState, fd: FormData): Promise<FormState> {
  const sb = await createSupabaseServerClient();
  if (!sb) return NOT_CONFIGURED;
  const schema = z.object({
    firstName: z.string().trim().min(1, "Prénom requis").max(80),
    lastName: z.string().trim().min(1, "Nom requis").max(80),
    email: Email,
    password: Password,
    consent: z.literal("on", { error: "Vous devez accepter la politique de confidentialité" }),
  });
  const parsed = schema.safeParse(Object.fromEntries(fd));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const ip = hashIp(await clientIp());
  if (!(await rateLimit(`signup:${ip}`, 5, 3600))) return { error: "Trop de créations de compte depuis cette connexion. Réessayez plus tard." };
  const { error } = await sb.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { first_name: parsed.data.firstName, last_name: parsed.data.lastName },
      emailRedirectTo: `${env.siteUrl}/auth/callback?next=/compte`,
    },
  });
  // Message identique que le compte existe ou non (pas d'énumération des comptes)
  if (error && !/already/i.test(error.message)) return { error: "Inscription impossible. Vérifiez vos informations." };
  return { ok: true, message: "Si cette adresse n'est pas déjà utilisée, un e-mail de confirmation vient de vous être envoyé." };
}

export async function forgotPasswordAction(_: FormState, fd: FormData): Promise<FormState> {
  const sb = await createSupabaseServerClient();
  if (!sb) return NOT_CONFIGURED;
  const email = Email.safeParse(fd.get("email"));
  if (!email.success) return { error: "Adresse e-mail invalide." };
  const ip = hashIp(await clientIp());
  if (!(await rateLimit(`reset:${ip}`, 5, 3600))) return { error: "Trop de demandes. Réessayez plus tard." };
  await sb.auth.resetPasswordForEmail(email.data, { redirectTo: `${env.siteUrl}/auth/callback?next=/compte/reinitialiser` });
  return { ok: true, message: "Si un compte existe pour cette adresse, vous allez recevoir un lien de réinitialisation." };
}

export async function resetPasswordAction(_: FormState, fd: FormData): Promise<FormState> {
  const sb = await createSupabaseServerClient();
  if (!sb) return NOT_CONFIGURED;
  const { data } = await sb.auth.getUser();
  if (!data.user) return { error: "Lien expiré. Refaites une demande de réinitialisation." };
  const pw = Password.safeParse(fd.get("password"));
  if (!pw.success) return { error: pw.error.issues[0].message };
  if (fd.get("password") !== fd.get("confirm")) return { error: "Les mots de passe ne correspondent pas." };
  const { error } = await sb.auth.updateUser({ password: pw.data });
  if (error) return { error: "Impossible de modifier le mot de passe." };
  redirect("/compte?mdp=ok");
}

export async function signOutAction() {
  const sb = await createSupabaseServerClient();
  await sb?.auth.signOut();
  redirect("/");
}
