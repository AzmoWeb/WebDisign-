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
    // Transporteurs indiqués par la commerçante. Tarifs NON renseignés : chaque mode reste masqué
    // (et la commande en ligne fermée) tant que son prix n'est pas défini dans l'administration.
    methods: [
      { id: "colissimo-domicile", carrier: "colissimo", type: "home", label: "Colissimo — livraison à domicile", enabled: true, priceCents: null, freeFromCents: null, delayText: "Expédié sous 24 h" },
      { id: "mondial-relay", carrier: "mondial_relay", type: "relay", label: "Mondial Relay — livraison en point relais", enabled: true, priceCents: null, freeFromCents: null, delayText: "Expédié sous 24 h" },
      { id: "colissimo-relais", carrier: "colissimo", type: "relay", label: "Colissimo — bureau de poste ou relais Pickup", enabled: false, priceCents: null, freeFromCents: null, delayText: "Expédié sous 24 h" },
    ],
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
