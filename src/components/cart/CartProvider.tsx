"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { CartLine } from "@/lib/types";

/**
 * Panier conservé dans le navigateur (stockage strictement nécessaire).
 * Il ne contient QUE des identifiants et des quantités : prix, stocks et totaux
 * sont toujours recalculés par le serveur.
 */
const KEY = "ajp_cart";
const MAX_QTY = 10;

type Ctx = {
  lines: CartLine[];
  count: number;
  ready: boolean;
  drawerOpen: boolean;
  setDrawerOpen: (v: boolean) => void;
  add: (l: CartLine) => void;
  setQuantity: (variantId: string, q: number) => void;
  changeVariant: (oldVariantId: string, newVariantId: string) => void;
  remove: (variantId: string) => void;
  clear: () => void;
};
const CartContext = createContext<Ctx | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [ready, setReady] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      const parsed = raw ? (JSON.parse(raw) as CartLine[]) : [];
      if (Array.isArray(parsed))
        setLines(parsed.filter((l) => typeof l.variantId === "string" && typeof l.productId === "string" && Number.isInteger(l.quantity) && l.quantity > 0).slice(0, 30));
    } catch {}
    setReady(true);
    const sync = (e: StorageEvent) => {
      if (e.key === KEY) {
        try { setLines(e.newValue ? JSON.parse(e.newValue) : []); } catch {}
      }
    };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try { localStorage.setItem(KEY, JSON.stringify(lines)); } catch {}
  }, [lines, ready]);

  const add = useCallback((l: CartLine) => {
    setLines((prev) => {
      const ex = prev.find((p) => p.variantId === l.variantId);
      if (ex) return prev.map((p) => (p.variantId === l.variantId ? { ...p, quantity: Math.min(MAX_QTY, p.quantity + l.quantity) } : p));
      return [...prev, { ...l, quantity: Math.min(MAX_QTY, l.quantity) }];
    });
  }, []);
  const setQuantity = useCallback((variantId: string, q: number) => {
    setLines((prev) => (q <= 0 ? prev.filter((p) => p.variantId !== variantId) : prev.map((p) => (p.variantId === variantId ? { ...p, quantity: Math.min(MAX_QTY, q) } : p))));
  }, []);
  const changeVariant = useCallback((oldId: string, newId: string) => {
    setLines((prev) => {
      const line = prev.find((p) => p.variantId === oldId);
      if (!line) return prev;
      const rest = prev.filter((p) => p.variantId !== oldId);
      const target = rest.find((p) => p.variantId === newId);
      if (target) return rest.map((p) => (p.variantId === newId ? { ...p, quantity: Math.min(MAX_QTY, p.quantity + line.quantity) } : p));
      return prev.map((p) => (p.variantId === oldId ? { ...p, variantId: newId } : p));
    });
  }, []);
  const remove = useCallback((variantId: string) => setLines((prev) => prev.filter((p) => p.variantId !== variantId)), []);
  const clear = useCallback(() => setLines([]), []);

  const value = useMemo(
    () => ({ lines, count: lines.reduce((s, l) => s + l.quantity, 0), ready, drawerOpen, setDrawerOpen, add, setQuantity, changeVariant, remove, clear }),
    [lines, ready, drawerOpen, add, setQuantity, changeVariant, remove, clear],
  );
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart hors CartProvider");
  return ctx;
}
