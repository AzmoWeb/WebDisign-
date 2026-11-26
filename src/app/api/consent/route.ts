import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseService } from "@/lib/supabase/admin";
import { assertSameOrigin, clientIp, hashIp, rateLimit } from "@/lib/security";
import { CONSENT_POLICY_VERSION } from "@/lib/consent";

const Body = z.object({
  id: z.string().uuid(),
  version: z.string().max(20),
  action: z.enum(["accept_all", "reject_all", "custom", "withdraw"]),
  choices: z.object({ preferences: z.boolean(), statistics: z.boolean(), marketing: z.boolean() }).strict(),
});

/** Historique du consentement : preuve horodatée du choix, sans donnée directement identifiante. */
export async function POST(req: Request) {
  if (!(await assertSameOrigin(req))) return NextResponse.json({ ok: false }, { status: 403 });
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success || parsed.data.version !== CONSENT_POLICY_VERSION) return NextResponse.json({ ok: false }, { status: 400 });
  const ipHash = hashIp(await clientIp());
  if (!(await rateLimit(`consent:${ipHash}`, 30, 3600))) return NextResponse.json({ ok: false }, { status: 429 });
  const sb = supabaseService();
  if (sb) {
    await sb.from("consent_logs").insert({
      consent_id: parsed.data.id,
      policy_version: parsed.data.version,
      action: parsed.data.action,
      choices: parsed.data.choices,
      ip_hash: ipHash,
      user_agent: (req.headers.get("user-agent") ?? "").slice(0, 200),
    });
  }
  return NextResponse.json({ ok: true });
}
