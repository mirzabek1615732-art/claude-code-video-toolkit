import React from "react";
import { hash } from "./util";

// ---------------------------------------------------------------- the strawberry (origin = between the feet)
export type SMood = "smug" | "proud" | "shock" | "angry" | "betrayed" | "shout";
export interface StrawberryProps { t: number; mood: SMood; glasses?: number; glassesDrop?: number; crown?: number; armL?: number; armR?: number; sign?: React.ReactNode; squash?: number; lookX?: number; blink?: number; face?: boolean; walk?: number }
const BODY = "M0 -40 C-95 -60 -175 -170 -165 -285 C-155 -385 -62 -412 0 -392 C62 -412 155 -385 165 -285 C175 -170 95 -60 0 -40Z";
export const STRAW_BODY = BODY;
export const Achenes: React.FC<{ id: string; size?: number; glow?: number }> = ({ id, size = 1, glow = 0 }) => (
  <g clipPath={`url(#${id})`}>
    {Array.from({ length: 9 }, (_, r) => Array.from({ length: 9 }, (_, c) => {
      const x = -160 + c * 40 + (r % 2) * 20, y = -380 + r * 40;
      return <g key={`${r}${c}`} transform={`translate(${x} ${y}) rotate(${(hash(r * 9 + c) - 0.5) * 30}) scale(${size})`}><ellipse rx="5.5" ry="9" fill="#FFE27A" style={glow > 0.1 ? { filter: `drop-shadow(0 0 ${6 * glow}px #FFF3A8)` } : undefined} /><ellipse rx="2.5" ry="4.5" cy="1" fill="#D9A520" /></g>;
    }))}
  </g>
);
export const Strawberry: React.FC<StrawberryProps> = ({ t, mood, glasses = 0, glassesDrop = 0, crown = 0, armL = 0, armR = 0, sign, squash = 1, lookX = 0, blink = 0, face = true, walk = 0 }) => {
  const step = Math.sin(walk * Math.PI * 2);
  const eyeW = mood === "shock" ? 1.25 : 1;
  const lid = mood === "smug" ? 0.42 : mood === "angry" ? 0.25 : 0;
  const L = Math.max(lid, blink);
  const brow = mood === "angry" || mood === "shout" ? 1 : mood === "shock" ? -1.2 : mood === "betrayed" ? -0.7 : 0;
  const arm = (side: number, ang: number) => (
    <g transform={`translate(${side * 150} -250) rotate(${-side * ang})`}>
      <path d={`M0 0 Q${side * 40} 50 ${side * 30} 110`} stroke="#2A1A0E" strokeWidth="10" fill="none" strokeLinecap="round" />
      <circle cx={side * 30} cy="118" r="22" fill="#FFFFFF" stroke="#2A1A0E" strokeWidth="5" />
    </g>
  );
  return (
    <g transform={`scale(${1 / Math.sqrt(squash)} ${squash})`}>
      <path d={`M-45 -70 L${-50 + step * 14} -8 M45 -70 L${50 - step * 14} -8`} stroke="#2A1A0E" strokeWidth="11" strokeLinecap="round" />
      <ellipse cx={-55 + step * 14} cy="-6" rx="30" ry="15" fill="#fff" stroke="#2A1A0E" strokeWidth="5" /><ellipse cx={55 - step * 14} cy="-6" rx="30" ry="15" fill="#fff" stroke="#2A1A0E" strokeWidth="5" />
      {arm(-1, armL)}{arm(1, armR)}
      <clipPath id="sbClip"><path d={BODY} /></clipPath>
      <path d={BODY} fill="url(#strawG)" />
      <Achenes id="sbClip" />
      <path d={BODY} fill="url(#strawShade)" />
      <ellipse cx="-80" cy="-320" rx="40" ry="22" fill="#fff" opacity="0.45" transform="rotate(-30 -80 -320)" />
      {[0, 1, 2, 3, 4, 5, 6].map((i) => <path key={i} d="M0 0 C18 -10 40 -6 62 8 C40 4 18 8 0 0Z" fill={i % 2 ? "#3FA34D" : "#2E8B3E"} transform={`translate(0 -392) rotate(${-180 + i * 30 + Math.sin(t * 2 + i) * 3}) scale(1.6)`} />)}
      <rect x="-6" y="-440" width="12" height="40" rx="6" fill="#2E8B3E" />
      {crown > 0 && <g transform="translate(0 -450)" opacity={crown}><path d="M-46 0 L-50 -46 L-24 -22 L0 -58 L24 -22 L50 -46 L46 0Z" fill="#FFC93C" stroke="#B8860B" strokeWidth="4" strokeLinejoin="round" /><circle cy="-30" r="7" fill="#FF4D6D" /></g>}
      {face && (
        <g>
          {[-56, 56].map((x, i) => (
            <g key={i} transform={`translate(${x} -262)`}>
              <ellipse rx={30 * eyeW} ry={34 * eyeW} fill="#fff" />
              <circle cx={lookX * 10} cy={mood === "shock" ? 0 : 4} r={mood === "shock" ? 10 : 15} fill="#2A0F14" /><circle cx={lookX * 10 - 4} cy="-4" r="5" fill="#fff" />
              {mood === "betrayed" && <ellipse cx="0" cy="26" rx="22" ry="7" fill="#9FE3FF" opacity="0.85" />}
              <rect x="-36" y="-40" width="72" height={70 * L + 1} fill="#E8283E" />
              <path d={i === 0 ? `M-32 ${-50 - 8 * Math.max(0, -brow)} L28 ${-46 + 14 * Math.max(0, brow) - 10 * Math.max(0, -brow)}` : `M-28 ${-46 + 14 * Math.max(0, brow) - 10 * Math.max(0, -brow)} L32 ${-50 - 8 * Math.max(0, -brow)}`} stroke="#4A0A12" strokeWidth="10" strokeLinecap="round" />
            </g>
          ))}
          {mood === "shock" ? <ellipse cx="0" cy="-170" rx="26" ry="32" fill="#4A0A12" />
            : mood === "shout" || mood === "angry" ? <path d={`M-48 -190 Q0 ${-120 + 8 * Math.sin(t * 30)} 48 -190Z`} fill="#4A0A12" />
              : mood === "betrayed" ? <path d={`M-36 -170 q12 ${-8 + 4 * Math.sin(t * 25)} 24 0 q12 ${8 - 4 * Math.sin(t * 25)} 24 0`} stroke="#4A0A12" strokeWidth="8" fill="none" strokeLinecap="round" />
                : <path d="M-40 -186 Q10 -160 46 -196" stroke="#4A0A12" strokeWidth="9" fill="none" strokeLinecap="round" />}
          {glasses > 0 && (
            <g transform={`translate(0 ${-262 + glassesDrop * 300}) rotate(${glassesDrop * 40})`} opacity={glasses * (1 - Math.max(0, glassesDrop - 0.8) * 5)}>
              <path d="M-96 -6 C-96 -40 -20 -40 -16 -6 C-16 26 -96 30 -96 -6Z M16 -6 C20 -40 96 -40 96 -6 C96 30 16 26 16 -6Z" fill="#1A1020" />
              <path d="M-16 -10 L16 -10" stroke="#1A1020" strokeWidth="6" />
              <path d="M-80 -20 L-56 -28 M32 -20 L56 -28" stroke="#fff" strokeWidth="6" strokeLinecap="round" opacity="0.6" />
            </g>
          )}
        </g>
      )}
      {sign}
    </g>
  );
};

// ---------------------------------------------------------------- the banana lawyer (origin = base)
export interface BananaProps { t: number; brow?: number; browRaise?: number; smile?: number; blink?: number; armR?: number; hold?: "folder" | "smoothie" | "none"; sip?: number; lookX?: number; lean?: number }
const BAN = "M-70 -30 C-130 -180 -110 -370 -20 -470 L22 -482 L32 -462 C-24 -380 -24 -220 74 -62 C64 -18 -40 -2 -70 -30Z";
export const Banana: React.FC<BananaProps> = ({ t, brow = 0, browRaise = 0, smile = 0.6, blink = 0, armR = 0, hold = "none", sip = 0, lookX = 0, lean = 0 }) => (
  <g transform={`rotate(${lean} 0 0)`}>
    <path d="M-30 -40 L-40 0 M30 -40 L40 0" stroke="#2A1A0E" strokeWidth="11" strokeLinecap="round" />
    <path d="M-62 -2 h40 M20 -2 h42" stroke="#1A1020" strokeWidth="14" strokeLinecap="round" />
    <clipPath id="banClip"><path d={BAN} /></clipPath>
    <path d={BAN} fill="url(#bananaG)" />
    <g clipPath="url(#banClip)">
      <path d="M-120 -40 C-110 -150 -90 -220 -60 -270 L120 -270 L120 0 L-120 0Z" fill="#1F2A5C" />
      <path d="M-40 -268 L0 -170 L26 -268Z" fill="#fff" />
      <path d="M-6 -250 L8 -250 L14 -170 L0 -150 L-12 -170Z" fill="#D7263D" />
      <path d="M-40 -268 L-10 -200 L-60 -210Z M26 -268 L4 -200 L50 -214Z" fill="#2B3A78" />
      <path d="M-90 -470 L60 -470 L60 -440 L-90 -440Z" fill="#7A5A1E" opacity="0.5" />
      <path d={BAN} fill="url(#bananaShade)" />
    </g>
    <path d="M22 -482 L32 -462 L18 -458 L10 -478Z" fill="#5A3A12" />
    <path d="M-62 -26 C-80 -60 -96 -100 -100 -140" stroke="#fff" strokeWidth="8" opacity="0.35" fill="none" strokeLinecap="round" />
    <g transform="translate(-28 -360)">
      {[-30, 30].map((x, i) => (
        <g key={i} transform={`translate(${x} 0)`}>
          <ellipse rx="22" ry="25" fill="#fff" />
          <g transform={`scale(1 ${1 - blink})`}><circle cx={lookX * 8} cy="3" r="11" fill="#2A1A0E" /><circle cx={lookX * 8 - 3} cy="-2" r="3.5" fill="#fff" /></g>
          <circle r="27" fill="none" stroke="#3A2A12" strokeWidth="4" />
          <path d={`M-24 ${-38 - (i === 1 ? browRaise * 22 : 0) - brow * 6} Q0 ${-48 - (i === 1 ? browRaise * 26 : 0) - brow * 8} 24 ${-38 - (i === 1 ? browRaise * 22 : 0) - brow * 6}`} stroke="#5A3A12" strokeWidth="7" fill="none" strokeLinecap="round" />
        </g>
      ))}
      <path d="M-3 0 L3 0" stroke="#3A2A12" strokeWidth="4" />
      <path d={`M-22 ${58} Q4 ${58 + 22 * smile} 30 ${52 - 6 * smile}`} stroke="#5A3A12" strokeWidth="7" fill="none" strokeLinecap="round" />
    </g>
    <g transform={`translate(50 -230) rotate(${-armR})`}>
      <path d="M0 0 Q40 40 70 90" stroke="#1F2A5C" strokeWidth="26" strokeLinecap="round" fill="none" />
      <circle cx="74" cy="98" r="20" fill="#FFE45C" stroke="#2A1A0E" strokeWidth="4" />
      {hold === "folder" && <g transform="translate(74 110) rotate(10)"><rect x="-70" y="-20" width="140" height="100" rx="8" fill="#E8C27A" stroke="#8A5A1E" strokeWidth="5" /><rect x="-70" y="-30" width="60" height="18" rx="5" fill="#E8C27A" stroke="#8A5A1E" strokeWidth="5" /></g>}
      {hold === "smoothie" && <g transform="translate(78 60)"><path d="M-30 -60 L30 -60 L22 40 L-22 40Z" fill="#FFD166" stroke="#fff" strokeWidth="4" /><path d="M-28 -50 L28 -50 L22 40 L-22 40Z" fill="#FFE27A" opacity="0.6" /><path d={`M8 -60 L${-60 + 0 * sip} -150`} stroke="#FF4D6D" strokeWidth="8" strokeLinecap="round" /></g>}
    </g>
  </g>
);

// ---------------------------------------------------------------- the pineapple judge (origin = top of the bench, centre)
export const Judge: React.FC<{ t: number; shock?: number; gavel?: number; facepalm?: number; blink?: number; lookX?: number }> = ({ t, shock = 0, gavel = 0, facepalm = 0, blink = 0, lookX = 0 }) => (
  <g>
    <path d="M-150 20 C-150 -80 -100 -130 0 -130 C100 -130 150 -80 150 20Z" fill="#1A1020" />
    <path d="M-40 -130 L0 -60 L40 -130Z" fill="#fff" />
    <g transform="translate(0 -230)">
      {[0, 1, 2, 3, 4, 5, 6].map((i) => <path key={i} d="M0 0 C10 -40 4 -80 0 -110 C-4 -80 -10 -40 0 0Z" fill={i % 2 ? "#3FA34D" : "#2E8B3E"} transform={`translate(0 -110) rotate(${-45 + i * 15 + Math.sin(t * 2 + i) * 2}) scale(1.3)`} />)}
      <ellipse rx="118" ry="132" fill="url(#pineG)" />
      <clipPath id="pc"><ellipse rx="118" ry="132" /></clipPath>
      <g clipPath="url(#pc)" opacity="0.5">{Array.from({ length: 14 }, (_, i) => <path key={i} d={`M${-200 + i * 32} -150 L${-60 + i * 32} 150 M${-60 + i * 32} -150 L${-200 + i * 32} 150`} stroke="#B8860B" strokeWidth="4" />)}</g>
      {[-1, 1].map((s) => Array.from({ length: 4 }, (_, i) => <circle key={`${s}${i}`} cx={s * (118 + 6 * (i % 2))} cy={-60 + i * 40} r="30" fill="#F4F1EA" stroke="#D9D2C2" strokeWidth="4" />))}
      <path d="M-100 -80 C-60 -150 60 -150 100 -80 C60 -110 -60 -110 -100 -80Z" fill="#F4F1EA" />
      {[-44, 44].map((x, i) => (
        <g key={i} transform={`translate(${x} 0)`}>
          <ellipse rx={24 + 8 * shock} ry={26 + 10 * shock} fill="#fff" />
          <g transform={`scale(1 ${1 - blink})`}><circle cx={lookX * 8} cy="2" r={12 - 4 * shock} fill="#2A1A0E" /><circle cx={lookX * 8 - 3} cy="-3" r="3.5" fill="#fff" /></g>
          <path d={`M-26 ${-36 - 28 * shock} L26 ${-40 - 30 * shock}`} stroke="#6A4A12" strokeWidth="9" strokeLinecap="round" transform={i === 0 ? "" : "scale(-1 1)"} />
        </g>
      ))}
      {shock > 0.3 ? <ellipse cy="64" rx="22" ry={20 + 14 * shock} fill="#4A2A0A" /> : <path d="M-30 64 Q0 76 30 64" stroke="#4A2A0A" strokeWidth="8" fill="none" strokeLinecap="round" />}
      {facepalm > 0 && <g transform={`translate(${lerpN(140, 10, facepalm)} ${lerpN(160, 0, facepalm)}) rotate(${-20 + 20 * facepalm})`}><ellipse rx="70" ry="54" fill="#E8B04A" stroke="#8A5A1E" strokeWidth="5" />{[0, 1, 2, 3].map((k) => <rect key={k} x={-60 + k * 30} y="-80" width="24" height="50" rx="12" fill="#E8B04A" stroke="#8A5A1E" strokeWidth="5" />)}</g>}
    </g>
    <g transform={`translate(150 -120) rotate(${-gavel * 70})`}>
      <path d="M0 0 L60 -60" stroke="#1A1020" strokeWidth="26" strokeLinecap="round" />
      <g transform="translate(70 -80) rotate(45)"><rect x="-12" y="-80" width="24" height="120" rx="8" fill="#7A4A1E" /><rect x="-40" y="-110" width="80" height="44" rx="12" fill="#A0652A" stroke="#5A3A12" strokeWidth="4" /></g>
    </g>
  </g>
);
const lerpN = (a: number, b: number, k: number) => a + (b - a) * k;
