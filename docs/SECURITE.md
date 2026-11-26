# Sécurité, données personnelles et conformité

## Mesures en place

**Paiement et intégrité des commandes**
- Prix, promotions, frais de port et stocks recalculés côté serveur à partir de la base (`lib/cart-pricing.ts`) ; le navigateur n'envoie que des identifiants et des quantités.
- Session Stripe Checkout créée côté serveur ; aucune donnée de carte ne transite par le site.
- Statut « payé » attribué **uniquement** par le webhook Stripe dont la signature est vérifiée sur le corps brut ; contrôle du montant encaissé (+ remise) contre le total attendu ; idempotence via la table `stripe_events` ; décrément de stock atomique (`finalize_paid_order`, verrou de ligne).
- Les produits de démonstration ne peuvent jamais être commandés.

**Base de données (Supabase)**
- Row Level Security sur toutes les tables ; écritures sensibles réservées à la clé `service_role` (serveur).
- Un client ne lit que ses commandes, adresses et favoris ; il ne peut modifier que prénom/nom/téléphone (privilèges par colonne) : impossible de s'attribuer le rôle admin.
- Fonctions `finalize_paid_order` et `check_rate_limit` non exécutables par `anon`/`authenticated`.
- Stockage d'images : lecture publique, écriture réservée aux administrateurs ; contrôle du type, de la taille (5 Mo) et de la signature binaire des fichiers.
- Requêtes paramétrées (client Supabase / PostgREST) : pas de SQL concaténé ; les recherches admin filtrent les caractères spéciaux.
- Tests automatisés : `tests/db.test.mjs`.

**Authentification et autorisations**
- Supabase Auth (mots de passe hachés, e-mail de confirmation, réinitialisation par lien).
- Mot de passe : 10 caractères minimum, majuscule, minuscule, chiffre.
- Limitation des tentatives : connexion (8 / 15 min par compte, 20 par IP), inscription, mot de passe oublié, contact, paiement, consentement — compteur partagé en base.
- Messages identiques que le compte existe ou non (pas d'énumération).
- Administration : filtrage dans `proxy.ts` **et** vérification du rôle côté serveur dans chaque page (`adminPage`) et chaque action (`assertAdmin`), **et** RLS.
- Redirections internes validées (`safeNext`) contre les redirections ouvertes.

**Navigateur**
- En-têtes : Content-Security-Policy restrictive (domaines tiers listés), `frame-ancestors 'none'`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, HSTS (en HTTPS), `noindex` + `no-store` sur `/admin` et `/compte`.
- Protection CSRF : Server Actions protégées nativement par Next.js (contrôle d'origine) ; routes API vérifiant l'en-tête `Origin`.
- XSS : rendu React échappé ; JSON-LD sérialisé avec échappement de `<`, `>` et `&` ; aucun HTML utilisateur injecté.
- Validation Zod de toutes les entrées (formulaires, API, réglages d'administration, URL de liens et d'images).
- Formulaire de contact : pot de miel, délai minimal de saisie, limitation de débit, limite de liens, Turnstile optionnel.

**Cookies (RGPD / recommandations CNIL)**
- Aucun traceur non essentiel avant un choix explicite ; « Tout accepter » et « Tout refuser » au même niveau ; Échap ou fermeture ne valent pas acceptation.
- Scripts GA4 / Meta injectés uniquement par `ConsentScripts` selon la catégorie acceptée ; au retrait, suppression des cookies `_ga*`, `_fbp`… et rechargement pour décharger les scripts.
- Choix conservé 6 mois, redemandé à expiration ou au changement de `CONSENT_POLICY_VERSION` (`src/lib/consent.ts`).
- Preuve du consentement (`consent_logs`) : identifiant aléatoire, version, choix, horodatage, empreinte d'IP salée.
- Carte Google Maps chargée seulement au clic (ou si cookies marketing acceptés).
- Tests navigateur : `tests/e2e.mjs`.

## À faire avant la mise en ligne

- [ ] Compléter et faire valider les pages légales (SIRET, forme juridique, hébergeur, médiateur, conditions de livraison et de retour, durées de conservation).
- [ ] Renseigner les horaires réels et les tarifs de livraison ; n'activer le retrait en magasin que si le service est assuré.
- [ ] Utiliser un mot de passe administrateur unique et activer l'authentification à deux facteurs sur les comptes Supabase, Stripe, hébergeur et Google.
- [ ] Restreindre la clé Google Places à l'API *Places (New)*.
- [ ] Vérifier dans Stripe que le webhook reçoit bien les 5 événements et effectuer une commande test complète (paiement, statut, stock, e-mail, remboursement).
- [ ] Mettre à jour `CONSENT_POLICY_VERSION` si des outils de mesure sont ajoutés, et compléter la liste des traceurs dans la politique de cookies.
- [ ] Mettre en place les sauvegardes Supabase (incluses dans les offres payantes) et surveiller `npm audit`.

## Limites connues

- Le stock n'est pas réservé pendant les 45 minutes de la session de paiement : en cas de deux paiements simultanés sur la dernière paire, la commande est quand même acceptée et un événement « stock insuffisant » est consigné pour traitement manuel.
- La CSP autorise `'unsafe-inline'` pour les scripts (nécessaire au rendu Next.js sans nonce dynamique) ; le risque XSS est contenu par l'échappement systématique de React et l'absence de contenu HTML utilisateur.
