"use client";
import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import type { ProductVariant } from "@/lib/types";
import { reserveAction } from "@/app/actions/product";
import { IconClose } from "@/components/ui/Icons";
import { Portal } from "@/components/ui/Portal";

/** Réserver en ligne, payer en magasin. */
export function ReserveInStore({ variant, productName, holdHours, storeAddress, onNeedSize, disabled }: { variant: ProductVariant | null; productName: string; holdHours: number; storeAddress: string; onNeedSize: () => void; disabled?: boolean }) {
  const [open, setOpen] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; message: string; number?: string } | null>(null);
  const [pending, start] = useTransition();

  useEffect(() => {
    if (!open) return;
    const k = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", k);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", k);
      document.body.style.overflow = "";
    };
  }, [open]);

  const hoursLabel = holdHours % 24 === 0 ? `${holdHours / 24} jour${holdHours > 24 ? "s" : ""}` : `${holdHours} h`;

  return (
    <>
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          if (!variant) return onNeedSize();
          setResult(null);
          setOpen(true);
        }}
        className="btn btn-outline mt-3 w-full text-center whitespace-normal"
        data-testid="reserve-in-store"
      >
        Réserver en magasin — payer sur place
      </button>
      <p className="mt-2 text-center text-xs text-mist">Gratuit et sans engagement : nous la gardons {hoursLabel} pour vous.</p>

      {open && variant && (
        <Portal>
          <div className="fixed inset-0 z-[80] flex items-end justify-center bg-ink/40 sm:items-center sm:p-6 animate-fade" role="dialog" aria-modal="true" aria-labelledby="reserve-title">
            <div className="relative max-h-[92dvh] w-full overflow-y-auto bg-paper p-6 sm:max-w-lg sm:rounded-[6px] sm:p-9 animate-fade-up">
              <button type="button" onClick={() => setOpen(false)} className="absolute top-4 right-4 p-2" aria-label="Fermer"><IconClose className="h-6 w-6" /></button>
              {result?.ok ? (
                <div role="status">
                  <p className="label text-mist">Réservation confirmée</p>
                  <h2 id="reserve-title" className="display mt-3 text-3xl">C&apos;est réservé !</h2>
                  <p className="mt-4 leading-relaxed text-graphite">
                    <strong className="font-medium text-ink">{productName}</strong> — {variant.color}, pointure {variant.size}, vous attend au magasin pendant {hoursLabel}.
                  </p>
                  <p className="mt-3 text-sm text-graphite">N° de réservation : <strong className="text-ink">{result.number}</strong><br />{storeAddress}</p>
                  <p className="mt-3 text-sm text-graphite">Un récapitulatif vous est envoyé par e-mail. Le paiement se fait au magasin.</p>
                  <button type="button" onClick={() => setOpen(false)} className="btn btn-primary mt-8 w-full">Continuer mes achats</button>
                </div>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const fd = new FormData(e.currentTarget);
                    start(async () =>
                      setResult(
                        await reserveAction(
                          { variantId: variant.id, firstName: fd.get("firstName"), lastName: fd.get("lastName"), email: fd.get("email"), phone: fd.get("phone"), consent: fd.get("consent") === "on" },
                          String(fd.get("website") ?? ""),
                        ),
                      ),
                    );
                  }}
                >
                  <p className="label text-mist">Réserver en magasin</p>
                  <h2 id="reserve-title" className="display mt-3 text-3xl">Nous la gardons pour vous</h2>
                  <p className="mt-3 text-sm leading-relaxed text-graphite">
                    {productName} — {variant.color}, pointure {variant.size}. Mise de côté pendant {hoursLabel}, vous l&apos;essayez et payez au magasin : {storeAddress}.
                  </p>
                  <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    <label className="block"><span className="field-label">Prénom</span><input name="firstName" required maxLength={80} autoComplete="given-name" className="field" /></label>
                    <label className="block"><span className="field-label">Nom</span><input name="lastName" required maxLength={80} autoComplete="family-name" className="field" /></label>
                    <label className="block"><span className="field-label">E-mail</span><input name="email" type="email" required autoComplete="email" className="field" /></label>
                    <label className="block"><span className="field-label">Téléphone</span><input name="phone" type="tel" required autoComplete="tel" className="field" /></label>
                  </div>
                  <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
                  <label className="mt-5 flex items-start gap-3 text-sm">
                    <input type="checkbox" name="consent" required className="mt-1 accent-ink" />
                    <span>J&apos;accepte que mes coordonnées soient utilisées pour gérer cette réservation (<Link href="/politique-de-confidentialite" target="_blank" className="link-static">en savoir plus</Link>).</span>
                  </label>
                  {result && !result.ok && <p className="mt-4 bg-sand px-3 py-2 text-sm text-oxblood" role="alert">{result.message}</p>}
                  <button className="btn btn-primary mt-6 w-full" disabled={pending}>{pending ? "Réservation…" : "Confirmer la réservation"}</button>
                </form>
              )}
            </div>
          </div>
        </Portal>
      )}
    </>
  );
}
