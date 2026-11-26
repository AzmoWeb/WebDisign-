import "server-only";
import { supabasePublic } from "./supabase/public";
import type { SiteSettings } from "./types";
import { VERIFIED_GOOGLE_REVIEWS } from "./reviews-data";

export type DisplayReview = {
  author: string;
  authorPhoto?: string | null;
  authorUrl?: string | null;
  rating: number;
  text: string;
  date: string | null;
  relativeDate?: string | null;
  visited?: string | null;
};

export type ReviewsData = {
  source: "google_api" | "manual" | "none";
  rating: number | null;
  count: number | null;
  checkedAt: string | null;
  reviews: DisplayReview[];
  allReviewsUrl: string;
  writeReviewUrl: string;
};

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Avis Google authentiques.
 * 1) Google Places API (New) si GOOGLE_PLACES_API_KEY + GOOGLE_PLACE_ID sont configurés (cache 24 h).
 * 2) Sinon, avis saisis manuellement par l'administrateur, vérifiés et dont la reproduction est autorisée.
 * 3) Sinon, aucun avis affiché — jamais de témoignage inventé.
 */
export async function getReviews(settings: SiteSettings): Promise<ReviewsData> {
  const placeId = process.env.GOOGLE_PLACE_ID;
  const key = process.env.GOOGLE_PLACES_API_KEY;
  const mapsUrl = settings.store.mapsUrl;
  const base = {
    allReviewsUrl: placeId ? `https://search.google.com/local/reviews?placeid=${encodeURIComponent(placeId)}` : mapsUrl,
    writeReviewUrl: placeId ? `https://search.google.com/local/writereview?placeid=${encodeURIComponent(placeId)}` : mapsUrl,
  };

  if (placeId && key) {
    try {
      const res = await fetch(`https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}?languageCode=fr`, {
        headers: { "X-Goog-Api-Key": key, "X-Goog-FieldMask": "rating,userRatingCount,reviews,googleMapsUri" },
        next: { revalidate: 86400 },
      });
      if (res.ok) {
        const j: any = await res.json();
        const reviews: DisplayReview[] = (j.reviews ?? [])
          .filter((r: any) => r.rating >= 4 && (r.originalText?.text || r.text?.text))
          .map((r: any) => ({
            author: r.authorAttribution?.displayName ?? "Client Google",
            authorPhoto: r.authorAttribution?.photoUri ?? null,
            authorUrl: r.authorAttribution?.uri ?? null,
            rating: r.rating,
            // Texte original non modifié (on n'altère jamais le sens d'un avis)
            text: r.originalText?.text ?? r.text?.text,
            date: r.publishTime ?? null,
            relativeDate: r.relativePublishTimeDescription ?? null,
          }));
        return {
          ...base,
          allReviewsUrl: j.googleMapsUri ?? base.allReviewsUrl,
          source: "google_api",
          rating: typeof j.rating === "number" ? j.rating : null,
          count: typeof j.userRatingCount === "number" ? j.userRatingCount : null,
          checkedAt: new Date().toISOString(),
          reviews,
        };
      }
      console.error("[reviews] Places API", res.status);
    } catch (e) {
      console.error("[reviews] Places API indisponible", e);
    }
  }

  const sb = supabasePublic();
  if (sb) {
    const { data } = await sb
      .from("reviews")
      .select("author_name, rating, text, review_date, visited_label")
      .eq("published", true)
      .eq("verified", true)
      .eq("publication_authorized", true)
      .order("created_at", { ascending: true })
      .limit(12);
    const reviews = (data ?? []).map((r: any) => ({ author: r.author_name, rating: r.rating, text: r.text, date: r.review_date, visited: r.visited_label }));
    const { manualRating, manualCount, manualCheckedAt } = settings.reviews;
    if (reviews.length || manualRating != null) {
      return { ...base, source: "manual", rating: manualRating, count: manualCount, checkedAt: manualCheckedAt, reviews };
    }
    return { ...base, source: "none", rating: null, count: null, checkedAt: null, reviews: [] };
  }
  // Base non connectée : avis réels relevés sur la fiche Google (voir reviews-data.ts)
  const { manualRating, manualCount, manualCheckedAt } = settings.reviews;
  return {
    ...base,
    source: "manual",
    rating: manualRating,
    count: manualCount,
    checkedAt: manualCheckedAt,
    reviews: VERIFIED_GOOGLE_REVIEWS.map((r) => ({ author: r.author, rating: r.rating, text: r.text, date: null, visited: r.visited })),
  };
}
