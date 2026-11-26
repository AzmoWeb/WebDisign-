import { adminPage } from "@/lib/auth";
import { getSettings } from "@/lib/settings";
import { PageTitle, Panel } from "@/components/admin/ui";
import { AnnouncementEditor, CampaignEditor, HeroEditor, StoreIntroEditor } from "@/components/admin/SettingsEditors";

export const metadata = { title: "Contenus du site" };
export const dynamic = "force-dynamic";

export default async function ContentAdmin() {
  await adminPage();
  const s = await getSettings();
  return (
    <>
      <PageTitle kicker="Site" title="Contenus du site" />
      <div className="space-y-6">
        <Panel title="Bandeau supérieur (nouveautés, promotions, opérations)"><AnnouncementEditor initial={s.announcement} /></Panel>
        <Panel title="Hero de la page d'accueil"><HeroEditor initial={s.hero} /></Panel>
        <Panel title="Campagne publicitaire diagonale"><CampaignEditor initial={s.campaign} /></Panel>
        <Panel title="Présentation du magasin (accueil)"><StoreIntroEditor initial={s.storeIntro} /></Panel>
      </div>
    </>
  );
}
