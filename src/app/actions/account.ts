"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { FormState } from "./auth";

export async function updateProfileAction(_: FormState, fd: FormData): Promise<FormState> {
  const user = await requireUser();
  const parsed = z
    .object({
      first_name: z.string().trim().min(1).max(80),
      last_name: z.string().trim().min(1).max(80),
      phone: z.string().trim().regex(/^[+0-9 ().-]{0,20}$/, "Téléphone invalide"),
    })
    .safeParse({ first_name: fd.get("firstName"), last_name: fd.get("lastName"), phone: fd.get("phone") ?? "" });
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const sb = (await createSupabaseServerClient())!;
  const { error } = await sb.from("profiles").update(parsed.data).eq("id", user.id);
  if (error) return { error: "Enregistrement impossible." };
  revalidatePath("/compte");
  return { ok: true, message: "Vos informations ont été mises à jour." };
}

const AddressSchema = z.object({
  label: z.string().trim().max(40).optional().default(""),
  first_name: z.string().trim().min(1, "Prénom requis").max(80),
  last_name: z.string().trim().min(1, "Nom requis").max(80),
  line1: z.string().trim().min(1, "Adresse requise").max(160),
  line2: z.string().trim().max(160).optional().default(""),
  postal_code: z.string().trim().regex(/^\d{5}$/, "Code postal invalide"),
  city: z.string().trim().min(1, "Ville requise").max(80),
  phone: z.string().trim().max(20).optional().default(""),
  is_default: z.boolean(),
});

export async function saveAddressAction(_: FormState, fd: FormData): Promise<FormState> {
  const user = await requireUser("/compte/adresses");
  const parsed = AddressSchema.safeParse({ ...Object.fromEntries(fd), is_default: fd.get("is_default") === "on" });
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const sb = (await createSupabaseServerClient())!;
  const id = String(fd.get("id") ?? "");
  if (parsed.data.is_default) await sb.from("addresses").update({ is_default: false }).eq("user_id", user.id);
  const row = { ...parsed.data, user_id: user.id, country: "FR" };
  const { error } = id && z.string().uuid().safeParse(id).success
    ? await sb.from("addresses").update(row).eq("id", id).eq("user_id", user.id)
    : await sb.from("addresses").insert(row);
  if (error) return { error: "Enregistrement impossible." };
  revalidatePath("/compte/adresses");
  return { ok: true, message: "Adresse enregistrée." };
}

export async function deleteAddressAction(fd: FormData) {
  const user = await requireUser("/compte/adresses");
  const id = z.string().uuid().safeParse(fd.get("id"));
  if (!id.success) return;
  const sb = (await createSupabaseServerClient())!;
  await sb.from("addresses").delete().eq("id", id.data).eq("user_id", user.id);
  revalidatePath("/compte/adresses");
}
