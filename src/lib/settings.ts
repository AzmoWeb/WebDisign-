import "server-only";
import { cache } from "react";
import type { SiteSettings } from "./types";
import { DEFAULT_SETTINGS } from "./settings-defaults";
import { supabasePublic } from "./supabase/public";

const KEYS = ["announcement", "hero", "campaign", "store", "shipping", "reviews", "storeIntro"] as const;
export type SettingsKey = (typeof KEYS)[number];
export const SETTINGS_KEYS = KEYS;

export const getSettings = cache(async (): Promise<SiteSettings> => {
  const sb = supabasePublic();
  if (!sb) return DEFAULT_SETTINGS;
  const { data, error } = await sb.from("site_settings").select("key, value");
  if (error || !data) return DEFAULT_SETTINGS;
  const merged: SiteSettings = structuredClone(DEFAULT_SETTINGS);
  for (const row of data as { key: string; value: unknown }[]) {
    if ((KEYS as readonly string[]).includes(row.key) && row.value && typeof row.value === "object") {
      const k = row.key as SettingsKey;
      (merged as Record<string, unknown>)[k] = { ...(DEFAULT_SETTINGS[k] as object), ...(row.value as object) };
    }
  }
  return merged;
});

export { shippingReady, computeShipping } from "./shipping";
