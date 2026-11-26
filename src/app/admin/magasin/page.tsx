import { adminPage } from "@/lib/auth";
import { getSettings } from "@/lib/settings";
import { PageTitle, Panel } from "@/components/admin/ui";
import { ShippingEditor, StoreEditor } from "@/components/admin/SettingsEditors";

export const metadata = { title: "Magasin & livraison" };
export const dynamic = "force-dynamic";

export default async function StoreAdmin() {
  await adminPage();
  const s = await getSettings();
  return (
    <>
      <PageTitle kicker="Site" title="Magasin & livraison" />
      <div className="space-y-6">
        <Panel title="Informations du magasin et horaires"><StoreEditor initial={s.store} /></Panel>
        <Panel title="Règles de livraison"><ShippingEditor initial={s.shipping} /></Panel>
      </div>
    </>
  );
}
