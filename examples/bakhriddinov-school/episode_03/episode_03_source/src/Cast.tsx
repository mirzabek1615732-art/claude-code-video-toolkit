import React from "react";
import { hash, mixHex } from "./util";

// ---------------------------------------------------------------- Venus: a golden cloud-covered planet with a face
export interface VenusProps { r: number; spin: number; blink?: number; eye?: number; mouth?: "smile" | "o" | "yawn" | "smirk" | "flat"; lookX?: number; lookY?: number; lids?: number; faceRot?: number; glow?: number; light?: number; id: string; wink?: number; face?: number }
export const Venus: React.FC<VenusProps> = ({ r, spin, blink = 0, eye = 1, mouth = "smile", lookX = 0, lookY = 0, lids = 0.35, faceRot = 0, glow = 1, light = -0.6, id, wink = 0, face = 1 }) => {
  const bands = [-0.62, -0.38, -0.12, 0.14, 0.38, 0.6];
  const off = ((spin % 1) + 1) % 1;
  const lid = Math.min(1, Math.max(lids, blink));
  return (
    <g>
      <circle r={r * 1.18} fill="url(#venusHalo)" opacity={0.85 * glow} />
      <clipPath id={`vc${id}`}><circle r={r} /></clipPath>
      <circle r={r} fill="url(#venusG)" />
      <g clipPath={`url(#vc${id})`}>
        {bands.map((b, i) => {
          const y = b * r, h = r * (0.1 + 0.05 * hash(i));
          const x0 = -off * 2 * r * 2;
          return [0, 1].map((k) => <path key={`${i}${k}`} d={`M${x0 + k * 4 * r - 2 * r} ${y} q${r * 0.5} ${-h} ${r} 0 t${r} 0 t${r} 0 t${r} 0 l0 ${h * 0.9} q${-r * 0.5} ${h} ${-r} 0 t${-r} 0 t${-r} 0 t${-r} 0z`} fill={i % 2 ? "#FFE6A8" : "#D9782F"} opacity={i % 2 ? 0.35 : 0.28} />);
        })}
        {Array.from({ length: 5 }, (_, i) => { const x = ((hash(i) * 4 - off * 4) % 4 + 4) % 4 * r - 2 * r; return <ellipse key={i} cx={x} cy={(hash(i + 3) - 0.5) * 1.4 * r} rx={r * 0.22} ry={r * 0.08} fill="#FFF1C9" opacity="0.35" />; })}
        <circle cx={light * r * 1.2} cy={-r * 0.5} r={r * 1.5} fill="url(#venusShade)" />
      </g>
      <circle r={r} fill="none" stroke="#FFD58A" strokeWidth={r * 0.02} opacity="0.7" />
      <g transform={`rotate(${faceRot}) scale(${r / 300})`} opacity={face}>
        {[-95, 95].map((x, i) => {
          const L = i === 1 ? Math.max(lid, wink) : lid;
          return (
            <g key={i} transform={`translate(${x} -20) scale(${eye})`}>
              <ellipse rx="58" ry="64" fill="#FFF8EC" />
              <circle cx={lookX * 18} cy={lookY * 14 + 6} r="34" fill="#3A1A0E" /><circle cx={lookX * 18 - 10} cy={lookY * 14 - 6} r="11" fill="#fff" />
              <path d={`M-62 -66 L62 -66 L62 ${-66 + 132 * L} Q0 ${-50 + 132 * L} -62 ${-66 + 132 * L}Z`} fill="#E08A3C" />
              <path d={`M-60 ${-66 + 132 * L} Q0 ${-52 + 132 * L} 60 ${-66 + 132 * L}`} stroke="#8A3A12" strokeWidth="8" fill="none" strokeLinecap="round" />
            </g>
          );
        })}
        <circle cx="-150" cy="70" r="34" fill="#FF8A5C" opacity="0.45" /><circle cx="150" cy="70" r="34" fill="#FF8A5C" opacity="0.45" />
        {mouth === "o" ? <ellipse cx="0" cy="110" rx="34" ry="44" fill="#6A2410" /> : mouth === "yawn" ? <ellipse cx="0" cy="115" rx="56" ry="70" fill="#6A2410" /> : mouth === "flat" ? <path d="M-50 110 L50 110" stroke="#6A2410" strokeWidth="14" strokeLinecap="round" /> : mouth === "smirk" ? <path d="M-50 112 Q20 130 64 90" stroke="#6A2410" strokeWidth="14" strokeLinecap="round" fill="none" /> : <path d="M-66 92 Q0 150 66 92" stroke="#6A2410" strokeWidth="14" strokeLinecap="round" fill="none" />}
      </g>
    </g>
  );
};

export const Sun: React.FC<{ r: number; t: number }> = ({ r, t }) => (
  <g>
    <circle r={r * 2.6} fill="url(#sunHalo)" />
    {Array.from({ length: 12 }, (_, i) => <path key={i} d={`M0 ${-r * 1.1} L${r * 0.12} ${-r * 1.55 - 10 * Math.sin(t * 3 + i)} L${-r * 0.12} ${-r * 1.55 - 10 * Math.sin(t * 3 + i)}Z`} fill="#FFE59A" opacity="0.7" transform={`rotate(${i * 30 + t * 8})`} />)}
    <circle r={r} fill="url(#sunG)" />
    <circle r={r} fill="none" stroke="#FFF6D6" strokeWidth="4" opacity="0.6" />
  </g>
);

export const Earth: React.FC<{ r: number; spin: number }> = ({ r, spin }) => {
  const off = ((spin % 1) + 1) % 1;
  return (
    <g>
      <circle r={r * 1.2} fill="#5FB8FF" opacity="0.25" />
      <clipPath id="ec"><circle r={r} /></clipPath>
      <circle r={r} fill="#2F7BEA" />
      <g clipPath="url(#ec)">
        {[0, 1].map((k) => <g key={k} transform={`translate(${(k - off) * 2.4 * r} 0)`}><path d={`M${-r * 0.8} ${-r * 0.4} q${r * 0.4} ${-r * 0.4} ${r * 0.7} 0 q${r * 0.1} ${r * 0.5} ${-r * 0.3} ${r * 0.6} q${-r * 0.5} 0 ${-r * 0.4} ${-r * 0.6}z`} fill="#3FCF7A" /><path d={`M${r * 0.4} ${r * 0.1} q${r * 0.3} ${-r * 0.2} ${r * 0.5} ${r * 0.1} q0 ${r * 0.4} ${-r * 0.3} ${r * 0.5}z`} fill="#3FCF7A" /></g>)}
        <circle cx={-r * 0.7} cy={-r * 0.5} r={r * 1.3} fill="url(#venusShade)" opacity="0.6" />
      </g>
    </g>
  );
};

// ---------------------------------------------------------------- space snail (origin: where the shell sits)
export const Snail: React.FC<{ t: number; shell: number; body: number; r: number; blink?: number; sweat?: number; children?: React.ReactNode }> = ({ t, shell, body, r, blink = 0, sweat = 0, children }) => {
  const stretch = 1 + 0.04 * Math.sin(t * 3);
  const eyes = (dx: number, k: number) => (
    <g key={k}>
      <path d={`M${dx} -60 Q${dx + 6 + 6 * Math.sin(t * 2 + k)} -120 ${dx + 10 * Math.sin(t * 2 + k)} -170`} stroke="#B9A6FF" strokeWidth="16" fill="none" strokeLinecap="round" />
      <g transform={`translate(${dx + 10 * Math.sin(t * 2 + k)} -180)`}><circle r="26" fill="#fff" /><g transform={`scale(1 ${1 - blink})`}><circle cx="6" r="13" fill="#24163A" /><circle cx="10" cy="-5" r="4.5" fill="#fff" /></g></g>
    </g>
  );
  return (
    <g>
      <g opacity={body} transform={`translate(${-(1 - body) * 120} 0)`}>
        <path d={`M${-r * 1.1} ${r * 0.62} C${-r * 1.1} ${r * 0.3} ${r * 0.2} ${r * 0.48} ${r * 1.15 * stretch} ${r * 0.2} C${r * 1.5 * stretch} ${r * 0.05} ${r * 1.75 * stretch} ${r * 0.35} ${r * 1.55 * stretch} ${r * 0.72} L${-r * 1.15} ${r * 0.85}Z`} fill="url(#slugG)" />
        <g transform={`translate(${r * 1.45 * stretch} ${r * 0.2})`}>
          {eyes(-20, 0)}{eyes(30, 1)}
          <path d="M-20 10 q22 18 44 0" stroke="#24163A" strokeWidth="7" fill="none" strokeLinecap="round" />
          <circle cx="0" cy="-70" r="150" fill="url(#helmetG)" stroke="#E6F4FF" strokeWidth="6" opacity="0.9" />
          <path d="M-90 -150 Q-60 -190 -10 -200" stroke="#fff" strokeWidth="12" strokeLinecap="round" fill="none" opacity="0.7" />
          <rect x="-110" y="60" width="220" height="26" rx="13" fill="#C9D3E8" />
          {sweat > 0.1 && <path d="M90 -120 q14 26 0 34 q-14 -8 0 -34Z" fill="#7FD3FF" opacity={sweat} />}
        </g>
      </g>
      {children}
      <g opacity={shell}>
        <path d={(() => { let d = ""; for (let i = 0; i <= 120; i++) { const a = i * 0.15, rr = r * 0.92 * Math.exp(-0.17 * a); d += `${i ? "L" : "M"}${(Math.cos(a) * rr).toFixed(1)} ${(Math.sin(a) * rr).toFixed(1)} `; } return d; })()} stroke="#8A3A12" strokeWidth={r * 0.06} fill="none" strokeLinecap="round" strokeDasharray="4000" strokeDashoffset={4000 * (1 - shell)} opacity="0.75" />
      </g>
    </g>
  );
};

// ---------------------------------------------------------------- sleepy student in bed (origin: head centre)
export const Student: React.FC<{ t: number; lids: number; reach: number; shock: number }> = ({ t, lids, reach, shock }) => {
  const skin = "#D99A6C", hair = "#1F1530";
  return (
    <g>
      <circle r="120" fill={skin} />
      {Array.from({ length: 9 }, (_, i) => { const a = Math.PI * 0.95 + (i / 8) * Math.PI * 1.1; return <circle key={i} cx={Math.cos(a) * 112} cy={Math.sin(a) * 100 - 30} r={46 + 10 * hash(i + 2)} fill={hair} />; })}
      {[-46, 46].map((x, i) => (
        <g key={i} transform={`translate(${x} 10)`}>
          <ellipse rx="26" ry={28 + shock * 8} fill="#fff" />
          <circle r={12 - shock * 3} fill="#1F1530" cy={shock * -3} />
          <rect x="-30" y="-34" width="60" height={58 * lids + 1} fill={skin} />
          <path d={`M-28 ${-34 + 58 * lids} Q0 ${-26 + 58 * lids} 28 ${-34 + 58 * lids}`} stroke="#7A4A30" strokeWidth="5" fill="none" />
        </g>
      ))}
      {shock > 0.3 ? <ellipse cy="70" rx="20" ry="26" fill="#6A2A2A" /> : <path d="M-20 70 Q0 60 20 70" stroke="#6A2A2A" strokeWidth="7" fill="none" strokeLinecap="round" />}
      <circle cx="-70" cy="50" r="18" fill="#FF8A8A" opacity="0.4" /><circle cx="70" cy="50" r="18" fill="#FF8A8A" opacity="0.4" />
      {shock < 0.3 && [0, 1, 2].map((i) => <text key={i} x={140 + i * 34} y={-120 - ((t * 40 + i * 30) % 90)} fontFamily="Lilita" fontSize={40 + i * 10} fill="#C9B8FF" opacity={0.8 - ((t * 40 + i * 30) % 90) / 120}>z</text>)}
    </g>
  );
};

// ---------------------------------------------------------------- the friend who waits (origin: bottom centre of the bust)
export const Waiter: React.FC<{ t: number; lookX: number; lookY: number; brow: number; smirk: number; blink: number }> = ({ t, lookX, lookY, brow, smirk, blink }) => {
  const skin = "#C98A5E", hair = "#3A2416";
  return (
    <g>
      <path d="M-300 40 C-300 -160 -200 -240 -60 -250 L60 -250 C200 -240 300 -160 300 40Z" fill="#6C4CE0" />
      <path d="M-60 -250 L0 -170 L60 -250" fill="#5A3CC8" />
      <rect x="-44" y="-300" width="88" height="70" rx="28" fill={skin} />
      <g transform={`translate(0 -440) rotate(${lookX * 3})`}>
        <ellipse cx="-138" cy="10" rx="22" ry="32" fill={skin} /><ellipse cx="138" cy="10" rx="22" ry="32" fill={skin} />
        <circle r="138" fill={skin} />
        <path d="M-140 -20 C-150 -150 -40 -175 10 -168 C110 -165 160 -110 140 -20 C110 -80 40 -110 -30 -100 C-80 -95 -120 -70 -140 -20Z" fill={hair} />
        {[-52, 52].map((x, i) => (
          <g key={i} transform={`translate(${x} 10)`}>
            <ellipse rx="30" ry="32" fill="#fff" />
            <g transform={`scale(1 ${1 - blink})`}><circle cx={lookX * 14} cy={lookY * 12} r="14" fill="#1F1530" /><circle cx={lookX * 14 + 5} cy={lookY * 12 - 5} r="4.5" fill="#fff" /></g>
            <path d={i === 0 ? `M-32 ${-44 - brow * 4} L30 ${-48 + brow * 6}` : `M-30 ${-48 - brow * 18} L32 ${-44 - brow * 26}`} stroke={hair} strokeWidth="11" strokeLinecap="round" />
          </g>
        ))}
        <path d={`M-38 ${80 + smirk * 4} Q${10 * smirk} ${86 + 10 * smirk} 42 ${80 - smirk * 14}`} stroke="#6A2A2A" strokeWidth="9" fill="none" strokeLinecap="round" />
      </g>
      <g transform="translate(110 -150) rotate(-8)">
        <rect x="-62" y="-110" width="124" height="220" rx="22" fill="#1A1438" stroke="#C9B8FF" strokeWidth="5" />
        <rect x="-50" y="-94" width="100" height="186" rx="12" fill="#3B2C8F" opacity={0.7 + 0.3 * Math.sin(t * 4) ** 2} />
        <ellipse cx="-40" cy="60" rx="40" ry="48" fill={skin} /><ellipse cx="44" cy="70" rx="34" ry="42" fill={skin} />
      </g>
    </g>
  );
};
export { mixHex };
