import "server-only";
import { redirect } from "next/navigation";
import { cache } from "react";
import { createSupabaseServerClient } from "./supabase/server";

export type SessionUser = { id: string; email: string; role: "customer" | "admin"; firstName: string; lastName: string; phone: string };

/** Utilisateur courant, vérifié auprès de Supabase Auth (getUser valide le jeton côté serveur). */
export const getCurrentUser = cache(async (): Promise<SessionUser | null> => {
  const sb = await createSupabaseServerClient();
  if (!sb) return null;
  const { data, error } = await sb.auth.getUser();
  if (error || !data.user) return null;
  const { data: profile } = await sb.from("profiles").select("role, first_name, last_name, phone").eq("id", data.user.id).maybeSingle();
  return {
    id: data.user.id,
    email: data.user.email ?? "",
    role: profile?.role === "admin" ? "admin" : "customer",
    firstName: profile?.first_name ?? "",
    lastName: profile?.last_name ?? "",
    phone: profile?.phone ?? "",
  };
});

export async function requireUser(next = "/compte") {
  const user = await getCurrentUser();
  if (!user) redirect(`/compte/connexion?next=${encodeURIComponent(next)}`);
  return user;
}

/** Contrôle d'autorisation côté serveur — à appeler dans CHAQUE page et action d'administration. */
export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user) redirect("/compte/connexion?next=/admin");
  if (user.role !== "admin") redirect("/");
  return user;
}

/** Variante pour les actions serveur : lève une erreur plutôt que rediriger. */
export async function assertAdmin() {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") throw new Error("Accès refusé");
  const sb = (await createSupabaseServerClient())!;
  return { user, sb };
}

/** Pour les pages d'administration : redirige si non autorisé, renvoie le client Supabase de l'admin. */
export async function adminPage() {
  const user = await requireAdmin();
  const sb = (await createSupabaseServerClient())!;
  return { user, sb };
}
