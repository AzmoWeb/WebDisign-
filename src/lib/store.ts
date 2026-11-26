import type { StoreInfo } from "./types";

/**
 * Informations RÉELLES fournies par le commerçant.
 * Aucune autre information (horaires, histoire, marques, services) n'est inventée :
 * elles se renseignent depuis l'administration.
 */
export const STORE_DEFAULTS: StoreInfo = {
  name: "Aux Jolis Pas",
  street: "110 Grande Rue de la Résistance",
  postalCode: "10110",
  city: "Bar-sur-Seine",
  country: "FR",
  phone: "03 25 29 86 32",
  phoneE164: "+33325298632",
  email: null,
  mapsUrl: "https://www.google.com/maps/search/?api=1&query=Aux+Jolis+Pas+110+Grande+Rue+de+la+Resistance+Bar-sur-Seine",
  hours: null,
  hoursNote: null,
  description: null,
};

export const directionsUrl = (s: StoreInfo) =>
  `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${s.name}, ${s.street}, ${s.postalCode} ${s.city}`)}`;

export const mapEmbedUrl = (s: StoreInfo) =>
  `https://www.google.com/maps?q=${encodeURIComponent(`${s.name}, ${s.street}, ${s.postalCode} ${s.city}`)}&output=embed`;
