"use client";
import Script from "next/script";
import { useConsent } from "./ConsentProvider";

/**
 * Seul point d'injection des scripts tiers non essentiels.
 * Rien n'est chargé tant que la catégorie correspondante n'a pas été explicitement acceptée.
 */
export function ConsentScripts({ ga4Id, metaPixelId }: { ga4Id: string; metaPixelId: string }) {
  const { ready, choices } = useConsent();
  if (!ready) return null;
  return (
    <>
      {choices.statistics && ga4Id && /^G-[A-Z0-9]+$/.test(ga4Id) && (
        <>
          <Script id="ga4-src" src={`https://www.googletagmanager.com/gtag/js?id=${ga4Id}`} strategy="afterInteractive" data-consent="statistics" />
          <Script id="ga4-init" strategy="afterInteractive" data-consent="statistics">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${ga4Id}',{anonymize_ip:true});`}
          </Script>
        </>
      )}
      {choices.marketing && metaPixelId && /^\d+$/.test(metaPixelId) && (
        <Script id="meta-pixel" strategy="afterInteractive" data-consent="marketing">
          {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${metaPixelId}');fbq('track','PageView');`}
        </Script>
      )}
    </>
  );
}
