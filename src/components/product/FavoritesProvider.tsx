"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { toggleFavoriteAction } from "@/app/actions/favorites";

/** Favoris : fonctionnalité demandée par l'utilisateur (stockage nécessaire). Synchronisés avec le compte si connecté. */
const KEY = "ajp_favorites";
type Ctx = { ids: string[]; has: (id: string) => boolean; toggle: (id: string) => void; ready: boolean };
const FavContext = createContext<Ctx | null>(null);

export function FavoritesProvider({ children, initial, loggedIn }: { children: React.ReactNode; initial: string[]; loggedIn: boolean }) {
  const [ids, setIds] = useState<string[]>(initial);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const local = JSON.parse(localStorage.getItem(KEY) || "[]") as string[];
      if (Array.isArray(local)) setIds((prev) => [...new Set([...prev, ...local.filter((x) => typeof x === "string")])].slice(0, 200));
    } catch {}
    setReady(true);
  }, []);
  useEffect(() => {
    if (ready) try { localStorage.setItem(KEY, JSON.stringify(ids)); } catch {}
  }, [ids, ready]);

  const toggle = useCallback(
    (id: string) => {
      setIds((prev) => {
        const on = !prev.includes(id);
        if (loggedIn) toggleFavoriteAction(id, on).catch(() => {});
        return on ? [...prev, id] : prev.filter((x) => x !== id);
      });
    },
    [loggedIn],
  );
  const value = useMemo(() => ({ ids, has: (id: string) => ids.includes(id), toggle, ready }), [ids, toggle, ready]);
  return <FavContext.Provider value={value}>{children}</FavContext.Provider>;
}

export function useFavorites() {
  const ctx = useContext(FavContext);
  if (!ctx) throw new Error("useFavorites hors FavoritesProvider");
  return ctx;
}
