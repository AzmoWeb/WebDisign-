import { CartPageClient } from "@/components/cart/CartPageClient";

export const metadata = { title: "Mon panier", robots: { index: false } };

export default function CartPage() {
  return <CartPageClient />;
}
