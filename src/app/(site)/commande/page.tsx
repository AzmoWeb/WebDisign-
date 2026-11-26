import { getSettings } from "@/lib/settings";
import { getCurrentUser } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isDemoMode, isStripeConfigured } from "@/lib/env";
import { CheckoutForm } from "@/components/cart/CheckoutForm";

export const metadata = { title: "Commande", robots: { index: false } };

export default async function CheckoutPage() {
  const [settings, user] = await Promise.all([getSettings(), getCurrentUser()]);
  let address = null;
  if (user) {
    const sb = await createSupabaseServerClient();
    const { data } = (await sb?.from("addresses").select("line1, line2, postal_code, city").eq("user_id", user.id).order("is_default", { ascending: false }).limit(1).maybeSingle()) ?? { data: null };
    if (data) address = { line1: data.line1, line2: data.line2 ?? "", postalCode: data.postal_code, city: data.city };
  }
  return (
    <CheckoutForm
      shipping={settings.shipping}
      storeLabel={`${settings.store.street}, ${settings.store.postalCode} ${settings.store.city}`}
      paymentsEnabled={!isDemoMode() && isStripeConfigured()}
      prefill={user ? { firstName: user.firstName, lastName: user.lastName, email: user.email, phone: user.phone, address } : null}
    />
  );
}
