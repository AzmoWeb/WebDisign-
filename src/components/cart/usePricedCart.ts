"use client";
import { useEffect, useState } from "react";
import { priceCartAction, type PricedCart } from "@/app/actions/cart";
import { useCart } from "./CartProvider";

export function usePricedCart(enabled = true) {
  const { lines, ready } = useCart();
  const [data, setData] = useState<PricedCart | null>(null);
  const [loading, setLoading] = useState(true);
  const key = JSON.stringify(lines);
  useEffect(() => {
    if (!ready || !enabled) return;
    let alive = true;
    setLoading(true);
    priceCartAction(lines)
      .then((d) => alive && setData(d))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, ready, enabled]);
  return { data, loading: loading || !ready };
}
