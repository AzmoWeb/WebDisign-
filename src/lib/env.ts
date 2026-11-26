/** Accès centralisé aux variables d'environnement. */
export const env = {
  // Sur Vercel, l'adresse de production est détectée automatiquement si NEXT_PUBLIC_SITE_URL n'est pas définie
  siteUrl: (
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "") ||
    "http://localhost:3000"
  ).replace(/\/$/, ""),
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
  ga4Id: process.env.NEXT_PUBLIC_GA4_ID || "",
  metaPixelId: process.env.NEXT_PUBLIC_META_PIXEL_ID || "",
  turnstileSiteKey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "",
};

/** Supabase configuré → données réelles. Sinon → mode démonstration clairement signalé. */
export const isSupabaseConfigured = () => Boolean(env.supabaseUrl && env.supabaseAnonKey);
export const isServiceRoleConfigured = () => Boolean(isSupabaseConfigured() && process.env.SUPABASE_SERVICE_ROLE_KEY);
export const isStripeConfigured = () => Boolean(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_WEBHOOK_SECRET);
export const isDemoMode = () => !isSupabaseConfigured();
