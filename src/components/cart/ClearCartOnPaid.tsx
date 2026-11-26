"use client";
import { useEffect } from "react";
import { useCart } from "./CartProvider";

export function ClearCartOnPaid() {
  const { clear, ready } = useCart();
  useEffect(() => {
    if (ready) clear();
  }, [ready, clear]);
  return null;
}
