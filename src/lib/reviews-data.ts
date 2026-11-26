/**
 * Avis Google réels relevés sur la fiche « Aux Jolis Pas » (captures fournies par la commerçante le 26/11/2026).
 * Textes reproduits mot pour mot ; lorsque Google tronque l'avis (« plus »), seul l'extrait visible est repris,
 * suivi de […]. Ces avis servent de repli tant que l'API Google Places ou la base de données ne sont pas connectées ;
 * la même liste est importée en base par supabase/migrations/0003_google_reviews.sql.
 */
export type VerifiedReview = { author: string; rating: number; text: string; visited: string };

export const VERIFIED_GOOGLE_REVIEWS: VerifiedReview[] = [
  { author: "Laur3009", rating: 5, text: "Très bon accueil, une propriétaire à l’écoute et beaucoup de choix!", visited: "Visité en juin 2026" },
  { author: "Denis B. 59", rating: 5, text: "Beaucoup de choix dans ce petit magasin de proximité. Ça vaut le détour !", visited: "Visité en avril 2024" },
  { author: "Dany Douyere", rating: 5, text: "Chaussures de très bonne qualité. De très jolis modèles et une commerçante très sympathique .... je recommande cette boutique.", visited: "Visité en octobre 2021" },
  { author: "EVELYNE BRODDES", rating: 5, text: "Beau magasin avec de belles chaussures et la patronne super sympa", visited: "Visité en juin 2021" },
  { author: "Steph Leg", rating: 5, text: "Allez y les yeux fermés. Du choix du choix du choix Tendance, marque, public il y en a vraiment […]", visited: "Visité en mai 2022" },
  { author: "Loïc Paillez", rating: 5, text: "Super magasin, du choix pour tout le monde et toujours à la pointe des tendances pour nous satisfaire...... […]", visited: "Visité en septembre 2019" },
];
