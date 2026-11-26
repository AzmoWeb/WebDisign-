import { NextResponse } from "next/server";
import { getProducts } from "@/lib/catalog";
import { effectivePrice } from "@/lib/money";

export async function GET(req: Request) {
  const q = new URL(req.url).searchParams.get("q")?.slice(0, 80).trim() ?? "";
  if (q.length < 2) return NextResponse.json({ hits: [] });
  const { products } = await getProducts({ q });
  const hits = products.slice(0, 8).map((p) => ({
    slug: p.slug,
    name: p.name,
    brand: p.brand,
    price: p.priceCents,
    sale: effectivePrice(p) < p.priceCents ? effectivePrice(p) : null,
    category: p.categoryName,
    gender: p.gender,
  }));
  return NextResponse.json({ hits }, { headers: { "Cache-Control": "public, max-age=60" } });
}
