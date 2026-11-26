import "server-only";

/** Envoi d'e-mails transactionnels via Resend (facultatif). Sans clé : aucun envoi, journalisation serveur. */
export async function sendEmail(to: string, subject: string, text: string) {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!key || !from || !to) {
    console.info(`[email] non envoyé (Resend non configuré) — ${subject}`);
    return false;
  }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from, to, subject, text }),
  });
  if (!res.ok) console.error("[email] échec d'envoi", res.status);
  return res.ok;
}
