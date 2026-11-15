import React from "react";
import { AbsoluteFill, Audio, Img, staticFile, useCurrentFrame } from "remotion";
import { Achenes, Banana, Judge, STRAW_BODY, Strawberry, SMood } from "./Cast";
import { EV, SC, UZ, boingAt, c01, hash, inOut, kf, lerp, outBack, outCubic, outElastic, seg, smooth, tri } from "./util";

const FONTS = `
@font-face{font-family:Slab;src:url(${staticFile("fonts/alfa-slab-one-latin-400-normal.woff2")}) format("woff2");unicode-range:U+0000-00FF,U+2000-206F,U+2260;}
@font-face{font-family:Slab;src:url(${staticFile("fonts/alfa-slab-one-latin-ext-400-normal.woff2")}) format("woff2");unicode-range:U+0100-02FF,U+1E00-1EFF;}
@font-face{font-family:NunitoX;font-weight:900;src:url(${staticFile("fonts/nunito-latin-900-normal.woff2")}) format("woff2");unicode-range:U+0000-00FF,U+2000-206F;}
@font-face{font-family:NunitoX;font-weight:900;src:url(${staticFile("fonts/nunito-latin-ext-800-normal.woff2")}) format("woff2");unicode-range:U+0100-02FF,U+1E00-1EFF;}
@font-face{font-family:NunitoX;font-weight:800;src:url(${staticFile("fonts/nunito-latin-800-normal.woff2")}) format("woff2");}
`;
const Defs: React.FC = () => (
  <svg width="0" height="0" style={{ position: "absolute" }}>
    <defs>
      <radialGradient id="strawG" cx="0.4" cy="0.3" r="0.8"><stop offset="0" stopColor="#FF6B7A" /><stop offset="0.55" stopColor="#E8283E" /><stop offset="1" stopColor="#9E0F24" /></radialGradient>
      <radialGradient id="strawShade" cx="0.35" cy="0.25" r="0.9"><stop offset="0.6" stopColor="#5A0010" stopOpacity="0" /><stop offset="1" stopColor="#5A0010" stopOpacity="0.45" /></radialGradient>
      <linearGradient id="bananaG" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#FFF08A" /><stop offset="0.5" stopColor="#FFD93D" /><stop offset="1" stopColor="#E8B21E" /></linearGradient>
      <linearGradient id="bananaShade" x1="0" y1="0" x2="1" y2="0"><stop offset="0.6" stopColor="#7A4A00" stopOpacity="0" /><stop offset="1" stopColor="#7A4A00" stopOpacity="0.35" /></linearGradient>
      <radialGradient id="pineG" cx="0.4" cy="0.35" r="0.75"><stop offset="0" stopColor="#FFE07A" /><stop offset="1" stopColor="#D99A1E" /></radialGradient>
      <linearGradient id="wallG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#3E0B1A" /><stop offset="1" stopColor="#7A1E36" /></linearGradient>
      <linearGradient id="woodG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#A0652A" /><stop offset="1" stopColor="#5E3714" /></linearGradient>
      <linearGradient id="goldG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#FFF1B0" /><stop offset="0.5" stopColor="#FFC93C" /><stop offset="1" stopColor="#D98E04" /></linearGradient>
      <radialGradient id="spotG"><stop offset="0" stopColor="#FFE9B0" stopOpacity="0.55" /><stop offset="1" stopColor="#FFE9B0" stopOpacity="0" /></radialGradient>
      <radialGradient id="flowerG" cx="0.5" cy="0.4" r="0.7"><stop offset="0" stopColor="#FFF6FA" /><stop offset="1" stopColor="#F2A8C4" /></radialGradient>
      <linearGradient id="canopyG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#1E4A2A" /><stop offset="0.75" stopColor="#2E6B3A" /><stop offset="1" stopColor="#2E6B3A" stopOpacity="0" /></linearGradient>
      <linearGradient id="banPeel" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#FFF08A" /><stop offset="1" stopColor="#E8B21E" /></linearGradient>
    </defs>
  </svg>
);
const Svg: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <svg width="1080" height="1920" viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0, overflow: "visible", ...style }}>{children}</svg>
);
const T: React.FC<{ x: number; y: number; size: number; children: React.ReactNode; fill?: string; stroke?: string; sw?: number; rot?: number; scale?: number; sx?: number; opacity?: number; font?: "slab" | "nunito" }> = ({ x, y, size, children, fill = "#fff", stroke = "#3E0B1A", sw = 14, rot = 0, scale = 1, sx = 1, opacity = 1, font = "slab" }) => (
  <text transform={`translate(${x} ${y}) rotate(${rot}) scale(${scale * sx} ${scale})`} textAnchor="middle" fontFamily={font === "slab" ? "Slab" : "NunitoX"} fontWeight={font === "slab" ? 400 : 900} fontSize={size} fill={fill} stroke={stroke} strokeWidth={sw} strokeLinejoin="round" paintOrder="stroke fill" opacity={opacity} style={{ filter: "drop-shadow(0 8px 0 rgba(40,4,14,0.45))" }}>{children}</text>
);
const Pill: React.FC<{ x: number; y: number; en: string; uz?: string; color: string; p: number; w?: number }> = ({ x, y, en, uz, color, p, w = 520 }) => (
  <g transform={`translate(${x} ${y}) scale(${p})`} opacity={c01(p * 2)}>
    <rect x={-w / 2} y="-46" width={w} height={uz ? 118 : 92} rx="30" fill="#fff" stroke={color} strokeWidth="7" style={{ filter: "drop-shadow(0 8px 0 rgba(40,4,14,0.25))" }} />
    <text y="14" textAnchor="middle" fontFamily="Slab" fontSize="44" fill={color}>{en}</text>
    {uz && <text y="56" textAnchor="middle" fontFamily="NunitoX" fontWeight={900} fontSize="32" fill="#5E3714">{uz}</text>}
  </g>
);

// ================================================================= the courtroom set
const Courtroom: React.FC<{ t: number; dim: number; gasp: number }> = ({ t, dim, gasp }) => (
  <>
    <Svg>
      <rect width="1080" height="1920" fill="url(#wallG)" />
      {[0, 1, 2].map((i) => (
        <g key={i} transform={`translate(${150 + i * 390} 0)`}>
          <path d="M-80 640 L-80 330 Q0 230 80 330 L80 640Z" fill="#FFD98A" opacity="0.22" />
          <path d="M-80 640 L-80 330 Q0 230 80 330 L80 640Z" fill="none" stroke="url(#goldG)" strokeWidth="10" />
          <path d="M0 250 L0 640 M-80 450 L80 450" stroke="#C99A3A" strokeWidth="6" opacity="0.5" />
        </g>
      ))}
      {[0, 1, 2].map((i) => <polygon key={i} points={`${110 + i * 390},330 ${190 + i * 390},330 ${330 + i * 390 + Math.sin(t * 0.6 + i) * 20},1400 ${10 + i * 390 + Math.sin(t * 0.6 + i) * 20},1400`} fill="#FFE2A0" opacity={0.08 * (1 - dim)} />)}
      {[-1, 1].map((s) => <rect key={s} x={s < 0 ? 0 : 1030} y="200" width="50" height="1000" fill="url(#goldG)" opacity="0.6" />)}
      <g transform="translate(540 240) scale(1.1)" opacity="0.9">
        <path d="M0 -30 L0 70 M-80 0 L80 0" stroke="url(#goldG)" strokeWidth="10" strokeLinecap="round" />
        <path d={`M-80 0 L-110 ${50 + Math.sin(t) * 6} L-50 ${50 + Math.sin(t) * 6}Z M80 0 L50 ${50 - Math.sin(t) * 6} L110 ${50 - Math.sin(t) * 6}Z`} fill="url(#goldG)" />
        <circle cy="-36" r="12" fill="url(#goldG)" />
      </g>
      <rect x="0" y="900" width="1080" height="260" fill="url(#woodG)" />
      {Array.from({ length: 9 }, (_, i) => <rect key={i} x={20 + i * 120} y="930" width="90" height="200" rx="8" fill="#000" opacity="0.12" />)}
      {/* gallery of fruit spectators */}
      {Array.from({ length: 9 }, (_, i) => {
        const x = 60 + i * 120, kind = i % 3, jump = gasp * (8 + 8 * hash(i)) * Math.abs(Math.sin(t * 10 + i));
        const col = ["#7B3FA0", "#E8473E", "#FF9F1C"][kind];
        return (
          <g key={i} transform={`translate(${x} ${905 - jump})`}>
            {kind === 0 ? [[-14, -36], [14, -36], [0, -60], [-22, -62], [22, -62], [0, -86]].map(([a, b], k) => <circle key={k} cx={a} cy={b} r="18" fill={col} />) : <circle cy="-50" r="44" fill={col} />}
            <circle cx="-12" cy="-58" r="7" fill="#fff" /><circle cx="12" cy="-58" r="7" fill="#fff" />
            {gasp > 0.3 ? <ellipse cy="-36" rx="7" ry="10" fill="#2A0A0A" /> : <path d="M-8 -38 q8 6 16 0" stroke="#2A0A0A" strokeWidth="4" fill="none" />}
          </g>
        );
      })}
      <rect x="0" y="880" width="1080" height="36" fill="#7A4A1E" />
      {Array.from({ length: 18 }, (_, i) => <rect key={i} x={10 + i * 60} y="880" width="14" height="80" fill="#8A5A2B" />)}
      {/* checkered marble floor in perspective */}
      <rect x="0" y="1160" width="1080" height="760" fill="#E8D9B5" />
      {Array.from({ length: 10 }, (_, r) => Array.from({ length: 14 }, (_, c) => (r + c) % 2 ? null : (() => {
        const y0 = 1160 + Math.pow(r / 10, 1.6) * 760, y1 = 1160 + Math.pow((r + 1) / 10, 1.6) * 760;
        const xs = (y: number, k: number) => 540 + (k - 7) * 110 * (0.6 + 0.9 * (y - 1160) / 760);
        return <polygon key={`${r}${c}`} points={`${xs(y0, c)},${y0} ${xs(y0, c + 1)},${y0} ${xs(y1, c + 1)},${y1} ${xs(y1, c)},${y1}`} fill="#C9B48A" />;
      })()))}
    </Svg>
    <AbsoluteFill style={{ background: "rgba(10,0,10,1)", opacity: 0.55 * dim }} />
  </>
);

// ================================================================= scene logic
const strawMood = (t: number): SMood => {
  if (t < EV.plot) return t < EV.straw2 ? "smug" : "proud";
  if (t < EV.w4end + 0.3) return "shock";
  if (t < SC.science) return "betrayed";
  if (t < EV.means) return "shock";
  if (t < EV.imagine) return "betrayed";
  if (t < EV.but12 - 0.1) return t > EV.notberry ? "angry" : "betrayed";
  if (t < EV.end + 0.05) return "shout";
  return "shout";
};

const CourtScene: React.FC<{ t: number }> = ({ t }) => {
  const freeze = t > EV.end + 0.05 ? EV.end + 0.05 : t;          // the freeze-frame stops everyone but the banana's brow and the judge's palm
  const tf = freeze;
  const enter = outCubic(seg(t, 0, 0.9));
  const sx = lerp(40, 290, enter);
  const slam = EV.w1end;
  const judgeShock = c01((t - slam) * 6) * (1 - seg(t, slam + 1.5, slam + 2.2)) + tri(t, EV.plot + 0.1, 0.8) + (t > SC.verdict - 0.1 && t < SC.verdict + 0.4 ? 0.4 : 0);
  const gavel = t > SC.verdict - 0.35 && t < SC.verdict + 0.1 ? kf(t, [[SC.verdict - 0.35, 0], [SC.verdict - 0.12, 1], [SC.verdict, 0]]) : 0;
  const dim = smooth(seg(t, EV.plot - 0.35, EV.plot - 0.1)) * (1 - smooth(seg(t, EV.w3end + 0.1, EV.banana4)));
  const gasp = c01((t - EV.w3end) * 5) * (1 - seg(t, EV.w3end + 1.2, EV.w3end + 1.6));
  const glassesDrop = seg(t, EV.w3end + 0.05, EV.w3end + 0.55);
  const signFlip = smooth(seg(t, EV.means - 0.1, EV.means + 0.3));
  const armUp = t < EV.plot ? 150 : t < EV.means ? 150 : t < EV.imagine ? 150 : 30;
  const argue = t > EV.imagine && t < EV.but12 - 0.1 ? 95 + 45 * Math.sin(tf * 9) : 30;
  const point = t > EV.but12 - 0.1 ? 160 : 0;
  const pres = outBack(seg(t, EV.banana4 - 0.2, EV.banana4 + 0.2));
  const sip = t > EV.w9end - 0.05 && t < EV.but12;
  const facepalm = smooth(seg(t, EV.end + 0.35, EV.end + 0.6));
  const browRaise = smooth(seg(t, EV.end + 0.1, EV.end + 0.6));
  const sign = (t < SC.science || t < EV.imagine) && (
    <g transform={`translate(215 -560) scale(${Math.abs(1 - 2 * signFlip)} 1)`}>
      <rect x="-6" y="40" width="12" height="190" fill="#8A5A2B" />
      <rect x="-215" y="-80" width="430" height="130" rx="14" fill="#FFF8E7" stroke="#8A5A2B" strokeWidth="8" />
      <text y="4" textAnchor="middle" fontFamily="Slab" fontSize={signFlip < 0.5 ? 46 : 36} fill="#E8283E">{signFlip < 0.5 ? "I'M A BERRY!" : "I'M NOT A BERRY?!"}</text>
    </g>
  );
  const sq = boingAt(t, 0.9, 0.08) * boingAt(t, EV.w3end, 0.16) * boingAt(t, EV.but12, 0.12, 16, 4);
  return (
    <AbsoluteFill>
      <Courtroom t={tf} dim={dim} gasp={gasp} />
      <Svg>
        {/* judge's bench */}
        <g transform="translate(540 650)"><Judge t={tf} shock={c01(judgeShock)} gavel={gavel} facepalm={facepalm} blink={tri(tf, 8.6, 0.08)} lookX={t > EV.imagine ? -0.7 : 0} /></g>
        <path d="M150 640 L930 640 L960 900 L120 900Z" fill="url(#woodG)" />
        <rect x="150" y="630" width="780" height="26" rx="8" fill="#C99A3A" />
        <circle cx="540" cy="770" r="56" fill="url(#goldG)" opacity="0.85" /><path d="M520 770 L540 740 L560 770Z M512 790 h56" stroke="#7A4A1E" strokeWidth="6" fill="none" />
        {/* evidence easel */}
        {pres > 0.01 && t < SC.science && (
          <g transform={`translate(540 ${lerp(150, 470, pres)}) scale(${pres})`}>
            <rect x="-450" y="-170" width="900" height="310" rx="26" fill="#FFF8E7" stroke="url(#goldG)" strokeWidth="12" style={{ filter: "drop-shadow(0 0 30px rgba(255,220,120,0.8))" }} />
            <text x="0" y="-70" textAnchor="middle" fontFamily="Slab" fontSize="64" fill="#2E8B3E" opacity={c01((t - EV.banana4) * 4)}>BANANA = BERRY ✅</text>
            <text x="0" y="22" textAnchor="middle" fontFamily="Slab" fontSize="54" fill="#C8102E" opacity={c01((t - EV.straw4) * 4)}>STRAWBERRY ≠</text>
            <text x="0" y="92" textAnchor="middle" fontFamily="Slab" fontSize="54" fill="#C8102E" opacity={c01((t - EV.straw4 - 0.15) * 4)}>BOTANICAL BERRY ❌</text>
          </g>
        )}
        {/* counsel tables */}
        <rect x="40" y="1120" width="420" height="160" rx="16" fill="url(#woodG)" />
        <rect x="620" y="1120" width="420" height="160" rx="16" fill="url(#woodG)" />
        {t > slam && <g transform={`translate(830 ${1120 - 10 * Math.max(0, 1 - (t - slam) * 4)})`}><rect x="-80" y="-20" width="160" height="26" rx="6" fill="#E8C27A" stroke="#8A5A1E" strokeWidth="4" /></g>}
        <ellipse cx={sx} cy="1300" rx="150" ry="22" fill="#000" opacity="0.18" />
        <g transform={`translate(${sx} 1295)`}>
          <Strawberry t={tf} mood={strawMood(t)} glasses={t < EV.w3end + 0.6 ? 1 : 0} glassesDrop={glassesDrop} crown={1} armL={t > EV.imagine ? argue : t < EV.plot ? 25 : 70} armR={point || (t > EV.imagine ? 95 + 45 * Math.sin(tf * 9 + 1.5) : armUp)} sign={sign} squash={sq} lookX={t > EV.imagine ? 0.6 : 0} blink={tri(tf, 3.6, 0.08) + tri(tf, 12, 0.08)} walk={t < 0.9 ? t * 2.2 : 0} />
        </g>
        <ellipse cx="810" cy="1300" rx="130" ry="20" fill="#000" opacity="0.18" />
        <g transform={`translate(810 1295)`}>
          <Banana t={tf} smile={t > EV.w9end ? 1 : 0.6} browRaise={browRaise} armR={t > slam - 0.2 && t < slam + 0.2 ? 40 : t > EV.banana4 - 0.2 && t < EV.w4end ? -30 : 0} hold={sip ? "smoothie" : t < slam + 0.3 ? "folder" : "none"} blink={tri(tf, 5, 0.08) + tri(tf, 24.6, 0.08)} lookX={t > EV.imagine ? -0.8 : 0} lean={sip ? -3 : 0} />
        </g>
        {/* floating name with BERRY lit */}
        {t > EV.notberry - 0.3 && (
          <g transform={`translate(${sx + 40} 720) scale(${outBack(seg(t, EV.notberry - 0.3, EV.notberry + 0.05))})`}>
            <text x="0" y="0" textAnchor="middle" fontFamily="Slab" fontSize="68" fill="#fff" stroke="#3E0B1A" strokeWidth="12" paintOrder="stroke fill">STRAW<tspan fill="#FFC93C" style={{ filter: "drop-shadow(0 0 14px #FFC93C)" }}>BERRY</tspan></text>
            <path d="M36 18 L222 18" stroke="#FFC93C" strokeWidth="8" strokeLinecap="round" strokeDasharray="220" strokeDashoffset={220 * (1 - seg(t, EV.notberry, EV.notberry + 0.4))} />
          </g>
        )}
        {/* the shout */}
        {t > EV.but12 - 0.1 && (
          <g transform={`translate(470 450) scale(${0.78 * outBack(seg(t, EV.but12 - 0.1, EV.but12 + 0.2))}) rotate(${-3 + (t < EV.end ? Math.sin(t * 40) * 1.5 : 0)})`}>
            <path d="M-480 -110 L480 -110 L460 110 L-60 110 L-200 220 L-170 110 L-470 110Z" fill="#fff" stroke="#E8283E" strokeWidth="10" strokeLinejoin="round" />
            <text y="-12" textAnchor="middle" fontFamily="Slab" fontSize="62" fill="#C8102E">BUT IT'S LITERALLY</text>
            <text y="68" textAnchor="middle" fontFamily="Slab" fontSize="70" fill="#C8102E">IN MY NAME!</text>
          </g>
        )}
        {t > slam && t < slam + 0.35 && <g opacity={1 - (t - slam) / 0.35}>{Array.from({ length: 8 }, (_, i) => <path key={i} d="M0 0 L0 -60" stroke="#FFE27A" strokeWidth="10" strokeLinecap="round" transform={`translate(830 1100) rotate(${i * 45}) translate(0 -60)`} />)}</g>}
        {t > EV.w3end && t < EV.w3end + 1.4 && <T x={sx + 40} y={700} size={90} fill="#FFE27A" rot={-8} scale={outBack(seg(t, EV.w3end, EV.w3end + 0.25))}>?!</T>}
      </Svg>
      {/* spotlight on the quiz options */}
      {t > EV.banana2 - 0.1 && t < EV.w2end + 0.3 && <AbsoluteFill style={{ background: `radial-gradient(circle 300px at ${t < EV.straw2 - 0.05 ? 810 : 290}px 1050px, transparent 60%, rgba(10,0,10,0.45))` }} />}
    </AbsoluteFill>
  );
};

// ================================================================= the botanical world
const ScienceScene: React.FC<{ t: number }> = ({ t }) => {
  const s0 = SC.science;
  const bloom = outBack(seg(t, s0 + 0.2, s0 + 0.8));
  const ovary = seg(t, EV.flower - 0.4, EV.flower + 0.2);
  const grow = smooth(seg(t, EV.flower + 0.1, EV.ovary + 0.1));
  const cut = smooth(seg(t, EV.ovary - 0.1, EV.ovary + 0.4));
  const toStraw = inOut(seg(t, EV.w5end + 0.05, EV.straw6 + 0.45));
  const macro = inOut(seg(t, EV.dots - 0.4, EV.dots + 0.4));
  const pop = seg(t, EV.w7end - 0.1, EV.w7end + 0.5);
  const lbl = (at: number) => outBack(seg(t, at - 0.05, at + 0.3));
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 35%, #FFFDF3, #FFF1D2 60%, #FFE3B0)" }} />
      <Svg>
        <rect x="0" y="0" width="1080" height="330" fill="url(#canopyG)" />
        {Array.from({ length: 12 }, (_, i) => <path key={`c${i}`} d="M0 0 C40 -30 100 -20 140 20 C100 0 40 0 0 0Z" fill={i % 2 ? "#2E6B3A" : "#245A30"} transform={`translate(${i * 95 - 20} ${210 + (i % 3) * 30}) rotate(${30 + (i % 4) * 25 + Math.sin(t + i) * 4}) scale(${1.4 + hash(i + 4) * 0.6})`} />)}
        {Array.from({ length: 10 }, (_, i) => <path key={i} d="M0 0 C40 -30 100 -20 140 20 C100 0 40 0 0 0Z" fill={i % 2 ? "#7CC46B" : "#5AAE5A"} opacity="0.55" transform={`translate(${i < 5 ? -20 : 1100} ${220 + (i % 5) * 300}) rotate(${(i < 5 ? 10 : 170) + Math.sin(t + i) * 5}) scale(${1.6 + hash(i)})`} />)}
        {/* part A: one flower, one ovary, one berry */}
        <g opacity={1 - toStraw} transform={`translate(${-400 * toStraw} 0)`}>
          <g transform={`translate(540 ${lerp(470, 420, grow)}) scale(${1.25 * bloom * (1 - grow * 0.35)})`}>
            {Array.from({ length: 5 }, (_, i) => <ellipse key={i} cx="0" cy="-70" rx="46" ry="80" fill="url(#flowerG)" stroke="#E07AA0" strokeWidth="4" transform={`rotate(${i * 72 + t * 6})`} />)}
            <circle r="30" fill="#FFD93D" />
          </g>
          <g transform={`translate(540 ${lerp(585, 880, grow)}) scale(${lerp(1.25, 1.8, grow)})`}>
            <ellipse rx={lerp(34, 10, grow)} ry={lerp(46, 10, grow)} fill="#7CC46B" stroke={ovary > 0 ? "#FFC93C" : "#3E8E3E"} strokeWidth={4 + 6 * ovary} opacity={1 - grow} style={{ filter: ovary > 0.1 ? `drop-shadow(0 0 ${18 * ovary}px #FFC93C)` : undefined }} />
          </g>
          {grow > 0.02 && (
            <g transform={`translate(540 880) scale(${grow})`}>
              <g transform={`translate(${-cut * 90} ${-cut * 30})`}><path d="M-320 10 C-210 -170 210 -190 330 -70 L345 -40 C220 -70 -180 -40 -300 60Z" fill="url(#banPeel)" stroke="#B8860B" strokeWidth="6" strokeLinejoin="round" /><circle cx="338" cy="-56" r="14" fill="#5A3A12" /><circle cx="-308" cy="36" r="12" fill="#5A3A12" /></g>
              <g transform={`translate(${cut * 230} ${cut * 210}) scale(${cut * 1.1})`} opacity={cut}>
                <circle r="110" fill="#FFF3C4" stroke="#F2D06B" strokeWidth="16" />
                <path d="M0 -40 L35 22 L-35 22Z" fill="none" stroke="#E8D9A0" strokeWidth="8" />
                {Array.from({ length: 9 }, (_, i) => <circle key={i} cx={Math.cos(i * 0.7) * 30} cy={Math.sin(i * 0.7) * 30} r="5" fill="#3A2A12" />)}
              </g>
            </g>
          )}
          <Pill x={250} y={600} en="1 FLOWER" uz="1 ta gul" color="#C2185B" p={lbl(EV.flower)} w={330} />
          <Pill x={820} y={600} en="1 OVARY" uz="1 ta tuguncha" color="#2E7D32" p={lbl(EV.ovary - 0.3)} w={350} />
          {cut > 0.5 && <T x={420} y={1250} size={84} fill="#2E8B3E" stroke="#fff" sw={12} scale={outBack(seg(t, EV.ovary + 0.2, EV.ovary + 0.5))} rot={-4}>= BERRY ✅</T>}
          {grow > 0.1 && <path d="M540 660 L540 760" stroke="#C99A3A" strokeWidth="10" strokeLinecap="round" opacity={grow} strokeDasharray="12 12" />}
        </g>
        {/* part B: the strawberry and its tiny fruits */}
        {toStraw > 0.01 && (
          <g opacity={toStraw} transform={`translate(${400 * (1 - toStraw)} 0)`}>
            <g transform={`translate(${lerp(540, 620, macro)} ${lerp(1150, 1700, macro)}) scale(${lerp(1.5, 4.2, macro)})`}>
              <clipPath id="sciClip"><path d={STRAW_BODY} /></clipPath>
              <path d={STRAW_BODY} fill="url(#strawG)" />
              <Achenes id="sciClip" size={1 + 0.5 * pop} glow={pop} />
              <path d={STRAW_BODY} fill="url(#strawShade)" />
              {[0, 1, 2, 3, 4, 5, 6].map((i) => <path key={i} d="M0 0 C18 -10 40 -6 62 8 C40 4 18 8 0 0Z" fill="#2E8B3E" transform={`translate(0 -392) rotate(${-180 + i * 30}) scale(1.6)`} />)}
            </g>
            <Pill x={540} y={360} en="RED PART = FLOWER BASE" uz="qizil qismi gul asosidan o‘sadi" color="#C8102E" p={lbl(EV.straw6 + 0.6) * (1 - macro)} w={760} />
            {macro > 0.3 && (
              <g transform="translate(300 520)" opacity={macro}>
                <circle r="150" fill="#fff" stroke="#3E0B1A" strokeWidth="12" />
                <g transform="scale(2.4)"><ellipse rx="22" ry="38" fill="#FFE27A" stroke="#D9A520" strokeWidth="4" /><ellipse rx="9" ry="16" cy="4" fill="#B5791A" /><text y="-46" textAnchor="middle" fontFamily="NunitoX" fontWeight={900} fontSize="11" fill="#5E3714">seed inside</text></g>
                <path d="M106 106 L190 190" stroke="#3E0B1A" strokeWidth="26" strokeLinecap="round" />
              </g>
            )}
            <Pill x={600} y={820} en="EACH DOT = A TINY FRUIT" uz="har bir nuqta: mitti meva" color="#C8102E" p={lbl(EV.fruits - 0.2)} w={760} />
            <Pill x={600} y={980} en="≈ 200 per strawberry!" color="#5E3714" p={lbl(EV.fruits + 0.1)} w={560} />
          </g>
        )}
      </Svg>
    </AbsoluteFill>
  );
};

// ================================================================= kinetic "PLOT TWIST!" (reveal and verdict)
const PlotTwist: React.FC<{ t: number }> = ({ t }) => {
  const showA = t > EV.plot - 0.05 && t < EV.banana4 + 0.1;
  const showB = t > SC.verdict - 0.05 && t < SC.reaction;
  if (!showA && !showB) return null;
  const t0 = showA ? EV.plot : SC.verdict;
  const out = showA ? 1 - seg(t, EV.banana4 - 0.3, EV.banana4 + 0.1) : 1 - seg(t, SC.reaction - 0.3, SC.reaction);
  const letters = (word: string, y: number, at: number, size: number) => word.split("").map((ch, i) => {
    const p = seg(t, at + i * 0.04, at + i * 0.04 + 0.35);
    const flip = Math.cos((1 - outCubic(p)) * Math.PI * 1.5);
    const x = 540 + (i - (word.length - 1) / 2) * size * 0.8;
    return <T key={`${word}${i}`} x={x} y={y} size={size} fill="url(#goldG)" stroke="#3E0B1A" sw={18} sx={flip} rot={(1 - p) * 30} opacity={c01(p * 4)}>{ch}</T>;
  });
  const card = outBack(seg(t, t0 + 0.55, t0 + 0.85));
  const meaning = showB ? outBack(seg(t, EV.unexpected - 0.1, EV.unexpected + 0.25)) : 0;
  return (
    <Svg style={{ opacity: out }}>
      {showB && <g transform={`translate(540 520) rotate(-7) scale(${lerp(2.2, 1, outCubic(seg(t, t0 + 0.15, t0 + 0.35)))})`} opacity={c01((t - t0 - 0.15) * 6)}><rect x="-440" y="-170" width="880" height="300" rx="30" fill="none" stroke="#C8102E" strokeWidth="16" strokeDasharray="40 14" /></g>}
      <g transform={showB ? "translate(540 520) rotate(-7) translate(-540 -520)" : undefined}>
        {letters("PLOT", showB ? 470 : 480, t0 - 0.02, showB ? 150 : 175)}
        {letters("TWIST!", showB ? 625 : 660, t0 + (showA ? EV.twist - EV.plot : 0.18) - 0.04, showB ? 150 : 175)}
      </g>
      {card > 0.01 && (
        <g transform={`translate(540 ${showB ? 800 : 790}) scale(${card})`}>
          <rect x="-360" y="-56" width="720" height="104" rx="34" fill="#3E0B1A" stroke="#FFC93C" strokeWidth="6" />
          <text y="18" textAnchor="middle" fontFamily="NunitoX" fontWeight={900} fontSize="52" fill="#FFE9B0">KUTILMAGAN BURILISH!</text>
        </g>
      )}
      {meaning > 0.01 && <T x={540} y={930} size={54} fill="#fff" sw={10} scale={meaning} font="nunito">= an unexpected surprise</T>}
    </Svg>
  );
};

// ---------------------------------------------------------------- Uzbek subtitles: white with a dark outline, phrase level
const UzSub: React.FC<{ t: number }> = ({ t }) => {
  const u = UZ.find((x) => t >= x.s && t < x.e);
  if (!u) return null;
  const a = c01((t - u.s) / 0.12) * (1 - c01((t - (u.e - 0.1)) / 0.1));
  const parts = u.text.split(/(“[^”]*”)/g);
  return (
    <div style={{ position: "absolute", left: 60, right: 60, top: 1360, display: "flex", justifyContent: "center", opacity: a, transform: `translateY(${(1 - a) * 10}px)` }}>
      <div style={{ maxWidth: 960, textAlign: "center", fontFamily: "NunitoX", fontWeight: 900, fontSize: 54, lineHeight: 1.16, color: "#FFFFFF", WebkitTextStroke: "10px rgba(40,4,14,0.92)", paintOrder: "stroke fill", textShadow: "0 5px 12px rgba(0,0,0,0.6)" }}>
        {parts.map((p, i) => <span key={i} style={/^“/.test(p) ? { color: "#FFC93C" } : undefined}>{p}</span>)}
      </div>
    </div>
  );
};
// brand rule (brands/bakhriddinov-school/README.md): official logo, top-right, as in Episode 1
const SchoolWatermark: React.FC = () => (
  <Img src={staticFile("logo-watermark.png")} style={{ position: "absolute", top: 104, right: 44, width: 252, opacity: 0.85, filter: "drop-shadow(0 2px 6px rgba(0,8,30,0.7))" }} />
);
const camAt = (t: number) => {
  const shake = (t0: number, a: number) => (t >= t0 ? a * Math.exp(-(t - t0) * 9) * Math.sin((t - t0) * 70) : 0);
  const z = kf(t, [[0, 1.22], [0.9, 1.02], [EV.plot - 0.3, 1.02], [EV.plot, 1.1], [EV.banana4, 1.0], [SC.science, 1.0], [SC.reaction, 1.0], [EV.w11end, 1.14], [EV.end, 1.14], [EV.end + 0.3, 1.2], [30, 1.22]]);
  const x = kf(t, [[0, 160], [0.9, 0], [EV.banana2, 0], [EV.banana2 + 0.3, -50], [EV.straw2, -50], [EV.straw2 + 0.3, 50], [EV.w2end + 0.2, 0], [SC.reaction, 0], [EV.w11end, 110]]) + shake(EV.w1end, 16) + shake(SC.verdict, 12);
  const y = shake(EV.w1end, 8) + kf(t, [[SC.reaction, 0], [EV.w11end, 40]]);
  return `translate(${x}px, ${y}px) scale(${z})`;
};

export const Episode: React.FC = () => {
  const t = useCurrentFrame() / 30;
  const toSci = inOut(seg(t, SC.science - 0.25, SC.science + 0.3));
  const back = inOut(seg(t, SC.verdict - 0.4, SC.verdict - 0.05));
  const inScience = t > SC.science - 0.25 && t < SC.verdict;
  const frozen = t > EV.end + 0.05;
  return (
    <AbsoluteFill style={{ background: "#3E0B1A", overflow: "hidden" }}>
      <style>{FONTS}</style>
      <Defs />
      <AbsoluteFill style={{ transform: camAt(t), filter: frozen ? `sepia(${0.45 * seg(t, EV.end + 0.05, EV.end + 0.25)}) contrast(1.05)` : undefined }}>
        {(!inScience || toSci < 1 || back > 0) && <CourtScene t={t} />}
        {inScience && (
          <AbsoluteFill style={{ clipPath: back > 0 ? `inset(0 0 ${back * 100}% 0)` : `circle(${toSci * 1500}px at 540px 470px)` }}><ScienceScene t={t} /></AbsoluteFill>
        )}
      </AbsoluteFill>
      <PlotTwist t={t} />
      {frozen && <AbsoluteFill style={{ boxShadow: "inset 0 0 160px rgba(40,4,14,0.8)", opacity: seg(t, EV.end + 0.05, EV.end + 0.25) }} />}
      <UzSub t={t} />
      <SchoolWatermark />
      <Audio src={staticFile("audio/mix.wav")} />
    </AbsoluteFill>
  );
};
export { hash };
