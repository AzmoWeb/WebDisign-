/** Gestion du consentement cookies — module partagé client/serveur. */
export const CONSENT_COOKIE = "ajp_consent";
/** Incrémenter cette version à chaque modification substantielle de la politique cookies : le bandeau réapparaît. */
export const CONSENT_POLICY_VERSION = "2026-11-26";
/** Durée de conservation du choix (acceptation comme refus) : 6 mois, recommandation CNIL. */
export const CONSENT_MAX_AGE_DAYS = 182;

export type ConsentChoices = { preferences: boolean; statistics: boolean; marketing: boolean };
export type ConsentRecord = { v: string; id: string; ts: number; c: ConsentChoices };
export type ConsentAction = "accept_all" | "reject_all" | "custom" | "withdraw";

export const ALL_GRANTED: ConsentChoices = { preferences: true, statistics: true, marketing: true };
export const ALL_DENIED: ConsentChoices = { preferences: false, statistics: false, marketing: false };

export function parseConsent(raw: string | undefined | null): ConsentRecord | null {
  if (!raw) return null;
  try {
    const r = JSON.parse(decodeURIComponent(raw)) as ConsentRecord;
    if (r.v !== CONSENT_POLICY_VERSION) return null; // nouvelle version → nouvelle demande
    if (!r.ts || Date.now() - r.ts > CONSENT_MAX_AGE_DAYS * 86400000) return null; // expiré
    if (typeof r.c?.statistics !== "boolean" || typeof r.c?.marketing !== "boolean" || typeof r.c?.preferences !== "boolean") return null;
    return r;
  } catch {
    return null;
  }
}

/** Cookies déposés par les outils tiers à supprimer lors d'un retrait de consentement. */
export const THIRD_PARTY_COOKIE_PATTERNS: Record<keyof ConsentChoices, RegExp[]> = {
  preferences: [],
  statistics: [/^_ga/, /^_gid$/, /^_gat/],
  marketing: [/^_fbp$/, /^_fbc$/, /^fr$/],
};

export const PREFERENCE_STORAGE_KEYS = ["ajp_pref_size"];
