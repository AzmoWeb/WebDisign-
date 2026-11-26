/**
 * Compositions graphiques provisoires des campagnes.
 * Elles occupent les emplacements photo tant que les photographies publicitaires
 * définitives n'ont pas été importées depuis l'administration (Contenu > Campagnes).
 * Brief photo détaillé : docs/DIRECTION-ARTISTIQUE.md
 */
type Scene = "femme" | "baskets" | "homme";

const SNEAKER_UPPER =
  "M44 214 L50 150 Q52 118 78 112 L112 106 Q124 104 128 116 Q134 134 158 132 L188 128 Q198 96 214 100 Q222 104 224 124 Q270 140 318 160 Q356 176 362 214 Z";
const SNEAKER_SOLE = "M36 212 Q34 238 62 239 L338 239 Q368 239 366 212 Z";
const PUMP = "M80 132 Q86 124 94 132 Q132 170 202 186 Q282 196 340 214 Q366 224 360 236 L248 238 Q200 222 150 198 Q112 178 84 172 Z";
const PUMP_HEEL = "M84 170 L102 174 L99 254 L93 254 Z";
const DERBY = "M48 216 L52 150 Q54 134 72 132 L120 128 Q150 128 176 118 Q196 112 210 128 Q270 150 330 178 Q362 196 360 216 Z";
const DERBY_SOLE = "M44 216 L362 216 Q364 230 350 232 L56 232 Q44 232 44 216 Z";

export function CampaignScene({ scene, className }: { scene: Scene; className?: string }) {
  if (scene === "femme")
    return (
      <svg viewBox="0 0 800 900" className={className} preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <rect width="800" height="900" fill="#e6dccd" />
        {/* façade : arcades */}
        {[60, 330, 600].map((x) => (
          <path key={x} d={`M${x} 640 L${x} 260 Q${x} 140 ${x + 110} 140 Q${x + 220} 140 ${x + 220} 260 L${x + 220} 640 Z`} fill="#d3c5b1" />
        ))}
        {[80, 350, 620].map((x) => (
          <path key={x} d={`M${x} 640 L${x} 270 Q${x} 168 ${x + 90} 168 Q${x + 180} 168 ${x + 180} 270 L${x + 180} 640 Z`} fill="#bfae96" />
        ))}
        <rect y="640" width="800" height="260" fill="#cfc2ae" />
        <path d="M0 640 L800 640" stroke="#b7a68e" strokeWidth="2" />
        {/* lumière rasante */}
        <polygon points="0,0 380,0 800,520 800,900 640,900 0,180" fill="#fff8ec" opacity="0.28" />
        {/* jambes, pantalon large */}
        <path d="M300 0 L470 0 L470 610 Q430 640 410 640 L392 640 Q372 380 360 120 Q350 380 330 640 L290 640 Q262 636 256 610 Z" fill="#1c1a18" />
        <path d="M368 120 Q372 360 392 640" stroke="#33302c" strokeWidth="3" fill="none" />
        {/* ombres portées */}
        <polygon points="250,700 470,700 760,860 520,880" fill="#000" opacity="0.1" />
        {/* escarpins */}
        <g transform="translate(190 562) scale(0.62)" fill="#7d2a22">
          <path d={PUMP} />
          <path d={PUMP_HEEL} />
        </g>
        <g transform="translate(330 588) scale(0.62)" fill="#6b231c">
          <path d={PUMP} />
          <path d={PUMP_HEEL} />
        </g>
      </svg>
    );
  if (scene === "baskets")
    return (
      <svg viewBox="0 0 800 900" className={className} preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <rect width="800" height="900" fill="#c9c4bb" />
        {/* marches béton en perspective */}
        {Array.from({ length: 9 }).map((_, i) => (
          <g key={i}>
            <polygon points={`0,${300 + i * 70} 800,${180 + i * 70} 800,${210 + i * 70} 0,${330 + i * 70}`} fill="#b3ada3" />
            <polygon points={`0,${330 + i * 70} 800,${210 + i * 70} 800,${250 + i * 70} 0,${370 + i * 70}`} fill="#d8d3ca" />
          </g>
        ))}
        <polygon points="0,0 800,0 800,190 0,310" fill="#a7a197" />
        <polygon points="520,0 800,0 800,900 380,900" fill="#000" opacity="0.06" />
        {/* basket en gros plan */}
        <ellipse cx="420" cy="640" rx="300" ry="26" fill="#000" opacity="0.16" />
        <g transform="translate(70 290) rotate(-8 200 200) scale(1.8)">
          <path d={SNEAKER_UPPER} fill="#f2eee7" />
          <path d={SNEAKER_SOLE} fill="#d9cdb8" />
          <path d="M300 212 Q306 178 338 176" stroke="#c9bfb0" strokeWidth="1.4" fill="none" />
          <path d="M118 212 Q150 162 236 148" stroke="#c9bfb0" strokeWidth="1.4" fill="none" />
          <path d="M204 132 l16 6 M216 140 l16 6 M230 147 l16 6 M244 154 l16 6" stroke="#8a847c" strokeWidth="2" strokeLinecap="round" />
          <path d="M52 196 L360 196" stroke="#b8ab95" strokeDasharray="3 4" strokeWidth="1" />
        </g>
      </svg>
    );
  return (
    <svg viewBox="0 0 800 900" className={className} preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <rect width="800" height="900" fill="#cfcac2" />
      {/* colonnade contemporaine */}
      {[40, 230, 420, 610].map((x) => (
        <g key={x}>
          <rect x={x} y="0" width="120" height="660" fill="#bdb6ab" />
          <rect x={x + 84} y="0" width="36" height="660" fill="#a9a196" />
        </g>
      ))}
      <rect y="660" width="800" height="240" fill="#e1dcd3" />
      {[0, 1, 2, 3, 4].map((i) => (
        <line key={i} x1={i * 200} y1="660" x2={i * 200 - 160} y2="900" stroke="#cfc8bd" strokeWidth="2" />
      ))}
      <polygon points="0,0 260,0 800,660 800,900 0,900" fill="#fffaf1" opacity="0.16" />
      {/* pantalon de costume */}
      <path d="M310 0 L500 0 L486 640 L420 646 Q414 360 404 140 Q392 360 380 646 L318 640 Z" fill="#2c2f33" />
      <path d="M404 140 L404 0" stroke="#24272b" strokeWidth="2" />
      <polygon points="300,700 520,700 800,860 560,880" fill="#000" opacity="0.1" />
      {/* derbies cognac */}
      <g transform="translate(222 572) scale(0.52)">
        <path d={DERBY} fill="#8a5432" />
        <path d={DERBY_SOLE} fill="#1f1c19" />
      </g>
      <g transform="translate(392 590) scale(0.52)">
        <path d={DERBY} fill="#7a4a2c" />
        <path d={DERBY_SOLE} fill="#1f1c19" />
      </g>
    </svg>
  );
}
