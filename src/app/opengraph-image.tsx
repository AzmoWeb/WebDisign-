import { ImageResponse } from "next/og";

export const alt = "Aux Jolis Pas — magasin de chaussures femme et homme à Bar-sur-Seine";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OG() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#f7f3ed", color: "#141210", fontFamily: "serif" }}>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", padding: 80, width: "58%" }}>
          <div style={{ fontSize: 22, letterSpacing: 8, opacity: 0.6 }}>BAR-SUR-SEINE · AUBE</div>
          <div style={{ fontSize: 30, letterSpacing: 14, marginTop: 40 }}>AUX</div>
          <div style={{ fontSize: 96, letterSpacing: 6 }}>JOLIS PAS</div>
          <div style={{ fontSize: 30, marginTop: 30, opacity: 0.75 }}>Chaussures femme & homme</div>
        </div>
        <div style={{ display: "flex", width: "42%", position: "relative", background: "#ebe2d5" }}>
          <div style={{ position: "absolute", inset: 0, background: "#141210", clipPath: "polygon(30% 0, 100% 0, 100% 100%, 0 100%)", display: "flex" }} />
          <div style={{ position: "absolute", inset: 0, background: "#d9cbb7", clipPath: "polygon(65% 0, 100% 0, 100% 100%, 40% 100%)", display: "flex" }} />
        </div>
      </div>
    ),
    size,
  );
}
