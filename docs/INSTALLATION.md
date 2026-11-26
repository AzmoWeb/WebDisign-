# Installation, configuration et déploiement

## 1. Prérequis

- Node.js 20.9 ou plus récent (22 recommandé)
- Un compte [Supabase](https://supabase.com) (offre gratuite suffisante au démarrage) — choisir une région **Union européenne**
- Un compte [Stripe](https://stripe.com) au nom de l'entreprise
- Un hébergeur Node.js (Vercel recommandé, ou tout hébergeur compatible Next.js)

## 2. Base de données Supabase

> **Le plus simple** : suivre `docs/MISE-EN-LIGNE.md` (intégration Supabase de Vercel). Les migrations sont alors appliquées **automatiquement** à chaque build par `scripts/migrate.mjs` (variable `POSTGRES_URL_NON_POOLING`), et l'administrateur initial est désigné par la variable `ADMIN_EMAIL`. La procédure manuelle ci-dessous reste possible.

1. Créez un projet Supabase (région UE).
2. **SQL Editor** → exécutez dans l'ordre :
   - `supabase/migrations/0001_schema.sql` (tables, RLS, fonctions, stockage des images)
   - `supabase/migrations/0002_seed_categories.sql` (catégories femme/homme)
   - `supabase/migrations/0003_google_reviews.sql` (vos avis Google relevés le 26/11/2026)
   - `supabase/migrations/0004_shipping_methods.sql` (plusieurs transporteurs, point relais)
   - ou, avec la CLI : `supabase link` puis `supabase db push`.
3. **Project Settings → API** : récupérez l'URL, la clé `anon` et la clé `service_role`.
4. **Authentication → URL Configuration** :
   - *Site URL* : `https://votre-domaine.fr`
   - *Redirect URLs* : `https://votre-domaine.fr/auth/callback` (ajoutez aussi `http://localhost:3000/auth/callback` pour le développement)
5. **Authentication → Providers → Email** : laissez « Confirm email » activé. Configurez un SMTP (Authentication → SMTP) pour envoyer les e-mails depuis votre domaine.
6. **Authentication → Rate Limits** : conservez les limites par défaut (elles complètent la limitation applicative).

## 3. Compte administrateur initial

1. Créez le compte du gérant : soit via le site (`/compte/inscription`, puis confirmation par e-mail), soit dans **Authentication → Users → Add user** (« Auto Confirm User » coché). Mot de passe long et unique.
2. Ouvrez `supabase/create_admin.sql`, remplacez l'adresse e-mail et exécutez-le dans le SQL Editor.
3. Connectez-vous sur `/compte/connexion` : le lien « Administration » apparaît, le tableau de bord est sur `/admin`.

Le rôle administrateur ne peut être attribué qu'en SQL : aucune interface du site ne permet de s'auto-promouvoir (vérifié par les tests).

## 4. Stripe

1. **Développeurs → Clés API** : copiez la clé secrète (`sk_test_…` pour les essais, `sk_live_…` en production) dans `STRIPE_SECRET_KEY`.
2. **Développeurs → Webhooks → Ajouter un endpoint** :
   - URL : `https://votre-domaine.fr/api/stripe/webhook`
   - Événements : `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `checkout.session.async_payment_failed`, `checkout.session.expired`, `charge.refunded`
   - Copiez le *secret de signature* (`whsec_…`) dans `STRIPE_WEBHOOK_SECRET`.
3. En local : `stripe listen --forward-to localhost:3000/api/stripe/webhook` fournit un secret `whsec_` temporaire.
4. Codes promotionnels : ils se créent dans **Administration → Promotions** (pas dans Stripe). Le serveur calcule la remise et la transmet à Stripe sous forme de coupon à usage unique.
5. Moyens de paiement : **Paramètres → Moyens de paiement** (carte bancaire, etc.).

Une commande n'est marquée « payée » **que** par le webhook signé, après vérification que le montant encaissé correspond au total calculé par le serveur. La page de confirmation n'écrit rien.

## 5. Variables d'environnement

Copiez `.env.example` et renseignez les valeurs (chez l'hébergeur en production) :

| Variable | Obligatoire | Description |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | oui | URL publique, ex. `https://www.auxjolispas.fr` (active HSTS et `upgrade-insecure-requests` si https) |
| `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` | oui | Supabase → API |
| `SUPABASE_SERVICE_ROLE_KEY` | oui | **serveur uniquement** : commandes, webhook, contact, journal de consentement |
| `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` | oui pour vendre | voir §4 |
| `GOOGLE_PLACES_API_KEY` / `GOOGLE_PLACE_ID` | non | avis Google automatiques (§6) |
| `NEXT_PUBLIC_GA4_ID` | non | Google Analytics 4 (`G-XXXX`), chargé seulement après consentement « statistiques » |
| `NEXT_PUBLIC_META_PIXEL_ID` | non | Meta Pixel, chargé seulement après consentement « marketing » |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` / `TURNSTILE_SECRET_KEY` | non | Cloudflare Turnstile sur le formulaire de contact |
| `RESEND_API_KEY` / `EMAIL_FROM` / `STORE_NOTIFICATION_EMAIL` | non | e-mails de confirmation de commande et notifications au magasin |
| `ADMIN_EMAIL` | oui | e-mail du compte qui devient administrateur à sa 1re connexion (une fois confirmé) |
| `CRON_SECRET` | conseillé | chaîne aléatoire : active la remise en vente automatique des réservations expirées (`vercel.json`) |
| `IP_HASH_SALT` | oui | chaîne aléatoire longue (hachage des IP anti-spam) |

Aucune clé secrète n'est préfixée `NEXT_PUBLIC_` : elles ne quittent jamais le serveur.

## 6. Avis Google

**Automatique (recommandé)** : Google Cloud Console → activer *Places API (New)* → créer une clé API restreinte à cette API → `GOOGLE_PLACES_API_KEY`. Trouvez le *Place ID* de la fiche avec l'outil « Place ID Finder » de Google → `GOOGLE_PLACE_ID`. La note, le nombre d'avis et les avis récents (4★ et plus) sont rafraîchis toutes les 24 h, avec l'attribution exigée par Google. Les boutons « Voir tous les avis » et « Donner mon avis » pointent alors directement vers la fiche.

**Manuel** : *Administration → Avis Google*. Saisissez la note et le nombre d'avis exactement comme sur la fiche, puis les avis à reproduire **tels quels**. Un avis n'est publié que s'il est coché *vérifié* ET *reproduction autorisée*. Sans aucune de ces deux sources, la section n'affiche aucun avis — jamais de témoignage inventé.

## 7. Premiers réglages dans l'administration

1. **Magasin & livraison** : horaires (non inventés : saisissez-les), e-mail public, présentation, **tarifs de livraison** (la commande en ligne reste fermée tant qu'aucun mode de livraison n'est configuré), retrait en magasin uniquement si le service est confirmé.
2. **Catégories** : ajustez si besoin.
3. **Produits** : créez chaque article → pointures/coloris/stocks → photos (JPEG/PNG/WebP/AVIF, 5 Mo max., converties automatiquement en AVIF/WebP à l'affichage) → cochez « Produit en ligne ».
4. **Contenus du site** : bandeau supérieur, hero, campagne diagonale (téléversez les photographies — brief dans `docs/DIRECTION-ARTISTIQUE.md`), présentation du magasin.
5. **Pages légales** : complétez toutes les mentions surlignées `[À compléter …]` dans `src/app/(site)/(legal)/` et faites-les valider.

## 8. Déploiement (Vercel)

1. Poussez le dépôt sur GitHub, puis « Import Project » sur Vercel.
2. Renseignez toutes les variables d'environnement (Production).
3. Déployez, puis ajoutez votre domaine (Settings → Domains) et mettez à jour `NEXT_PUBLIC_SITE_URL`, l'URL Supabase Auth et l'endpoint du webhook Stripe.
4. Vérifiez : `/robots.txt`, `/sitemap.xml`, un paiement test de bout en bout en mode test Stripe, puis passez aux clés live.
5. Déclarez le site dans Google Search Console et soumettez `/sitemap.xml`. Ajoutez l'URL du site à la fiche Google Business Profile.

Autre hébergeur : `npm ci && npm run build && npm start` (port `PORT`, Node 20.9+), derrière HTTPS.

## 9. Tests

```bash
npm test                       # logique + base de données (PGlite) : RLS, rôles, finalisation de paiement, limitation de débit
npm run build && npm start &   # puis :
npm i -D playwright && npx playwright install chromium
BASE_URL=http://localhost:3000 npm run test:e2e
# Pour vérifier le blocage réel des traceurs, construire avec :
NEXT_PUBLIC_GA4_ID=G-TEST123 NEXT_PUBLIC_META_PIXEL_ID=123456 npm run build
BASE_URL=http://localhost:3000 EXPECT_TRACKERS=1 npm run test:e2e
```
