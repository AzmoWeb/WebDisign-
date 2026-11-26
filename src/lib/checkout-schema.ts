import { z } from "zod";

const text = (max: number) => z.string().trim().min(1, "Champ requis").max(max);

export const CheckoutSchema = z
  .object({
    firstName: text(80),
    lastName: text(80),
    email: z.string().trim().toLowerCase().email("Adresse e-mail invalide").max(160),
    phone: z.string().trim().regex(/^[+0-9 ().-]{8,20}$/, "Numéro de téléphone invalide"),
    method: z.string().regex(/^[a-z0-9-]{2,40}$/, "Mode de livraison invalide"),
    // Type déclaré par le formulaire ; le serveur le recontrôle avec les réglages
    deliveryType: z.enum(["home", "relay", "pickup"]),
    relayPoint: z.string().trim().max(300).optional().default(""),
    address: z
      .object({
        line1: z.string().trim().max(160),
        line2: z.string().trim().max(160).optional().default(""),
        postalCode: z.string().trim().max(10),
        city: z.string().trim().max(80),
        country: z.literal("FR"),
      })
      .optional(),
    notes: z.string().trim().max(500).optional().default(""),
    promoCode: z.string().trim().max(40).optional().default(""),
    acceptTerms: z.literal(true, { error: "Vous devez accepter les conditions générales de vente" }),
    lines: z
      .array(z.object({ productId: z.string().min(1).max(64), variantId: z.string().min(1).max(64), quantity: z.number().int().min(1).max(10) }))
      .min(1)
      .max(30),
  })
  .superRefine((v, ctx) => {
    if (v.deliveryType === "relay" && v.relayPoint.length < 5)
      ctx.addIssue({ code: "custom", path: ["relayPoint"], message: "Indiquez le point relais choisi" });
    if (v.deliveryType === "home") {
      if (!v.address?.line1) ctx.addIssue({ code: "custom", path: ["address", "line1"], message: "Adresse requise" });
      if (!/^\d{5}$/.test(v.address?.postalCode ?? "")) ctx.addIssue({ code: "custom", path: ["address", "postalCode"], message: "Code postal invalide" });
      if (!v.address?.city) ctx.addIssue({ code: "custom", path: ["address", "city"], message: "Ville requise" });
    }
  });
export type CheckoutInput = z.infer<typeof CheckoutSchema>;
