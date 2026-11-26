import "server-only";
import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { supabaseService } from "./supabase/admin";

export async function clientIp() {
  const h = await headers();
  return (h.get("x-forwarded-for")?.split(",")[0] || h.get("x-real-ip") || "0.0.0.0").trim();
}

export function hashIp(ip: string) {
  return createHash("sha256")
    .update(`${process.env.IP_HASH_SALT || "ajp"}:${ip}`)
    .digest("hex")
    .slice(0, 32);
}

/** Vérifie que la requête provient bien du site (protection CSRF des routes API). */
export async function assertSameOrigin(req: Request) {
  const origin = req.headers.get("origin");
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host");
  if (!origin || !host) return false;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

// Repli mémoire si la base n'est pas configurée (une instance)
const memory = new Map<string, { start: number; count: number }>();

/**
 * Limitation de débit. Utilise la fonction SQL partagée `check_rate_limit`
 * (efficace sur plusieurs instances serverless), sinon un compteur mémoire.
 * Retourne true si la requête est autorisée.
 */
export async function rateLimit(key: string, limit: number, windowSeconds: number): Promise<boolean> {
  const sb = supabaseService();
  if (sb) {
    const { data, error } = await sb.rpc("check_rate_limit", { p_key: key, p_limit: limit, p_window_seconds: windowSeconds });
    if (!error) return data === true;
  }
  const now = Date.now();
  const e = memory.get(key);
  if (!e || now - e.start > windowSeconds * 1000) {
    memory.set(key, { start: now, count: 1 });
    return true;
  }
  e.count += 1;
  return e.count <= limit;
}

/** Vérification Cloudflare Turnstile (si configuré). */
export async function verifyTurnstile(token: string | null, ip: string) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true;
  if (!token) return false;
  const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    body: new URLSearchParams({ secret, response: token, remoteip: ip }),
  });
  const json = (await res.json().catch(() => null)) as { success?: boolean } | null;
  return Boolean(json?.success);
}

/** Valide un chemin de redirection interne (empêche les redirections ouvertes). */
export function safeNext(next: unknown, fallback = "/compte") {
  if (typeof next !== "string") return fallback;
  if (!next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) return fallback;
  return next;
}
