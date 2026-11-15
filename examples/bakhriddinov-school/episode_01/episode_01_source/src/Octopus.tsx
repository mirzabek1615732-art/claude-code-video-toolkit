import React from "react";
import { Heart } from "./Hearts";

export type Mouth = "smile" | "grin" | "o" | "smirk" | "flat" | "worry";
export interface Pose {
  blink: number;       // 0 open .. 1 closed
  lookX: number;       // -1..1
  lookY: number;
  brow: number;        // -1 worried .. 1 excited
  mouth: Mouth;
  arms: number[];      // 8 lift angles in degrees (positive lifts the arm up and outward)
  tilt: number;        // head tilt in degrees
  xray: number;        // 0 solid .. 1 see-through
  eyeScale: number;
  curlBoost: number;   // extra tip curl, 0..1
  wave: number;        // wave amplitude multiplier
}
export const defaultPose: Pose = { blink: 0, lookX: 0, lookY: 0, brow: 0.3, mouth: "smile", arms: [0, 0, 0, 0, 0, 0, 0, 0], tilt: 0, xray: 0, eyeScale: 1, curlBoost: 0, wave: 1 };

const N = 26;
export interface ArmGeo { pts: { x: number; y: number; w: number; a: number }[] }

/** spine of one arm in octopus-local coordinates, integrated from curvature so it bends smoothly */
export function armGeo(i: number, t: number, pose: Pose): ArmGeo {
  const out = (i - 3.5) / 3.5;
  const sgn = i < 4 ? -1 : 1;
  const x0 = -185 + i * (370 / 7);
  const y0 = 150 + (1 - Math.abs(out)) * 28;
  const lift = (pose.arms[i] * Math.PI) / 180;
  let phi = Math.PI / 2 + sgn * -(Math.abs(out) * 0.55 + lift);
  const L = 330 + 55 * Math.abs(out) + (i % 2) * 20;
  const dl = L / N;
  const curl = (-sgn) * (0.013 + 0.007 * pose.curlBoost) * (i % 2 ? 1 : 0.65);
  const A = 0.0058 * pose.wave, om = 2 * Math.PI * 0.55, ph = i * 0.9;
  const pts: ArmGeo["pts"] = [];
  let x = x0, y = y0;
  for (let k = 0; k <= N; k++) {
    const s = k / N;
    const w = 66 * Math.pow(1 - s, 0.85) + 7;
    pts.push({ x, y, w, a: phi });
    const kappa = curl * Math.pow(s, 2.1) * 2.2 + A * (0.25 + s) * Math.sin(2 * Math.PI * 1.15 * s - om * t + ph);
    phi += kappa * dl;
    x += Math.cos(phi) * dl; y += Math.sin(phi) * dl;
  }
  return { pts };
}

const Arm: React.FC<{ geo: ArmGeo; xray: number }> = ({ geo, xray }) => {
  const left: string[] = [], right: string[] = [];
  geo.pts.forEach((p) => {
    const nx = -Math.sin(p.a), ny = Math.cos(p.a);
    left.push(`${(p.x + (nx * p.w) / 2).toFixed(1)} ${(p.y + (ny * p.w) / 2).toFixed(1)}`);
    right.push(`${(p.x - (nx * p.w) / 2).toFixed(1)} ${(p.y - (ny * p.w) / 2).toFixed(1)}`);
  });
  const d = `M${left.join(" L")} L${right.reverse().join(" L")}Z`;
  const tip = geo.pts[geo.pts.length - 1];
  return (
    <g opacity={1 - 0.72 * xray}>
      <path d={d} fill="url(#armG)" stroke="#8A2A86" strokeOpacity="0.55" strokeWidth="3" strokeLinejoin="round" />
      <circle cx={tip.x} cy={tip.y} r={tip.w / 2 + 1} fill="#B53AAA" />
      {geo.pts.map((p, k) => (k >= 4 && k <= N - 5 && k % 2 === 0 ? (
        <g key={k}><circle cx={p.x} cy={p.y} r={p.w * 0.23} fill="#FFC3DA" opacity="0.9" /><circle cx={p.x} cy={p.y} r={p.w * 0.11} fill="#D9609C" opacity="0.7" /></g>
      ) : null))}
    </g>
  );
};

const SPOTS: [number, number, number][] = [[-120, -190, 15], [-40, -245, 11], [70, -215, 14], [150, -150, 10], [-170, -110, 9], [190, -60, 12], [-215, 10, 8], [30, -165, 7], [-80, -140, 8], [118, -240, 8], [210, 60, 9], [-205, 90, 10]];

export const Octopus: React.FC<{ t: number; pose: Pose; children?: React.ReactNode; front?: React.ReactNode }> = ({ t, pose, children, front }) => {
  const geos = Array.from({ length: 8 }, (_, i) => armGeo(i, t, pose));
  const body = "M-246 110 C-336 -80 -176 -334 36 -324 C232 -314 326 -92 246 112 C166 236 -166 236 -246 110Z";
  const es = pose.eyeScale;
  const eye = (cx: number, dir: number) => {
    const lx = pose.lookX * 16, ly = pose.lookY * 12;
    const lid = pose.blink * 74;
    return (
      <g key={cx} transform={`translate(${cx} 22)`}>
        <ellipse rx={64 * es} ry={72 * es} fill="url(#eyeG)" stroke="#6b1f66" strokeWidth="4" strokeOpacity="0.5" />
        <g transform={`translate(${lx} ${ly}) scale(${es})`}>
          <circle r="47" fill="url(#irisG)" /><circle r="30" fill="#1C0B2E" />
          <circle cx={-11} cy={-13} r="12" fill="#fff" /><circle cx={12} cy={12} r="5.5" fill="#fff" opacity="0.9" />
        </g>
        <clipPath id={`eyeclip${cx}`}><ellipse rx={64 * es} ry={72 * es} /></clipPath>
        <g clipPath={`url(#eyeclip${cx})`}><rect x="-80" y={-80 * es} width="160" height={lid * es + 2} fill="#F2508A" /><path d={`M-80 ${lid * es} Q0 ${lid * es + 18} 80 ${lid * es}`} stroke="#A02EA6" strokeWidth="5" fill="none" opacity={pose.blink > 0.05 ? 1 : 0} /></g>
        {/* brow */}
        {(() => {
          const b = pose.brow, w = Math.max(0, -b) * 30, up = Math.max(b, 0) * 20;
          const innerY = -88 - w - up * 0.2, outerY = -80 + w * 0.5 - up * 0.1;
          const ix = -dir * 52, ox = dir * 58;
          return <path d={`M${ox} ${outerY} Q${(ix + ox) / 2} ${-112 - up - w * 0.3} ${ix} ${innerY}`} stroke="#7A1F78" strokeWidth="13" strokeLinecap="round" fill="none" />;
        })()}
      </g>
    );
  };
  const mouth = (() => {
    switch (pose.mouth) {
      case "grin": return <g><path d="M-54 104 Q0 176 54 104Z" fill="#5A1240" stroke="#5A1240" strokeWidth="8" strokeLinejoin="round" /><ellipse cx="0" cy="138" rx="24" ry="13" fill="#FF7FA6" /></g>;
      case "o": return <ellipse cx="0" cy="126" rx="21" ry="27" fill="#5A1240" />;
      case "smirk": return <path d="M-38 122 Q12 136 48 100" stroke="#5A1240" strokeWidth="9" strokeLinecap="round" fill="none" />;
      case "flat": return <path d="M-34 122 L34 122" stroke="#5A1240" strokeWidth="9" strokeLinecap="round" />;
      case "worry": return <path d="M-38 134 Q0 104 38 134" stroke="#5A1240" strokeWidth="9" strokeLinecap="round" fill="none" />;
      default: return <path d="M-46 106 Q0 146 46 106" stroke="#5A1240" strokeWidth="9" strokeLinecap="round" fill="none" />;
    }
  })();
  return (
    <g transform={`rotate(${pose.tilt} 0 120)`}>
      {geos.map((g, i) => <Arm key={i} geo={g} xray={pose.xray} />)}
      <g opacity={1 - 0.74 * pose.xray}>
        <path d={body} fill="url(#bodyG)" />
        {SPOTS.map(([x, y, r], k) => <circle key={k} cx={x} cy={y} r={r} fill="#FFC3DA" opacity="0.4" />)}
        <path d={body} fill="url(#bodyShade)" />
        <ellipse cx="-95" cy="-190" rx="110" ry="70" fill="url(#bodyHi)" transform="rotate(-24 -95 -190)" />
        <path d={body} fill="none" stroke="url(#rimG)" strokeWidth="9" />
      </g>
      {pose.xray > 0 && <path d={body} fill="none" stroke="#7DF3FF" strokeWidth="6" opacity={pose.xray * 0.9} style={{ filter: "drop-shadow(0 0 14px #31D8FF)" }} />}
      {children}
      <g opacity={1 - 0.62 * pose.xray}>
        {eye(-98, 1)}{eye(98, -1)}
        <circle cx="-158" cy="92" r="24" fill="#FF6FA5" opacity="0.45" /><circle cx="158" cy="92" r="24" fill="#FF6FA5" opacity="0.45" />
        {mouth}
      </g>
      {front}
    </g>
  );
};

export { Heart };
