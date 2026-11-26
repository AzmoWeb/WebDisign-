"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { AnnouncementSettings } from "@/lib/types";

export function AnnouncementBar({ data }: { data: AnnouncementSettings }) {
  const msgs = data.messages.filter((m) => m.text.trim());
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (msgs.length < 2 || paused) return;
    const t = setInterval(() => setI((x) => (x + 1) % msgs.length), 5000);
    return () => clearInterval(t);
  }, [msgs.length, paused]);
  if (!data.enabled || !msgs.length) return null;
  const m = msgs[i];
  return (
    <div className="bg-ink text-ivory" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocus={() => setPaused(true)} onBlur={() => setPaused(false)}>
      <div className="container-site flex h-9 items-center justify-center gap-4 text-[0.7rem] tracking-[0.14em] uppercase">
        {msgs.length > 1 && (
          <button type="button" aria-label="Message précédent" className="hidden p-1 opacity-60 hover:opacity-100 sm:block" onClick={() => setI((x) => (x - 1 + msgs.length) % msgs.length)}>
            ‹
          </button>
        )}
        <p key={i} className="truncate animate-fade" aria-live="polite">
          {m.href ? (
            <Link href={m.href} className="link-underline">
              {m.text}
            </Link>
          ) : (
            m.text
          )}
        </p>
        {msgs.length > 1 && (
          <button type="button" aria-label="Message suivant" className="hidden p-1 opacity-60 hover:opacity-100 sm:block" onClick={() => setI((x) => (x + 1) % msgs.length)}>
            ›
          </button>
        )}
      </div>
    </div>
  );
}
