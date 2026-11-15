import React from "react";
import { SC, hash, kf, mixHex, seg, smooth } from "./util";

type Pal = { top: string; bot: string; glow: string; glowA: number };
const OCEAN: Pal = { top: "#0C74C0", bot: "#06214F", glow: "#35D9E8", glowA: 0.45 };
const SCAN: Pal = { top: "#07224A", bot: "#020B1E", glow: "#2BB8FF", glowA: 0.35 };
const DARK: Pal = { top: "#1A0838", bot: "#02040F", glow: "#3A7BFF", glowA: 0.4 };
const HYPE: Pal = { top: "#6A1FB5", bot: "#1B0658", glow: "#FF5FA8", glowA: 0.5 };
const CALM: Pal = { top: "#0B94A8", bot: "#052B5A", glow: "#7DF3FF", glowA: 0.4 };
const KEYS: [number, Pal][] = [[0, OCEAN], [SC.heart - 0.15, OCEAN], [SC.heart + 0.45, SCAN], [SC.blood - 0.1, SCAN], [SC.blood + 0.4, DARK], [SC.vocab - 0.1, DARK], [SC.vocab + 0.4, HYPE], [SC.twist - 0.1, HYPE], [SC.twist + 0.5, CALM]];

const palAt = (t: number): Pal => {
  for (let i = 1; i < KEYS.length; i++) {
    if (t <= KEYS[i][0]) {
      const k = smooth(seg(t, KEYS[i - 1][0], KEYS[i][0]));
      const a = KEYS[i - 1][1], b = KEYS[i][1];
      return { top: mixHex(a.top, b.top, k), bot: mixHex(a.bot, b.bot, k), glow: mixHex(a.glow, b.glow, k), glowA: a.glowA + (b.glowA - a.glowA) * k };
    }
  }
  return KEYS[KEYS.length - 1][1];
};

export const palette = palAt;

/** far layer: gradient water, light rays, glow that drifts with the story */
export const BackFar: React.FC<{ t: number }> = ({ t }) => {
  const p = palAt(t);
  const rays = Array.from({ length: 7 }, (_, i) => i);
  return (
    <div style={{ position: "absolute", inset: -240 }}>
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(${p.top}, ${p.bot})` }} />
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse 60% 38% at ${50 + Math.sin(t * 0.5) * 8}% ${kf(t, [[0, 42], [SC.blood, 48], [SC.vocab, 40]])}%, ${p.glow}${Math.round(p.glowA * 255).toString(16).padStart(2, "0")}, transparent 70%)` }} />
      <svg width="1560" height="2400" viewBox="-240 -240 1560 2400" style={{ position: "absolute", inset: 0, mixBlendMode: "screen" }}>
        {rays.map((i) => {
          const ang = -18 + i * 7 + Math.sin(t * 0.35 + i) * 3.5;
          const o = (0.05 + 0.04 * Math.sin(t * 0.7 + i * 1.7)) * (i % 2 ? 0.8 : 1);
          return <polygon key={i} points="540,-300 640,-300 1240,2200 140,2200" fill="#fff" opacity={o} transform={`rotate(${ang} 560 -300) translate(${(i - 3) * 120} 0) scale(${0.55 + (i % 3) * 0.2} 1)`} />;
        })}
      </svg>
    </div>
  );
};

/** drifting bubbles and plankton; depth sets size, speed and blur */
export const Particles: React.FC<{ t: number; depth: "far" | "near"; tint?: string }> = ({ t, depth, tint = "#CFF8FF" }) => {
  const n = depth === "far" ? 38 : 14;
  return (
    <svg width="1080" height="1920" viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0 }}>
      {Array.from({ length: n }, (_, i) => {
        const r0 = hash(i + (depth === "far" ? 0 : 99));
        const r = (depth === "far" ? 3 + r0 * 7 : 14 + r0 * 26);
        const speed = (depth === "far" ? 22 : 70) * (0.6 + hash(i + 3));
        const y = ((hash(i + 7) * 2300 - t * speed) % 2300 + 2300) % 2300 - 190;
        const x = hash(i + 11) * 1080 + Math.sin(t * (0.6 + hash(i + 5)) + i) * (depth === "far" ? 16 : 34);
        return (
          <g key={i} opacity={depth === "far" ? 0.25 + 0.3 * hash(i + 17) : 0.55}>
            <circle cx={x} cy={y} r={r} fill={depth === "far" ? tint : "none"} stroke={tint} strokeWidth={depth === "far" ? 0 : 3} style={depth === "near" ? { filter: "blur(1.2px)" } : undefined} />
            {depth === "near" && <circle cx={x - r * 0.35} cy={y - r * 0.35} r={r * 0.2} fill="#fff" opacity="0.8" />}
          </g>
        );
      })}
    </svg>
  );
};

/** dark kelp silhouettes in the foreground corners */
export const Kelp: React.FC<{ t: number }> = ({ t }) => {
  const blade = (x: number, h: number, i: number, flip: number) => {
    const sw = Math.sin(t * 0.9 + i) * 26;
    return <path key={i} d={`M${x} 1960 C${x + flip * 30 + sw * 0.3} ${1960 - h * 0.35} ${x - flip * 24 + sw} ${1960 - h * 0.7} ${x + flip * 34 + sw * 1.4} ${1960 - h} C${x + flip * 70 + sw} ${1960 - h * 0.6} ${x + flip * 50} ${1960 - h * 0.3} ${x + 46} 1960Z`} fill="#031635" opacity="0.8" />;
  };
  return (
    <svg width="1080" height="1920" viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0 }}>
      {[-10, 40, 95, 150].map((x, i) => blade(x, 520 + i * 90, i, 1))}
      {[930, 985, 1040, 1100].map((x, i) => blade(x, 560 + i * 70, i + 5, -1))}
    </svg>
  );
};

export const Vignette: React.FC = () => (
  <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 75% 62% at 50% 46%, transparent 55%, rgba(1,6,22,0.55) 100%)", pointerEvents: "none" }} />
);
