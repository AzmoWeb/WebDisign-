"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  ALL_DENIED,
  CONSENT_COOKIE,
  CONSENT_MAX_AGE_DAYS,
  CONSENT_POLICY_VERSION,
  PREFERENCE_STORAGE_KEYS,
  THIRD_PARTY_COOKIE_PATTERNS,
  parseConsent,
  type ConsentAction,
  type ConsentChoices,
  type ConsentRecord,
} from "@/lib/consent";

type Ctx = {
  ready: boolean;
  consent: ConsentRecord | null;
  choices: ConsentChoices;
  bannerOpen: boolean;
  panelOpen: boolean;
  openPreferences: () => void;
  closePanel: () => void;
  save: (c: ConsentChoices, action: ConsentAction) => void;
};
const ConsentContext = createContext<Ctx | null>(null);

function readCookie(name: string) {
  return document.cookie
    .split("; ")
    .find((c) => c.startsWith(`${name}=`))
    ?.slice(name.length + 1);
}

function deleteCookie(name: string) {
  const host = location.hostname;
  const domains = ["", host, `.${host}`, `.${host.split(".").slice(-2).join(".")}`];
  for (const d of domains) document.cookie = `${name}=; Max-Age=0; path=/${d ? `; domain=${d}` : ""}`;
}

function uuid() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (c) => (+c ^ (Math.random() * 16) >> (+c / 4)).toString(16));
}

export function ConsentProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [consent, setConsent] = useState<ConsentRecord | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);

  useEffect(() => {
    setConsent(parseConsent(readCookie(CONSENT_COOKIE)));
    setReady(true);
    const open = () => setPanelOpen(true);
    window.addEventListener("ajp:open-cookie-preferences", open);
    return () => window.removeEventListener("ajp:open-cookie-preferences", open);
  }, []);

  const save = useCallback(
    (c: ConsentChoices, action: ConsentAction) => {
      const previous = consent?.c;
      const record: ConsentRecord = { v: CONSENT_POLICY_VERSION, id: consent?.id ?? uuid(), ts: Date.now(), c };
      const secure = location.protocol === "https:" ? "; Secure" : "";
      document.cookie = `${CONSENT_COOKIE}=${encodeURIComponent(JSON.stringify(record))}; Max-Age=${CONSENT_MAX_AGE_DAYS * 86400}; path=/; SameSite=Lax${secure}`;

      // Retrait : suppression effective des traceurs des catégories refusées
      let mustReload = false;
      (Object.keys(THIRD_PARTY_COOKIE_PATTERNS) as (keyof ConsentChoices)[]).forEach((cat) => {
        if (!c[cat]) {
          const names = document.cookie.split("; ").map((x) => x.split("=")[0]);
          names.filter((n) => THIRD_PARTY_COOKIE_PATTERNS[cat].some((re) => re.test(n))).forEach(deleteCookie);
          if (previous?.[cat] && cat !== "preferences") mustReload = true; // décharger les scripts déjà exécutés
        }
      });
      if (!c.preferences) PREFERENCE_STORAGE_KEYS.forEach((k) => {
        try { localStorage.removeItem(k); } catch {}
      });

      setConsent(record);
      setPanelOpen(false);

      // Preuve du consentement (horodatage, version, choix) — sans donnée identifiante
      fetch("/api/consent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: record.id, version: record.v, choices: c, action }),
        keepalive: true,
      }).catch(() => {});

      if (mustReload) setTimeout(() => location.reload(), 150);
    },
    [consent],
  );

  const value = useMemo<Ctx>(
    () => ({
      ready,
      consent,
      choices: consent?.c ?? ALL_DENIED, // le silence ne vaut pas acceptation
      bannerOpen: ready && !consent && !panelOpen,
      panelOpen,
      openPreferences: () => setPanelOpen(true),
      closePanel: () => setPanelOpen(false),
      save,
    }),
    [ready, consent, panelOpen, save],
  );
  return <ConsentContext.Provider value={value}>{children}</ConsentContext.Provider>;
}

export function useConsent() {
  const ctx = useContext(ConsentContext);
  if (!ctx) throw new Error("useConsent hors ConsentProvider");
  return ctx;
}

export function openCookiePreferences() {
  window.dispatchEvent(new Event("ajp:open-cookie-preferences"));
}
