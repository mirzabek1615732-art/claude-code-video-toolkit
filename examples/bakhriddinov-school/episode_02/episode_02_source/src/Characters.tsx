import React from "react";
import { mixHex, hash } from "./util";

// ---------------------------------------------------------------- flamingo (origin = between the feet, facing right)
export interface FlamingoProps { t: number; pink: number; neck?: number; tilt?: number; blink?: number; legUp?: number; glasses?: number; glassesDrop?: number; eye?: number; lookX?: number; lashes?: boolean; bob?: number }
export const Flamingo: React.FC<FlamingoProps> = ({ t, pink, neck = 0, tilt = 0, blink = 0, legUp = 0, glasses = 0, glassesDrop = 0, eye = 1, lookX = 0, lashes = true, bob = 0 }) => {
  const body = mixHex("#DCD6DE", "#FF8DAA", pink), dark = mixHex("#ADA6B1", "#F2557F", pink), neckC = mixHex("#D4CED6", "#FF7C9E", pink);
  const leg = mixHex("#B9AFB8", "#F2789A", pink), light = mixHex("#F4F1F6", "#FFC4D3", pink);
  const hx = 95 + 24 * neck, hy = -565 + 8 * Math.abs(neck) + bob;
  const knee2 = [-15 + 30 * legUp, -125 - 30 * legUp], foot2 = [-22 + 58 * legUp, 0 - 175 * legUp];
  return (
    <g>
      <path d="M10 -238 L4 -122 L12 0" stroke={leg} strokeWidth="11" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M-4 -2 L34 -2 M12 -2 L26 8" stroke={leg} strokeWidth="9" strokeLinecap="round" />
      <path d={`M-10 -238 L${knee2[0]} ${knee2[1]} L${foot2[0]} ${foot2[1]}`} stroke={leg} strokeWidth="11" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <g transform={`translate(0 ${bob * 0.4})`}>
        <path d="M-140 -300 L-222 -282 L-150 -268Z" fill={dark} />
        <path d="M-150 -290 L-214 -278 L-160 -270Z" fill="#2B2230" />
        <path d="M-150 -300 C-150 -362 -60 -392 32 -386 C112 -380 152 -340 152 -298 C152 -248 90 -224 10 -224 C-62 -224 -112 -244 -150 -300Z" fill={body} />
        <path d="M-120 -300 C-70 -250 40 -238 120 -270 C100 -236 40 -226 -10 -228 C-70 -232 -105 -258 -120 -300Z" fill={dark} opacity="0.45" />
        <path d="M-112 -322 C-62 -364 58 -364 102 -322 C62 -290 -40 -282 -112 -322Z" fill={dark} />
        {[0, 1, 2].map((i) => <path key={i} d={`M${-86 + i * 48} -322 q22 18 44 0`} stroke={light} strokeWidth="5" fill="none" opacity="0.6" strokeLinecap="round" />)}
        <ellipse cx="-30" cy="-358" rx="60" ry="16" fill="#fff" opacity="0.28" />
        <path d={`M112 -330 C${200 + 22 * neck} -400 ${-12 + 34 * neck} -462 ${hx - 12} ${hy + 30}`} stroke={neckC} strokeWidth="32" fill="none" strokeLinecap="round" />
        <path d={`M118 -340 C${196 + 22 * neck} -404 ${-4 + 34 * neck} -462 ${hx - 4} ${hy + 26}`} stroke={light} strokeWidth="7" fill="none" strokeLinecap="round" opacity="0.45" />
        <g transform={`translate(${hx} ${hy}) rotate(${tilt})`}>
          <circle r="38" fill={neckC} />
          <path d="M24 -14 C60 -20 86 -6 94 24 L83 32 C74 8 54 2 28 8Z" fill="#FBE6EC" />
          <path d="M80 4 C90 10 96 20 96 34 L85 38 C83 26 78 20 70 14Z" fill="#26202A" />
          <circle cx="12" cy="10" r="10" fill="#FF6F96" opacity={0.25 + 0.2 * pink} />
          <g transform={`translate(4 -8) scale(${eye})`}>
            <circle r="12" fill="#fff" />
            <g transform={`scale(1 ${1 - blink})`}><circle cx={2 + lookX * 4} r="7" fill="#22102A" /><circle cx={4 + lookX * 4} cy="-3" r="2.6" fill="#fff" /></g>
            {lashes && <path d="M-8 -11 l-5 -7 M-1 -13 l-1 -8 M6 -12 l3 -7" stroke="#22102A" strokeWidth="3" strokeLinecap="round" />}
          </g>
          {glasses > 0 && (
            <g transform={`translate(0 ${glassesDrop * 14}) rotate(${glassesDrop * 6})`} opacity={glasses}>
              <path d="M-38 -10 L-14 -12" stroke="#2A1430" strokeWidth="5" />
              <rect x="-14" y="-24" width="40" height="26" rx="11" fill="#2A1430" stroke="#FFC861" strokeWidth="4" />
              <path d="M-6 -16 L4 -20" stroke="#fff" strokeWidth="4" strokeLinecap="round" opacity="0.7" />
            </g>
          )}
        </g>
      </g>
    </g>
  );
};

// ---------------------------------------------------------------- fuzzy chick (origin = feet, facing right)
const fuzzy = (cx: number, cy: number, r: number, n: number, amp: number, ph: number) => {
  let d = "";
  for (let i = 0; i <= n; i++) {
    const a = (i / n) * Math.PI * 2, a2 = ((i + 0.5) / n) * Math.PI * 2;
    const r1 = r + amp * Math.sin(i * 2.3 + ph) * 0.4, r2 = r + amp;
    const x = cx + Math.cos(a) * r1, y = cy + Math.sin(a) * r1, qx = cx + Math.cos(a2) * r2, qy = cy + Math.sin(a2) * r2;
    d += i === 0 ? `M${x.toFixed(1)} ${y.toFixed(1)}` : ` Q${prevQ} ${x.toFixed(1)} ${y.toFixed(1)}`;
    prevQ = `${qx.toFixed(1)} ${qy.toFixed(1)}`;
  }
  return d + "Z";
};
let prevQ = "";
export interface ChickProps { t: number; pink?: number; shock?: number; blink?: number; lookX?: number; lookY?: number; stretch?: number; walk?: number; happy?: number }
export const Chick: React.FC<ChickProps> = ({ t, pink = 0, shock = 0, blink = 0, lookX = 0, lookY = 0, stretch = 1, walk = 0, happy = 0 }) => {
  const base = mixHex("#CFCBD4", "#FFB3C6", pink), shade = mixHex("#A7A1AD", "#F2809F", pink), light = mixHex("#F0EDF3", "#FFDCE5", pink);
  const ph = Math.floor(t * 8) * 0.7;
  const step = Math.sin(walk * Math.PI * 2);
  const eS = 1 + 0.45 * shock;
  return (
    <g transform={`scale(${1 / Math.sqrt(stretch)} ${stretch})`}>
      <path d={`M-28 -34 L${-28 + step * 10} 0 M24 -34 L${24 - step * 10} 0`} stroke={mixHex("#9C929C", "#E8809C", pink)} strokeWidth="13" strokeLinecap="round" />
      <path d={`M${-44 + step * 10} 0 h30 M${8 - step * 10} 0 h30`} stroke={mixHex("#9C929C", "#E8809C", pink)} strokeWidth="9" strokeLinecap="round" />
      <path d={fuzzy(0, -128, 98, 26, 9, ph)} fill={base} />
      <path d={fuzzy(-8, -108, 70, 20, 7, ph + 1)} fill={light} opacity="0.55" />
      <ellipse cx="-34" cy="-128" rx="44" ry="28" fill={shade} transform={`rotate(${-20 + 12 * Math.sin(t * 9) * shock} -34 -128)`} />
      <path d={fuzzy(34, -246, 66, 22, 7, ph + 2)} fill={base} />
      <path d="M30 -310 q-6 -26 8 -34 M40 -310 q4 -22 20 -26 M22 -306 q-16 -14 -10 -32" stroke={base} strokeWidth="8" fill="none" strokeLinecap="round" />
      <path d={`M90 -256 L132 ${-246 + 10 * shock} L92 ${-232 + 14 * shock}Z`} fill="#6B6470" />
      <path d="M90 -256 L132 -246 L92 -246Z" fill="#8A828F" />
      <circle cx="34" cy="-218" r="13" fill="#FF8FAB" opacity={0.35 + 0.3 * happy} />
      {[[22, -262], [68, -258]].map(([x, y], i) => (
        <g key={i} transform={`translate(${x} ${y}) scale(${eS})`}>
          <ellipse rx="18" ry="20" fill="#fff" stroke="#6B6470" strokeWidth="2" />
          <g transform={`scale(1 ${1 - blink * 0.95})`}><circle cx={lookX * 6} cy={lookY * 6} r={10 * (1 - 0.35 * shock)} fill="#1E1626" /><circle cx={lookX * 6 + 3} cy={lookY * 6 - 4} r="3.4" fill="#fff" /></g>
        </g>
      ))}
      {shock > 0.05 && <path d="M2 -300 q20 -16 40 -6 M52 -300 q20 -12 36 2" stroke="#6B6470" strokeWidth="6" fill="none" strokeLinecap="round" opacity={shock} />}
      {shock > 0.4 && <path d="M120 -330 q14 26 0 34 q-14 -8 0 -34Z" fill="#7FD3FF" opacity={(shock - 0.4) / 0.6} />}
      {happy > 0.2 && <path d="M50 -210 q14 12 28 0" stroke="#4A3B4F" strokeWidth="5" fill="none" strokeLinecap="round" opacity={happy} />}
    </g>
  );
};

// ---------------------------------------------------------------- shrimp (center origin, facing right)
export const Shrimp: React.FC<{ t: number; s?: number; glow?: number; ph?: number }> = ({ t, s = 1, glow = 0, ph = 0 }) => {
  const flick = Math.sin(t * 9 + ph) * 8;
  const segs = Array.from({ length: 6 }, (_, i) => i);
  const col = mixHex("#FFA27F", "#FF5D7E", glow);
  return (
    <g transform={`scale(${s})`} style={glow > 0.2 ? { filter: `drop-shadow(0 0 ${10 * glow}px rgba(255,120,100,0.9))` } : undefined}>
      <path d={`M-48 -6 l${-22} ${-14 + flick * 0.4} l4 14 l-4 14 Z`} fill={mixHex("#FF8B6A", "#F2456D", glow)} />
      {segs.map((i) => { const a = -0.5 + i * 0.32; const r = 20 - i * 1.6; const x = -40 + i * 15, y = Math.sin(a) * 18 - i * 2 + (i > 3 ? (i - 3) * 6 : 0); return <ellipse key={i} cx={x} cy={y} rx={r * 0.9} ry={r} fill={col} stroke="#C2414F" strokeOpacity="0.35" strokeWidth="2" />; })}
      {[0, 1, 2, 3].map((i) => <path key={i} d={`M${-20 + i * 14} 14 l${-3 + Math.sin(t * 14 + i + ph) * 4} 14`} stroke="#E8624F" strokeWidth="3" strokeLinecap="round" />)}
      <path d={`M42 -14 C80 ${-60 + flick} 120 ${-50 + flick} 150 ${-30 + flick * 1.5} M44 -8 C90 ${-30 - flick} 120 ${-10 - flick} 140 ${0 - flick}`} stroke="#E8624F" strokeWidth="2.5" fill="none" />
      <circle cx="38" cy="-14" r="7" fill="#fff" /><circle cx="40" cy="-14" r="4" fill="#1E1626" />
    </g>
  );
};

// ---------------------------------------------------------------- friend with a huge smoothie (origin = bottom centre of the bust)
export interface FriendProps { t: number; sip: number; side: number; shock: number; level: number; blink: number }
export const Friend: React.FC<FriendProps> = ({ t, sip, side, shock, level, blink }) => {
  const skin = "#E7AE84", hair = "#2B1D2E";
  const eyeLid = Math.max(blink, side * 0.42 * (1 - shock));
  const px = side * 15 * (1 - shock) - shock * 16;
  const cupTop = -700, cupBot = -120;
  const fillTop = cupTop + 40 + (1 - level) * 320;
  return (
    <g>
      <path d="M-330 40 C-330 -170 -220 -262 -70 -272 L70 -272 C220 -262 330 -170 330 40Z" fill="#14A89C" />
      <path d="M-120 -268 C-90 -200 90 -200 120 -268" fill="none" stroke="#0D7F76" strokeWidth="14" />
      <path d="M-40 -230 l-6 90 M40 -230 l6 90" stroke="#F4F1E8" strokeWidth="8" strokeLinecap="round" />
      <rect x="-48" y="-320" width="96" height="70" rx="30" fill={skin} />
      <g transform={`translate(0 ${-470 - shock * 18}) rotate(${-side * 3 + shock * 4})`}>
        <ellipse cx="-150" cy="10" rx="24" ry="34" fill={skin} /><ellipse cx="150" cy="10" rx="24" ry="34" fill={skin} />
        <circle r="150" fill={skin} />
        {Array.from({ length: 11 }, (_, i) => { const a = Math.PI + (i / 10) * Math.PI; return <circle key={i} cx={Math.cos(a) * 140} cy={Math.sin(a) * 120 - 40 - shock * 10} r={48 + 6 * hash(i)} fill={hair} />; })}
        <path d="M-150 -40 C-120 -150 120 -150 150 -40 C80 -90 -80 -90 -150 -40Z" fill={hair} />
        <circle cx="-88" cy="62" r="26" fill="#FF8FA0" opacity={0.3 + 0.2 * sip} /><circle cx="88" cy="62" r="26" fill="#FF8FA0" opacity={0.3 + 0.2 * sip} />
        {[-58, 58].map((x, i) => (
          <g key={i} transform={`translate(${x} 4)`}>
            <ellipse rx="34" ry={36 + shock * 8} fill="#fff" />
            <circle cx={px} cy={shock * -4} r={16 - shock * 4} fill="#22152A" /><circle cx={px + 5} cy={-6} r="5" fill="#fff" />
            <rect x="-40" y={-46} width="80" height={46 * eyeLid + 2} fill={skin} />
            <path d={`M-38 ${-46 + 46 * eyeLid} Q0 ${-40 + 46 * eyeLid} 38 ${-46 + 46 * eyeLid}`} stroke="#8C5A44" strokeWidth="5" fill="none" opacity={eyeLid > 0.1 ? 1 : 0} />
            <path d={i === 0 ? `M-36 ${-58 - shock * 16 + side * 8} L34 ${-66 - shock * 16 - side * 2}` : `M-34 ${-66 - shock * 16 - side * 10} L36 ${-58 - shock * 16}`} stroke={hair} strokeWidth="12" strokeLinecap="round" />
          </g>
        ))}
        {sip > 0.3 ? <ellipse cx="18" cy="84" rx={14 + 4 * Math.sin(t * 18)} ry="12" fill="#7A3B3B" /> : shock > 0.3 ? <ellipse cx="0" cy="90" rx="22" ry="28" fill="#7A3B3B" /> : <path d="M-34 86 Q4 100 40 78" stroke="#7A3B3B" strokeWidth="9" fill="none" strokeLinecap="round" />}
      </g>
      {/* the enormous smoothie */}
      <g transform={`translate(230 0) rotate(${-3 + Math.sin(t * 2) * 1.5})`}>
        <path d={`M${-30} ${cupTop - 10} C-30 ${cupTop - 120} -150 ${cupTop - 110} -190 ${-470 + 8}`} stroke="#FF4F8B" strokeWidth="16" fill="none" strokeLinecap="round" opacity={sip > 0.3 ? 1 : 0} />
        <path d={`M-30 ${cupTop - 10} L-10 ${cupTop - 160}`} stroke="#FF4F8B" strokeWidth="16" strokeLinecap="round" opacity={sip > 0.3 ? 0 : 1} />
        <clipPath id="cupClip"><path d={`M-120 ${cupTop} L120 ${cupTop} L90 ${cupBot} L-90 ${cupBot}Z`} /></clipPath>
        <path d={`M-120 ${cupTop} L120 ${cupTop} L90 ${cupBot} L-90 ${cupBot}Z`} fill="#fff" opacity="0.35" />
        <g clipPath="url(#cupClip)">
          <rect x="-130" y={fillTop} width="260" height="700" fill="url(#smoothieG)" />
          <path d={`M-130 ${fillTop} q32 ${-14 + 6 * Math.sin(t * 5)} 65 0 t65 0 t65 0 t65 0`} fill="#FFB6CE" />
        </g>
        <path d={`M-120 ${cupTop} L120 ${cupTop} L90 ${cupBot} L-90 ${cupBot}Z`} fill="none" stroke="#fff" strokeWidth="8" />
        <path d={`M-92 ${cupTop + 30} L-70 ${cupBot - 40}`} stroke="#fff" strokeWidth="12" strokeLinecap="round" opacity="0.5" />
        <path d={`M-128 ${cupTop} C-128 ${cupTop - 80} 128 ${cupTop - 80} 128 ${cupTop}Z`} fill="#fff" opacity="0.55" stroke="#fff" strokeWidth="6" />
        <circle cx="54" cy={cupTop - 34} r="26" fill="#FF3D6E" /><path d={`M46 ${cupTop - 58} l8 -14 l8 14`} fill="#3FBF6A" />
        <ellipse cx="-118" cy="-350" rx="46" ry="54" fill={skin} /><ellipse cx="110" cy="-330" rx="40" ry="50" fill={skin} />
      </g>
    </g>
  );
};
