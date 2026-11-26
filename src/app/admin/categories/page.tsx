import { adminPage } from "@/lib/auth";
import { PageTitle, Panel } from "@/components/admin/ui";
import { deleteCategoryAction, saveCategoryAction } from "../actions";
import { ConfirmButton } from "@/components/admin/ConfirmButton";

export const metadata = { title: "Catégories" };

type C = { id: string; slug: string; name: string; gender: string; position: number; active: boolean; description: string | null };

export default async function CategoriesAdmin() {
  const { sb } = await adminPage();
  const { data } = await sb.from("categories").select("*").order("position");
  const cats = (data ?? []) as C[];
  return (
    <>
      <PageTitle kicker="Catalogue" title="Catégories" />
      <div className="grid gap-6 xl:grid-cols-2">
        {(["femme", "homme"] as const).map((g) => (
          <Panel key={g} title={g === "femme" ? "Femme" : "Homme"}>
            <ul className="divide-y divide-line">
              {cats.filter((c) => c.gender === g).map((c) => (
                <li key={c.id} className="py-3">
                  <form action={saveCategoryAction} className="grid grid-cols-[1fr_4rem_auto_auto] items-center gap-2">
                    <input type="hidden" name="id" value={c.id} />
                    <input type="hidden" name="gender" value={g} />
                    <input name="name" defaultValue={c.name} className="field min-h-9 py-1" aria-label="Nom" />
                    <input name="position" type="number" defaultValue={c.position} className="field min-h-9 py-1" aria-label="Ordre" />
                    <label className="flex items-center gap-1 text-xs"><input type="checkbox" name="active" defaultChecked={c.active} className="accent-ink" /> Active</label>
                    <button className="text-xs underline">OK</button>
                    <input name="description" defaultValue={c.description ?? ""} placeholder="Description (SEO, facultatif)" className="field col-span-4 min-h-9 py-1 text-xs" />
                  </form>
                  <form action={deleteCategoryAction} className="mt-1 text-right">
                    <input type="hidden" name="id" value={c.id} />
                    <span className="mr-3 text-xs text-mist">/{g}/{c.slug}</span>
                    <ConfirmButton message="Supprimer cette catégorie ? Les produits associés n'auront plus de catégorie." className="text-xs text-oxblood underline">Supprimer</ConfirmButton>
                  </form>
                </li>
              ))}
            </ul>
            <form action={saveCategoryAction} className="mt-4 flex gap-2 border-t border-line pt-4">
              <input type="hidden" name="gender" value={g} />
              <input type="hidden" name="active" value="on" />
              <input name="name" required placeholder="Nouvelle catégorie" className="field min-h-10 py-2" />
              <input type="hidden" name="position" value={cats.filter((c) => c.gender === g).length + 1} />
              <button className="btn btn-outline min-h-10">Ajouter</button>
            </form>
          </Panel>
        ))}
      </div>
    </>
  );
}
