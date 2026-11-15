import React from "react";
import { AbsoluteFill, Audio, Img, staticFile, useCurrentFrame } from "remotion";
import { Defs } from "./Defs";
import { BackFar, Kelp, Particles, Vignette } from "./Background";
import { Octopus, Pose, defaultPose, armGeo } from "./Octopus";
import { Organs } from "./Organs";
import { Heart } from "./Hearts";
import { Captions, UzCaption } from "./Captions";
import { Pill, Star, Txt } from "./Ui";
import { EV, SC, W, beat, c01, hash, inCubic, kf, lerp, outBack, outCubic, outElastic, seg, smooth } from "./util";

const FONTS = `
@font-face{font-family:SGrotesk;font-weight:700;src:url(${staticFile("fonts/space-grotesk-latin-700-normal.woff2")}) format("woff2");}
@font-face{font-family:AntonX;font-weight:400;src:url(${staticFile("fonts/anton-latin-400-normal.woff2")}) format("woff2");}
`;

const tri = (t: number, a: number, d: number) => c01(1 - Math.abs(t - a) / d);        // blink triangle
const BLINKS = [2.3, 5.1, 9.0, 11.6, 15.0, 19.3, 22.7, 26.2, 29.0];

// ------------------------------------------------------------------ octopus placement and acting
const place = (t: number) => ({
  x: kf(t, [[0, 540], [SC.heart, 540], [SC.blood - 0.3, 540], [SC.blood + 0.6, 160], [SC.vocab - 0.4, 160], [SC.vocab + 0.45, 540], [SC.twist - 0.1, 540], [SC.twist + 0.8, 540]]),
  y: kf(t, [[0, 1010], [3.9, 1010], [4.9, 930], [SC.heart, 930], [SC.heart + 0.9, 870], [SC.blood - 0.3, 870], [SC.blood + 0.6, 1100], [SC.vocab - 0.4, 1100], [SC.vocab + 0.45, 1060], [SC.twist - 0.1, 1060], [SC.twist + 0.8, 1135]]),
  s: kf(t, [[0, 1.75], [0.5, 1.5], [3.9, 1.46], [4.9, 1.02], [SC.heart, 1.02], [SC.heart + 0.9, 1.34], [SC.blood - 0.3, 1.34], [SC.blood + 0.6, 0.4], [SC.vocab - 0.4, 0.4], [SC.vocab + 0.45, 0.92], [SC.twist - 0.1, 0.92], [SC.twist + 0.8, 0.88]]),
});

const mouthAt = (t: number): Pose["mouth"] => {
  if (t < 0.25) return "o";
  if (t < EV.broken) return "grin";
  if (t < 4.2) return "worry";
  if (t < EV.have) return "smirk";
  if (t < SC.heart) return "grin";
  if (t < EV.blue - 0.05) return "smile";
  if (t < EV.copper) return "o";
  if (t < SC.vocab) return "smile";
  if (t < EV.mind - 0.15) return "smile";
  if (t < EV.mind + 0.9) return "o";
  if (t < SC.twist) return "grin";
  if (t < EV.which - 0.1) return "grin";
  return "smirk";
};

const poseAt = (t: number): Pose => {
  const blink = BLINKS.reduce((m, b) => Math.max(m, tri(t, b, 0.1)), 0);
  const arms = Array.from({ length: 8 }, (_, i) => 6 + 5 * Math.sin(t * 2 + i));
  const shrug = kf(t, [[3.9, 0], [4.25, 1], [EV.have - 0.1, 1], [EV.have + 0.2, 0]]);
  arms[2] += 55 * shrug; arms[5] += 55 * shrug;
  arms[1] += 20 * shrug; arms[6] += 20 * shrug;
  const cheer = seg(t, EV.have, EV.have + 0.3) * (1 - seg(t, SC.heart - 0.3, SC.heart + 0.3));
  for (let i = 0; i < 8; i++) arms[i] += cheer * (35 + 22 * Math.sin(t * 7 + i * 1.3));
  if (t > SC.heart) for (let i = 0; i < 8; i++) arms[i] *= kf(t, [[SC.heart, 1], [SC.heart + 0.7, 0.15]]);
  // vocab: arms fly up on the "mind-blowing" burst
  const burst = seg(t, EV.mind, EV.mind + 0.18) * (1 - seg(t, EV.mind + 1.6, EV.mind + 2.4));
  if (t >= SC.vocab) for (let i = 0; i < 8; i++) arms[i] = lerp(6 + 5 * Math.sin(t * 2 + i), 70 + 18 * Math.sin(t * 9 + i), burst) + (t > EV.mind + 2.2 ? 10 * Math.sin(t * 5 + i) : 0);
  if (t >= SC.twist) {
    for (let i = 0; i < 8; i++) arms[i] = 8 + 6 * Math.sin(t * 2 + i);
    arms[6] = lerp(8, 98, outCubic(seg(t, W("c7", "you"), W("c7", "you") + 0.55))) * (1 - seg(t, EV.which, EV.which + 0.5) * 0.85);
    arms[5] += 18 * seg(t, EV.which, EV.which + 0.4);
    arms[2] += 18 * seg(t, EV.which, EV.which + 0.4);
  }
  const tilt = t < 4.2 ? kf(t, [[EV.broken, 0], [EV.broken + 0.3, -6]]) : t < EV.have ? Math.sin((t - EV.dont) * 14) * 6 * Math.exp(-(t - EV.dont) * 1.6) * (t > EV.dont ? 1 : 0) : t < SC.vocab ? 0
    : t < EV.mind ? 0 : t < SC.twist ? (t > EV.mind2 ? 4 * Math.sin((t - EV.mind2) * 10) * Math.exp(-(t - EV.mind2) * 1.5) : -3 * Math.exp(-(t - EV.mind) * 1.2)) : kf(t, [[EV.which, 0], [EV.which + 0.4, 8]]);
  const look = (a: number, b: number) => [a, b];
  let [lx, ly] = look(0, 0);
  if (t < 3) [lx, ly] = look(kf(t, [[0.3, -0.5], [0.62, 0], [0.9, 0.5], [1.4, 0.6]]), -0.6);
  else if (t < SC.heart) [lx, ly] = look(0.2 * Math.sin(t * 1.5), kf(t, [[3.9, 0], [6.3, -0.3]]));
  else if (t < SC.blood) [lx, ly] = look(t < EV.third ? Math.sin((t - EV.two) * 3) * 0.6 : 0, t < EV.third ? 0.4 : 0.6);
  else if (t < SC.vocab) [lx, ly] = look(0.9, -0.7);
  else if (t < SC.twist) [lx, ly] = look(0.1 * Math.sin(t * 3), t < EV.mind ? -0.5 : 0);
  else [lx, ly] = look(t < EV.which ? 0.8 : 0.0, t < EV.which ? -0.4 : -0.5);
  const brow = t < 0.3 ? 1 : t < EV.broken ? 0.9 : t < 4.2 ? -0.9 : t < EV.have ? -0.45 : t < SC.heart ? 1 : t < EV.blue ? 0.3 : t < SC.vocab ? 0.6 : t < EV.mind ? 0.5 : t < EV.mind + 1.4 ? 1 : t < EV.which ? 0.7 : 1;
  const eyeScale = t < 0.4 ? 1.12 : t > EV.mind && t < EV.mind + 1.2 ? kf(t, [[EV.mind, 1], [EV.mind + 0.08, 1.38], [EV.mind + 1.2, 1.1]]) : t > EV.blue - 0.05 && t < EV.copper ? 1.12 : 1;
  return { ...defaultPose, blink, lookX: lx, lookY: ly, brow, mouth: mouthAt(t), arms, tilt, xray: seg(t, SC.heart, SC.heart + 0.95) * (1 - seg(t, SC.blood - 0.1, SC.blood + 0.5)), eyeScale: eyeScale * (1 - 0.1 * seg(t, SC.heart, SC.heart + 0.9) * (1 - seg(t, SC.blood, SC.blood + 0.4))), curlBoost: burst * 0.6, wave: 1 + burst };
};

// ------------------------------------------------------------------ camera
const camAt = (t: number) => {
  const punch = (t0: number, amt: number, dur = 0.5) => amt * Math.exp(-(t - t0) * (4 / dur)) * (t >= t0 ? 1 : 0);
  const shake = (t0: number, amt: number) => (t >= t0 ? amt * Math.exp(-(t - t0) * 7) : 0);
  const z = 1 + punch(0.08, 0.12) + punch(EV.broken, 0.05, 0.3) + punch(EV.blue, 0.06, 0.4) + punch(EV.mind, 0.12, 0.5) + punch(EV.which, 0.04, 0.4)
    + kf(t, [[3.9, 0.06], [4.9, 0], [SC.heart, 0], [SC.blood, 0.05], [SC.vocab, 0.0], [SC.twist, 0], [30, 0.07]]);
  const x = Math.sin(t * 0.7) * 6 + shake(0.1, 14) * Math.sin(t * 90) + shake(EV.mind, 22) * Math.sin(t * 80) + shake(EV.broken, 10) * Math.sin(t * 70);
  const y = Math.cos(t * 0.6) * 6 + shake(0.1, 14) * Math.cos(t * 83) + shake(EV.mind, 22) * Math.cos(t * 77);
  const rot = Math.sin(t * 0.4) * 0.5 + shake(EV.mind, 1.4) * Math.sin(t * 60);
  return { z, x, y, rot };
};
const camStyle = (c: { z: number; x: number; y: number; rot: number }, d: number): React.CSSProperties => ({
  position: "absolute", inset: 0, transformOrigin: "50% 50%", transform: `translate(${c.x * d}px, ${c.y * d}px) scale(${1 + (c.z - 1) * d}) rotate(${c.rot * d}deg)`,
});

// ------------------------------------------------------------------ overlays (screen space)
const HookHearts: React.FC<{ t: number }> = ({ t }) => {
  if (t > SC.heart + 0.5) return null;
  const A = [[215, 735, 190], [540, 615, 235], [865, 735, 190]];
  const B = [[300, 470, 140], [540, 470, 150], [780, 470, 140]];
  const times = [EV.h1, EV.h2, EV.h3];
  const lit = [EV.have, EV.three2, EV.hearts2];
  const toB = smooth(seg(t, 3.92, 4.75));
  const toBody = smooth(seg(t, SC.heart - 0.25, SC.heart + 0.45));
  return (
    <g>
      {A.map(([ax, ay, as], i) => {
        const pop = outElastic(seg(t, times[i], times[i] + 0.55));
        const inB = t > 3.9;
        const x = lerp(lerp(ax, B[i][0], toB), 540, toBody);
        const y = lerp(lerp(ay, B[i][1], toB), 860, toBody) + Math.sin(t * 2.4 + i * 2) * 7 * (1 - toBody);
        const size = lerp(lerp(as, B[i][2], toB), 40, toBody) * pop;
        const l = inB ? c01((t - lit[i]) / 0.3) : 1;
        const glow = inB ? 0.2 + 0.8 * l : 1;
        const crackIn = i === 2 ? seg(t, EV.broken, EV.broken + 0.35) : 0;
        const heal = i === 2 ? seg(t, EV.hearts2 - 0.15, EV.hearts2 + 0.3) : 0;
        const bump = inB && t > lit[i] ? Math.exp(-(t - lit[i]) * 6) * 0.35 : 0;
        return (
          <g key={i} opacity={(inB ? 0.55 + 0.45 * l : 1) * (1 - toBody)}>
            <Heart x={x} y={y} size={size} glow={glow} pulse={beat(t, i * 0.04) * (inB ? l : 1) + bump} crack={crackIn * (1 - heal)} id={`ah${i}`} rot={i === 0 ? -8 : i === 2 ? 8 : 0} />
            {inB && t > lit[i] - 0.05 && toBody < 0.5 && (
              <g transform={`translate(${x} ${y + 105}) scale(${outBack(c01((t - lit[i]) / 0.3))})`}>
                <circle r="34" fill="#FFD84D" stroke="#fff" strokeWidth="5" /><text y="15" textAnchor="middle" fontFamily="AntonX" fontSize="46" fill="#0A1442">{i + 1}</text>
              </g>
            )}
          </g>
        );
      })}
      {[EV.h1, EV.h2, EV.h3].map((tt, i) => (t > tt && t < tt + 0.5 ? <Star key={i} x={A[i][0] + 70} y={A[i][1] - 80} r={40 * Math.sin(((t - tt) / 0.5) * Math.PI)} rot={t * 120} opacity={0.9} /> : null))}
      {t > EV.hearts2 && t < EV.hearts2 + 0.7 && <Star x={780 + 40} y={470 - 60} r={46 * Math.sin(((t - EV.hearts2) / 0.7) * Math.PI)} rot={t * 90} fill="#FFF3A8" />}
    </g>
  );
};

const HookTitle: React.FC<{ t: number }> = ({ t }) => {
  if (t < 0.08 || t > 3.9) return null;
  const s = lerp(2.2, 1, outBack(seg(t, 0.1, 0.45)));
  const out = seg(t, 3.5, 3.85);
  const jx = Math.sin(t * 70) * 6 * Math.exp(-(t - 0.1) * 6);
  return <Txt x={540 + jx} y={430 - 140 * inCubic(out)} size={206} fill="url(#titleG)" stroke="#1A0A4A" sw={16} scale={s} opacity={1 - out} glow="rgba(255,90,170,0.9)">3 HEARTS?!</Txt>;
};

const ScanFx: React.FC<{ t: number }> = ({ t }) => {
  const p = seg(t, EV.scan, EV.scan + 0.95);
  if (p <= 0 || p >= 1) return null;
  const y = lerp(520, 1280, p);
  return (
    <g>
      <rect x="0" y={y - 60} width="1080" height="60" fill="url(#scanG)" opacity="0.8" />
      <rect x="0" y={y - 3} width="1080" height="6" fill="#B8FBFF" style={{ filter: "drop-shadow(0 0 16px #31D8FF)" }} />
      <defs><linearGradient id="scanG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#31D8FF" stopOpacity="0" /><stop offset="1" stopColor="#31D8FF" stopOpacity="0.45" /></linearGradient></defs>
    </g>
  );
};

const HeartLabels: React.FC<{ t: number; oc: { x: number; y: number; s: number } }> = ({ t, oc }) => {
  if (t < EV.two - 0.1 || t > SC.blood - 0.1) return null;
  const a = outBack(seg(t, EV.two - 0.05, EV.two + 0.25)), b = outBack(seg(t, EV.third - 0.05, EV.third + 0.25));
  const out = 1 - seg(t, SC.blood - 0.4, SC.blood - 0.1);
  const L = (lx: number, ly: number) => [oc.x + oc.s * lx, oc.y + oc.s * ly];
  const [g1x, g1y] = L(-118, 134), [g2x, g2y] = L(118, 134), [bx, by] = L(0, 58);
  return (
    <g opacity={out}>
      <g opacity={a * (t > EV.third ? 0.6 : 1)}>
        <path d={`M470 592 L${g1x} ${g1y - 52}`} stroke="#fff" strokeWidth="4" strokeDasharray="4 10" strokeLinecap="round" opacity="0.8" />
        <path d={`M610 592 L${g2x} ${g2y - 52}`} stroke="#fff" strokeWidth="4" strokeDasharray="4 10" strokeLinecap="round" opacity="0.8" />
        <Pill x={540} y={545} w={560} fill="#FF7BA9" text="GILL HEARTS" badge="2" scale={a} size={44} />
      </g>
      <g opacity={b}>
        <path d={`M540 1190 L${bx} ${by + 58}`} stroke="#fff" strokeWidth="4" strokeDasharray="4 10" strokeLinecap="round" opacity="0.8" />
        <Pill x={540} y={1232} w={560} fill="#FFD84D" text="BODY HEART" badge="1" scale={b} size={44} />
      </g>
      <Txt x={540} y={1300} size={30} font="sg" sw={0} fill="#BEE9FF" opacity={0.75 * a}>simplified diagram</Txt>
    </g>
  );
};

const BloodScene: React.FC<{ t: number }> = ({ t }) => {
  if (t < SC.blood - 0.1 || t > SC.vocab + 0.2) return null;
  const qIn = seg(t, EV.blood - 0.08, EV.blood + 0.28), qOut = seg(t, EV.blue - 0.04, EV.blue + 0.12);
  const flash = t > EV.blue ? Math.exp(-(t - EV.blue) * 6) : 0;
  const dropIn = outElastic(seg(t, EV.blue, EV.blue + 0.7));
  const toTop = smooth(seg(t, EV.copper - 0.15, EV.copper + 0.45));
  const wob = Math.sin(t * 6) * 0.03;
  const dx = 540, dy = lerp(690, 455, toTop), ds = lerp(1, 0.5, toTop);
  const molIn = outBack(seg(t, EV.copper + 0.05, EV.copper + 0.6));
  const ironIn = outBack(seg(t, EV.iron - 0.05, EV.iron + 0.3)), ironOut = seg(t, EV.iron + 0.95, EV.iron + 1.2);
  const xDraw = seg(t, EV.iron + 0.4, EV.iron + 0.65);
  const oxy = seg(t, EV.oxygen, EV.oxygen + 0.75);
  const docked = seg(t, EV.oxygen + 0.7, EV.oxygen + 1.0);
  const spot = seg(t, SC.blood - 0.1, SC.blood + 0.5);
  const out = 1 - seg(t, SC.vocab - 0.25, SC.vocab + 0.1);
  const cu = (x: number, k: number) => (
    <g transform={`translate(${x} 860) scale(${molIn})`} style={{ filter: `drop-shadow(0 0 ${12 + 14 * docked}px rgba(255,150,80,0.9))` }}>
      <circle r="66" fill="url(#cuG)" stroke="#fff" strokeWidth="4" />
      <text y="17" textAnchor="middle" fontFamily="AntonX" fontSize="52" fill="#3B1A08">Cu</text>
      <ellipse cx="-22" cy="-30" rx="16" ry="9" fill="#fff" opacity="0.55" transform="rotate(-30 -22 -30)" />
    </g>
  );
  const o2x = lerp(60, 560, outCubic(oxy)), o2y = lerp(520, 858, outCubic(oxy)) + Math.sin(oxy * 9) * 14 * (1 - oxy);
  return (
    <g opacity={out * spot}>
      <circle cx="540" cy="760" r="520" fill="url(#spotG)" opacity={0.6} />
      <defs><radialGradient id="spotG"><stop offset="0" stopColor="#3A7BFF" stopOpacity="0.38" /><stop offset="1" stopColor="#3A7BFF" stopOpacity="0" /></radialGradient></defs>
      {qIn > 0 && qOut < 1 && (
        <g opacity={1 - qOut} transform={`translate(540 ${700 + Math.sin(t * 40) * 3 * (t > EV.blood + 0.3 ? 1 : 0)}) scale(${lerp(2.6, 1, outCubic(qIn)) * (1 - 0.6 * qOut)}) rotate(${qOut * 25})`}>
          <text textAnchor="middle" y="230" fontFamily="AntonX" fontSize="640" fill="#FF2D4A" stroke="#4A0A18" strokeWidth="18" paintOrder="stroke fill" style={{ filter: "drop-shadow(0 0 34px rgba(255,45,74,0.9))" }}>?</text>
        </g>
      )}
      {flash > 0.01 && <circle cx="540" cy="690" r={200 + 900 * (1 - flash)} fill="#fff" opacity={flash * 0.7} />}
      {t > EV.blue && (
        <g transform={`translate(${dx} ${dy}) scale(${ds * dropIn * (1 + wob)} ${ds * dropIn * (1 - wob)})`} style={{ filter: "drop-shadow(0 0 40px rgba(60,150,255,0.95))" }}>
          <path d="M0 -250 C80 -110 190 -40 190 70 C190 185 110 255 0 255 C-110 255 -190 185 -190 70 C-190 -40 -80 -110 0 -250Z" fill="url(#dropG)" stroke="#CFF8FF" strokeWidth="8" />
          <path d="M-98 38 C-102 110 -72 160 -22 188" stroke="#fff" strokeWidth="18" strokeLinecap="round" fill="none" opacity="0.7" />
          <circle cx="-62" cy="-8" r="14" fill="#fff" opacity="0.8" />
        </g>
      )}
      {t > EV.blue && t < EV.blue + 1.1 && [0, 0.22].map((d, i) => { const p = seg(t, EV.blue + d, EV.blue + d + 0.9); return p > 0 && p < 1 ? <ellipse key={i} cx="540" cy="900" rx={160 + 380 * p} ry={30 + 80 * p} fill="none" stroke="#9FE9FF" strokeWidth="6" opacity={1 - p} /> : null; })}
      {t > EV.blue + 0.3 && t < EV.copper + 0.2 && <Pill x={620} y={1050} w={520} fill="#5FB8FF" text="OCTOPUS BLOOD" size={42} scale={outBack(seg(t, EV.blue + 0.3, EV.blue + 0.6)) * (1 - toTop)} />}
      {molIn > 0.01 && (
        <g>
          <g transform={`translate(560 860) scale(${molIn})`}>
            <path d={`M-340 0 C-340 -150 -200 -210 0 -205 C220 -210 340 -140 340 0 C340 150 210 205 0 200 C-200 210 -340 150 -340 0Z`} fill="url(#protG)" stroke="#CFF8FF" strokeWidth="6" opacity={0.8 + 0.2 * docked} style={{ filter: `drop-shadow(0 0 ${20 + 40 * docked}px rgba(70,160,255,0.9))` }} />
            {Array.from({ length: 5 }, (_, i) => <path key={i} d={`M${-260 + i * 120} ${-120 + (i % 2) * 40} q60 ${30 - (i % 3) * 30} 110 ${(i % 2) * 20}`} stroke="#fff" strokeOpacity="0.25" strokeWidth="6" fill="none" />)}
          </g>
          {cu(470, 0)}{cu(650, 1)}
          <Pill x={620} y={1115} w={420} fill="#F2994A" text="COPPER" size={46} scale={outBack(seg(t, EV.copper + 0.15, EV.copper + 0.45))} />
          <Txt x={620} y={1185} size={28} font="sg" sw={0} fill="#BEE9FF" opacity={0.85 * molIn}>hemocyanin: the blue oxygen carrier</Txt>
        </g>
      )}
      {ironIn > 0.01 && (
        <g opacity={1 - ironOut} transform={`translate(880 520) scale(${ironIn * (1 - 0.3 * ironOut)})`}>
          <circle r="70" fill="url(#feG)" stroke="#fff" strokeWidth="4" style={{ filter: "drop-shadow(0 0 16px rgba(255,70,60,0.8))" }} />
          <text y="18" textAnchor="middle" fontFamily="AntonX" fontSize="58" fill="#fff">Fe</text>
          <path d="M-86 -86 L86 86 M86 -86 L-86 86" stroke="#fff" strokeWidth="14" strokeLinecap="round" strokeDasharray="250" strokeDashoffset={250 * (1 - xDraw)} style={{ filter: "drop-shadow(0 0 8px #000)" }} />
          <Pill x={0} y={118} w={300} h={60} fill="#FF8A8A" text="IRON = RED" size={32} />
        </g>
      )}
      {oxy > 0 && (
        <g transform={`translate(${docked > 0 ? 560 : o2x} ${docked > 0 ? 858 : o2y})`} style={{ filter: "drop-shadow(0 0 14px rgba(255,150,150,0.9))" }}>
          <circle cx="-26" r="26" fill="url(#o2G)" stroke="#fff" strokeWidth="3" /><circle cx="26" r="26" fill="url(#o2G)" stroke="#fff" strokeWidth="3" />
          <rect x="-12" y="-6" width="24" height="12" fill="#FF8A8A" />
          <Txt x={0} y={-48} size={34} font="sg" sw={5} fill="#fff">O₂</Txt>
        </g>
      )}
      {docked > 0 && docked < 1 && <circle cx="560" cy="860" r={90 + 260 * docked} fill="none" stroke="#9FE9FF" strokeWidth="8" opacity={1 - docked} />}
      {Array.from({ length: 6 }, (_, i) => t > EV.oxygen ? <Star key={i} x={560 + Math.cos(i * 1.05 + t) * (300 + 20 * Math.sin(t * 3 + i))} y={860 + Math.sin(i * 1.05 + t) * (190 + 14 * i)} r={14 + 8 * hash(i)} rot={t * 60} fill="#CFF8FF" opacity={0.4 + 0.5 * Math.abs(Math.sin(t * 4 + i))} /> : null)}
    </g>
  );
};

const VocabScene: React.FC<{ t: number }> = ({ t }) => {
  if (t < SC.vocab - 0.1 || t > SC.twist + 0.3) return null;
  const out = 1 - seg(t, SC.twist - 0.25, SC.twist + 0.2);
  const w = (sub: string, n = 0) => W("c5", sub, n);
  // recap icons while "Three hearts, blue blood?" is spoken
  const rIn = [w("three"), w("hearts"), w("blue"), w("blood")];
  const rOut = 1 - seg(t, EV.mind - 0.3, EV.mind - 0.05);
  const mind = t - EV.mind;
  const letters = (txt: string, y: number, delay: number) => txt.split("").map((ch, i) => {
    const p = outBack(seg(t, EV.mind + delay + i * 0.035, EV.mind + delay + i * 0.035 + 0.26));
    const wob = Math.sin(t * 6 + i) * 3;
    return <Txt key={`${txt}${i}`} x={540 + (i - (txt.length - 1) / 2) * (txt === "MIND-" ? 130 : 108)} y={y + wob} size={txt === "MIND-" ? 220 : 196} fill="url(#vocabG)" stroke="#2A0A5A" sw={16} scale={p} glow="rgba(255,120,190,0.85)" rot={Math.sin(i * 2.1) * 4}>{ch}</Txt>;
  });
  const shrink = smooth(seg(t, EV.extremely - 0.15, EV.extremely + 0.4));
  const cardIn = outBack(seg(t, EV.extremely - 0.05, EV.extremely + 0.35)) * (1 - seg(t, EV.mind2 - 0.3, EV.mind2 - 0.05));
  const exIn = outBack(seg(t, EV.mind2 - 0.05, EV.mind2 + 0.35));
  const hl = seg(t, EV.extremely, EV.extremely + 0.9);
  return (
    <g opacity={out}>
      <g opacity={rOut}>
        {[0, 1, 2].map((i) => <Heart key={i} x={190 + i * 150} y={520} size={128 * outElastic(seg(t, rIn[Math.min(i, 1)] + i * 0.12 * (i === 2 ? 1 : 0), rIn[Math.min(i, 1)] + 0.55 + i * 0.12))} glow={0.9} pulse={beat(t, i * 0.05)} id={`rh${i}`} />)}
        <Txt x={660} y={548} size={110} sw={9} opacity={seg(t, rIn[2] - 0.1, rIn[2] + 0.15)}>+</Txt>
        <g transform={`translate(820 520) scale(${0.46 * outElastic(seg(t, rIn[2], rIn[2] + 0.6))})`} style={{ filter: "drop-shadow(0 0 24px rgba(60,150,255,0.9))" }}>
          <path d="M0 -250 C80 -110 190 -40 190 70 C190 185 110 255 0 255 C-110 255 -190 185 -190 70 C-190 -40 -80 -110 0 -250Z" fill="url(#dropG)" stroke="#CFF8FF" strokeWidth="10" />
        </g>
      </g>
      {mind > -0.02 && (
        <g>
          {mind < 0.7 && <circle cx="540" cy="860" r={80 + 1100 * seg(t, EV.mind, EV.mind + 0.5)} fill="#fff" opacity={0.75 * (1 - seg(t, EV.mind, EV.mind + 0.5))} />}
          {mind < 1.8 && Array.from({ length: 14 }, (_, i) => {
            const a = (i / 14) * Math.PI * 2, p = outCubic(seg(t, EV.mind, EV.mind + 0.9)), fade = 1 - seg(t, EV.mind + 0.5, EV.mind + 1.7);
            return <g key={i} opacity={fade}><Star x={540 + Math.cos(a) * (120 + 420 * p)} y={860 + Math.sin(a) * (100 + 330 * p)} r={(22 + 22 * hash(i)) * (1 - 0.4 * p)} rot={t * 140 + i * 30} fill={["#FFF07A", "#FF7AB6", "#7AF0FF", "#fff"][i % 4]} /></g>;
          })}
          {mind < 1.2 && [0, 0.14].map((d, i) => { const p = seg(t, EV.mind + d, EV.mind + d + 0.8); return p > 0 && p < 1 ? <circle key={i} cx="540" cy="860" r={90 + 520 * p} fill="none" stroke="#FFE766" strokeWidth={14 * (1 - p)} opacity={0.9 - p * 0.9} /> : null; })}
          <g transform={`translate(0 ${-25 * shrink})`}>
            <g transform={`translate(540 495) scale(${lerp(1, 0.6, shrink)}) translate(-540 -495)`}>{letters("MIND-", 440, 0.02)}{letters("BLOWING", 640, 0.2)}</g>
          </g>
          {cardIn > 0.01 && (
            <g transform={`translate(540 705) scale(${cardIn})`}>
              <rect x="-470" y="-60" width="940" height="140" rx="40" fill="#04112E" opacity="0.5" transform="translate(0 8)" />
              <rect x="-470" y="-70" width="940" height="140" rx="40" fill="#fff" stroke="#FFE766" strokeWidth="6" />
              <rect x="-470" y="-70" width="190" height="52" rx="26" fill="#6A1FB5" /><text x="-375" y="-33" textAnchor="middle" fontFamily="SGrotesk" fontWeight="700" fontSize="30" fill="#fff">ADJECTIVE</text>
              <text x="0" y="40" textAnchor="middle" fontFamily="SGrotesk" fontWeight="700" fontSize="52" fill="#1A0A4A">= <tspan fill="#D4156F">extremely surprising</tspan> or amazing</text>
              <rect x="-310" y="52" width={620 * hl} height="8" rx="4" fill="#FFD84D" opacity="0.9" />
            </g>
          )}
          {exIn > 0.01 && (
            <g transform={`translate(540 705) scale(${exIn})`}>
              <rect x="-470" y="-60" width="940" height="140" rx="40" fill="#04112E" opacity="0.5" transform="translate(0 8)" />
              <rect x="-470" y="-70" width="940" height="140" rx="40" fill="#fff" stroke="#FF7AB6" strokeWidth="6" />
              <rect x="-470" y="-70" width="190" height="52" rx="26" fill="#D4156F" /><text x="-375" y="-33" textAnchor="middle" fontFamily="SGrotesk" fontWeight="700" fontSize="30" fill="#fff">EXAMPLE</text>
              <text x="-30" y="40" textAnchor="middle" fontFamily="SGrotesk" fontWeight="700" fontSize="54" fill="#1A0A4A">A <tspan fill="#D4156F">mind-blowing</tspan> fact!</text>
              <text x="400" y={36 - 14 * Math.abs(Math.sin((t - EV.mind2) * 7)) * Math.exp(-(t - EV.mind2))} textAnchor="middle" fontSize="84">🤯</text>
            </g>
          )}
        </g>
      )}
    </g>
  );
};

const TwistScene: React.FC<{ t: number; oc: { x: number; y: number; s: number }; pose: Pose }> = ({ t, oc, pose }) => {
  if (t < SC.twist - 0.1) return null;
  const you = W("c7", "you"), itself = 1;
  const tip = armGeo(6, t, pose).pts.slice(-1)[0];
  const hx = oc.x + oc.s * tip.x + 10, hy = oc.y + oc.s * tip.y - 70;
  const held = outElastic(seg(t, EV.myheart - 0.05, EV.myheart + 0.5));
  const toRow = smooth(seg(t, EV.which - 0.05, EV.which + 0.55));
  const bubble = outBack(seg(t, you - 0.05, you + 0.3)) * (1 - seg(t, EV.which - 0.1, EV.which + 0.15));
  const ROW = [[290, 470], [540, 440], [790, 470]];
  const hearts: { x: number; y: number; s: number; i: number }[] = [
    { x: lerp(hx, ROW[1][0], toRow), y: lerp(hy, ROW[1][1], toRow), s: lerp(120, 170, toRow) * held, i: 1 },
  ];
  const side = (i: number) => {
    const p = outElastic(seg(t, EV.which + 0.08 * (i === 0 ? 0 : 1), EV.which + 0.65 + 0.08 * (i === 0 ? 0 : 1)));
    const k = outCubic(seg(t, EV.which, EV.which + 0.5));
    return { x: lerp(oc.x, ROW[i][0], k), y: lerp(oc.y - 160, ROW[i][1], k), s: 170 * p, i };
  };
  hearts.push(side(0), side(2));
  const q = outBack(seg(t, EV.which + 0.2, EV.which + 0.55));
  const sw = Math.sin((t - EV.which) * 9);
  const endP = seg(t, 28.4, 29.8);
  return (
    <g>
      {bubble > 0.01 && (
        <g transform={`translate(${Math.min(hx, 760)} ${hy - 150}) scale(${bubble})`}>
          <path d="M-250 -62 h500 a46 46 0 0 1 46 46 v50 a46 46 0 0 1 -46 46 h-330 l-60 70 l12 -70 h-122 a46 46 0 0 1 -46 -46 v-50 a46 46 0 0 1 46 -46z" transform="translate(0 6)" fill="#04112E" opacity="0.45" />
          <path d="M-250 -62 h500 a46 46 0 0 1 46 46 v50 a46 46 0 0 1 -46 46 h-330 l-60 70 l12 -70 h-122 a46 46 0 0 1 -46 -46 v-50 a46 46 0 0 1 46 -46z" fill="#fff" stroke="#FF7AB6" strokeWidth="6" />
          <text x="0" y="22" textAnchor="middle" fontFamily="SGrotesk" fontWeight="700" fontSize="50" fill="#1A0A4A">“You have my heart…”</text>
        </g>
      )}
      {hearts.map((h) => h.s > 1 && <g key={h.i}>
        <Heart x={h.x} y={h.y} size={h.s} glow={0.85 + 0.15 * endP} pulse={t > EV.which ? beat(t - EV.which, h.i * 0.0) * 1.1 : beat(t)} id={`th${h.i}`} rot={h.i === 1 ? Math.sin(t * 3) * 5 : 0} />
        {t > EV.which + 0.4 && <g transform={`translate(${h.x} ${h.y + 118}) scale(${outBack(seg(t, EV.which + 0.35 + h.i * 0.06, EV.which + 0.65 + h.i * 0.06))})`}><circle r="34" fill="#FFD84D" stroke="#fff" strokeWidth="5" /><text y="15" textAnchor="middle" fontFamily="AntonX" fontSize="46" fill="#0A1442">{h.i + 1}</text></g>}
      </g>)}
      {q > 0.01 && <Txt x={540} y={815} size={176} fill="url(#vocabG)" stroke="#2A0A5A" sw={16} scale={q * (1 + 0.04 * sw)} rot={sw * 2.5} glow="rgba(255,150,200,0.8)">WHICH ONE?</Txt>}
      {t > EV.which + 0.6 && Array.from({ length: 5 }, (_, i) => <Star key={i} x={150 + i * 200 + Math.sin(t * 2 + i) * 30} y={300 + (i % 2) * 90 + Math.cos(t * 3 + i) * 16} r={16 + 10 * hash(i + 2)} rot={t * 80 + i * 40} fill="#FFF3A8" opacity={0.35 + 0.5 * Math.abs(Math.sin(t * 3 + i))} />)}
      <g opacity={0} />{itself ? null : null}
    </g>
  );
};

// ------------------------------------------------------------------ episode
export const Episode: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  const cam = camAt(t);
  const oc = place(t);
  const bob = Math.sin(t * 1.9) * 9 * (t > SC.blood && t < SC.vocab ? 0.5 : 1);
  const pose = poseAt(t);
  const squash = 1 + 0.012 * beat(t);
  const flashA = EV.broken < t && t < EV.broken + 0.2 ? 0.0 : 0;
  return (
    <AbsoluteFill style={{ background: "#031225", overflow: "hidden" }}>
      <style>{FONTS}</style>
      <Defs />
      <div style={camStyle(cam, 0.3)}><BackFar t={t} /></div>
      <div style={camStyle(cam, 0.5)}><Particles t={t} depth="far" /></div>
      <div style={camStyle(cam, 1)}>
        <svg width="1080" height="1920" viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0 }}>
          <g transform={`translate(${oc.x} ${oc.y + bob}) scale(${oc.s * squash} ${oc.s / squash})`} style={{ filter: "drop-shadow(0 30px 40px rgba(0,10,40,0.45))" }}>
            <Octopus t={t} pose={pose}><Organs t={t} show={pose.xray} /></Octopus>
          </g>
          <ScanFx t={t} />
          <HookHearts t={t} />
          <HookTitle t={t} />
          <HeartLabels t={t} oc={{ x: oc.x, y: oc.y + bob, s: oc.s }} />
          <BloodScene t={t} />
          <VocabScene t={t} />
          <TwistScene t={t} oc={{ x: oc.x, y: oc.y + bob, s: oc.s * squash }} pose={pose} />
        </svg>
      </div>
      <div style={camStyle(cam, 1.5)}><Particles t={t} depth="near" /><Kelp t={t} /></div>
      <Vignette />
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 640, background: "linear-gradient(transparent, rgba(2,8,30,0.62))" }} />
      {t > 4.2 && <div style={{ position: "absolute", top: 262, left: 0, right: 0, textAlign: "center", fontFamily: "SGrotesk", fontWeight: 700, fontSize: 30, letterSpacing: 6, color: "#fff", opacity: 0.6 * seg(t, 4.2, 4.8) * (1 - seg(t, EV.mind - 0.3, EV.mind - 0.1) + seg(t, SC.twist, SC.twist + 0.4)) }}>ENGLISH IN 30 SECONDS  ·  EP. 1</div>}
      {/* school watermark, top right, the whole video */}
      <Img src={staticFile("logo-watermark.png")} style={{ position: "absolute", top: 104, right: 44, width: 252, opacity: 0.85, filter: "drop-shadow(0 2px 6px rgba(0,8,30,0.7))" }} />
      <Captions t={t} />
      <UzCaption t={t} />
      {flashA > 0 && <AbsoluteFill style={{ background: "#fff", opacity: flashA }} />}
      <Audio src={staticFile("audio/mix.wav")} />
    </AbsoluteFill>
  );
};
