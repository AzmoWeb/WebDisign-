import { adminPage } from "@/lib/auth";
import { supabaseService } from "@/lib/supabase/admin";
import { formatPrice } from "@/lib/money";
import { PageTitle } from "@/components/admin/ui";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { updateReservationAction } from "../actions";

export const metadata = { title: "Réservations" };
export const dynamic = "force-dynamic";

const LABEL: Record<string, string> = { pending: "À préparer", ready: "Prête", collected: "Retirée", cancelled: "Annulée", expired: "Expirée" };
const TONE: Record<string, string> = { pending: "bg-[#f3e7c9] text-[#5b4517]", ready: "bg-[#dfe5ee] text-[#26364d]", collected: "bg-[#e3ead9] text-moss", cancelled: "bg-sand text-mist", expired: "bg-sand text-mist" };

type R = { id: string; reservation_number: string; product_id: string | null; product_name: string; brand: string; size: string; color: string; price_cents: number; first_name: string; last_name: string; email: string; phone: string; status: string; expires_at: string; created_at: string };

export default async function ReservationsAdmin({ searchParams }: { searchParams: Promise<{ vue?: string }> }) {
  const { sb } = await adminPage();
  // Les réservations dépassées sont remises en vente avant affichage
  await supabaseService()?.rpc("expire_reservations");
  const sp = await searchParams;
  const open = sp.vue !== "historique";
  let q = sb.from("reservations").select("*").order("created_at", { ascending: false }).limit(200);
  q = open ? q.in("status", ["pending", "ready"]) : q.in("status", ["collected", "cancelled", "expired"]);
  const { data } = await q;
  const fmt = (s: string) => new Date(s).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short", timeZone: "Europe/Paris" });
  return (
    <>
      <PageTitle kicker="Magasin" title="Réservations" />
      <nav className="mb-6 flex gap-2 text-sm">
        <a href="?" className={`border px-3 py-1.5 ${open ? "border-ink bg-ink text-ivory" : "border-line"}`}>En cours</a>
        <a href="?vue=historique" className={`border px-3 py-1.5 ${!open ? "border-ink bg-ink text-ivory" : "border-line"}`}>Historique</a>
      </nav>
      {!data?.length ? (
        <p className="border border-line bg-white/60 p-10 text-center text-graphite">{open ? "Aucune réservation en cours." : "Aucune réservation dans l'historique."}</p>
      ) : (
        <ul className="space-y-4">
          {(data as R[]).map((r) => (
            <li key={r.id} className="border border-line bg-white/60 p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="font-medium">
                    {r.reservation_number} <span className={`ml-2 px-2 py-0.5 text-xs font-normal ${TONE[r.status]}`}>{LABEL[r.status]}</span>
                  </p>
                  <p className="mt-2 text-sm">{r.product_name}{r.brand ? ` · ${r.brand}` : ""} — {r.color}, <strong className="font-medium">pointure {r.size}</strong> — {formatPrice(r.price_cents)}</p>
                  <p className="mt-1 text-sm text-graphite">{r.first_name} {r.last_name} · <a href={`tel:${r.phone}`} className="underline">{r.phone}</a> · <a href={`mailto:${r.email}`} className="underline">{r.email}</a></p>
                  <p className="mt-1 text-xs text-mist">Réservée le {fmt(r.created_at)}{open && <> · <strong className="font-medium text-graphite">à garder jusqu&apos;au {fmt(r.expires_at)}</strong></>}</p>
                </div>
                {open && (
                  <div className="flex flex-wrap gap-2">
                    {r.status === "pending" && (
                      <form action={updateReservationAction}><input type="hidden" name="id" value={r.id} /><input type="hidden" name="status" value="ready" /><button className="btn btn-outline min-h-10 px-4">Prête (prévenir)</button></form>
                    )}
                    <form action={updateReservationAction}><input type="hidden" name="id" value={r.id} /><input type="hidden" name="status" value="collected" /><button className="btn btn-primary min-h-10 px-4">Retirée et payée</button></form>
                    <form action={updateReservationAction}><input type="hidden" name="id" value={r.id} /><input type="hidden" name="status" value="cancelled" />
                      <ConfirmButton message="Annuler cette réservation ? La paire sera remise en vente en ligne." className="btn min-h-10 border-oxblood px-4 text-oxblood hover:bg-oxblood hover:text-ivory">Annuler</ConfirmButton>
                    </form>
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
      <p className="mt-6 text-xs text-mist">Pendant la réservation, la paire n&apos;est plus vendue en ligne. « Annuler » ou l&apos;expiration du délai la remettent automatiquement en vente.</p>
    </>
  );
}
