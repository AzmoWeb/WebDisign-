export function PageTitle({ title, children, kicker }: { title: string; kicker?: string; children?: React.ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        {kicker && <p className="label text-mist">{kicker}</p>}
        <h1 className="display mt-1 text-[2.2rem]">{title}</h1>
      </div>
      {children && <div className="flex flex-wrap gap-2">{children}</div>}
    </div>
  );
}

export function Panel({ title, children, className = "", actions }: { title?: string; children: React.ReactNode; className?: string; actions?: React.ReactNode }) {
  return (
    <section className={`border border-line bg-white/60 p-5 md:p-6 ${className}`}>
      {(title || actions) && (
        <div className="mb-5 flex items-center justify-between gap-4">
          {title && <h2 className="label">{title}</h2>}
          {actions}
        </div>
      )}
      {children}
    </section>
  );
}

export function StatusBadge({ status, label }: { status: string; label: string }) {
  const tone: Record<string, string> = {
    paid: "bg-[#e3ead9] text-moss",
    preparing: "bg-[#f3e7c9] text-[#5b4517]",
    shipped: "bg-[#dfe5ee] text-[#26364d]",
    ready_for_pickup: "bg-[#dfe5ee] text-[#26364d]",
    completed: "bg-sand text-graphite",
    pending: "bg-sand text-mist",
    cancelled: "bg-[#f1dcd8] text-oxblood",
    payment_failed: "bg-[#f1dcd8] text-oxblood",
    refunded: "bg-[#f1dcd8] text-oxblood",
  };
  return <span className={`inline-block px-2 py-0.5 text-xs whitespace-nowrap ${tone[status] ?? "bg-sand"}`}>{label}</span>;
}
