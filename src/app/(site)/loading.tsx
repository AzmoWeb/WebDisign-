export default function Loading() {
  return (
    <div className="container-site pt-10" aria-busy="true" aria-live="polite">
      <span className="sr-only">Chargement…</span>
      <div className="h-3 w-24 animate-pulse bg-sand" />
      <div className="mt-5 h-12 w-72 max-w-full animate-pulse bg-sand" />
      <div className="mt-12 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4 md:gap-x-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i}>
            <div className="aspect-[4/5] animate-pulse bg-sand" style={{ animationDelay: `${i * 80}ms` }} />
            <div className="mt-4 h-3 w-2/3 animate-pulse bg-sand" />
            <div className="mt-2 h-3 w-1/3 animate-pulse bg-sand" />
          </div>
        ))}
      </div>
    </div>
  );
}
