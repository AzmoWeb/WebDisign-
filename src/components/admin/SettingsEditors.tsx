"use client";
import { useState, useTransition } from "react";
import { saveSettingAction, uploadSiteImageAction } from "@/app/admin/actions";
import type { AnnouncementSettings, CampaignSettings, HeroSettings, ShippingMethod, ShippingSettings, SiteSettings, StoreInfo } from "@/lib/types";

function useSaver<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(initial);
  const [msg, setMsg] = useState<{ ok?: boolean; text: string } | null>(null);
  const [pending, start] = useTransition();
  const save = () => start(async () => {
    const r = await saveSettingAction(key, value);
    setMsg({ ok: r?.ok, text: r?.error ?? r?.message ?? "" });
  });
  return { value, setValue, save, pending, msg };
}

function SaveBar({ save, pending, msg }: { save: () => void; pending: boolean; msg: { ok?: boolean; text: string } | null }) {
  return (
    <div className="mt-6 flex flex-wrap items-center gap-4 border-t border-line pt-5">
      <button type="button" onClick={save} disabled={pending} className="btn btn-primary">{pending ? "Publication…" : "Publier"}</button>
      {msg && <span className={`text-sm ${msg.ok ? "text-moss" : "text-oxblood"}`} role="status">{msg.text}</span>}
    </div>
  );
}

const T = ({ label, value, onChange, max = 200, area }: { label: string; value: string | null | undefined; onChange: (v: string) => void; max?: number; area?: boolean }) => (
  <label className="block">
    <span className="field-label">{label}</span>
    {area ? <textarea value={value ?? ""} onChange={(e) => onChange(e.target.value)} maxLength={max} rows={4} className="field" /> : <input value={value ?? ""} onChange={(e) => onChange(e.target.value)} maxLength={max} className="field" />}
  </label>
);

function ImageField({ label, url, onChange }: { label: string; url: string | null; onChange: (u: string | null) => void }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  return (
    <div>
      <span className="field-label">{label}</span>
      <div className="flex flex-wrap items-center gap-3">
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt="" className="h-20 w-28 border border-line object-cover" />
        ) : (
          <span className="flex h-20 w-28 items-center justify-center border border-dashed border-stone text-center text-[0.65rem] text-mist">Visuel provisoire</span>
        )}
        <label className="btn btn-outline min-h-10 cursor-pointer">
          {busy ? "Envoi…" : "Choisir une image"}
          <input type="file" accept="image/jpeg,image/png,image/webp,image/avif" className="sr-only" onChange={async (e) => {
            const f = e.target.files?.[0];
            if (!f) return;
            setBusy(true); setErr(null);
            const fd = new FormData(); fd.append("file", f);
            const r = await uploadSiteImageAction(fd);
            setBusy(false);
            if (r.url) onChange(r.url); else setErr(r.error ?? "Erreur");
          }} />
        </label>
        {url && <button type="button" onClick={() => onChange(null)} className="text-xs text-oxblood underline">Retirer</button>}
      </div>
      {err && <p className="mt-1 text-xs text-oxblood">{err}</p>}
    </div>
  );
}

export function AnnouncementEditor({ initial }: { initial: AnnouncementSettings }) {
  const s = useSaver("announcement", initial);
  const v = s.value;
  return (
    <div>
      <label className="mb-4 flex items-center gap-2 text-sm"><input type="checkbox" checked={v.enabled} onChange={(e) => s.setValue({ ...v, enabled: e.target.checked })} className="accent-ink" /> Afficher le bandeau</label>
      <div className="space-y-3">
        {v.messages.map((m, i) => (
          <div key={i} className="grid gap-2 sm:grid-cols-[1fr_14rem_auto] sm:items-end">
            <T label={`Message ${i + 1}`} value={m.text} max={140} onChange={(t) => s.setValue({ ...v, messages: v.messages.map((x, k) => (k === i ? { ...x, text: t } : x)) })} />
            <T label="Lien (ex. /promotions)" value={m.href ?? ""} max={300} onChange={(t) => s.setValue({ ...v, messages: v.messages.map((x, k) => (k === i ? { ...x, href: t || null } : x)) })} />
            <button type="button" onClick={() => s.setValue({ ...v, messages: v.messages.filter((_, k) => k !== i) })} className="pb-3 text-xs text-oxblood underline">Retirer</button>
          </div>
        ))}
      </div>
      {v.messages.length < 6 && <button type="button" onClick={() => s.setValue({ ...v, messages: [...v.messages, { text: "", href: null }] })} className="mt-4 text-sm underline">+ Ajouter un message</button>}
      <SaveBar {...s} />
    </div>
  );
}

export function HeroEditor({ initial }: { initial: HeroSettings }) {
  const s = useSaver("hero", initial);
  const v = s.value;
  const up = (p: Partial<HeroSettings>) => s.setValue({ ...v, ...p });
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="md:col-span-2"><T label="Titre" value={v.title} max={120} onChange={(t) => up({ title: t })} /></div>
      <div className="md:col-span-2"><T label="Sous-titre" value={v.subtitle} max={300} area onChange={(t) => up({ subtitle: t })} /></div>
      <T label="Bouton principal" value={v.primaryLabel} max={40} onChange={(t) => up({ primaryLabel: t })} />
      <T label="Lien du bouton principal" value={v.primaryHref} max={300} onChange={(t) => up({ primaryHref: t })} />
      <T label="Bouton secondaire" value={v.secondaryLabel} max={40} onChange={(t) => up({ secondaryLabel: t })} />
      <T label="Lien du bouton secondaire" value={v.secondaryHref} max={300} onChange={(t) => up({ secondaryHref: t })} />
      <div className="md:col-span-2"><ImageField label="Photographie du hero (sinon : campagne diagonale)" url={v.imageUrl} onChange={(u) => up({ imageUrl: u })} /></div>
      <div className="md:col-span-2"><T label="Texte alternatif de l'image" value={v.imageAlt} onChange={(t) => up({ imageAlt: t })} /></div>
      <div className="md:col-span-2"><SaveBar {...s} /></div>
    </div>
  );
}

export function CampaignEditor({ initial }: { initial: CampaignSettings }) {
  const s = useSaver("campaign", initial);
  const v = s.value;
  const up = (p: Partial<CampaignSettings>) => s.setValue({ ...v, ...p });
  const SUGGESTIONS = ["TROUVEZ CHAUSSURE À VOTRE PIED", "LE STYLE COMMENCE PAR LES DÉTAILS", "COLLECTIONS FEMME & HOMME", "VOTRE STYLE, NOS COLLECTIONS"];
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="md:col-span-2">
        <T label="Accroche de la campagne" value={v.title} max={120} onChange={(t) => up({ title: t })} />
        <div className="mt-2 flex flex-wrap gap-2">{SUGGESTIONS.map((x) => <button type="button" key={x} onClick={() => up({ title: x })} className="border border-line px-2 py-1 text-[0.65rem] tracking-wide hover:border-ink">{x}</button>)}</div>
      </div>
      <T label="Surtitre" value={v.subtitle} max={120} onChange={(t) => up({ subtitle: t })} />
      <div className="grid grid-cols-2 gap-3"><T label="Bouton" value={v.ctaLabel} max={40} onChange={(t) => up({ ctaLabel: t })} /><T label="Lien" value={v.ctaHref} max={300} onChange={(t) => up({ ctaHref: t })} /></div>
      {v.panels.map((p, i) => (
        <fieldset key={i} className="space-y-3 border border-line p-4 md:col-span-2">
          <legend className="label px-1">Section diagonale {i + 1} — {["mode féminine", "baskets", "mode masculine"][i]}</legend>
          <div className="grid gap-3 sm:grid-cols-2">
            <T label="Libellé" value={p.label} max={30} onChange={(t) => up({ panels: v.panels.map((x, k) => (k === i ? { ...x, label: t } : x)) })} />
            <T label="Lien" value={p.href} max={300} onChange={(t) => up({ panels: v.panels.map((x, k) => (k === i ? { ...x, href: t } : x)) })} />
          </div>
          <ImageField label="Photographie" url={p.imageUrl} onChange={(u) => up({ panels: v.panels.map((x, k) => (k === i ? { ...x, imageUrl: u } : x)) })} />
          <T label="Texte alternatif" value={p.imageAlt} onChange={(t) => up({ panels: v.panels.map((x, k) => (k === i ? { ...x, imageAlt: t } : x)) })} />
        </fieldset>
      ))}
      <div className="md:col-span-2"><SaveBar {...s} /></div>
    </div>
  );
}

export function StoreIntroEditor({ initial }: { initial: SiteSettings["storeIntro"] }) {
  const s = useSaver("storeIntro", initial);
  const v = s.value;
  return (
    <div className="space-y-4">
      <T label="Titre" value={v.title} max={120} onChange={(t) => s.setValue({ ...v, title: t })} />
      <T label="Texte de présentation" value={v.text} max={1500} area onChange={(t) => s.setValue({ ...v, text: t })} />
      <ImageField label="Photographie du magasin" url={v.imageUrl} onChange={(u) => s.setValue({ ...v, imageUrl: u })} />
      <SaveBar {...s} />
    </div>
  );
}

function BrandsField({ initial, onChange }: { initial: string[]; onChange: (b: string[]) => void }) {
  const [text, setText] = useState(initial.join(", "));
  return (
    <T
      label="Marques distribuées (séparées par des virgules)"
      value={text}
      max={1000}
      onChange={(t) => {
        setText(t);
        onChange(t.split(",").map((x) => x.trim()).filter(Boolean));
      }}
    />
  );
}

const DAYS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];

export function StoreEditor({ initial }: { initial: StoreInfo }) {
  const s = useSaver("store", initial);
  const v = s.value;
  const up = (p: Partial<StoreInfo>) => s.setValue({ ...v, ...p });
  const hours = v.hours ?? DAYS.map((day) => ({ day, closed: true, open: null, close: null, open2: null, close2: null }));
  const setDay = (i: number, p: Record<string, unknown>) => up({ hours: hours.map((h, k) => (k === i ? { ...h, ...p } : h)) });
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <T label="Nom" value={v.name} onChange={(t) => up({ name: t })} />
      <T label="Téléphone (affiché)" value={v.phone} max={20} onChange={(t) => up({ phone: t })} />
      <T label="Adresse" value={v.street} onChange={(t) => up({ street: t })} />
      <div className="grid grid-cols-[7rem_1fr] gap-3"><T label="Code postal" value={v.postalCode} max={5} onChange={(t) => up({ postalCode: t })} /><T label="Ville" value={v.city} onChange={(t) => up({ city: t })} /></div>
      <T label="Téléphone international (+33…)" value={v.phoneE164} max={16} onChange={(t) => up({ phoneE164: t })} />
      <T label="E-mail public (facultatif)" value={v.email} max={160} onChange={(t) => up({ email: t || null })} />
      <div className="md:col-span-2"><T label="Lien Google Maps" value={v.mapsUrl} max={500} onChange={(t) => up({ mapsUrl: t })} /></div>
      <div className="md:col-span-2"><T label="Présentation (page Notre magasin)" value={v.description} max={2000} area onChange={(t) => up({ description: t || null })} /></div>
      <div className="md:col-span-2"><BrandsField initial={v.brands ?? []} onChange={(brands) => up({ brands })} /></div>

      <fieldset className="md:col-span-2">
        <legend className="field-label">Horaires d&apos;ouverture</legend>
        <label className="mb-3 flex items-center gap-2 text-sm"><input type="checkbox" checked={v.hours != null} onChange={(e) => up({ hours: e.target.checked ? hours : null })} className="accent-ink" /> Afficher les horaires sur le site</label>
        {v.hours && (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[36rem] text-sm">
              <thead><tr className="text-left text-xs text-mist"><th className="py-1 font-normal">Jour</th><th className="font-normal">Fermé</th><th className="font-normal">Matin / journée</th><th className="font-normal">Après-midi (facultatif)</th></tr></thead>
              <tbody>
                {hours.map((h, i) => (
                  <tr key={h.day} className="border-t border-line">
                    <td className="py-2">{h.day}</td>
                    <td><input type="checkbox" checked={h.closed} onChange={(e) => setDay(i, { closed: e.target.checked })} className="accent-ink" aria-label={`${h.day} fermé`} /></td>
                    <td><span className="flex gap-1"><input type="time" value={h.open ?? ""} disabled={h.closed} onChange={(e) => setDay(i, { open: e.target.value || null })} className="field min-h-9 w-28 py-1" /><input type="time" value={h.close ?? ""} disabled={h.closed} onChange={(e) => setDay(i, { close: e.target.value || null })} className="field min-h-9 w-28 py-1" /></span></td>
                    <td><span className="flex gap-1"><input type="time" value={h.open2 ?? ""} disabled={h.closed} onChange={(e) => setDay(i, { open2: e.target.value || null })} className="field min-h-9 w-28 py-1" /><input type="time" value={h.close2 ?? ""} disabled={h.closed} onChange={(e) => setDay(i, { close2: e.target.value || null })} className="field min-h-9 w-28 py-1" /></span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </fieldset>
      <div className="md:col-span-2"><T label="Note sur les horaires (fermetures exceptionnelles…)" value={v.hoursNote} max={300} onChange={(t) => up({ hoursNote: t || null })} /></div>
      <div className="md:col-span-2"><SaveBar {...s} /></div>
    </div>
  );
}

const toCents = (s: string) => (s.trim() === "" ? null : Math.round(Number(s.replace(",", ".")) * 100));
const fromCents = (c: number | null) => (c == null ? "" : (c / 100).toFixed(2).replace(".", ","));

function MoneyInput({ cents, onChange }: { cents: number | null; onChange: (c: number | null) => void }) {
  const [text, setText] = useState(fromCents(cents));
  return (
    <input
      value={text}
      inputMode="decimal"
      className="field"
      onChange={(e) => {
        setText(e.target.value);
        const c = toCents(e.target.value);
        onChange(c != null && Number.isFinite(c) && c >= 0 ? c : null);
      }}
    />
  );
}

export function ShippingEditor({ initial }: { initial: ShippingSettings }) {
  const s = useSaver("shipping", initial);
  const v = s.value;
  const up = (p: Partial<ShippingSettings>) => s.setValue({ ...v, ...p });
  const setMethod = (i: number, p: Partial<ShippingMethod>) => up({ methods: v.methods.map((m, k) => (k === i ? { ...m, ...p } : m)) });
  const CARRIERS: Record<string, string> = { colissimo: "Colissimo (La Poste)", mondial_relay: "Mondial Relay", chronopost: "Chronopost", autre: "Autre" };
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="space-y-4 md:col-span-2">
        {v.methods.map((m, i) => (
          <fieldset key={m.id} className="grid gap-3 border border-line p-4 sm:grid-cols-6">
            <legend className="px-1 text-sm font-medium">{CARRIERS[m.carrier]} · {m.type === "relay" ? "point relais" : "domicile"}</legend>
            <label className="flex items-center gap-2 text-sm sm:col-span-6"><input type="checkbox" checked={m.enabled} onChange={(e) => setMethod(i, { enabled: e.target.checked })} className="accent-ink" /> Proposer ce mode</label>
            <div className="sm:col-span-6"><T label="Libellé affiché au client" value={m.label} max={100} onChange={(t) => setMethod(i, { label: t })} /></div>
            <label className="block sm:col-span-2"><span className="field-label">Prix TTC (€) *</span><MoneyInput cents={m.priceCents} onChange={(c) => setMethod(i, { priceCents: c })} /></label>
            <label className="block sm:col-span-2"><span className="field-label">Offerte dès (€)</span><MoneyInput cents={m.freeFromCents} onChange={(c) => setMethod(i, { freeFromCents: c })} /></label>
            <div className="sm:col-span-2"><T label="Délai affiché" value={m.delayText} max={120} onChange={(t) => setMethod(i, { delayText: t || null })} /></div>
            {m.enabled && m.priceCents == null && <p className="text-xs text-oxblood sm:col-span-6">Renseignez le prix : sans tarif, ce mode n&apos;est pas proposé aux clients.</p>}
            <button type="button" onClick={() => up({ methods: v.methods.filter((_, k) => k !== i) })} className="justify-self-start text-xs text-oxblood underline sm:col-span-6">Supprimer ce mode</button>
          </fieldset>
        ))}
        <div className="flex flex-wrap gap-2">
          {(["colissimo:home", "colissimo:relay", "mondial_relay:relay", "mondial_relay:home", "chronopost:home"] as const).map((k) => {
            const [carrier, type] = k.split(":") as [ShippingMethod["carrier"], ShippingMethod["type"]];
            return (
              <button key={k} type="button" className="border border-line px-3 py-1.5 text-xs hover:border-ink"
                onClick={() => up({ methods: [...v.methods, { id: `${carrier.replace("_", "-")}-${type === "home" ? "domicile" : "relais"}-${Date.now().toString(36)}`, carrier, type, label: `${CARRIERS[carrier].replace(" (La Poste)", "")} — ${type === "home" ? "livraison à domicile" : "livraison en point relais"}`, enabled: true, priceCents: null, freeFromCents: null, delayText: null }] })}>
                + {CARRIERS[carrier]} {type === "home" ? "domicile" : "relais"}
              </button>
            );
          })}
        </div>
      </div>
      <label className="flex items-center gap-2 border-t border-line pt-4 text-sm md:col-span-2"><input type="checkbox" checked={v.pickupEnabled} onChange={(e) => up({ pickupEnabled: e.target.checked })} className="accent-ink" /> Proposer le retrait en magasin (uniquement si ce service est réellement assuré)</label>
      <div className="md:col-span-2"><T label="Précisions sur le retrait" value={v.pickupText} onChange={(t) => up({ pickupText: t || null })} /></div>
      <p className="text-xs text-mist md:col-span-2">Tant qu&apos;aucun mode de livraison n&apos;est configuré, la commande en ligne reste fermée.</p>
      <div className="md:col-span-2"><SaveBar {...s} /></div>
    </div>
  );
}

export function ReviewsSettingsEditor({ initial }: { initial: SiteSettings["reviews"] }) {
  const s = useSaver("reviews", initial);
  const v = s.value;
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <label className="block"><span className="field-label">Note Google relevée (ex. 4,8)</span><input value={v.manualRating ?? ""} onChange={(e) => s.setValue({ ...v, manualRating: e.target.value ? Number(e.target.value.replace(",", ".")) : null })} inputMode="decimal" className="field" /></label>
      <label className="block"><span className="field-label">Nombre d&apos;avis Google</span><input value={v.manualCount ?? ""} onChange={(e) => s.setValue({ ...v, manualCount: e.target.value ? parseInt(e.target.value) : null })} inputMode="numeric" className="field" /></label>
      <label className="block"><span className="field-label">Date du relevé</span><input type="date" value={v.manualCheckedAt ?? ""} onChange={(e) => s.setValue({ ...v, manualCheckedAt: e.target.value || null })} className="field" /></label>
      <p className="text-xs text-mist sm:col-span-3">Recopiez exactement les valeurs affichées sur votre fiche Google. Elles ne sont utilisées que si l&apos;API Google Places n&apos;est pas configurée.</p>
      <div className="sm:col-span-3"><SaveBar {...s} /></div>
    </div>
  );
}
