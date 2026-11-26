import { useId } from "react";
import type { DemoShape } from "@/lib/types";

/**
 * Illustration vectorielle utilisée UNIQUEMENT pour les produits de démonstration.
 * Elle remplace une photographie tant que le catalogue réel n'est pas saisi.
 */
type Props = { shape: DemoShape; color: string; className?: string; background?: string; angle?: 0 | 1 | 2; title?: string };

const SHAPES: Record<DemoShape, { upper: string; sole: string; heel?: string; details: string[] }> = {
  sneaker: {
    upper: "M44 214 L50 150 Q52 118 78 112 L112 106 Q124 104 128 116 Q134 134 158 132 L188 128 Q198 96 214 100 Q222 104 224 124 Q270 140 318 160 Q356 176 362 214 Z",
    sole: "M36 212 Q34 238 62 239 L338 239 Q368 239 366 212 Z",
    details: ["M300 212 Q306 178 338 176", "M118 212 Q150 162 236 148", "M204 132 l16 6 M216 140 l16 6 M230 147 l16 6 M244 154 l16 6", "M52 196 L360 196"],
  },
  boot: {
    upper: "M72 222 L74 40 Q74 30 84 30 L150 30 Q160 30 160 42 L162 150 Q200 160 262 176 Q332 192 346 212 L348 222 Z",
    sole: "M112 222 L348 222 Q350 234 338 236 L112 236 Z",
    heel: "M72 222 L72 250 L112 250 L114 222 Z",
    details: ["M96 30 L98 222", "M160 150 Q150 186 170 222", "M74 52 L160 52"],
  },
  ankle: {
    upper: "M66 222 L70 104 Q70 96 80 96 L160 96 Q170 96 170 106 L172 150 Q230 166 290 182 Q340 194 346 222 Z",
    sole: "M114 222 L346 222 L344 234 Q340 238 330 238 L116 238 Z",
    heel: "M66 222 L68 252 L112 252 L116 222 Z",
    details: ["M120 98 Q124 140 146 158", "M70 112 L170 112", "M72 104 L66 84 L82 84 L84 98"],
  },
  pump: {
    upper: "M80 132 Q86 124 94 132 Q132 170 202 186 Q282 196 340 214 Q366 224 360 236 L248 238 Q200 222 150 198 Q112 178 84 172 Z",
    sole: "M100 174 Q172 206 248 236 L362 236 L360 242 L246 244 Q170 214 100 182 Z",
    heel: "M84 170 L102 174 L99 254 L93 254 Z",
    details: ["M96 136 Q150 178 220 190"],
  },
  loafer: {
    upper: "M48 218 L52 168 Q54 150 76 148 Q160 140 230 152 Q300 162 340 190 Q362 206 360 218 Z",
    sole: "M44 218 L362 218 Q364 232 350 234 L56 234 Q44 234 44 218 Z",
    heel: "M50 234 L50 244 L104 244 L104 234 Z",
    details: ["M206 152 Q236 182 304 172", "M186 150 L254 164", "M56 200 L356 206"],
  },
  derby: {
    upper: "M48 216 L52 150 Q54 134 72 132 L120 128 Q150 128 176 118 Q196 112 210 128 Q270 150 330 178 Q362 196 360 216 Z",
    sole: "M44 216 L362 216 Q364 230 350 232 L56 232 Q44 232 44 216 Z",
    heel: "M50 232 L50 244 L106 244 L106 232 Z",
    details: ["M150 134 Q170 170 160 216", "M190 122 l12 8 M200 132 l12 8 M210 142 l12 8", "M290 162 Q300 190 288 216"],
  },
  sandal: {
    upper: "M84 224 Q92 168 140 164 Q158 166 156 224 Z M214 226 Q234 182 292 190 Q306 206 306 228 Z M76 168 Q110 148 148 164 L148 174 Q112 160 80 178 Z",
    sole: "M48 224 Q150 212 250 222 Q330 228 362 224 Q368 240 350 242 L66 242 Q46 242 48 224 Z",
    heel: "M52 240 L54 252 L104 252 L106 240 Z",
    details: [],
  },
  slipper: {
    upper: "M54 220 Q64 198 140 194 Q172 148 252 146 Q342 148 362 208 Q364 220 356 224 Z",
    sole: "M46 220 L364 220 Q366 234 350 236 L60 236 Q46 236 46 220 Z",
    details: ["M140 194 Q190 176 250 182", "M62 206 Q140 200 200 206"],
  },
};

function shade(hex: string, amt: number) {
  const n = parseInt(hex.slice(1), 16);
  const c = (v: number) => Math.max(0, Math.min(255, Math.round(v + amt * 255)));
  const r = c((n >> 16) & 255), g = c((n >> 8) & 255), b = c(n & 255);
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
}
const luminance = (hex: string) => {
  const n = parseInt(hex.slice(1), 16);
  return (0.299 * ((n >> 16) & 255) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255;
};

export function ShoeArt({ shape, color, className, background = "#ece5da", angle = 0, title }: Props) {
  const s = SHAPES[shape];
  const light = luminance(color) > 0.6;
  const soleColor = shape === "sneaker" ? (light ? "#f7f4ee" : "#ece5d8") : light ? "#c9bba6" : "#201d1a";
  const line = light ? shade(color, -0.22) : shade(color, 0.16);
  const gid = `g${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const transform = angle === 1 ? "translate(400 0) scale(-1 1)" : angle === 2 ? "translate(30 18) scale(0.86)" : undefined;
  return (
    <svg viewBox="0 -70 400 480" className={className} role="img" aria-label={title} preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={shade(color, 0.1)} />
          <stop offset="0.55" stopColor={color} />
          <stop offset="1" stopColor={shade(color, -0.1)} />
        </linearGradient>
      </defs>
      <rect x="-400" y="-400" width="1200" height="1200" fill={background} />
      <ellipse cx="205" cy="252" rx="170" ry="9" fill="#000" opacity="0.09" />
      <g transform={transform}>
        {s.heel && <path d={s.heel} fill={soleColor} />}
        <path d={s.upper} fill={`url(#${gid})`} />
        <path d={s.sole} fill={soleColor} />
        {s.details.map((d, i) => (
          <path key={i} d={d} fill="none" stroke={line} strokeWidth={i === 0 ? 1.6 : 1.2} strokeLinecap="round" strokeDasharray={i === s.details.length - 1 && (shape === "sneaker" || shape === "loafer") ? "3 4" : undefined} opacity="0.85" />
        ))}
      </g>
    </svg>
  );
}
