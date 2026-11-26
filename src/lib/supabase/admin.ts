import "server-only";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from "@supabase/supabase-js";
import { env, isServiceRoleConfigured } from "../env";

/**
 * Client service_role — CONTOURNE LA RLS.
 * Réservé au serveur : webhooks Stripe, création de commandes, journal de consentement,
 * formulaire de contact. Ne jamais l'importer dans un composant client.
 */
let client: ReturnType<typeof createClient<any>> | null = null;
export function supabaseService() {
  if (!isServiceRoleConfigured()) return null;
  client ??= createClient<any>(env.supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return client;
}
