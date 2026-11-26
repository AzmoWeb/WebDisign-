import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { env } from "@/lib/env";
import { ConsentProvider } from "@/components/consent/ConsentProvider";
import { CookieBanner } from "@/components/consent/CookieBanner";
import { ConsentScripts } from "@/components/consent/ConsentScripts";

const bodoni = localFont({
  src: [
    { path: "../fonts/bodoni-moda-latin-wght-normal.woff2", style: "normal", weight: "400 900" },
    { path: "../fonts/bodoni-moda-latin-wght-italic.woff2", style: "italic", weight: "400 900" },
  ],
  variable: "--font-bodoni",
  display: "swap",
  preload: true,
});
const jost = localFont({
  src: [{ path: "../fonts/jost-latin-wght-normal.woff2", style: "normal", weight: "100 900" }],
  variable: "--font-jost",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(env.siteUrl),
  title: {
    default: "Aux Jolis Pas — Magasin de chaussures femme et homme à Bar-sur-Seine (Aube)",
    template: "%s | Aux Jolis Pas, chaussures à Bar-sur-Seine",
  },
  description:
    "Aux Jolis Pas, magasin de chaussures femme et homme à Bar-sur-Seine dans l'Aube : baskets, bottines, escarpins, mocassins, chaussures de ville. Boutique en ligne et magasin au 110 Grande Rue de la Résistance.",
  applicationName: "Aux Jolis Pas",
  formatDetection: { telephone: true, address: true },
  openGraph: { type: "website", locale: "fr_FR", siteName: "Aux Jolis Pas" },
  twitter: { card: "summary_large_image" },
  alternates: { canonical: "/" },
};

export const viewport: Viewport = {
  themeColor: "#f7f3ed",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${bodoni.variable} ${jost.variable}`}>
      <body className="min-h-dvh">
        <ConsentProvider>
          {children}
          <CookieBanner />
          <ConsentScripts ga4Id={env.ga4Id} metaPixelId={env.metaPixelId} />
        </ConsentProvider>
      </body>
    </html>
  );
}
