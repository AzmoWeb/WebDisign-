// Parcours utilisateur réels dans Chromium (Playwright) contre un serveur lancé.
// Usage : BASE_URL=http://localhost:3000 node tests/e2e.mjs
// Pour tester le blocage effectif des scripts, construire avec NEXT_PUBLIC_GA4_ID=G-TEST123 et NEXT_PUBLIC_META_PIXEL_ID=123456.
import { createRequire } from "node:module";
// Playwright : `npm i -D playwright && npx playwright install chromium` si absent
const { chromium, devices } = createRequire(import.meta.url)("playwright");
import assert from "node:assert/strict";

const BASE = process.env.BASE_URL || "http://localhost:3000";
const results = [];
const browser = await chromium.launch();

async function run(name, fn, ctxOpts = {}) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, ...ctxOpts });
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  // Les requêtes tierces sont bloquées : on vérifie seulement si le navigateur TENTE de les charger.
  const thirdParty = [];
  await page.route(/googletagmanager|google-analytics|facebook\.net|facebook\.com/, (r) => { thirdParty.push(r.request().url()); r.abort(); });
  try {
    await fn(page, ctx, thirdParty);
    assert.deepEqual(errors, [], `erreurs JS : ${errors.join(" | ")}`);
    results.push(["✔", name]);
  } catch (e) {
    results.push(["✖", name, e.message.split("\n")[0]]);
  } finally {
    await ctx.close();
  }
}
const gaScripts = (page) => page.locator('script[src*="googletagmanager"]').count();
const metaScripts = (page) => page.locator("#meta-pixel").count();
const consentCookie = async (ctx) => {
  const c = (await ctx.cookies()).find((x) => x.name === "ajp_consent");
  return c ? JSON.parse(decodeURIComponent(c.value)) : null;
};

// ---------------- COOKIES ----------------
await run("Cookies : bannière à la 1re visite, aucun traceur avant choix", async (page, ctx, tp) => {
  await page.goto(BASE + "/");
  await page.getByTestId("cookie-accept").waitFor();
  assert.ok(await page.getByTestId("cookie-reject").isVisible());
  assert.ok(await page.getByTestId("cookie-customize").isVisible());
  await page.keyboard.press("Escape");
  assert.ok(await page.getByTestId("cookie-accept").isVisible(), "Échap ne doit pas valoir acceptation");
  await page.waitForTimeout(800);
  assert.equal(await gaScripts(page), 0);
  assert.equal(tp.length, 0, "aucune requête tierce");
  assert.equal(await consentCookie(ctx), null);
  assert.ok(!(await ctx.cookies()).some((c) => /^_ga|^_fbp/.test(c.name)));
});

await run("Cookies : « Tout refuser » bloque les scripts et mémorise le choix", async (page, ctx, tp) => {
  await page.goto(BASE + "/");
  await page.getByTestId("cookie-reject").click();
  await page.waitForTimeout(600);
  assert.equal(await gaScripts(page), 0);
  assert.equal(await metaScripts(page), 0);
  assert.equal(tp.length, 0);
  const c = await consentCookie(ctx);
  assert.deepEqual(c.c, { preferences: false, statistics: false, marketing: false });
  await page.reload();
  await page.waitForTimeout(600);
  assert.equal(await page.getByTestId("cookie-layer").count(), 0, "pas de nouvelle demande");
});

await run("Cookies : « Tout accepter » charge les scripts", async (page, ctx, tp) => {
  await page.goto(BASE + "/");
  await page.getByTestId("cookie-accept").click();
  await page.waitForTimeout(1200);
  if (!process.env.EXPECT_TRACKERS) return; // GA/Meta non configurés : rien à charger
  assert.ok((await gaScripts(page)) > 0 || tp.some((u) => u.includes("googletagmanager")), "GA attendu");
  assert.ok((await metaScripts(page)) > 0, "Meta attendu");
});

await run("Cookies : personnalisation (statistiques seules) puis retrait via le footer", async (page, ctx, tp) => {
  await page.goto(BASE + "/");
  await page.getByTestId("cookie-customize").click();
  await page.getByRole("switch", { name: "Cookies statistiques" }).click();
  await page.getByTestId("cookie-save").click();
  await page.waitForTimeout(1000);
  assert.deepEqual((await consentCookie(ctx)).c, { preferences: false, statistics: true, marketing: false });
  assert.equal(await metaScripts(page), 0, "marketing refusé → pas de Meta");
  if (process.env.EXPECT_TRACKERS) assert.ok((await gaScripts(page)) > 0 || tp.length > 0);
  // retrait
  await ctx.addCookies([{ name: "_ga", value: "GA1.1.x", url: BASE }]);
  await page.getByTestId("manage-cookies").click();
  await page.getByTestId("cookie-panel-reject").click();
  await page.waitForLoadState("load");
  await page.waitForTimeout(1200);
  assert.deepEqual((await consentCookie(ctx)).c, { preferences: false, statistics: false, marketing: false });
  assert.ok(!(await ctx.cookies()).some((c) => c.name === "_ga"), "cookie _ga supprimé");
  assert.equal(await gaScripts(page), 0, "GA déchargé après retrait");
});

await run("Cookies : nouvelle demande si la version de la politique change", async (page, ctx) => {
  await ctx.addCookies([{ name: "ajp_consent", value: encodeURIComponent(JSON.stringify({ v: "2000-01-01", id: "x", ts: Date.now(), c: { preferences: true, statistics: true, marketing: true } })), url: BASE }]);
  await page.goto(BASE + "/");
  await page.getByTestId("cookie-accept").waitFor({ timeout: 5000 });
  assert.equal(await gaScripts(page), 0, "ancien consentement ignoré");
});

const consented = { storageState: { cookies: [{ name: "ajp_consent", value: encodeURIComponent(JSON.stringify({ v: process.env.CONSENT_VERSION || "2026-11-26", id: "00000000-0000-4000-8000-000000000000", ts: Date.now(), c: { preferences: false, statistics: false, marketing: false } })), domain: new URL(BASE).hostname, path: "/", expires: -1, httpOnly: false, secure: false, sameSite: "Lax" }], origins: [] } };

// ---------------- BOUTIQUE ----------------
await run("Catalogue : filtre pointure + tri prix", async (page) => {
  await page.goto(BASE + "/femme");
  const countText = async () => (await page.locator("text=/\\d+ produits?/").first().textContent()).trim();
  const before = await countText();
  await page.getByRole("button", { name: "36", exact: true }).first().click();
  await page.waitForURL(/pointure=36/);
  await page.locator('select[aria-label="Trier les produits"]').selectOption("prix-asc");
  await page.waitForURL(/tri=prix-asc/);
  await page.waitForTimeout(500);
  const after = await countText();
  assert.notEqual(before, after);
}, consented);

await run("Recherche instantanée", async (page) => {
  await page.goto(BASE + "/");
  await page.getByRole("combobox").first().fill("mocassin");
  await page.getByRole("option").first().waitFor({ timeout: 5000 });
  assert.ok((await page.getByRole("option").count()) >= 2);
}, consented);

await run("Fiche produit : pointure obligatoire, ajout au panier, panier", async (page) => {
  await page.goto(BASE + "/produit/bottine-a-talon-bloc-femme-demo");
  await page.getByTestId("add-to-cart").click();
  await page.getByText("Veuillez sélectionner votre pointure.").waitFor();
  assert.ok(await page.locator('[role=radio][aria-label*="indisponible"]').first().isDisabled());
  await page.locator('[role=radio]:not([disabled])').first().click();
  await page.getByTestId("add-to-cart").click();
  await page.getByRole("dialog", { name: "Votre panier" }).waitFor();
  assert.equal((await page.getByTestId("header-cart").textContent()).trim(), "1");
  await page.goto(BASE + "/panier");
  await page.getByTestId("cart-line").first().waitFor();
  await page.getByLabel(/Quantité de/).selectOption("2");
  await page.waitForTimeout(300);
  assert.equal((await page.getByTestId("header-cart").textContent()).trim(), "2");
  // Produit de démonstration : commande impossible
  assert.equal(await page.getByTestId("go-checkout").count(), 0);
  assert.ok(await page.getByText("articles de démonstration").isVisible());
  await page.getByText("Supprimer").first().click();
  await page.getByText("Votre panier est vide.").waitFor();
}, consented);

// ---------------- MOBILE ----------------
await run("Mobile : pas de débordement horizontal", async (page) => {
  for (const path of ["/", "/femme", "/produit/basket-cuir-epuree-homme-demo", "/panier", "/notre-magasin", "/contact", "/compte/connexion", "/politique-cookies"]) {
    await page.goto(BASE + path);
    await page.waitForTimeout(300);
    const sw = await page.evaluate(() => document.documentElement.scrollWidth);
    assert.ok(sw <= 390, `${path} : largeur ${sw}`);
  }
}, { ...devices["iPhone 13"], ...consented });

await run("Mobile : menu hamburger et panneau de filtres", async (page) => {
  await page.goto(BASE + "/");
  await page.getByRole("button", { name: "Ouvrir le menu" }).click();
  // Le panneau doit occuper toute la hauteur de l'écran (régression : rogné par le flou du header)
  const panel = await page.getByRole("dialog", { name: "Menu" }).boundingBox();
  const vh = page.viewportSize().height;
  assert.ok(panel.height >= vh - 2, `menu rogné : ${panel.height}px sur ${vh}px`);
  for (const label of ["Nouveautés", "Promotions", "Notre magasin", "Contact"]) {
    const link = page.getByRole("dialog", { name: "Menu" }).getByRole("link", { name: label, exact: true });
    assert.ok(await link.isVisible(), `lien « ${label} » invisible dans le menu`);
  }
  await page.getByRole("dialog", { name: "Menu" }).getByRole("link", { name: "Contact", exact: true }).click();
  await page.waitForURL(/\/contact/);
  await page.getByRole("button", { name: "Ouvrir le menu" }).click();
  await page.getByRole("button", { name: /Femme/ }).click();
  await page.getByRole("link", { name: "Bottines" }).click();
  await page.waitForURL(/\/femme\/bottines/);
  await page.getByRole("button", { name: "Filtrer" }).click();
  await page.getByRole("dialog", { name: "Filtres" }).waitFor();
}, { ...devices["Pixel 7"], ...consented });

await run("Mobile : bannière cookies responsive", async (page) => {
  await page.goto(BASE + "/");
  const box = await page.getByRole("dialog").boundingBox();
  assert.ok(box.width <= 390 && box.x >= 0);
  assert.ok(await page.getByTestId("cookie-reject").isVisible());
}, devices["iPhone SE"]);

// ---------------- SÉCURITÉ ----------------
await run("API : contrôle d'origine, webhook sans signature, 404", async (page) => {
  const r1 = await page.request.post(BASE + "/api/checkout", { data: {}, headers: { origin: "https://evil.example" } });
  assert.equal(r1.status(), 403);
  const r2 = await page.request.post(BASE + "/api/stripe/webhook", { data: "{}" });
  assert.ok([400, 503].includes(r2.status()));
  const r3 = await page.request.post(BASE + "/api/consent", { data: { id: "x" }, headers: { origin: BASE } });
  assert.equal(r3.status(), 400);
  const r4 = await page.goto(BASE + "/page-inexistante");
  assert.equal(r4.status(), 404);
  const h = (await page.request.get(BASE + "/")).headers();
  assert.ok(h["content-security-policy"]?.includes("frame-ancestors 'none'"));
  assert.equal(h["x-content-type-options"], "nosniff");
}, consented);

await run("SEO : robots, sitemap, données structurées", async (page) => {
  const robots = await (await page.request.get(BASE + "/robots.txt")).text();
  assert.ok(robots.includes("Disallow: /admin"));
  const sm = await (await page.request.get(BASE + "/sitemap.xml")).text();
  assert.ok(sm.includes("/femme/bottines") && !sm.includes("-demo"));
  await page.goto(BASE + "/");
  const ld = await page.locator('script[type="application/ld+json"]').allTextContents();
  const store = ld.map((x) => JSON.parse(x)).find((x) => x["@type"] === "ShoeStore");
  assert.equal(store.telephone, "+33325298632");
  assert.equal(store.address.postalCode, "10110");
  assert.equal(store.aggregateRating, undefined);
  assert.equal(await page.locator("h1").count(), 1);
}, consented);

await browser.close();
for (const r of results) console.log(r.join("  "));
const failed = results.filter((r) => r[0] === "✖").length;
console.log(`\n${results.length - failed}/${results.length} parcours réussis`);
process.exit(failed ? 1 : 0);
