import "server-only";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from "@supabase/supabase-js";
import { env, isSupabaseConfigured } from "../env";

/** Client anonyme sans cookies — lectures publiques du catalogue (RLS appliquée), compatible cache. */
let client: ReturnType<typeof createClient<any>> | null = null;
export function supabasePublic() {
  if (!isSupabaseConfigured()) return null;
  client ??= createClient<any>(env.supabaseUrl, env.supabaseAnonKey, { auth: { persistSession: false, autoRefreshToken: false } });
  return client;
}
