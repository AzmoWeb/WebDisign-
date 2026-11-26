# Direction artistique & expérience utilisateur

## 1. Référence UX : l'organisation d'une grande enseigne de chaussures

Le site de référence (chaussea.com) n'était pas accessible depuis l'environnement de développement (résolution DNS bloquée). L'analyse s'appuie donc sur les conventions éprouvées des grandes enseignes de chaussures en ligne, que l'on retrouve sur ce type de site — **sans reprendre aucun texte, logo, photo ni élément propriétaire** :

| Principe | Mise en œuvre chez Aux Jolis Pas |
|---|---|
| Bandeau promotionnel au-dessus du header | `AnnouncementBar`, messages rotatifs éditables (Admin → Contenus) |
| Header à trois zones : recherche · logo centré · compte/favoris/panier | `Header.tsx`, sticky, se compacte au défilement |
| Navigation par univers avec méga-menus | Femme / Homme : catégories, sélections, visuel de campagne |
| Accueil commercial : hero, bannière promo, accès univers, rails produits | 10 sections, produits accessibles dès l'accueil |
| Carte produit : photo, marque, nom, prix barré, badge −%, favori | `ProductCard.tsx`, 2e vue au survol, pastilles coloris |
| Liste : filtres pointure/prix/marque/couleur/catégorie + tri | barre latérale desktop, panneau bas d'écran sur mobile, filtres actifs en puces |
| Fiche : galerie + zoom, grille de pointures (barrées si épuisées), réassurance | `ProductPurchase.tsx`, pointure obligatoire, stock en temps réel |
| Panier latéral après ajout, puis page panier et tunnel en étapes | `CartDrawer`, `/panier`, `/commande` → Stripe |
| Footer : bande de réassurance, colonnes de liens, informations légales | uniquement des engagements vérifiés (paiement Stripe, adresse) |

## 2. Identité visuelle

**Positionnement** : boutique de centre-ville, élégante et accessible. Une mise en page éditoriale (beaucoup d'air, grandes images, typographie contrastée) plutôt qu'un gabarit e-commerce générique.

### Couleurs (`src/app/globals.css`)

| Jeton | Valeur | Usage |
|---|---|---|
| `ivory` | `#f7f3ed` | fond principal (blanc cassé) |
| `paper` | `#fbf9f5` | panneaux, champs, fenêtres |
| `sand` / `sand-deep` | `#ebe2d5` / `#d9cbb7` | fonds d'image, sections secondaires (beige) |
| `ink` | `#141210` | texte, boutons, footer (noir profond) |
| `graphite` / `mist` | `#3b3834` / `#8a847c` | textes secondaires (gris doux) |
| `line` | `#e2dad0` | filets |
| `oxblood` | `#7d2a22` | promotions uniquement |

Pas de dégradés décoratifs, pas d'effet verre, pas de cartes superflues, coins droits (sauf la fenêtre cookies, légèrement arrondie).

### Typographies (auto-hébergées, `src/fonts`)

- **Bodoni Moda** — titres : contraste fort, registre « mode » / éditorial.
- **Jost** — interface et textes : géométrique, très lisible, libellés en capitales espacées.

### Mouvement

Transitions de 300 à 900 ms sur courbe douce ; zoom lent des visuels au survol ; soulignement progressif des liens ; tiroirs latéraux. `prefers-reduced-motion` est respecté.

## 3. Campagnes diagonales

Composant `DiagonalCampaign` : **une seule composition** découpée en trois sections diagonales (découpes nettes, filets ivoire), chaque section étant cliquable selon sa forme exacte.

Géométrie (en % de la largeur) : section 1 `0→40 % en haut, 0→26 % en bas` · section 2 `40→74 % / 26→60 %` · section 3 `74→100 % / 60→100 %`.

Utilisée dans le hero et le bloc « campagne » de l'accueil, la page magasin ; les autres blocs utilisent des visuels simples pour que la diagonale reste un temps fort.

**Visuels provisoires** : tant que les photographies ne sont pas fournies, des compositions graphiques (architecture, jambes, chaussures) occupent les emplacements. Elles sont volontairement stylisées pour ne jamais passer pour de vraies photos.

### Brief des photographies (à produire par un photographe ou par génération d'images)

Format conseillé : **1600 × 2000 px** (portrait 4:5) par section, sujet principal centré dans la moitié inférieure (les chaussures doivent rester visibles dans la découpe diagonale, quel que soit le cadrage). Export JPEG qualité 85 ou WebP, < 5 Mo. Aucune marque ni logo visible sur les produits.

**Section 1 — Mode féminine**
> Photographie publicitaire ultra-réaliste, cadrage vertical, une femme marchant dans une rue élégante bordée d'architecture moderne en pierre claire, vue de la taille aux pieds, pantalon large crème, escarpins en cuir bordeaux parfaitement nets au premier plan, lumière de fin d'après-midi rasante, ombres naturelles longues, profondeur de champ maîtrisée (arrière-plan légèrement flou), textures du cuir et de la pierre détaillées, étalonnage chaud et doux, qualité campagne internationale, aucune marque visible.

**Section 2 — Baskets & mode urbaine**
> Gros plan publicitaire ultra-réaliste sur une paire de baskets en cuir blanc et daim beige posées sur des marches en béton d'une architecture contemporaine, perspective dynamique en contre-plongée, léger mouvement (un pied en appui, l'autre en levée), détails des coutures, du grain du cuir et de la semelle gomme nets, lumière naturelle directe avec reflets maîtrisés, palette minérale grise et ivoire, aucune marque ni logo.

**Section 3 — Mode masculine**
> Photographie lifestyle ultra-réaliste, un homme en pantalon de costume anthracite marchant sous une colonnade contemporaine, cadrage des genoux aux pieds, derbies en cuir cognac au premier plan parfaitement nettes, sol en pierre claire, éclairage cinématographique latéral, ombres naturelles, profondeur de champ courte, ambiance élégante et urbaine, aucune marque visible.

**Accroches disponibles** (Admin → Contenus → Campagne) : « TROUVEZ CHAUSSURE À VOTRE PIED » · « LE STYLE COMMENCE PAR LES DÉTAILS » · « COLLECTIONS FEMME & HOMME » · « VOTRE STYLE, NOS COLLECTIONS ». Les textes sont placés **hors** des photographies (colonne typographique du hero, titre au-dessus de la campagne) afin de ne jamais masquer les produits.

**Photos du magasin** : façade, vitrine, rayons femme/homme — à prendre sur place et à téléverser dans Admin → Contenus (présentation du magasin) et Magasin.

**Photos produits** : fond uni beige clair ou blanc cassé, 1600 × 2000 px, profil côté extérieur en première image, puis 3/4 avant, dessus, semelle, porté.
