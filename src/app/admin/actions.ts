"use server";
import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { assertAdmin } from "@/lib/auth";
import { ADMIN_TRANSITIONS } from "@/lib/order-status";
import type { OrderStatus } from "@/lib/types";
import { SETTINGS_KEYS, type SettingsKey } from "@/lib/settings";
import { sendEmail } from "@/lib/email";
import type { FormState } from "@/app/actions/auth";

/* Toutes les actions ci-dessous revérifient le rôle administrateur côté serveur (assertAdmin),
   et la RLS Supabase refuse de toute façon les écritures d'un non-administrateur. */

const uuid = z.string().uuid();
const euros = (v: FormDataEntryValue | null) => {
  const s = String(v ?? "").replace(",", ".").trim();
  if (!s) return null;
  const n = Math.round(Number(s) * 100);
  return Number.isFinite(n) ? n : NaN;
};
const slugify = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 80);

function refreshShop() {
  revalidatePath("/", "layout");
}

/* ------------------------------- PRODUITS ------------------------------- */

const ProductSchema = z.object({
  name: z.string().trim().min(2, "Nom requis").max(160),
  slug: z.string().trim().max(90),
  brand: z.string().trim().max(80),
  description: z.string().trim().max(5000),
  gender: z.enum(["femme", "homme", "mixte"]),
  category_id: z.string().uuid().nullable(),
  price_cents: z.number().int().positive("Prix invalide"),
  sale_price_cents: z.number().int().positive().nullable(),
  is_new: z.boolean(),
  is_bestseller: z.boolean(),
  is_featured: z.boolean(),
  active: z.boolean(),
});

export async function saveProductAction(_: FormState, fd: FormData): Promise<FormState> {
  const { sb } = await assertAdmin();
  const id = String(fd.get("id") ?? "");
  const parsed = ProductSchema.safeParse({
    name: fd.get("name"),
    slug: slugify(String(fd.get("slug") || fd.get("name") || "")),
    brand: fd.get("brand") ?? "",
    description: fd.get("description") ?? "",
    gender: fd.get("gender"),
    category_id: fd.get("category_id") || null,
    price_cents: euros(fd.get("price")),
    sale_price_cents: euros(fd.get("sale_price")),
    is_new: fd.get("is_new") === "on",
    is_bestseller: fd.get("is_bestseller") === "on",
    is_featured: fd.get("is_featured") === "on",
    active: fd.get("active") === "on",
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const d = parsed.data;
  if (d.sale_price_cents != null && d.sale_price_cents >= d.price_cents) return { error: "Le prix promotionnel doit être inférieur au prix." };
  if (!d.slug) return { error: "Adresse (slug) invalide." };

  if (id && uuid.safeParse(id).success) {
    const { error } = await sb.from("products").update(d).eq("id", id);
    if (error) return { error: error.code === "23505" ? "Cette adresse (slug) est déjà utilisée." : "Enregistrement impossible." };
    refreshShop();
    return { ok: true, message: "Produit enregistré." };
  }
  const { data, error } = await sb.from("products").insert(d).select("id").single();
  if (error || !data) return { error: error?.code === "23505" ? "Cette adresse (slug) est déjà utilisée." : "Création impossible." };
  refreshShop();
  redirect(`/admin/produits/${data.id}?cree=1`);
}

export async function toggleProductAction(fd: FormData) {
  const { sb } = await assertAdmin();
  const id = uuid.parse(fd.get("id"));
  await sb.from("products").update({ active: fd.get("active") === "true" }).eq("id", id);
  refreshShop();
}

export async function deleteProductAction(fd: FormData) {
  const { sb } = await assertAdmin();
  const id = uuid.parse(fd.get("id"));
  const { data: imgs } = await sb.from("product_images").select("storage_path").eq("product_id", id);
  const paths = (imgs ?? []).map((i: { storage_path: string | null }) => i.storage_path).filter(Boolean) as string[];
  if (paths.length) await sb.storage.from("site-images").remove(paths);
  await sb.from("products").delete().eq("id", id);
  refreshShop();
  redirect("/admin/produits?supprime=1");
}

const VariantsSchema = z.array(
  z.object({
    id: z.string().uuid().optional(),
    color: z.string().trim().min(1).max(40),
    color_hex: z.string().regex(/^#[0-9a-fA-F]{6}$/),
    size: z.string().trim().min(1).max(10),
    stock: z.number().int().min(0).max(100000),
    sku: z.string().trim().max(60).optional().nullable(),
  }),
).max(400);

export async function saveVariantsAction(productId: string, rows: unknown): Promise<FormState> {
  const { sb } = await assertAdmin();
  const pid = uuid.parse(productId);
  const parsed = VariantsSchema.safeParse(rows);
  if (!parsed.success) return { error: "Déclinaisons invalides : vérifiez coloris, code couleur (#RRGGBB), pointure et stock." };
  const keys = new Set<string>();
  for (const v of parsed.data) {
    const k = `${v.color.toLowerCase()}|${v.size}`;
    if (keys.has(k)) return { error: `Doublon : ${v.color} pointure ${v.size}.` };
    keys.add(k);
  }
  const { data: existing } = await sb.from("product_variants").select("id").eq("product_id", pid);
  const keep = new Set(parsed.data.filter((v) => v.id).map((v) => v.id));
  const toDelete = (existing ?? []).map((e: { id: string }) => e.id).filter((id: string) => !keep.has(id));
  if (toDelete.length) await sb.from("product_variants").delete().in("id", toDelete);
  for (const v of parsed.data) {
    const row = { product_id: pid, color: v.color, color_hex: v.color_hex, size: v.size, stock: v.stock, sku: v.sku || null };
    const { error } = v.id ? await sb.from("product_variants").update(row).eq("id", v.id).eq("product_id", pid) : await sb.from("product_variants").insert(row);
    if (error) return { error: `Erreur sur ${v.color} ${v.size} : ${error.code === "23505" ? "doublon" : "enregistrement impossible"}.` };
  }
  refreshShop();
  return { ok: true, message: "Pointures et stocks enregistrés." };
}

/* -------------------------------- IMAGES -------------------------------- */

const MIME: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/avif": "avif" };
const MAX_BYTES = 5 * 1024 * 1024;

async function uploadImage(sb: Awaited<ReturnType<typeof assertAdmin>>["sb"], file: File, folder: string) {
  if (!(file instanceof File) || !file.size) throw new Error("Aucun fichier");
  if (!MIME[file.type]) throw new Error("Format accepté : JPEG, PNG, WebP ou AVIF");
  if (file.size > MAX_BYTES) throw new Error("Image trop lourde (5 Mo maximum)");
  // Vérification de la signature binaire (le type MIME déclaré par le navigateur ne suffit pas)
  const head = new Uint8Array(await file.slice(0, 16).arrayBuffer());
  const hex = Array.from(head).map((b) => b.toString(16).padStart(2, "0")).join("");
  const ok = hex.startsWith("ffd8ff") || hex.startsWith("89504e47") || (hex.startsWith("52494646") && hex.slice(16, 24) === "57454250") || hex.slice(8, 24).includes("66747970");
  if (!ok) throw new Error("Fichier image invalide");
  const path = `${folder}/${randomUUID()}.${MIME[file.type]}`;
  const { error } = await sb.storage.from("site-images").upload(path, file, { contentType: file.type, cacheControl: "31536000", upsert: false });
  if (error) throw new Error("Téléversement impossible");
  const { data } = sb.storage.from("site-images").getPublicUrl(path);
  return { path, url: data.publicUrl };
}

export async function uploadProductImageAction(_: FormState, fd: FormData): Promise<FormState> {
  const { sb } = await assertAdmin();
  const pid = uuid.safeParse(fd.get("product_id"));
  if (!pid.success) return { error: "Produit invalide" };
  const files = fd.getAll("files").filter((f): f is File => f instanceof File && f.size > 0).slice(0, 10);
  if (!files.length) return { error: "Sélectionnez au moins une image." };
  const alt = String(fd.get("alt") ?? "").trim().slice(0, 200);
  const color = String(fd.get("color") ?? "").trim().slice(0, 40) || null;
  const { count } = await sb.from("product_images").select("id", { count: "exact", head: true }).eq("product_id", pid.data);
  let pos = count ?? 0;
  try {
    for (const f of files) {
      const up = await uploadImage(sb, f, `products/${pid.data}`);
      await sb.from("product_images").insert({ product_id: pid.data, url: up.url, storage_path: up.path, alt, color, position: pos++ });
    }
  } catch (e) {
    return { error: (e as Error).message };
  }
  refreshShop();
  return { ok: true, message: `${files.length} image(s) ajoutée(s).` };
}

export async function updateImageAction(fd: FormData) {
  const { sb } = await assertAdmin();
  const id = uuid.parse(fd.get("id"));
  const op = String(fd.get("op"));
  const { data: img } = await sb.from("product_images").select("id, product_id, position, storage_path").eq("id", id).single();
  if (!img) return;
  if (op === "delete") {
    if (img.storage_path) await sb.storage.from("site-images").remove([img.storage_path]);
    await sb.from("product_images").delete().eq("id", id);
  } else if (op === "up" || op === "down") {
    const { data: all } = await sb.from("product_images").select("id, position").eq("product_id", img.product_id).order("position");
    const list = (all ?? []) as { id: string; position: number }[];
    const i = list.findIndex((x) => x.id === id);
    const j = op === "up" ? i - 1 : i + 1;
    if (j >= 0 && j < list.length) {
      [list[i], list[j]] = [list[j], list[i]];
      await Promise.all(list.map((x, k) => sb.from("product_images").update({ position: k }).eq("id", x.id)));
    }
  } else if (op === "meta") {
    await sb.from("product_images").update({ alt: String(fd.get("alt") ?? "").slice(0, 200), color: String(fd.get("color") ?? "").slice(0, 40) || null }).eq("id", id);
  }
  refreshShop();
}

export async function uploadSiteImageAction(fd: FormData): Promise<{ url?: string; error?: string }> {
  const { sb } = await assertAdmin();
  try {
    const up = await uploadImage(sb, fd.get("file") as File, "site");
    return { url: up.url };
  } catch (e) {
    return { error: (e as Error).message };
  }
}

/* ------------------------------- COMMANDES ------------------------------ */

export async function updateOrderAction(_: FormState, fd: FormData): Promise<FormState> {
  const { sb, user } = await assertAdmin();
  const id = uuid.safeParse(fd.get("id"));
  if (!id.success) return { error: "Commande invalide" };
  const { data: order } = await sb.from("orders").select("status, email, first_name, order_number").eq("id", id.data).single();
  if (!order) return { error: "Commande introuvable" };
  const next = String(fd.get("status") ?? "") as OrderStatus;
  const tracking_number = String(fd.get("tracking_number") ?? "").trim().slice(0, 80) || null;
  const tracking_url_raw = String(fd.get("tracking_url") ?? "").trim();
  const tracking_url = tracking_url_raw && /^https:\/\//.test(tracking_url_raw) ? tracking_url_raw.slice(0, 300) : null;
  const note = String(fd.get("note") ?? "").trim().slice(0, 500) || null;

  const update: Record<string, unknown> = { tracking_number, tracking_url };
  if (next && next !== order.status) {
    if (!ADMIN_TRANSITIONS[order.status as OrderStatus]?.includes(next)) return { error: "Changement de statut non autorisé." };
    update.status = next;
  }
  const { error } = await sb.from("orders").update(update).eq("id", id.data);
  if (error) return { error: "Mise à jour impossible." };
  if (update.status || note) await sb.from("order_events").insert({ order_id: id.data, status: (update.status as string) ?? order.status, note, created_by: user.id });
  if (update.status && fd.get("notify") === "on") {
    const label: Record<string, string> = { preparing: "est en préparation", shipped: "a été expédiée", ready_for_pickup: "est prête à être retirée en magasin", completed: "est terminée", cancelled: "a été annulée" };
    await sendEmail(order.email, `Votre commande ${order.order_number}`, `Bonjour ${order.first_name},\n\nVotre commande ${order.order_number} ${label[next] ?? "a été mise à jour"}.${tracking_number ? `\nNuméro de suivi : ${tracking_number}${tracking_url ? ` — ${tracking_url}` : ""}` : ""}\n\nAux Jolis Pas — 03 25 29 86 32`);
  }
  revalidatePath(`/admin/commandes/${id.data}`);
  return { ok: true, message: "Commande mise à jour." };
}

/* -------------------------------- RÉGLAGES ------------------------------ */

export async function saveSettingAction(key: string, value: unknown): Promise<FormState> {
  const { sb, user } = await assertAdmin();
  if (!(SETTINGS_KEYS as readonly string[]).includes(key)) return { error: "Réglage inconnu" };
  const json = JSON.stringify(value);
  if (json.length > 50000) return { error: "Contenu trop volumineux" };
  const v = sanitizeSetting(key as SettingsKey, value);
  if ("error" in v) return { error: v.error };
  const { error } = await sb.from("site_settings").upsert({ key, value: v.value, updated_by: user.id, updated_at: new Date().toISOString() });
  if (error) return { error: "Enregistrement impossible." };
  refreshShop();
  return { ok: true, message: "Modifications publiées." };
}

const href = z.string().trim().max(300).refine((s) => s === "" || s.startsWith("/") || /^https:\/\//.test(s), "Lien invalide (commencez par / ou https://)");
const img = z.string().trim().max(500).refine((s) => s === "" || /^https:\/\//.test(s), "URL d'image invalide").transform((s) => s || null).nullable();
const time = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/).nullable().or(z.literal("").transform(() => null));

const SETTING_SCHEMAS: Record<SettingsKey, z.ZodTypeAny> = {
  announcement: z.object({ enabled: z.boolean(), messages: z.array(z.object({ text: z.string().trim().max(140), href: href.nullable().optional() })).max(6) }),
  hero: z.object({ title: z.string().trim().min(1).max(120), subtitle: z.string().trim().max(300), primaryLabel: z.string().trim().max(40), primaryHref: href, secondaryLabel: z.string().trim().max(40), secondaryHref: href, imageUrl: img, imageAlt: z.string().trim().max(200) }),
  campaign: z.object({
    title: z.string().trim().max(120), subtitle: z.string().trim().max(120), ctaLabel: z.string().trim().max(40), ctaHref: href,
    panels: z.array(z.object({ label: z.string().trim().max(30), href, imageUrl: img, imageAlt: z.string().trim().max(200), scene: z.enum(["femme", "baskets", "homme"]) })).length(3),
  }),
  store: z.object({
    name: z.string().trim().min(1).max(80), street: z.string().trim().min(1).max(160), postalCode: z.string().trim().regex(/^\d{5}$/), city: z.string().trim().min(1).max(80), country: z.literal("FR"),
    phone: z.string().trim().max(20), phoneE164: z.string().trim().regex(/^\+\d{8,15}$/), email: z.string().trim().email().max(160).nullable().or(z.literal("").transform(() => null)),
    mapsUrl: z.string().trim().regex(/^https:\/\/(www\.)?google\.[a-z.]+\/maps/).max(500), description: z.string().trim().max(2000).nullable(), brands: z.array(z.string().trim().min(1).max(40)).max(40).default([]), hoursNote: z.string().trim().max(300).nullable(),
    hours: z.array(z.object({ day: z.enum(["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"]), closed: z.boolean(), open: time, close: time, open2: time.optional(), close2: time.optional() })).length(7).nullable(),
  }),
  shipping: z.object({
    homeDeliveryEnabled: z.boolean(), homeDeliveryCents: z.number().int().min(0).max(100000).nullable(), freeShippingThresholdCents: z.number().int().min(0).max(10000000).nullable(),
    deliveryDelayText: z.string().trim().max(200).nullable(), pickupEnabled: z.boolean(), pickupText: z.string().trim().max(200).nullable(),
  }),
  reviews: z.object({ manualRating: z.number().min(1).max(5).nullable(), manualCount: z.number().int().min(0).nullable(), manualCheckedAt: z.string().max(30).nullable() }),
  storeIntro: z.object({ title: z.string().trim().max(120), text: z.string().trim().max(1500), imageUrl: img }),
};

function sanitizeSetting(key: SettingsKey, value: unknown): { value: unknown } | { error: string } {
  const r = SETTING_SCHEMAS[key].safeParse(value);
  if (!r.success) return { error: `${r.error.issues[0].path.join(".")} : ${r.error.issues[0].message}` };
  return { value: r.data };
}

/* ------------------------------ CATÉGORIES ------------------------------ */

export async function saveCategoryAction(fd: FormData) {
  const { sb } = await assertAdmin();
  const id = String(fd.get("id") ?? "");
  const name = String(fd.get("name") ?? "").trim().slice(0, 60);
  const gender = z.enum(["femme", "homme"]).parse(fd.get("gender"));
  const position = Number(fd.get("position") ?? 0) || 0;
  const description = String(fd.get("description") ?? "").trim().slice(0, 500) || null;
  const active = fd.get("active") === "on";
  if (!name) return;
  if (id && uuid.safeParse(id).success) await sb.from("categories").update({ name, position, description, active }).eq("id", id);
  else await sb.from("categories").insert({ name, gender, position, description, active, slug: slugify(String(fd.get("slug") || name)) });
  refreshShop();
}

export async function deleteCategoryAction(fd: FormData) {
  const { sb } = await assertAdmin();
  await sb.from("categories").delete().eq("id", uuid.parse(fd.get("id")));
  refreshShop();
}

/* -------------------------------- AVIS ---------------------------------- */

export async function saveReviewAction(fd: FormData) {
  const { sb } = await assertAdmin();
  const id = String(fd.get("id") ?? "");
  const row = z
    .object({
      author_name: z.string().trim().min(1).max(80),
      rating: z.coerce.number().int().min(1).max(5),
      text: z.string().trim().min(1).max(3000),
      review_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().or(z.literal("").transform(() => null)),
      source_url: z.string().trim().max(500).refine((s) => !s || /^https:\/\//.test(s)).nullable(),
      visited_label: z.string().trim().max(60).nullable(),
      verified: z.boolean(),
      publication_authorized: z.boolean(),
      published: z.boolean(),
    })
    .parse({
      author_name: fd.get("author_name"), rating: fd.get("rating"), text: fd.get("text"), review_date: fd.get("review_date") ?? "",
      source_url: String(fd.get("source_url") ?? "") || null,
      visited_label: String(fd.get("visited_label") ?? "").trim() || null,
      verified: fd.get("verified") === "on", publication_authorized: fd.get("publication_authorized") === "on", published: fd.get("published") === "on",
    });
  // Garde-fou : publication impossible sans vérification ET autorisation
  if (row.published && !(row.verified && row.publication_authorized)) row.published = false;
  if (id && uuid.safeParse(id).success) await sb.from("reviews").update(row).eq("id", id);
  else await sb.from("reviews").insert(row);
  refreshShop();
}

export async function deleteReviewAction(fd: FormData) {
  const { sb } = await assertAdmin();
  await sb.from("reviews").delete().eq("id", uuid.parse(fd.get("id")));
  refreshShop();
}

/* ------------------------------- MESSAGES ------------------------------- */

export async function updateMessageAction(fd: FormData) {
  const { sb } = await assertAdmin();
  const status = z.enum(["new", "in_progress", "closed"]).parse(fd.get("status"));
  await sb.from("contact_messages").update({ status }).eq("id", uuid.parse(fd.get("id")));
  revalidatePath("/admin/messages");
}
