import { test } from "node:test";
import assert from "node:assert/strict";
import { availableShipping, computeShipping, PICKUP_ID, shippingReady } from "../src/lib/shipping";
import type { ShippingSettings } from "../src/lib/types";
import { applyFilters, parseSearchParams } from "../src/lib/catalog-filters";
import { DEMO_PRODUCTS } from "../src/lib/demo-data";
import { effectivePrice, discountPercent } from "../src/lib/money";
import { parseConsent, CONSENT_POLICY_VERSION } from "../src/lib/consent";
import { CheckoutSchema } from "../src/lib/checkout-schema";
import { safeJson } from "../src/lib/seo";

const ship: ShippingSettings = {
  methods: [
    { id: "colissimo-domicile", carrier: "colissimo", type: "home", label: "Colissimo", enabled: true, priceCents: 690, freeFromCents: 8000, delayText: null },
    { id: "mondial-relay", carrier: "mondial_relay", type: "relay", label: "Mondial Relay", enabled: true, priceCents: 450, freeFromCents: null, delayText: null },
    { id: "chronopost", carrier: "chronopost", type: "home", label: "Chrono", enabled: false, priceCents: 1500, freeFromCents: null, delayText: null },
    { id: "colissimo-relais", carrier: "colissimo", type: "relay", label: "Relais", enabled: true, priceCents: null, freeFromCents: null, delayText: null },
  ],
  pickupEnabled: false,
  pickupText: null,
};

test("livraison multi-transporteurs : tarifs, gratuité, modes non configurés", () => {
  assert.equal(computeShipping(ship, "colissimo-domicile", 5000), 690);
  assert.equal(computeShipping(ship, "colissimo-domicile", 8000), 0);
  assert.equal(computeShipping(ship, "mondial-relay", 9000), 450);
  assert.equal(computeShipping(ship, "chronopost", 5000), null, "mode désactivé");
  assert.equal(computeShipping(ship, "colissimo-relais", 5000), null, "mode sans tarif");
  assert.equal(computeShipping(ship, PICKUP_ID, 5000), null, "retrait non confirmé");
  assert.equal(computeShipping({ ...ship, pickupEnabled: true }, PICKUP_ID, 5000), 0);
  assert.deepEqual(availableShipping(ship, 0).map((o) => o.id), ["colissimo-domicile", "mondial-relay"]);
  assert.equal(shippingReady({ ...ship, methods: ship.methods.map((m) => ({ ...m, priceCents: null })) }), false);
});

test("prix promotionnel", () => {
  assert.equal(effectivePrice({ priceCents: 10000, salePriceCents: 7500 }), 7500);
  assert.equal(effectivePrice({ priceCents: 10000, salePriceCents: 12000 }), 10000);
  assert.equal(discountPercent({ priceCents: 10000, salePriceCents: 7500 }), 25);
});

test("filtres catalogue : univers, pointure en stock, prix, tri", () => {
  const f = applyFilters(DEMO_PRODUCTS, { gender: "femme", sizes: ["38"], maxPrice: 100, sort: "prix-asc" });
  assert.ok(f.products.length > 0);
  for (const p of f.products) {
    assert.equal(p.gender, "femme");
    assert.ok(p.variants.some((v) => v.size === "38" && v.stock > 0));
    assert.ok(effectivePrice(p) <= 10000);
  }
  const prices = f.products.map(effectivePrice);
  assert.deepEqual(prices, [...prices].sort((a, b) => a - b));
  assert.ok(applyFilters(DEMO_PRODUCTS, { collection: "promotions" }).products.every((p) => p.salePriceCents != null));
  assert.ok(applyFilters(DEMO_PRODUCTS, { q: "bottine" }).products.every((p) => /bottine/i.test(`${p.name} ${p.categoryName}`)));
});

test("lecture des paramètres d'URL bornée", () => {
  const f = parseSearchParams({ pointure: "38,39", tri: "prix-desc", prix_min: "-5", q: "x".repeat(200) });
  assert.deepEqual(f.sizes, ["38", "39"]);
  assert.equal(f.sort, "prix-desc");
  assert.equal(f.minPrice, undefined);
  assert.equal(f.q?.length, 80);
});

test("consentement : version, expiration et format", () => {
  const rec = (o: object) => encodeURIComponent(JSON.stringify({ v: CONSENT_POLICY_VERSION, id: "x", ts: Date.now(), c: { preferences: false, statistics: true, marketing: false }, ...o }));
  assert.ok(parseConsent(rec({})));
  assert.equal(parseConsent(rec({ v: "ancienne" })), null);
  assert.equal(parseConsent(rec({ ts: Date.now() - 400 * 86400000 })), null);
  assert.equal(parseConsent(rec({ c: { statistics: "yes" } })), null);
  assert.equal(parseConsent(undefined), null);
});

test("validation du formulaire de commande", () => {
  const base = { firstName: "Ana", lastName: "B", email: "ana@x.fr", phone: "06 00 00 00 00", method: "colissimo-domicile", deliveryType: "home", acceptTerms: true, lines: [{ productId: "p", variantId: "v", quantity: 1 }] };
  const relay = { ...base, method: "mondial-relay", deliveryType: "relay" };
  assert.equal(CheckoutSchema.safeParse(base).success, false); // adresse manquante
  assert.equal(CheckoutSchema.safeParse({ ...base, address: { line1: "1 rue", postalCode: "10110", city: "Bar-sur-Seine", country: "FR" } }).success, true);
  assert.equal(CheckoutSchema.safeParse(relay).success, false); // point relais manquant
  assert.equal(CheckoutSchema.safeParse({ ...relay, relayPoint: "Tabac de la Gare, Bar-sur-Seine" }).success, true);
  assert.equal(CheckoutSchema.safeParse({ ...relay, method: "<script>", relayPoint: "Tabac de la Gare" }).success, false);
  assert.equal(CheckoutSchema.safeParse({ ...relay, relayPoint: "Tabac de la Gare", acceptTerms: false }).success, false);
  assert.equal(CheckoutSchema.safeParse({ ...relay, relayPoint: "Tabac de la Gare", lines: [{ productId: "p", variantId: "v", quantity: 99 }] }).success, false);
});

test("JSON-LD protégé contre l'injection de balise", () => {
  assert.ok(!safeJson({ a: "</script><script>alert(1)</script>" }).includes("</script>"));
});

test("codes promo : pourcentage, montant, minimum, dates, plafond", async () => {
  const { promoDiscount, normalizeCode } = await import("../src/lib/promo");
  const base = { code: "X", kind: "percent" as const, value: 10, min_subtotal_cents: 0, starts_at: null, ends_at: null, max_uses: null, uses: 0, active: true };
  assert.deepEqual(promoDiscount(base, 12000), { ok: true, discountCents: 1200, label: "−10 %" });
  const amount = promoDiscount({ ...base, kind: "amount", value: 1500 }, 12000);
  assert.ok(amount.ok && amount.discountCents === 1500);
  assert.equal(promoDiscount({ ...base, min_subtotal_cents: 15000 }, 12000).ok, false);
  assert.equal(promoDiscount({ ...base, active: false }, 12000).ok, false);
  assert.equal(promoDiscount({ ...base, ends_at: "2000-01-01T00:00:00Z" }, 12000).ok, false);
  assert.equal(promoDiscount({ ...base, max_uses: 5, uses: 5 }, 12000).ok, false);
  const capped = promoDiscount({ ...base, kind: "amount", value: 50000 }, 3000);
  assert.ok(capped.ok && capped.discountCents === 2950, "jamais plus que le panier (0,50 € minimum à payer)");
  assert.equal(normalizeCode(" bienvenue 10 "), "BIENVENUE10");
});
