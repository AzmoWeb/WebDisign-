# Aux Jolis Pas — boutique en ligne

Site e-commerce du magasin de chaussures **Aux Jolis Pas**, 110 Grande Rue de la Résistance, 10110 Bar-sur-Seine (03 25 29 86 32).

Site vitrine + boutique + espace client + paiement Stripe + tableau de bord administrateur + gestion RGPD des cookies + avis Google + SEO local.

| | |
|---|---|
| Framework | Next.js 16 (App Router, Server Actions, Turbopack) · React 19 · TypeScript |
| Style | Tailwind CSS 4 — système de design maison (`src/app/globals.css`) |
| Données & comptes | Supabase (PostgreSQL + RLS, Auth, Storage) |
| Paiement | Stripe Checkout + webhook signé |
| Validation | Zod (toutes les entrées serveur) |

## Démarrage rapide

```bash
npm install
cp .env.example .env.local   # facultatif pour un premier aperçu
npm run dev                  # http://localhost:3000
```

Sans variables Supabase, le site tourne en **mode démonstration** : un bandeau l'indique, les produits sont fictifs (badge « Démo », illustrations vectorielles, non indexés) et **aucune commande n'est possible**. Tout s'active en connectant Supabase et Stripe — voir **[docs/INSTALLATION.md](docs/INSTALLATION.md)**.

## Scripts

| Commande | Rôle |
|---|---|
| `npm run dev` | développement |
| `npm run build && npm start` | production |
| `npm run typecheck` | vérification TypeScript |
| `npm test` | tests unitaires + tests de la base (migrations, RLS, paiement) sur PostgreSQL embarqué |
| `BASE_URL=http://localhost:3000 npm run test:e2e` | parcours navigateur (cookies, boutique, mobile, sécurité, SEO) — nécessite Playwright |

## Documentation

- [docs/INSTALLATION.md](docs/INSTALLATION.md) — installation, configuration, déploiement, compte administrateur
- [docs/DIRECTION-ARTISTIQUE.md](docs/DIRECTION-ARTISTIQUE.md) — principes UX, identité visuelle, brief des photographies de campagne
- [docs/SECURITE.md](docs/SECURITE.md) — mesures de sécurité et RGPD, points à valider avant la mise en ligne

## Arborescence

```
src/
  app/(site)/        pages publiques (accueil, femme, homme, produit, panier, commande, compte, magasin, contact, légal)
  app/admin/         tableau de bord (protégé) + actions serveur
  app/api/           checkout Stripe, webhook, recherche, journal de consentement
  components/        header/footer, catalogue, produit, panier, cookies, admin…
  lib/               données (catalogue, réglages, avis), sécurité, Stripe, Supabase, SEO
  proxy.ts           rafraîchissement de session + filtrage des zones privées
supabase/migrations/ schéma SQL, RLS, fonctions, stockage
tests/               tests unitaires, base de données, parcours navigateur
```
