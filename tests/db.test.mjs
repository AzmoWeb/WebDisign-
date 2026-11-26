// Tests de la base : migrations + règles RLS + finalisation des paiements.
// Exécutés sur PGlite (PostgreSQL embarqué) avec des bouchons des schémas auth/storage de Supabase.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { PGlite } from "@electric-sql/pglite";

const db = new PGlite();
await db.exec(`
create role anon; create role authenticated; create role service_role bypassrls;
create schema auth; create schema storage;
create table auth.users (id uuid primary key, email text, raw_user_meta_data jsonb);
create or replace function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.uid', true), '')::uuid $$;
create table storage.buckets (id text primary key, name text, public boolean, file_size_limit int, allowed_mime_types text[]);
create table storage.objects (id uuid default gen_random_uuid(), bucket_id text, name text);
alter table storage.objects enable row level security;
grant usage on schema public to anon, authenticated, service_role;
alter default privileges in schema public grant all on tables to anon, authenticated, service_role;
alter default privileges in schema public grant all on sequences to anon, authenticated, service_role;
alter default privileges in schema public grant execute on functions to anon, authenticated, service_role;
`);
for (const f of ["0001_schema.sql", "0002_seed_categories.sql", "0003_google_reviews.sql", "0004_shipping_methods.sql", "0005_alerts_promos_reservations.sql"]) await db.exec(readFileSync(new URL(`../supabase/migrations/${f}`, import.meta.url), "utf8"));

const q = async (sql, p) => (await db.query(sql, p)).rows;
const as = async (role, uid, fn) => {
  await db.exec(`set role ${role}; select set_config('request.jwt.uid', '${uid ?? ""}', false);`);
  try { return await fn(); } finally { await db.exec("reset role;"); }
};
const rejects = async (p) => { let failed = false; try { await p; } catch { failed = true; } return failed; };

const U1 = "11111111-1111-4111-8111-111111111111", U2 = "22222222-2222-4222-8222-222222222222", ADM = "33333333-3333-4333-8333-333333333333";
for (const [id, fn] of [[U1, "Ana"], [U2, "Bob"], [ADM, "Admin"]]) await q(`insert into auth.users values ($1, $2, $3)`, [id, `${fn}@x.fr`, { first_name: fn }]);
await q(`update profiles set role='admin' where id=$1`, [ADM]);
const cat = (await q("select id from categories where gender='femme' and slug='bottines'"))[0].id;
const P = (await q(`insert into products (slug,name,gender,category_id,price_cents,active) values ('b1','Bottine','femme',$1,12000,true) returning id`, [cat]))[0].id;
await q(`insert into products (slug,name,gender,price_cents,active) values ('b2','Brouillon','femme',5000,false)`);
const V = (await q(`insert into product_variants (product_id,color,size,stock) values ($1,'Noir','38',3) returning id`, [P]))[0].id;

test("un profil est créé à l'inscription, sans rôle admin", async () => {
  const r = await q("select role from profiles where id=$1", [U1]);
  assert.equal(r[0].role, "customer");
});

test("le public ne voit que les produits actifs et ne peut rien modifier", async () => {
  assert.deepEqual((await as("anon", null, () => q("select slug from products"))).map((r) => r.slug), ["b1"]);
  await as("anon", null, () => q("update products set price_cents=1")).catch(() => {});
  assert.equal((await q("select price_cents from products where id=$1", [P]))[0].price_cents, 12000);
});

test("un client ne peut pas s'attribuer le rôle administrateur", async () => {
  assert.ok(await rejects(as("authenticated", U1, () => q("update profiles set role='admin' where id=$1", [U1]))));
  await as("authenticated", U1, () => q("update profiles set first_name='Anna' where id=$1", [U1]));
  assert.deepEqual((await q("select first_name, role from profiles where id=$1", [U1]))[0], { first_name: "Anna", role: "customer" });
});

test("l'administrateur voit les produits hors ligne", async () => {
  assert.equal((await as("authenticated", ADM, () => q("select count(*)::int c from products")))[0].c, 2);
});

test("commandes : création réservée au serveur, lecture limitée au propriétaire", async () => {
  assert.ok(await rejects(as("authenticated", U1, () => q(`insert into orders (email,first_name,last_name,phone,shipping_method,subtotal_cents,total_cents) values ('a','a','a','0','home',1,1)`))));
  const o = (await q(`insert into orders (user_id,email,first_name,last_name,phone,shipping_method,subtotal_cents,shipping_cents,total_cents) values ($1,'a@x.fr','A','B','0600000000','mondial-relay',24000,500,24500) returning id`, [U1]))[0];
  await q(`insert into order_items (order_id,product_id,variant_id,name,size,color,unit_price_cents,quantity) values ($1,$2,$3,'Bottine','38','Noir',12000,2)`, [o.id, P, V]);
  assert.equal((await as("authenticated", U1, () => q("select count(*)::int c from orders")))[0].c, 1);
  assert.equal((await as("authenticated", U2, () => q("select count(*)::int c from orders")))[0].c, 0);
  assert.equal((await as("authenticated", U2, () => q("select count(*)::int c from order_items")))[0].c, 0);
  await as("authenticated", U1, () => q("update orders set status='paid'")).catch(() => {});
  assert.equal((await q("select status from orders where id=$1", [o.id]))[0].status, "pending");

  // Finalisation : contrôle du montant, idempotence, décrément de stock
  assert.equal((await q("select finalize_paid_order($1,'pi_1',100,0) r", [o.id]))[0].r, "amount_mismatch");
  assert.equal((await q("select finalize_paid_order($1,'pi_1',22000,2500) r", [o.id]))[0].r, "ok");
  assert.equal((await q("select finalize_paid_order($1,'pi_1',22000,2500) r", [o.id]))[0].r, "already_paid");
  assert.equal((await q("select stock from product_variants where id=$1", [V]))[0].stock, 1);
  assert.deepEqual((await q("select status, payment_status, discount_cents from orders where id=$1", [o.id]))[0], { status: "paid", payment_status: "paid", discount_cents: 2500 });
  assert.ok(await rejects(as("authenticated", U1, () => q("select finalize_paid_order($1,'x',1,0)", [o.id]))));
});

test("limitation de débit partagée", async () => {
  const r = [];
  for (let i = 0; i < 3; i++) r.push((await q("select check_rate_limit('t',2,60) r"))[0].r);
  assert.deepEqual(r, [true, true, false]);
  assert.ok(await rejects(as("anon", null, () => q("select check_rate_limit('k',1,60)"))));
});

test("avis : seuls les avis vérifiés, autorisés et publiés sont publics", async () => {
  await q(`insert into reviews (author_name,rating,text,verified,publication_authorized,published) values ('X',5,'ok',true,false,true),('Y',5,'ok',true,true,true)`);
  const names = (await as("anon", null, () => q("select author_name from reviews"))).map((r) => r.author_name);
  assert.ok(names.includes("Y") && !names.includes("X"));
  assert.ok(names.includes("Laur3009"), "avis Google importés");
});

test("messages, journaux et événements Stripe sont privés", async () => {
  await q(`insert into contact_messages (name,email,subject,message) values ('a','a@a.fr','s','m')`);
  assert.equal((await as("authenticated", U1, () => q("select count(*)::int c from contact_messages")))[0].c, 0);
  assert.equal((await as("authenticated", ADM, () => q("select count(*)::int c from contact_messages")))[0].c, 1);
  await q(`insert into stripe_events (id, type) values ('evt_1','x')`);
  assert.equal((await as("anon", null, () => q("select count(*)::int c from stripe_events")))[0].c, 0);
});

test("favoris : un client ne peut pas écrire pour un autre", async () => {
  await as("authenticated", U1, () => q("insert into favorites (user_id, product_id) values ($1,$2)", [U1, P]));
  assert.ok(await rejects(as("authenticated", U2, () => q("insert into favorites (user_id, product_id) values ($1,$2)", [U1, P]))));
});

test("réservation en magasin : stock bloqué, limites, annulation et expiration", async () => {
  const pid = (await q(`insert into products (slug,name,gender,price_cents,sale_price_cents,active) values ('r1','Mocassin','homme',10000,8000,true) returning id`))[0].id;
  const vid = (await q(`insert into product_variants (product_id,color,size,stock) values ($1,'Noir','42',2) returning id`, [pid]))[0].id;
  const reserve = (email) => q(`select * from create_reservation($1, null, 'A', 'B', $2, '0600000000', 48)`, [vid, email]);
  const stock = async () => (await q("select stock from product_variants where id=$1", [vid]))[0].stock;

  const r1 = (await reserve("a@x.fr"))[0];
  assert.equal(r1.result, "ok");
  assert.match(r1.reservation_number, /^RES-\d+$/);
  assert.equal(await stock(), 1);
  assert.equal((await q("select price_cents from reservations where id=$1", [r1.reservation_id]))[0].price_cents, 8000, "prix promotionnel retenu");
  await reserve("b@x.fr");
  assert.equal(await stock(), 0);
  assert.equal((await reserve("c@x.fr"))[0].result, "out_of_stock");

  // annulation → remise en stock ; double clôture refusée
  assert.equal((await q("select set_reservation_status($1,'cancelled') r", [r1.reservation_id]))[0].r, "ok");
  assert.equal(await stock(), 1);
  assert.equal((await q("select set_reservation_status($1,'cancelled') r", [r1.reservation_id]))[0].r, "closed");
  assert.equal(await stock(), 1);

  // expiration automatique
  const r3 = (await reserve("d@x.fr"))[0];
  await q("update reservations set expires_at = now() - interval '1 hour' where id=$1", [r3.reservation_id]);
  assert.equal((await q("select expire_reservations() n"))[0].n, 1);
  assert.equal((await q("select status from reservations where id=$1", [r3.reservation_id]))[0].status, "expired");
  assert.equal(await stock(), 1);

  // 3 réservations actives maximum par e-mail
  await q(`update product_variants set stock = 10 where id=$1`, [vid]);
  for (let i = 0; i < 3; i++) await reserve("e@x.fr");
  assert.equal((await reserve("E@x.fr"))[0].result, "too_many");

  // fonctions réservées au serveur
  assert.ok(await rejects(as("authenticated", U1, () => q(`select * from create_reservation($1, null, 'A','B','z@x.fr','06',48)`, [vid]))));
  assert.ok(await rejects(as("authenticated", ADM, () => q("select set_reservation_status($1,'collected')", [r1.reservation_id]))));
  assert.ok(await rejects(as("anon", null, () => q("select expire_reservations()"))));
  assert.equal((await as("authenticated", U2, () => q("select count(*)::int c from reservations")))[0].c, 0, "réservations privées");
  assert.ok((await as("authenticated", ADM, () => q("select count(*)::int c from reservations")))[0].c > 0);
});

test("codes promo : privés, comptés au paiement", async () => {
  await q(`insert into promo_codes (code, kind, value) values ('BIENVENUE10','percent',10)`);
  assert.ok(await rejects(q(`insert into promo_codes (code, kind, value) values ('TROP','percent',95)`)));
  assert.equal((await as("anon", null, () => q("select count(*)::int c from promo_codes")))[0].c, 0);
  const o = (await q(`insert into orders (email,first_name,last_name,phone,shipping_method,subtotal_cents,shipping_cents,total_cents,promo_code,expected_discount_cents) values ('p@x.fr','P','Q','06','retrait-magasin',10000,0,10000,'BIENVENUE10',1000) returning id`))[0];
  assert.equal((await q("select finalize_paid_order($1,'pi_2',9000,1000) r", [o.id]))[0].r, "ok");
  assert.equal((await q("select uses from promo_codes where code='BIENVENUE10'"))[0].uses, 1);
});

test("alertes retour en stock : une seule alerte en attente par e-mail et pointure, privées", async () => {
  await q(`insert into stock_alerts (variant_id, product_id, email) values ($1,$2,'x@x.fr')`, [V, P]);
  assert.ok(await rejects(q(`insert into stock_alerts (variant_id, product_id, email) values ($1,$2,'X@x.fr')`, [V, P])));
  assert.equal((await as("anon", null, () => q("select count(*)::int c from stock_alerts")))[0].c, 0);
});
