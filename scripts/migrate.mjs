// Applique automatiquement les migrations SQL (supabase/migrations/*.sql) avant chaque build.
// Utilise la chaîne de connexion PostgreSQL fournie par l'intégration Supabase de Vercel
// (POSTGRES_URL_NON_POOLING, POSTGRES_URL) ou DATABASE_URL. Sans elle : rien n'est fait.
// Chaque fichier n'est appliqué qu'une fois (table public._migrations), dans une transaction.
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import pg from "pg";

const url = process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL || process.env.DATABASE_URL;
if (!url) {
  console.log("[migrate] Aucune base PostgreSQL configurée : migrations ignorées.");
  process.exit(0);
}

const dir = join(process.cwd(), "supabase", "migrations");
const files = readdirSync(dir).filter((f) => /^\d+_.+\.sql$/.test(f)).sort();
const noSsl = /sslmode=disable/.test(url);
const client = new pg.Client({ connectionString: url.replace(/[?&]sslmode=[^&]*/, ""), ssl: noSsl ? false : { rejectUnauthorized: false } });

try {
  await client.connect();
  await client.query("create table if not exists public._migrations (name text primary key, applied_at timestamptz not null default now())");
  await client.query("alter table public._migrations enable row level security");
  const done = new Set((await client.query("select name from public._migrations")).rows.map((r) => r.name));
  for (const f of files) {
    if (done.has(f)) continue;
    console.log(`[migrate] Application de ${f}…`);
    await client.query("begin");
    try {
      await client.query(readFileSync(join(dir, f), "utf8"));
      await client.query("insert into public._migrations (name) values ($1)", [f]);
      await client.query("commit");
    } catch (e) {
      await client.query("rollback");
      throw new Error(`${f} : ${e.message}`);
    }
  }
  console.log("[migrate] Base de données à jour.");
} catch (e) {
  console.error("[migrate] ÉCHEC —", e.message);
  process.exit(1);
} finally {
  await client.end().catch(() => {});
}
