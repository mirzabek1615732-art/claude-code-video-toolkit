import React from "react";
import { hash } from "./util";

// ---------------------------------------------------------------- the brain (origin = centre of the brain)
export type BMood = "calm" | "alarm" | "panic" | "smug" | "facepalm" | "sneaky";
export const Brain: React.FC<{ t: number; mood: BMood; press?: number; lookX?: number; blink?: number; palm?: number }> = ({ t, mood, press = 0, lookX = 0, blink = 0, palm = 0 }) => {
  const lobes: [number, number, number][] = [[-110, -40, 95], [-40, -95, 100], [60, -95, 100], [125, -30, 92], [95, 50, 90], [-90, 50, 92], [0, 30, 110]];
  const wob = mood === "panic" ? Math.sin(t * 30) * 4 : Math.sin(t * 2) * 2;
  const brow = mood === "alarm" || mood === "panic" ? -1 : mood === "smug" || mood === "sneaky" ? 0.6 : 0;
  const eyeS = mood === "alarm" || mood === "panic" ? 1.25 : 1;
  const arm = (side: number, a: number, pressing: number) => (
    <g transform={`translate(${side * 170} 70) rotate(${side * a})`}>
      <path d={`M0 0 Q${side * 50} ${60 - pressing * 40} ${side * 70} ${130 - pressing * 30}`} stroke="#FF9DB0" strokeWidth="18" fill="none" strokeLinecap="round" />
      <circle cx={side * 72} cy={138 - pressing * 30} r="30" fill="#5FF2C8" stroke="#1E7A66" strokeWidth="5" />
    </g>
  );
  return (
    <g transform={`translate(${wob} 0)`}>
      {arm(-1, mood === "panic" ? 30 + 30 * Math.sin(t * 22) : 10, 0)}
      {arm(1, -20 + press * 50, press)}
      <g>
        {lobes.map(([x, y, r], i) => <circle key={i} cx={x} cy={y} r={r} fill="url(#brainG)" />)}
        {lobes.map(([x, y, r], i) => <path key={`g${i}`} d={`M${x - r * 0.6} ${y} q${r * 0.2} ${-r * 0.4} ${r * 0.45} 0 t${r * 0.45} 0`} stroke="#D9577A" strokeWidth="7" fill="none" strokeLinecap="round" opacity="0.55" />)}
        <path d="M0 -190 C-10 -120 10 -60 0 0" stroke="#D9577A" strokeWidth="8" fill="none" opacity="0.6" />
        <ellipse cx="-70" cy="-120" rx="50" ry="22" fill="#fff" opacity="0.35" transform="rotate(-25 -70 -120)" />
      </g>
      {[-58, 58].map((x, i) => (
        <g key={i} transform={`translate(${x} 10) scale(${eyeS})`}>
          <ellipse rx="34" ry="38" fill="#fff" />
          <g transform={`scale(1 ${1 - blink})`}><circle cx={lookX * 12} cy="4" r={mood === "panic" ? 11 : 16} fill="#23185A" /><circle cx={lookX * 12 - 5} cy="-3" r="5" fill="#fff" /></g>
          {mood === "sneaky" && <rect x="-38" y="-42" width="76" height="34" fill="#FF8FA6" />}
          <path d={i === 0 ? `M-32 ${-50 + 12 * brow} L30 ${-56 - 10 * brow}` : `M-30 ${-56 - 10 * brow} L32 ${-50 + 12 * brow}`} stroke="#7A2244" strokeWidth="10" strokeLinecap="round" />
        </g>
      ))}
      {mood === "alarm" || mood === "panic" ? <ellipse cy="92" rx="26" ry={22 + 6 * Math.abs(Math.sin(t * 18))} fill="#5A1530" /> : mood === "smug" || mood === "sneaky" ? <path d="M-34 86 Q10 102 40 76" stroke="#5A1530" strokeWidth="9" fill="none" strokeLinecap="round" /> : <path d="M-30 84 Q0 104 30 84" stroke="#5A1530" strokeWidth="9" fill="none" strokeLinecap="round" />}
      {(mood === "panic" || mood === "alarm") && <path d="M140 -110 q16 30 0 40 q-16 -10 0 -40Z" fill="#7FE6FF" />}
      {palm > 0 && <g transform={`translate(${40 * (1 - palm) + 0} ${120 * (1 - palm) + 0}) rotate(${-15 + 15 * palm})`}><ellipse cx="0" cy="10" rx="105" ry="70" fill="#5FF2C8" stroke="#1E7A66" strokeWidth="6" />{[0, 1, 2, 3].map((k) => <rect key={k} x={-88 + k * 46} y="-80" width="36" height="70" rx="18" fill="#5FF2C8" stroke="#1E7A66" strokeWidth="6" />)}</g>}
    </g>
  );
};

// ---------------------------------------------------------------- the nose, star of the show (origin = base)
export const Nose: React.FC<{ t: number; wave?: number; glasses?: boolean }> = ({ t, wave = 0, glasses = true }) => (
  <g>
    <path d="M-20 -60 L-40 -10 M20 -60 L40 -10" stroke="#5A2A1A" strokeWidth="9" strokeLinecap="round" />
    <path d="M0 -330 C40 -320 70 -200 110 -140 C150 -90 130 -50 80 -54 C60 -40 30 -40 0 -48 C-30 -40 -60 -40 -80 -54 C-130 -50 -150 -90 -110 -140 C-70 -200 -40 -320 0 -330Z" fill="url(#noseG)" />
    <ellipse cx="-48" cy="-70" rx="22" ry="12" fill="#8A4A32" /><ellipse cx="48" cy="-70" rx="22" ry="12" fill="#8A4A32" />
    <ellipse cx="-20" cy="-250" rx="12" ry="40" fill="#fff" opacity="0.35" />
    {glasses && <g transform="translate(0 -200)"><path d="M-96 0 C-96 -34 -20 -34 -14 0 C-14 30 -96 32 -96 0Z M14 0 C20 -34 96 -34 96 0 C96 32 14 30 14 0Z" fill="#141433" /><path d="M-14 -6 L14 -6" stroke="#141433" strokeWidth="6" /><path d="M-80 -12 L-56 -20 M30 -12 L54 -20" stroke="#fff" strokeWidth="6" strokeLinecap="round" opacity="0.6" /></g>}
    <g transform={`translate(110 -150) rotate(${-40 - wave * 30 * Math.sin(t * 12)})`}><path d="M0 0 L60 -50" stroke="#5A2A1A" strokeWidth="9" strokeLinecap="round" /><circle cx="64" cy="-54" r="16" fill="#fff" stroke="#5A2A1A" strokeWidth="4" /></g>
    <g transform="translate(-110 -150) rotate(30)"><path d="M0 0 L-50 40" stroke="#5A2A1A" strokeWidth="9" strokeLinecap="round" /><circle cx="-54" cy="44" r="16" fill="#fff" stroke="#5A2A1A" strokeWidth="4" /></g>
  </g>
);

// ---------------------------------------------------------------- the student (origin = bottom centre of the bust)
export type SMood = "neutral" | "curious" | "cross" | "shock" | "point" | "ignore" | "peek" | "deadpan" | "talk";
export const Student: React.FC<{ t: number; mood: SMood; blink?: number; talk?: number; lookX?: number; headTilt?: number }> = ({ t, mood, blink = 0, talk = 0, lookX = 0, headTilt = 0 }) => {
  const skin = "#E2A97E", hair = "#2A1B3D";
  const eyeS = mood === "shock" || mood === "point" ? 1.3 : 1;
  const cross = mood === "cross" ? 1 : 0;
  const shut = mood === "ignore" ? 1 : 0;
  const pointArm = mood === "point";
  return (
    <g>
      <path d="M-300 40 C-300 -160 -200 -240 -60 -250 L60 -250 C200 -240 300 -160 300 40Z" fill="#7C6CFF" />
      <path d="M-70 -250 C-40 -180 40 -180 70 -250" fill="#5FF2C8" />
      <rect x="-44" y="-300" width="88" height="70" rx="28" fill={skin} />
      {pointArm && <g transform="translate(150 -170)"><path d="M0 0 C40 -60 70 -120 60 -190" stroke="#7C6CFF" strokeWidth="58" strokeLinecap="round" fill="none" /><circle cx="58" cy="-200" r="34" fill={skin} /><rect x="48" y="-280" width="22" height="70" rx="11" fill={skin} /></g>}
      <g transform={`translate(0 -440) rotate(${headTilt})`}>
        <ellipse cx="-140" cy="10" rx="22" ry="32" fill={skin} /><ellipse cx="140" cy="10" rx="22" ry="32" fill={skin} />
        <circle r="140" fill={skin} />
        {Array.from({ length: 10 }, (_, i) => { const a = Math.PI + (i / 9) * Math.PI; return <circle key={i} cx={Math.cos(a) * 128} cy={Math.sin(a) * 110 - 40 - (mood === "shock" ? 10 : 0)} r={44 + 8 * hash(i + 3)} fill={hair} />; })}
        {[-55, 55].map((x, i) => (
          <g key={i} transform={`translate(${x} 4) scale(${eyeS})`}>
            {shut ? <path d="M-26 0 Q0 14 26 0" stroke="#3A2030" strokeWidth="8" fill="none" strokeLinecap="round" /> : (
              <>
                <ellipse rx="30" ry="33" fill="#fff" />
                <g transform={`scale(1 ${1 - blink})`}><circle cx={cross ? (i === 0 ? 14 : -14) : lookX * 12} cy={cross ? 12 : 3} r={mood === "shock" ? 10 : 15} fill="#20152E" /><circle cx={(cross ? (i === 0 ? 14 : -14) : lookX * 12) - 4} cy={cross ? 7 : -2} r="4.5" fill="#fff" /></g>
                {mood === "peek" && <rect x="-34" y="-36" width="68" height="40" fill={skin} />}
                {mood === "deadpan" && <rect x="-34" y="-36" width="68" height="26" fill={skin} />}
              </>
            )}
            <path d={i === 0 ? `M-30 ${-48 - (mood === "shock" || mood === "point" ? 14 : 0) + (mood === "deadpan" ? 8 : 0)} L28 ${-52 - (mood === "curious" ? 12 : 0) - (mood === "shock" ? 14 : 0)}` : `M-28 ${-52 - (mood === "shock" || mood === "point" ? 14 : 0) - (mood === "curious" ? 0 : 0)} L30 ${-48 - (mood === "shock" ? 14 : 0) + (mood === "deadpan" ? 0 : 0)}`} stroke={hair} strokeWidth="11" strokeLinecap="round" />
          </g>
        ))}
        <path d="M0 10 C-12 50 -14 70 0 76 C10 80 20 74 16 68" stroke="#B87A52" strokeWidth="7" fill="none" strokeLinecap="round" />
        {mood === "shock" || mood === "point" || talk > 0.3 ? <ellipse cy="105" rx={mood === "point" ? 30 : 20} ry={8 + 18 * Math.max(talk, mood === "shock" || mood === "point" ? 1 : 0)} fill="#6A2A2A" /> : mood === "deadpan" ? <path d="M-30 104 L30 104" stroke="#6A2A2A" strokeWidth="8" strokeLinecap="round" /> : mood === "ignore" ? <path d="M-30 106 Q0 94 30 106" stroke="#6A2A2A" strokeWidth="8" fill="none" strokeLinecap="round" /> : <path d="M-34 100 Q0 120 34 100" stroke="#6A2A2A" strokeWidth="8" fill="none" strokeLinecap="round" />}
        <circle cx="-86" cy="60" r="20" fill="#FF8A8A" opacity="0.35" /><circle cx="86" cy="60" r="20" fill="#FF8A8A" opacity="0.35" />
        {(mood === "shock" || mood === "ignore") && <path d="M120 -60 q16 30 0 40 q-16 -10 0 -40Z" fill="#7FE6FF" />}
      </g>
    </g>
  );
};

// ---------------------------------------------------------------- the house with a face (example picture)
export const FaceHouse: React.FC<{ glow: number }> = ({ glow }) => (
  <g>
    <rect x="-150" y="-120" width="300" height="220" fill="#FFD9A0" stroke="#7A4A2A" strokeWidth="6" />
    <path d="M-175 -110 L0 -230 L175 -110Z" fill="#E8574A" stroke="#7A4A2A" strokeWidth="6" strokeLinejoin="round" />
    <rect x="-110" y="-80" width="70" height="60" rx="8" fill="#5FC8FF" stroke="#7A4A2A" strokeWidth="6" />
    <rect x="40" y="-80" width="70" height="60" rx="8" fill="#5FC8FF" stroke="#7A4A2A" strokeWidth="6" />
    <path d="M-50 100 L-50 30 Q0 -10 50 30 L50 100Z" fill="#8A4A2A" stroke="#7A4A2A" strokeWidth="6" />
    {glow > 0.05 && <g opacity={glow} stroke="#FF7A6B" strokeWidth="7" fill="none"><circle cx="-75" cy="-50" r="52" /><circle cx="75" cy="-50" r="52" /><path d="M-60 70 Q0 110 60 70" /></g>}
  </g>
);
