import { adminPage } from "@/lib/auth";
import { getSettings } from "@/lib/settings";
import { formatPrice } from "@/lib/money";
import { PageTitle, Panel } from "@/components/admin/ui";
import { BulkSaleForm, PromoCodeForm } from "@/components/admin/PromoForms";
import { PromoBannerEditor } from "@/components/admin/SettingsEditors";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { deletePromoCodeAction, togglePromoCodeAction } from "../actions";

export const metadata = { title: "Promotions" };
export const dynamic = "force-dynamic";

type Code = { id: string; code: string; kind: string; value: number; min_subtotal_cents: number; starts_at: string | null; ends_at: string | null; max_uses: number | null; uses: number; active: boolean; description: string | null };

export default async function PromotionsAdmin() {
  const { sb } = await adminPage();
  const [{ data: codes }, { data: cats }, settings] = await Promise.all([
    sb.from("promo_codes").select("*").order("created_at", { ascending: false }),
    sb.from("categories").select("id, name, gender").order("gender").order("position"),
    getSettings(),
  ]);
  const d = (s: string | null) => (s ? new Date(s).toLocaleDateString("fr-FR") : null);
  return (
    <>
      <PageTitle kicker="Ventes" title="Promotions" />
      <div className="space-y-6">
        <Panel title="Soldes en un clic"><BulkSaleForm categories={cats ?? []} /></Panel>
        <Panel title="Bannière promotionnelle de l'accueil"><PromoBannerEditor initial={settings.promoBanner} /></Panel>
        <Panel title="Créer un code promo"><PromoCodeForm /></Panel>
        <Panel title="Codes promo">
          {!codes?.length ? (
            <p className="text-sm text-mist">Aucun code pour l&apos;instant.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[40rem] text-sm">
                <thead><tr className="border-b border-line text-left text-xs text-mist"><th className="py-2 font-normal">Code</th><th className="font-normal">Remise</th><th className="font-normal">Conditions</th><th className="font-normal">Utilisé</th><th className="font-normal">État</th><th /></tr></thead>
                <tbody>
                  {(codes as Code[]).map((c) => (
                    <tr key={c.id} className="border-b border-line last:border-0">
                      <td className="py-3 font-medium">{c.code}{c.description && <span className="block text-xs font-normal text-mist">{c.description}</span>}</td>
                      <td>{c.kind === "percent" ? `−${c.value} %` : `−${formatPrice(c.value)}`}</td>
                      <td className="text-xs text-graphite">
                        {c.min_subtotal_cents > 0 && <span className="block">Dès {formatPrice(c.min_subtotal_cents)}</span>}
                        {(c.starts_at || c.ends_at) && <span className="block">{d(c.starts_at) ?? "…"} → {d(c.ends_at) ?? "…"}</span>}
                      </td>
                      <td className="tabular-nums">{c.uses}{c.max_uses ? ` / ${c.max_uses}` : ""}</td>
                      <td>
                        <form action={togglePromoCodeAction}>
                          <input type="hidden" name="id" value={c.id} />
                          <input type="hidden" name="active" value={String(!c.active)} />
                          <button className={`px-2 py-0.5 text-xs ${c.active ? "bg-[#e3ead9] text-moss" : "bg-sand text-mist"}`}>{c.active ? "Actif" : "Inactif"}</button>
                        </form>
                      </td>
                      <td className="text-right">
                        <form action={deletePromoCodeAction}>
                          <input type="hidden" name="id" value={c.id} />
                          <ConfirmButton message={`Supprimer le code ${c.code} ?`} className="text-xs text-oxblood underline">Supprimer</ConfirmButton>
                        </form>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <p className="mt-4 text-xs text-mist">Le client saisit le code au moment de la commande. La remise s&apos;applique aux articles (pas à la livraison) et le code n&apos;est compté qu&apos;une fois le paiement confirmé.</p>
        </Panel>
      </div>
    </>
  );
}
