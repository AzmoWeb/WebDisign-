"use client";
import { useState } from "react";
import { useConsent } from "@/components/consent/ConsentProvider";

/**
 * Carte Google Maps chargée uniquement à la demande (ou si les cookies marketing sont acceptés),
 * car l'intégration Google dépose ses propres traceurs.
 */
export function MapEmbed({ src, title, className = "" }: { src: string; title: string; className?: string }) {
  const { choices } = useConsent();
  const [loaded, setLoaded] = useState(false);
  const show = loaded || choices.marketing;
  return (
    <div className={`relative overflow-hidden bg-sand ${className}`}>
      {show ? (
        <iframe src={src} title={title} className="absolute inset-0 h-full w-full border-0 grayscale-[0.35]" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-8 text-center">
          <svg viewBox="0 0 400 240" className="absolute inset-0 h-full w-full opacity-40" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
            <path d="M0 160 Q120 120 200 150 T400 120" stroke="#b9ae9f" strokeWidth="10" fill="none" />
            <path d="M80 0 L140 240 M260 0 L230 240 M0 60 L400 90" stroke="#cdbfac" strokeWidth="4" fill="none" />
          </svg>
          <p className="relative max-w-xs text-sm text-graphite">L&apos;affichage de la carte charge un service Google susceptible de déposer des cookies.</p>
          <button type="button" className="btn btn-primary relative" onClick={() => setLoaded(true)}>
            Afficher la carte
          </button>
        </div>
      )}
    </div>
  );
}
