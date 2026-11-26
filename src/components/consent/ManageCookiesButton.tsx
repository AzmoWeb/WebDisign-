"use client";
import { openCookiePreferences } from "./ConsentProvider";

export function ManageCookiesButton({ className }: { className?: string }) {
  return (
    <button type="button" onClick={openCookiePreferences} className={className} data-testid="manage-cookies">
      Gérer mes cookies
    </button>
  );
}
