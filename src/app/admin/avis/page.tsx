import { adminPage } from "@/lib/auth";
import { getSettings } from "@/lib/settings";
import { PageTitle, Panel } from "@/components/admin/ui";
import { ReviewsSettingsEditor } from "@/components/admin/SettingsEditors";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { deleteReviewAction, saveReviewAction } from "../actions";

export const metadata = { title: "Avis Google" };
export const dynamic = "force-dynamic";

type R = { id: string; author_name: string; rating: number; text: string; review_date: string | null; source_url: string | null; verified: boolean; publication_authorized: boolean; published: boolean };

function ReviewForm({ r }: { r?: R }) {
  return (
    <form action={saveReviewAction} className="grid gap-3 sm:grid-cols-6">
      {r && <input type="hidden" name="id" value={r.id} />}
      <label className="sm:col-span-3"><span className="field-label">Auteur (tel qu&apos;affiché sur Google)</span><input name="author_name" defaultValue={r?.author_name} required className="field min-h-10 py-2" /></label>
      <label className="sm:col-span-1"><span className="field-label">Note</span><select name="rating" defaultValue={r?.rating ?? 5} className="field min-h-10 py-2">{[5, 4, 3, 2, 1].map((n) => <option key={n}>{n}</option>)}</select></label>
      <label className="sm:col-span-2"><span className="field-label">Date de l&apos;avis</span><input type="date" name="review_date" defaultValue={r?.review_date ?? ""} className="field min-h-10 py-2" /></label>
      <label className="sm:col-span-6"><span className="field-label">Texte exact de l&apos;avis (ne pas modifier)</span><textarea name="text" defaultValue={r?.text} required rows={3} className="field" /></label>
      <label className="sm:col-span-6"><span className="field-label">Lien vers l&apos;avis (facultatif)</span><input name="source_url" defaultValue={r?.source_url ?? ""} className="field min-h-10 py-2" /></label>
      <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm sm:col-span-6">
        <label className="flex items-center gap-2"><input type="checkbox" name="verified" defaultChecked={r?.verified} className="accent-ink" /> Avis vérifié sur la fiche Google</label>
        <label className="flex items-center gap-2"><input type="checkbox" name="publication_authorized" defaultChecked={r?.publication_authorized} className="accent-ink" /> Reproduction autorisée</label>
        <label className="flex items-center gap-2"><input type="checkbox" name="published" defaultChecked={r?.published} className="accent-ink" /> Publié sur le site</label>
      </div>
      <div className="sm:col-span-6"><button className="btn btn-primary min-h-10">{r ? "Enregistrer" : "Ajouter l'avis"}</button></div>
    </form>
  );
}

export default async function ReviewsAdmin() {
  const { sb } = await adminPage();
  const [{ data }, settings] = await Promise.all([sb.from("reviews").select("*").order("review_date", { ascending: false }), getSettings()]);
  const api = Boolean(process.env.GOOGLE_PLACES_API_KEY && process.env.GOOGLE_PLACE_ID);
  return (
    <>
      <PageTitle kicker="Réputation" title="Avis Google" />
      <p className={`mb-6 px-4 py-3 text-sm ${api ? "bg-[#e3ead9] text-moss" : "bg-[#f8efd9] text-[#4d3a12]"}`}>
        {api
          ? "L'API Google Places est configurée : la note, le nombre d'avis et les avis récents sont récupérés automatiquement (mise à jour quotidienne). La saisie manuelle ci-dessous n'est utilisée qu'en secours."
          : "L'API Google Places n'est pas configurée : seuls les avis saisis ici, vérifiés ET dont la reproduction est autorisée, sont affichés. N'inventez jamais d'avis et ne modifiez pas leur texte."}
      </p>
      <div className="space-y-6">
        <Panel title="Note globale (saisie manuelle)"><ReviewsSettingsEditor initial={settings.reviews} /></Panel>
        <Panel title="Ajouter un avis Google"><ReviewForm /></Panel>
        {((data ?? []) as R[]).map((r) => (
          <Panel key={r.id} title={`${r.author_name} · ${r.rating}/5${r.published ? " · publié" : ""}`} actions={
            <form action={deleteReviewAction}><input type="hidden" name="id" value={r.id} /><ConfirmButton message="Supprimer cet avis ?" className="text-xs text-oxblood underline">Supprimer</ConfirmButton></form>
          }>
            <ReviewForm r={r} />
          </Panel>
        ))}
      </div>
    </>
  );
}
