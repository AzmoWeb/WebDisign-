import Link from "next/link";

export function SectionHeading({ kicker, title, href, linkLabel = "Tout voir", tone }: { kicker?: string; title: string; href?: string; linkLabel?: string; tone?: "sale" }) {
  return (
    <div className="mb-8 flex items-end justify-between gap-6 md:mb-10">
      <div>
        {kicker && <p className={`label ${tone === "sale" ? "text-oxblood" : "text-mist"}`}>{kicker}</p>}
        <h2 className="display mt-2 text-[2rem] md:text-[2.75rem]">{title}</h2>
      </div>
      {href && (
        <Link href={href} className="link-underline shrink-0 pb-2 text-[0.7rem] font-medium tracking-[0.18em] uppercase">
          {linkLabel}
        </Link>
      )}
    </div>
  );
}
