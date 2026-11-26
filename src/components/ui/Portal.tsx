"use client";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

/**
 * Affiche ses enfants directement dans <body>.
 * Indispensable pour les panneaux plein écran placés dans un parent qui crée un
 * « containing block » (backdrop-filter, transform…), sinon `position: fixed` est rogné.
 */
export function Portal({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted ? createPortal(children, document.body) : null;
}
