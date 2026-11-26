import { requireUser } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { deleteAddressAction } from "@/app/actions/account";
import { AddressForm } from "@/components/account/AddressForm";

export const metadata = { title: "Mes adresses", robots: { index: false } };

export default async function AddressesPage() {
  const user = await requireUser("/compte/adresses");
  const sb = (await createSupabaseServerClient())!;
  const { data: addresses } = await sb.from("addresses").select("*").eq("user_id", user.id).order("is_default", { ascending: false });
  return (
    <section>
      <h2 className="display text-2xl">Mes adresses</h2>
      {addresses?.length ? (
        <ul className="mt-8 grid gap-4 md:grid-cols-2">
          {addresses.map((a) => (
            <li key={a.id} className="border border-line p-6 text-sm">
              <details>
                <summary className="flex cursor-pointer list-none flex-col [&::-webkit-details-marker]:hidden">
                  <span className="flex items-center justify-between">
                    <span className="font-medium">{a.label || "Adresse"}</span>
                    {a.is_default && <span className="label text-mist">Par défaut</span>}
                  </span>
                  <span className="mt-3 leading-relaxed text-graphite">{a.first_name} {a.last_name}<br />{a.line1}{a.line2 ? `, ${a.line2}` : ""}<br />{a.postal_code} {a.city}</span>
                  <span className="mt-4 text-xs underline underline-offset-4">Modifier</span>
                </summary>
                <div className="mt-6 border-t border-line pt-6"><AddressForm address={a} /></div>
              </details>
              <form action={deleteAddressAction} className="mt-3">
                <input type="hidden" name="id" value={a.id} />
                <button type="submit" className="text-xs text-oxblood underline underline-offset-4">Supprimer</button>
              </form>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-6 text-graphite">Aucune adresse enregistrée.</p>
      )}
      <div className="mt-12 border-t border-line pt-8">
        <h3 className="label mb-6">Ajouter une adresse</h3>
        <AddressForm />
      </div>
    </section>
  );
}
