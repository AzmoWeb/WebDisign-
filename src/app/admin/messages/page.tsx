import { adminPage } from "@/lib/auth";
import { PageTitle } from "@/components/admin/ui";
import { updateMessageAction } from "../actions";

export const metadata = { title: "Messages clients" };

const LABEL: Record<string, string> = { new: "Nouveau", in_progress: "En cours", closed: "Traité" };

export default async function MessagesAdmin({ searchParams }: { searchParams: Promise<{ statut?: string }> }) {
  const { sb } = await adminPage();
  const sp = await searchParams;
  let q = sb.from("contact_messages").select("*").order("created_at", { ascending: false }).limit(200);
  if (sp.statut && sp.statut in LABEL) q = q.eq("status", sp.statut);
  const { data } = await q;
  return (
    <>
      <PageTitle kicker="Relation client" title="Messages clients" />
      <nav className="mb-6 flex gap-2 text-sm">
        {[["", "Tous"], ["new", "Nouveaux"], ["in_progress", "En cours"], ["closed", "Traités"]].map(([k, l]) => (
          <a key={k} href={k ? `?statut=${k}` : "?"} className={`border px-3 py-1.5 ${(sp.statut ?? "") === k ? "border-ink bg-ink text-ivory" : "border-line"}`}>{l}</a>
        ))}
      </nav>
      {!data?.length ? <p className="border border-line bg-white/60 p-10 text-center text-graphite">Aucun message.</p> : (
        <ul className="space-y-4">
          {data.map((m) => (
            <li key={m.id} className="border border-line bg-white/60 p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="font-medium">{m.subject} <span className="ml-2 bg-sand px-2 py-0.5 text-xs font-normal">{LABEL[m.status]}</span></p>
                  <p className="mt-1 text-sm text-graphite">{m.name} · <a href={`mailto:${m.email}`} className="underline">{m.email}</a>{m.phone && <> · <a href={`tel:${m.phone}`}>{m.phone}</a></>}</p>
                  <p className="text-xs text-mist">{new Date(m.created_at).toLocaleString("fr-FR")}</p>
                </div>
                <form action={updateMessageAction} className="flex gap-2">
                  <input type="hidden" name="id" value={m.id} />
                  <select name="status" defaultValue={m.status} className="field min-h-9 w-auto py-1 text-sm">{Object.entries(LABEL).map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select>
                  <button className="btn btn-outline min-h-9 px-3">OK</button>
                </form>
              </div>
              <p className="mt-4 text-sm leading-relaxed whitespace-pre-line">{m.message}</p>
              <a href={`mailto:${m.email}?subject=${encodeURIComponent(`Re: ${m.subject}`)}`} className="mt-4 inline-block text-xs underline underline-offset-4">Répondre par e-mail</a>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
