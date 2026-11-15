import React from "react";
import { BEAT, EV, beat, hash, seg } from "./util";
import { Heart } from "./Hearts";

type P4 = [number, number][];
const pt = (p: P4, u: number): [number, number] => {
  const m = 1 - u;
  return [m * m * m * p[0][0] + 3 * m * m * u * p[1][0] + 3 * m * u * u * p[2][0] + u * u * u * p[3][0], m * m * m * p[0][1] + 3 * m * m * u * p[1][1] + 3 * m * u * u * p[2][1] + u * u * u * p[3][1]];
};
const mir = (p: P4): P4 => p.map(([x, y]) => [-x, y]) as P4;

// simplified circulation, in octopus-local coordinates:
// body -> gill hearts -> gills -> body heart -> body
const V_BODY_GH: P4 = [[-40, 228], [-122, 240], [-152, 202], [-122, 160]];
const V_GH_GILL: P4 = [[-128, 112], [-170, 108], [-212, 100], [-214, 62]];
const V_GILL_BH: P4 = [[-200, -34], [-130, -96], [-44, -40], [-8, 42]];
const V_BH_DL: P4 = [[-6, 92], [-4, 150], [-24, 200], [-52, 252]];
const V_BH_UP: P4 = [[0, 28], [0, -70], [-42, -140], [-34, -210]];

const Gill: React.FC<{ x: number; flip: number; glow: number; t: number }> = ({ x, flip, glow, t }) => (
  <g transform={`translate(${x} 18) scale(${flip} 1)`} style={{ filter: glow > 0.05 ? `drop-shadow(0 0 ${6 + 16 * glow}px rgba(70,220,255,${0.4 + 0.5 * glow}))` : undefined }}>
    <path d="M0 -92 C44 -64 58 -8 42 58 C22 96 -22 96 -42 58 C-58 -8 -44 -64 0 -92Z" fill="#35C9E6" fillOpacity={0.28 + 0.25 * glow} stroke="#8DF7FF" strokeWidth="5" />
    {Array.from({ length: 7 }, (_, i) => <path key={i} d={`M${-34 + i * 11} ${-50 + Math.abs(i - 3) * 9} Q${-34 + i * 11 + 4 * Math.sin(t * 3 + i)} 8 ${-30 + i * 10} ${52 - Math.abs(i - 3) * 6}`} stroke="#BFF7FF" strokeWidth="3.4" fill="none" opacity={0.55 + 0.3 * glow} />)}
  </g>
);

const Flow: React.FC<{ path: P4; t: number; n: number; color: string; r?: number; speed?: number; alpha: number; mirror?: boolean; tube?: boolean }> = ({ path, t, n, color, r = 7, speed = 0.45, alpha, mirror, tube = true }) => {
  const p = mirror ? mir(path) : path;
  const d = `M${p[0][0]} ${p[0][1]} C${p[1][0]} ${p[1][1]} ${p[2][0]} ${p[2][1]} ${p[3][0]} ${p[3][1]}`;
  return (
    <g opacity={alpha}>
      {tube && <path d={d} stroke={color} strokeOpacity="0.22" strokeWidth={r * 2.4} fill="none" strokeLinecap="round" />}
      {Array.from({ length: n }, (_, i) => {
        const u = (((t * speed + i / n) % 1) + 1) % 1;
        const [x, y] = pt(p, u);
        const fade = Math.min(1, u * 8, (1 - u) * 8);
        return <circle key={i} cx={x} cy={y} r={r * (0.7 + 0.5 * fade)} fill={color} opacity={0.35 + 0.65 * fade} style={{ filter: `drop-shadow(0 0 6px ${color})` }} />;
      })}
    </g>
  );
};

/** x-ray view inside the octopus: drawn in octopus-local coordinates */
export const Organs: React.FC<{ t: number; show: number }> = ({ t, show }) => {
  if (show <= 0.01) return null;
  const hi2 = seg(t, EV.two - 0.1, EV.two + 0.3) * (1 - 0.65 * seg(t, EV.third - 0.1, EV.third + 0.3));
  const hi1 = seg(t, EV.third - 0.1, EV.third + 0.3);
  const base = 0.55 + 0.45 * Math.max(hi1, hi2);
  const pale = "#B7CBE8", blue = "#3FA6FF";
  const gh = beat(t, 0.0) * (0.35 + 0.65 * hi2), bh = beat(t, 0.1) * (0.35 + 0.65 * hi1);
  return (
    <g opacity={show}>
      <Gill x={-218} flip={1} glow={hi2} t={t} /><Gill x={218} flip={-1} glow={hi2} t={t} />
      {[1, -1].map((m) => (
        <g key={m}>
          <Flow path={V_BODY_GH} mirror={m < 0} t={t} n={5} color={pale} alpha={base * (0.55 + 0.45 * hi2)} />
          <Flow path={V_GH_GILL} mirror={m < 0} t={t} n={3} color={pale} r={6} alpha={base * (0.55 + 0.45 * hi2)} />
          <Flow path={V_GILL_BH} mirror={m < 0} t={t} n={5} color={blue} alpha={base * (0.55 + 0.45 * Math.max(hi2, hi1 * 0.8))} />
          <Flow path={V_BH_DL} mirror={m < 0} t={t} n={5} color={blue} r={8} alpha={0.45 + 0.55 * hi1} />
        </g>
      ))}
      <Flow path={V_BH_UP} t={t} n={5} color={blue} r={8} alpha={0.45 + 0.55 * hi1} />
      {/* oxygen from the water into the gills */}
      {[1, -1].map((m) => Array.from({ length: 3 }, (_, i) => {
        const u = ((t * 0.5 + i / 3) % 1);
        const x = m * (350 - 120 * u), y = -30 + 60 * u + Math.sin(t * 4 + i) * 6;
        return <g key={`${m}${i}`} opacity={hi2 * Math.min(1, (1 - u) * 5)} transform={`translate(${x} ${y})`}><circle r="15" fill="url(#o2G)" /><text y="5" textAnchor="middle" fontFamily="SGrotesk" fontWeight="700" fontSize="14" fill="#7A1020">O₂</text></g>;
      }))}
      <Heart x={-118} y={134} size={58 + 8 * hi2} glow={0.25 + 0.75 * hi2} pulse={gh} id="ghl" />
      <Heart x={118} y={134} size={58 + 8 * hi2} glow={0.25 + 0.75 * hi2} pulse={gh} id="ghr" />
      <Heart x={0} y={58} size={92 + 10 * hi1} glow={0.25 + 0.75 * hi1} pulse={bh} id="bh" />
    </g>
  );
};
export { BEAT, hash };
