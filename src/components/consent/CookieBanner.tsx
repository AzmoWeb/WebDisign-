"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ALL_DENIED, ALL_GRANTED, type ConsentChoices } from "@/lib/consent";
import { useConsent } from "./ConsentProvider";

const CATEGORIES: { key: keyof ConsentChoices | "necessary"; title: string; text: string; items: string[] }[] = [
  {
    key: "necessary",
    title: "Cookies strictement nécessaires",
    text: "Indispensables au fonctionnement de la boutique. Ils ne peuvent pas être désactivés et ne servent à aucun suivi publicitaire.",
    items: ["Panier", "Sécurité", "Authentification", "Gestion de session", "Mémorisation de vos choix cookies"],
  },
  {
    key: "preferences",
    title: "Cookies de préférences",
    text: "Mémorisent vos réglages pour vous faire gagner du temps lors de vos prochaines visites.",
    items: ["Mémorisation de votre pointure habituelle"],
  },
  {
    key: "statistics",
    title: "Cookies statistiques",
    text: "Nous aident à comprendre la fréquentation du site afin de l'améliorer (Google Analytics, si activé).",
    items: ["Mesure de fréquentation", "Analyse des pages consultées", "Amélioration du site"],
  },
  {
    key: "marketing",
    title: "Cookies marketing",
    text: "Permettent de mesurer nos campagnes et de vous proposer des publicités adaptées (Meta, si activé).",
    items: ["Publicité personnalisée", "Mesure des campagnes", "Partenaires publicitaires"],
  },
];

function Toggle({ checked, onChange, label, disabled }: { checked: boolean; onChange?: (v: boolean) => void; label: string; disabled?: boolean }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange?.(!checked)}
      className={`relative h-7 w-12 shrink-0 rounded-full border transition-colors duration-300 ${checked ? "border-ink bg-ink" : "border-stone bg-paper"} ${disabled ? "opacity-60" : ""}`}
    >
      <span
        className={`absolute top-1/2 left-1 h-5 w-5 -translate-y-1/2 rounded-full transition-transform duration-300 ${checked ? "translate-x-5 bg-ivory" : "bg-stone"}`}
      />
    </button>
  );
}

export function CookieBanner() {
  const { bannerOpen, panelOpen, closePanel, save, choices, consent, openPreferences } = useConsent();
  const [draft, setDraft] = useState<ConsentChoices>(choices);
  const dialogRef = useRef<HTMLDivElement>(null);
  const open = bannerOpen || panelOpen;

  useEffect(() => {
    if (panelOpen) setDraft(choices);
  }, [panelOpen, choices]);

  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    dialogRef.current?.querySelector<HTMLElement>("button")?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && panelOpen && consent) closePanel();
      if (e.key === "Tab" && dialogRef.current) {
        const f = dialogRef.current.querySelectorAll<HTMLElement>("button:not(:disabled), a[href]");
        if (!f.length) return;
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      prev?.focus?.();
    };
  }, [open, panelOpen, consent, closePanel]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-ink/35 p-0 sm:items-center sm:p-6 animate-fade" data-testid="cookie-layer">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cookie-title"
        className={`relative max-h-[92dvh] w-full overflow-y-auto bg-paper text-ink shadow-[0_24px_80px_-20px_rgba(20,18,16,0.35)] sm:rounded-[6px] animate-fade-up ${panelOpen ? "sm:max-w-2xl" : "sm:max-w-xl"}`}
      >
        {!panelOpen ? (
          <div className="px-6 pt-8 pb-6 sm:px-10 sm:pt-10 sm:pb-9">
            <p className="label text-mist">Cookies</p>
            <h2 id="cookie-title" className="display mt-3 text-[1.9rem] sm:text-[2.2rem]">
              Nous respectons votre confidentialité
            </h2>
            <p className="mt-5 text-[0.95rem] leading-relaxed text-graphite">
              Aux Jolis Pas utilise des cookies pour assurer le bon fonctionnement de sa boutique, améliorer votre expérience de navigation et, avec votre accord, mesurer son audience et personnaliser certains contenus. Vous pouvez accepter, refuser ou personnaliser vos préférences à tout moment.
            </p>
            <p className="mt-3 text-sm text-mist">
              <Link href="/politique-cookies" className="link-static">
                En savoir plus sur notre politique de cookies
              </Link>
            </p>
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              <button type="button" className="btn btn-primary w-full" onClick={() => save(ALL_GRANTED, "accept_all")} data-testid="cookie-accept">
                Tout accepter
              </button>
              <button type="button" className="btn btn-primary w-full" onClick={() => save(ALL_DENIED, "reject_all")} data-testid="cookie-reject">
                Tout refuser
              </button>
              <button type="button" className="btn btn-outline w-full sm:col-span-2" onClick={openPreferences} data-testid="cookie-customize">
                Personnaliser mes choix
              </button>
            </div>
          </div>
        ) : (
          <div className="px-6 pt-8 pb-6 sm:px-10 sm:pt-10">
            <div className="flex items-start justify-between gap-6">
              <div>
                <p className="label text-mist">Préférences</p>
                <h2 id="cookie-title" className="display mt-3 text-[1.8rem] sm:text-[2rem]">
                  Personnaliser mes choix
                </h2>
              </div>
              {consent && (
                <button type="button" onClick={closePanel} className="-mr-2 p-2 text-sm text-mist hover:text-ink" aria-label="Fermer sans modifier">
                  Fermer
                </button>
              )}
            </div>
            <p className="mt-4 text-sm leading-relaxed text-graphite">
              Activez uniquement les catégories que vous acceptez. Vous pouvez modifier ce choix à tout moment depuis le lien « Gérer mes cookies » en bas de page.
            </p>
            <ul className="mt-6 divide-y divide-line border-y border-line">
              {CATEGORIES.map((cat) => (
                <li key={cat.key} className="py-5">
                  <div className="flex items-start justify-between gap-6">
                    <div>
                      <h3 className="font-medium">{cat.title}</h3>
                      <p className="mt-1.5 text-sm leading-relaxed text-graphite">{cat.text}</p>
                      <p className="mt-2 text-xs text-mist">{cat.items.join(" · ")}</p>
                    </div>
                    {cat.key === "necessary" ? (
                      <span className="flex flex-col items-end gap-1">
                        <Toggle checked disabled label="Cookies strictement nécessaires (toujours actifs)" />
                        <span className="text-[0.7rem] text-mist">Toujours actifs</span>
                      </span>
                    ) : (
                      <Toggle
                        checked={draft[cat.key as keyof ConsentChoices]}
                        onChange={(v) => setDraft((d) => ({ ...d, [cat.key]: v }))}
                        label={cat.title}
                      />
                    )}
                  </div>
                </li>
              ))}
            </ul>
            <div className="sticky bottom-0 -mx-6 mt-0 grid gap-3 bg-paper px-6 py-5 sm:-mx-10 sm:grid-cols-3 sm:px-10">
              <button type="button" className="btn btn-outline w-full" onClick={() => save(ALL_DENIED, consent ? "withdraw" : "reject_all")} data-testid="cookie-panel-reject">
                Tout refuser
              </button>
              <button type="button" className="btn btn-outline w-full" onClick={() => save(ALL_GRANTED, "accept_all")}>
                Tout accepter
              </button>
              <button type="button" className="btn btn-primary w-full" onClick={() => save(draft, "custom")} data-testid="cookie-save">
                Enregistrer
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
