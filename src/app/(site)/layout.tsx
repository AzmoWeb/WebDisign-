import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CartProvider } from "@/components/cart/CartProvider";
import { FavoritesProvider } from "@/components/product/FavoritesProvider";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { DemoNotice } from "@/components/ui/DemoNotice";
import { getSettings } from "@/lib/settings";
import { getCategories } from "@/lib/catalog";
import { getCurrentUser } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isDemoMode } from "@/lib/env";
import { storeJsonLd } from "@/lib/seo";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [settings, categories, user] = await Promise.all([getSettings(), getCategories(), getCurrentUser()]);
  let favoriteIds: string[] = [];
  if (user) {
    const sb = await createSupabaseServerClient();
    const { data } = (await sb?.from("favorites").select("product_id").eq("user_id", user.id)) ?? { data: null };
    favoriteIds = (data ?? []).map((r: { product_id: string }) => r.product_id);
  }
  return (
    <CartProvider>
      <FavoritesProvider initial={favoriteIds} loggedIn={Boolean(user)}>
        <a href="#contenu" className="sr-only z-[60] bg-ink px-4 py-2 text-ivory focus:not-sr-only focus:fixed focus:top-2 focus:left-2">
          Aller au contenu
        </a>
        {isDemoMode() && <DemoNotice />}
        <AnnouncementBar data={settings.announcement} />
        <Header categories={categories} loggedIn={Boolean(user)} />
        <main id="contenu">{children}</main>
        <Footer settings={settings} />
        <CartDrawer />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: storeJsonLd(settings) }} />
      </FavoritesProvider>
    </CartProvider>
  );
}
