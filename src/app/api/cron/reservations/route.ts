import { NextResponse } from "next/server";
import { supabaseService } from "@/lib/supabase/admin";

/** Tâche planifiée (vercel.json) : remet en vente les paires dont la réservation a expiré. */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const sb = supabaseService();
  if (!sb) return NextResponse.json({ expired: 0 });
  const { data, error } = await sb.rpc("expire_reservations");
  if (error) return NextResponse.json({ error: "db" }, { status: 500 });
  return NextResponse.json({ expired: data ?? 0 });
}
