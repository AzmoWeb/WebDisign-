import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

/**
 * Rafraîchit la session Supabase et filtre l'accès aux zones privées.
 * Ce filtrage est une première barrière : chaque page et action d'administration
 * revérifie le rôle côté serveur (requireAdmin / assertAdmin) et la RLS protège la base.
 */
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return response;

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (toSet) => {
        toSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        toSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });
  const { data } = await supabase.auth.getUser();
  const path = request.nextUrl.pathname;
  const isPublicAccount = /^\/compte\/(connexion|inscription|mot-de-passe-oublie)/.test(path);
  if (!data.user && (path.startsWith("/admin") || (path.startsWith("/compte") && !isPublicAccount))) {
    const login = request.nextUrl.clone();
    login.pathname = "/compte/connexion";
    login.search = `?next=${encodeURIComponent(path)}`;
    return NextResponse.redirect(login);
  }
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icon|api/stripe/webhook|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|woff2)$).*)"],
};
