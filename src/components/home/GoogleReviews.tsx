import Image from "next/image";
import type { ReviewsData } from "@/lib/reviews";
import { IconStar } from "@/components/ui/Icons";

const dateFmt = new Intl.DateTimeFormat("fr-FR", { month: "long", year: "numeric" });

function Stars({ value, size = "h-4 w-4" }: { value: number; size?: string }) {
  return (
    <span className="inline-flex gap-0.5 text-ink" aria-label={`${value.toLocaleString("fr-FR")} sur 5`} role="img">
      {[0, 1, 2, 3, 4].map((i) => (
        <IconStar key={i} className={size} fill={Math.max(0, Math.min(1, value - i))} />
      ))}
    </span>
  );
}

export function GoogleReviews({ data }: { data: ReviewsData }) {
  return (
    <section aria-labelledby="avis-title" className="container-site py-20 md:py-28">
      <div className="grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <p className="label text-mist">Avis clients Google</p>
          <h2 id="avis-title" className="display mt-3 text-[2.25rem] md:text-[3rem]">Ils nous font confiance</h2>
          {data.rating != null ? (
            <div className="mt-8">
              <p className="flex items-baseline gap-3">
                <span className="display text-6xl tabular-nums">{data.rating.toLocaleString("fr-FR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}</span>
                <span className="text-sm text-mist">/ 5</span>
              </p>
              <div className="mt-3"><Stars value={data.rating} size="h-5 w-5" /></div>
              {data.count != null && <p className="mt-3 text-sm text-graphite">Note moyenne sur Google · {data.count.toLocaleString("fr-FR")} avis</p>}
              {data.source === "manual" && data.checkedAt && (
                <p className="mt-1 text-xs text-mist">Relevé sur la fiche Google le {new Date(data.checkedAt).toLocaleDateString("fr-FR")}</p>
              )}
            </div>
          ) : (
            <p className="mt-8 max-w-sm text-graphite">Découvrez les avis de nos clients sur notre fiche Google, et partagez le vôtre après votre visite.</p>
          )}
          <div className="mt-10 flex flex-wrap gap-3">
            <a href={data.allReviewsUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary">Voir tous les avis</a>
            <a href={data.writeReviewUrl} target="_blank" rel="noopener noreferrer" className="btn btn-outline">Donner mon avis</a>
          </div>
        </div>

        <div className="lg:col-span-8">
          {data.reviews.length > 0 ? (
            <ul className="grid gap-px bg-line sm:grid-cols-2">
              {data.reviews.slice(0, 4).map((r, i) => (
                <li key={i} className="flex flex-col bg-ivory p-7 md:p-9">
                  <Stars value={r.rating} />
                  <blockquote className="mt-5 flex-1 text-[0.98rem] leading-relaxed text-graphite">
                    <p className="line-clamp-6">« {r.text} »</p>
                  </blockquote>
                  <footer className="mt-6 flex items-center gap-3 text-sm">
                    {r.authorPhoto && <Image src={r.authorPhoto} alt="" width={32} height={32} className="rounded-full" />}
                    <span>
                      {r.authorUrl ? (
                        <a href={r.authorUrl} target="_blank" rel="noopener noreferrer" className="font-medium hover:underline">{r.author}</a>
                      ) : (
                        <span className="font-medium">{r.author}</span>
                      )}
                      <span className="block text-xs text-mist">
                        Avis Google{r.relativeDate ? ` · ${r.relativeDate}` : r.date ? ` · ${dateFmt.format(new Date(r.date))}` : ""}
                      </span>
                    </span>
                  </footer>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex h-full min-h-[16rem] items-center border border-line p-10">
              <p className="max-w-md text-graphite">
                Les avis de nos clients sont consultables directement sur Google. Nous n&apos;affichons ici que des avis authentiques, issus de notre fiche Google.
              </p>
            </div>
          )}
          {data.source === "google_api" && <p className="mt-4 text-right text-xs text-mist">Avis fournis par Google</p>}
          {data.source === "manual" && data.reviews.length > 0 && <p className="mt-4 text-right text-xs text-mist">Avis publiés sur Google, reproduits avec l&apos;autorisation de leurs auteurs</p>}
        </div>
      </div>
    </section>
  );
}
