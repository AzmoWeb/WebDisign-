# Mise en ligne — guide pour la gérante

Tout le technique est automatisé : il ne reste que les étapes qui doivent être faites **à votre nom** (création de comptes, acceptation des conditions). Comptez 20 minutes.

## Étape 1 — Vercel (l'hébergeur du site)
1. Allez sur **vercel.com** → « Sign Up » → **« Continue with GitHub »** (le compte GitHub qui contient le site).
2. Cliquez **« Add New… » → « Project »**, choisissez le dépôt **WebDisign-** → **« Import »**.
3. Dans **« Environment Variables »**, ajoutez une seule ligne :
   - Nom : `ADMIN_EMAIL` — Valeur : *l'adresse e-mail avec laquelle vous gérerez le site*
4. Cliquez **« Deploy »**. Le site s'affiche (encore en mode démonstration).

## Étape 2 — Supabase (la base de données), depuis Vercel
1. Dans votre projet Vercel : onglet **« Storage »** → **« Create Database »** → **Supabase** → région **Europe (Paris ou Francfort)** → « Create ».
2. Acceptez la connexion au projet : les codes secrets sont transmis automatiquement au site (vous n'avez rien à recopier).
3. Onglet **« Deployments »** → sur le dernier déploiement, **« ⋯ » → « Redeploy »**. Au démarrage, le site installe lui-même toutes ses tables (catégories, avis Google, livraison…).

## Étape 3 — Adresse du site pour les e-mails
1. Ouvrez Supabase (bouton « Open in Supabase » dans l'onglet Storage de Vercel).
2. **Authentication → URL Configuration** :
   - *Site URL* : l'adresse de votre site (ex. `https://aux-jolis-pas.vercel.app`)
   - *Redirect URLs* : ajoutez `https://aux-jolis-pas.vercel.app/auth/callback`

## Étape 4 — Votre compte administratrice
1. Sur votre site : **« Se connecter » → « Créer un compte »** avec l'e-mail indiqué à l'étape 1.
2. Cliquez sur le lien de confirmation reçu par e-mail.
3. Connectez-vous : le lien **« Administration »** apparaît dans « Mon compte » (ou allez sur `/admin`).

Seul ce compte devient administrateur. Personne d'autre ne peut obtenir ces droits depuis le site.

## Plus tard — encaisser les paiements (Stripe)
Création du compte Stripe au nom de l'entreprise (SIRET, RIB, pièce d'identité), puis ajout de deux codes dans Vercel. Voir `docs/INSTALLATION.md` §4.
