import type { SiteSettings } from "./types";
import { STORE_DEFAULTS } from "./store";

export const DEFAULT_SETTINGS: SiteSettings = {
  announcement: {
    enabled: true,
    messages: [
      { text: "Nouveautés femme & homme — découvrez la sélection", href: "/nouveautes" },
      { text: "Promotions en cours sur une sélection de modèles", href: "/promotions" },
      { text: "Retrouvez-nous au 110 Grande Rue de la Résistance, Bar-sur-Seine", href: "/notre-magasin" },
    ],
  },
  hero: {
    title: "Trouvez chaussure à votre pied",
    subtitle: "Découvrez notre sélection de chaussures pour femmes et hommes chez Aux Jolis Pas.",
    primaryLabel: "Découvrir la collection",
    primaryHref: "/nouveautes",
    secondaryLabel: "Découvrir notre magasin",
    secondaryHref: "/notre-magasin",
    imageUrl: null,
    imageAlt: "Campagne Aux Jolis Pas — chaussures femme et homme",
  },
  campaign: {
    title: "Le style commence par les détails",
    subtitle: "Collections femme & homme",
    ctaLabel: "Voir les nouveautés",
    ctaHref: "/nouveautes",
    panels: [
      { scene: "femme", label: "Femme", href: "/femme", imageUrl: null, imageAlt: "Femme portant des escarpins élégants dans une rue urbaine" },
      { scene: "baskets", label: "Baskets", href: "/femme/baskets", imageUrl: null, imageAlt: "Gros plan sur une paire de baskets en mouvement" },
      { scene: "homme", label: "Homme", href: "/homme", imageUrl: null, imageAlt: "Homme portant des chaussures de ville modernes" },
    ],
  },
  store: STORE_DEFAULTS,
  shipping: {
    homeDeliveryEnabled: true,
    // Tarifs NON renseignés : la commande en ligne reste bloquée tant que le commerçant ne les a pas définis.
    homeDeliveryCents: null,
    freeShippingThresholdCents: null,
    deliveryDelayText: null,
    // Le retrait en magasin n'est proposé qu'après confirmation du commerçant.
    pickupEnabled: false,
    pickupText: null,
  },
  reviews: { manualRating: null, manualCount: null, manualCheckedAt: null },
  storeIntro: {
    title: "Votre magasin de chaussures à Bar-sur-Seine",
    text: "Aux Jolis Pas est une boutique spécialisée dans les chaussures pour femmes et pour hommes, installée Grande Rue de la Résistance à Bar-sur-Seine. Venez découvrir nos modèles, les essayer et trouver la paire qui vous correspond.",
    imageUrl: null,
  },
};
