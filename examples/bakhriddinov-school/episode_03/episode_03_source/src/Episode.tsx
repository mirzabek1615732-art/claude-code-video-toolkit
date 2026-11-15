import React from "react";
import { AbsoluteFill, Audio, Img, staticFile, useCurrentFrame } from "remotion";
import { Earth, Snail, Student, Sun, Venus, Waiter } from "./Cast";
import { EV, SC, UZ, c01, hash, inOut, kf, lerp, outBack, outCubic, outElastic, seg, smooth, tri } from "./util";

const FONTS = `
@font-face{font-family:Lilita;src:url(${staticFile("fonts/lilita-one-latin-400-normal.woff2")}) format("woff2");unicode-range:U+0000-00FF,U+2000-206F;}
@font-face{font-family:Lilita;src:url(${staticFile("fonts/lilita-one-latin-ext-400-normal.woff2")}) format("woff2");unicode-range:U+0100-02FF,U+1E00-1EFF;}
@font-face{font-family:NunitoX;font-weight:900;src:url(${staticFile("fonts/nunito-latin-900-normal.woff2")}) format("woff2");unicode-range:U+0000-00FF,U+2000-206F;}
@font-face{font-family:NunitoX;font-weight:900;src:url(${staticFile("fonts/nunito-latin-ext-800-normal.woff2")}) format("woff2");unicode-range:U+0100-02FF,U+1E00-1EFF;}
@font-face{font-family:NunitoX;font-weight:800;src:url(${staticFile("fonts/nunito-latin-800-normal.woff2")}) format("woff2");}
`;

const Defs: React.FC = () => (
  <svg width="0" height="0" style={{ position: "absolute" }}>
    <defs>
      <radialGradient id="venusG" cx="0.38" cy="0.32" r="0.75"><stop offset="0" stopColor="#FFE9A6" /><stop offset="0.45" stopColor="#F7A94A" /><stop offset="1" stopColor="#B4521C" /></radialGradient>
      <radialGradient id="venusHalo"><stop offset="0.75" stopColor="#FFB45E" stopOpacity="0.55" /><stop offset="1" stopColor="#FFB45E" stopOpacity="0" /></radialGradient>
      <radialGradient id="venusShade" cx="0.5" cy="0.5" r="0.5"><stop offset="0.55" stopColor="#2A0F40" stopOpacity="0" /><stop offset="1" stopColor="#2A0F40" stopOpacity="0.55" /></radialGradient>
      <radialGradient id="sunG" cx="0.42" cy="0.38" r="0.7"><stop offset="0" stopColor="#FFFBE6" /><stop offset="0.5" stopColor="#FFD45E" /><stop offset="1" stopColor="#FF8A2B" /></radialGradient>
      <radialGradient id="sunHalo"><stop offset="0.3" stopColor="#FFB84D" stopOpacity="0.5" /><stop offset="1" stopColor="#FF7A2B" stopOpacity="0" /></radialGradient>
      <linearGradient id="slugG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#C9B8FF" /><stop offset="1" stopColor="#7E6BE0" /></linearGradient>
      <radialGradient id="helmetG" cx="0.35" cy="0.3" r="0.8"><stop offset="0" stopColor="#E6F4FF" stopOpacity="0.35" /><stop offset="1" stopColor="#8FD3FF" stopOpacity="0.12" /></radialGradient>
      <linearGradient id="goldT" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#FFF1A8" /><stop offset="0.5" stopColor="#FFC24D" /><stop offset="1" stopColor="#FF8A2B" /></linearGradient>
      <linearGradient id="dawnG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#2A1F7A" /><stop offset="0.7" stopColor="#B04A9A" /><stop offset="1" stopColor="#FF9A6B" /></linearGradient>
      <linearGradient id="ringG" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#FFE07A" /><stop offset="1" stopColor="#FF7A2B" /></linearGradient>
    </defs>
  </svg>
);

const Svg: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <svg width="1080" height="1920" viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0, overflow: "visible", ...style }}>{children}</svg>
);
const T: React.FC<{ x: number; y: number; size: number; children: React.ReactNode; fill?: string; stroke?: string; sw?: number; rot?: number; scale?: number; opacity?: number; font?: "lilita" | "nunito" }> = ({ x, y, size, children, fill = "#fff", stroke = "#2A0F55", sw = 14, rot = 0, scale = 1, opacity = 1, font = "lilita" }) => (
  <text transform={`translate(${x} ${y}) rotate(${rot}) scale(${scale})`} textAnchor="middle" fontFamily={font === "lilita" ? "Lilita" : "NunitoX"} fontWeight={font === "lilita" ? 400 : 900} fontSize={size} fill={fill} stroke={stroke} strokeWidth={sw} strokeLinejoin="round" paintOrder="stroke fill" opacity={opacity} style={{ filter: "drop-shadow(0 8px 0 rgba(20,6,50,0.45))" }}>{children}</text>
);
const Note: React.FC<{ y: number; text: string; o: number }> = ({ y, text, o }) => (
  <text x="540" y={y} textAnchor="middle" fontFamily="NunitoX" fontWeight={800} fontSize="30" fill="#E6DEFF" opacity={0.75 * o}>{text}</text>
);

// ---------------------------------------------------------------- space backdrop with parallax stars and drifting nebula
const Space: React.FC<{ t: number; hue?: number; px?: number }> = ({ t, hue = 0, px = 0 }) => (
  <AbsoluteFill>
    <div style={{ position: "absolute", inset: 0, background: `linear-gradient(${hue > 0.5 ? "#2A0F55" : "#0B0A2E"}, #1A0B45 55%, #120830)` }} />
    <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse 55% 30% at ${30 + Math.sin(t * 0.3) * 6}% ${30 + px * 0.01}%, rgba(170,70,255,0.35), transparent 70%), radial-gradient(ellipse 50% 28% at ${72 + Math.cos(t * 0.25) * 6}% 70%, rgba(40,180,255,0.22), transparent 70%), radial-gradient(ellipse 40% 22% at 60% 20%, rgba(255,120,190,${0.14 + 0.1 * hue}), transparent 70%)` }} />
    <Svg>
      {[0, 1, 2].map((layer) => Array.from({ length: 40 - layer * 10 }, (_, i) => {
        const k = i + layer * 100, d = 0.2 + layer * 0.35;
        const x = ((hash(k) * 1300 + px * d - t * 6 * d) % 1300 + 1300) % 1300 - 110, y = hash(k + 1) * 1920;
        return <circle key={k} cx={x} cy={y} r={0.8 + layer * 1.1 + hash(k + 2)} fill="#fff" opacity={(0.35 + 0.5 * Math.abs(Math.sin(t * (1 + hash(k)) + k))) * (0.5 + layer * 0.25)} />;
      }))}
    </Svg>
  </AbsoluteFill>
);

// ================================================================= 1. HOOK: the student who cannot wake up
const Hook: React.FC<{ t: number }> = ({ t }) => {
  const ringA = t < 0.35, ringB = t > 1.95 && t < 2.28;
  const shake = ringA || ringB ? Math.sin(t * 90) * 7 : 0;
  const reach = kf(t, [[0.45, 0], [2.1, 0.55]], (x) => x);
  const rise = outCubic(seg(t, EV.meet - 0.35, EV.venus2 + 0.35));
  const shock = outBack(seg(t, EV.meet - 0.05, EV.meet + 0.25));
  const glow = rise;
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(#241A5C, #3B2A7A 60%, #2A1F66)" }} />
      <Svg>
        {Array.from({ length: 30 }, (_, i) => <circle key={i} cx={hash(i) * 1080} cy={hash(i + 1) * 1000} r="3" fill="#8E7CF0" opacity="0.35" />)}
        <g>
          <clipPath id="win"><rect x="270" y="330" width="540" height="470" rx="20" /></clipPath>
          <rect x="270" y="330" width="540" height="470" rx="20" fill="url(#dawnG)" />
          <g clipPath="url(#win)">
            {Array.from({ length: 18 }, (_, i) => <circle key={i} cx={290 + hash(i + 7) * 500} cy={350 + hash(i + 8) * 250} r={2 + 2 * hash(i + 9)} fill="#fff" opacity={0.5 + 0.4 * Math.sin(t * 3 + i)} />)}
            <g transform={`translate(540 ${lerp(1060, 590, rise)})`}><Venus r={230} spin={t * 0.01} id="hv" lids={0.15} eye={1.05} mouth="smile" lookY={0.3} /></g>
          </g>
          <rect x="270" y="330" width="540" height="470" rx="20" fill="none" stroke="#C9B8FF" strokeWidth="20" />
          <path d="M540 330 L540 800 M270 565 L810 565" stroke="#C9B8FF" strokeWidth="12" opacity={1 - rise * 0.9} />
          <rect x="240" y="790" width="600" height="34" rx="12" fill="#9E8CF0" />
        </g>
        <rect x="0" y="0" width="1080" height="1920" fill="#FFB45E" opacity={0.22 * glow} style={{ mixBlendMode: "screen" }} />
        {/* bed */}
        <rect x="40" y="1020" width="720" height="300" rx="40" fill="#4C3AA8" />
        <rect x="90" y="960" width="300" height="120" rx="50" fill="#E6DEFF" />
        <g transform={`translate(260 ${1000 + Math.sin(t * 2) * 3})`}><Student t={t} lids={kf(t, [[0, 0.88], [1.2, 0.72], [1.5, 0.95], [1.8, 0.75], [EV.meet - 0.05, 0.8], [EV.meet + 0.1, 0]])} reach={reach} shock={shock} /></g>
        <path d={`M60 1100 C200 ${1060 + Math.sin(t * 2) * 6} 450 1080 760 1060 L760 1320 L60 1320Z`} fill="#7E6BE0" />
        <path d="M180 1140 q60 40 140 10 M420 1130 q70 40 160 10" stroke="#9E8CF0" strokeWidth="10" fill="none" strokeLinecap="round" />
        {/* nightstand + alarm clock */}
        <rect x="790" y="1080" width="230" height="240" rx="20" fill="#2E2370" />
        <g transform={`translate(${905 + shake} 1010) rotate(${shake})`}>
          <circle cx="-48" cy="-62" r="24" fill="#FF6B8A" /><circle cx="48" cy="-62" r="24" fill="#FF6B8A" />
          <circle r="74" fill="#FF6B8A" /><circle r="58" fill="#FFF6E6" />
          <path d={`M0 0 L0 -40 M0 0 L28 10`} stroke="#2A0F55" strokeWidth="7" strokeLinecap="round" />
          {(ringA || ringB) && [0, 1, 2].map((i) => <path key={i} d={`M${86 + i * 14} ${-40 + i * 30} l26 -8`} stroke="#FFE07A" strokeWidth="8" strokeLinecap="round" />)}
        </g>
        {/* the arm creeping toward the alarm clock, ridiculously slowly */}
        <path d={`M300 1110 C${380 + reach * 120} ${1090 - reach * 20} ${420 + reach * 240} ${1080 - reach * 60} ${450 + reach * 380} ${1075 - reach * 70}`} stroke="#9E8CF0" strokeWidth="50" strokeLinecap="round" fill="none" />
        <circle cx={460 + reach * 380} cy={1072 - reach * 70} r="30" fill="#D99A6C" />
        {shock > 0.05 && <T x={420} y={820} size={110} fill="#FFE07A" scale={shock} rot={-10} opacity={1 - seg(t, 2.85, 3.0)}>!?</T>}
      </Svg>
    </AbsoluteFill>
  );
};

// ================================================================= 2-3. SPACE: the slow spin, then the orbit
const ORB = { cx: 540, cy: 860, rx: 390, ry: 165 };
const orbitPos = (p: number) => { const a = Math.PI / 2 - p * Math.PI * 2; return { x: ORB.cx + Math.cos(a) * ORB.rx, y: ORB.cy + Math.sin(a) * ORB.ry, front: Math.sin(a) >= 0 }; };
const Ring: React.FC<{ x: number; y: number; p: number; title: string; value: string; color: string; inP: number; done: boolean }> = ({ x, y, p, title, value, color, inP, done }) => {
  const r = 92, C = 2 * Math.PI * r;
  return (
    <g transform={`translate(${x} ${y}) scale(${inP})`}>
      <text y="-128" textAnchor="middle" fontFamily="Lilita" fontSize="46" fill="#fff" stroke="#2A0F55" strokeWidth="10" paintOrder="stroke fill">{title}</text>
      <circle r={r} fill="rgba(20,8,60,0.6)" stroke="#3B2C8F" strokeWidth="22" />
      <circle r={r} fill="none" stroke={color} strokeWidth="22" strokeLinecap="round" strokeDasharray={`${C * p} ${C}`} transform="rotate(-90)" style={{ filter: `drop-shadow(0 0 10px ${color})` }} />
      <text y="10" textAnchor="middle" fontFamily="Lilita" fontSize="64" fill="#fff">{value}</text>
      <text y="48" textAnchor="middle" fontFamily="NunitoX" fontWeight={900} fontSize="26" fill="#C9B8FF">DAYS</text>
      {done && <circle r={r + 24} fill="none" stroke={color} strokeWidth="4" opacity="0.6" />}
    </g>
  );
};
const SpaceScene: React.FC<{ t: number }> = ({ t }) => {
  // the planet: big close-up -> small on its orbit -> back to the centre for the snail
  const toOrbit = inOut(seg(t, SC.orbit - 0.2, SC.orbit + 0.75));
  const toSnail = inOut(seg(t, SC.snail - 0.25, SC.snail + 0.45));
  const p1 = smooth(seg(t, EV.but + 0.2, EV.v4end - 0.1));
  const ringStart = EV.yes + 0.1, orbitDone = EV.rotation + 0.9, rotDone = EV.year + 0.1;
  const p2 = seg(t, ringStart, orbitDone);
  const orbP = t < ringStart ? p1 : p2;
  const op = orbitPos(orbP % 1 === 0 && orbP > 0 ? 0.9999 : orbP);
  const rotP = t < ringStart ? p1 * (225 / 243) : lerp(0, 225 / 243, seg(t, ringStart, orbitDone)) + (1 - 225 / 243) * seg(t, orbitDone, rotDone);
  const intro = outCubic(seg(t, SC.space, SC.space + 0.7));
  const bigX = 540, bigY = lerp(600, 920, intro), bigR = lerp(260, 300, intro);
  const vx = lerp(lerp(bigX, op.x, toOrbit), 450, toSnail), vy = lerp(lerp(bigY, op.y, toOrbit), 1040, toSnail);
  const depth = op.front ? 1 : 0.82;
  const vr = lerp(lerp(bigR, 62 * depth, toOrbit), 225, toSnail);
  const spin = (t - SC.space) * 0.015;
  const count = Math.round(243 * outCubic(seg(t, EV.n243 - 0.1, EV.once + 0.15)));
  const counterIn = outBack(seg(t, EV.n243 - 0.15, EV.n243 + 0.15)) * (1 - seg(t, SC.orbit - 0.3, SC.orbit));
  const land = t > EV.once + 0.15 ? 1 + 0.12 * Math.sin((t - EV.once - 0.15) * 14) * Math.exp(-(t - EV.once - 0.15) * 4) : 1;
  const sunIn = outBack(seg(t, SC.orbit, SC.orbit + 0.6)) * (1 - seg(t, SC.snail - 0.2, SC.snail + 0.2));
  const orbitDraw = seg(t, SC.orbit + 0.1, SC.orbit + 0.9);
  const lbl225 = outBack(seg(t, EV.n225 - 0.05, EV.n225 + 0.3)) * (1 - seg(t, EV.yes - 0.2, EV.yes + 0.1));
  const days225 = Math.round(225 * p1);
  const ringsIn = outBack(seg(t, EV.yes - 0.1, EV.yes + 0.25)) * (1 - seg(t, SC.snail - 0.3, SC.snail));
  const stamp = seg(t, EV.v5end - 0.05, EV.v5end + 0.15);
  const stampOut = seg(t, SC.snail - 0.4, SC.snail - 0.1);
  const behind = toOrbit > 0.5 && !op.front && toSnail < 0.5;
  const mouth = t > EV.spin - 0.1 && t < EV.once + 0.5 ? "yawn" : t > EV.v5end && t < SC.snail ? "o" : "smile";
  const faceRot = toOrbit > 0 && toSnail < 1 ? -360 * rotP : 0;
  const shellP = seg(t, SC.snail + 0.3, SC.snail + 0.9);
  const body = outBack(seg(t, SC.snail + 0.55, SC.snail + 1.2));
  const crawl = Math.max(0, t - (SC.snail + 1.2)) * 5;
  const venusEl = (
    <g transform={`translate(${vx + crawl} ${vy})`}>
      {toSnail > 0.5 && <path d={`M${-crawl - 400} 200 L-120 200`} stroke="#C9B8FF" strokeWidth="14" strokeLinecap="round" opacity="0.4" strokeDasharray="2 26" />}
      <Snail t={t} shell={shellP} body={c01(body)} r={vr} blink={tri(t, 19.6, 0.1)} sweat={seg(t, EV.v7end, EV.v7end + 0.4)}>
        <Venus r={vr} spin={spin} id="sv" lids={t < SC.orbit ? 0.5 : 0.3} blink={tri(t, 5.3, 0.1) + tri(t, 13.0, 0.1)} mouth={mouth} faceRot={faceRot} glow={1 - 0.3 * toOrbit} face={1 - shellP} eye={t > EV.v5end && t < SC.snail ? 1.15 : 1} />
      </Snail>
    </g>
  );
  return (
    <AbsoluteFill>
      <Space t={t} hue={toSnail} px={-toOrbit * 200} />
      <Svg>
        {sunIn > 0.01 && (
          <g>
            <ellipse cx={ORB.cx} cy={ORB.cy} rx={ORB.rx} ry={ORB.ry} fill="none" stroke="#FFB45E" strokeWidth="5" opacity={0.85 * sunIn} strokeDasharray="2600" strokeDashoffset={2600 * (1 - orbitDraw)} style={{ filter: "drop-shadow(0 0 10px #FF9A3D)" }} />
            <ellipse cx={ORB.cx} cy={ORB.cy} rx={ORB.rx} ry={ORB.ry} fill="none" stroke="#FFE07A" strokeWidth="3" strokeDasharray="6 30" strokeDashoffset={-t * 60} opacity={0.6 * sunIn} />
          </g>
        )}
        {behind && venusEl}
        {sunIn > 0.01 && <g transform={`translate(${ORB.cx} ${ORB.cy}) scale(${sunIn})`}><Sun r={105} t={t} /></g>}
        {!behind && venusEl}
        {/* backward-spin arrow while we watch it turn */}
        {t > EV.n243 && t < SC.orbit && <g opacity={seg(t, EV.n243, EV.n243 + 0.4) * (1 - seg(t, SC.orbit - 0.3, SC.orbit))}><path d={`M${540 + 360} 920 A360 360 0 0 1 540 1280`} stroke="#C9B8FF" strokeWidth="10" fill="none" strokeDasharray="20 18" strokeDashoffset={t * 12} /><path d="M556 1262 L528 1282 L560 1300" stroke="#C9B8FF" strokeWidth="10" fill="none" strokeLinecap="round" strokeLinejoin="round" /></g>}
        {counterIn > 0.01 && (
          <g transform={`translate(540 0) scale(${counterIn})`}>
            <g transform={`translate(0 470) scale(${land})`}><T x={0} y={0} size={210} fill="url(#goldT)" sw={18}>{String(count)}</T></g>
            <T x={0} y={560} size={70} fill="#fff" sw={12}>EARTH DAYS</T>
            <g transform="translate(250 360)"><Earth r={30} spin={t * 1.6} /></g>
          </g>
        )}
        {counterIn > 0.01 && <Note y={1300} text="one full turn, measured against the stars" o={counterIn} />}
        {lbl225 > 0.01 && (
          <g transform={`translate(540 1150) scale(${lbl225})`}>
            <rect x="-250" y="-62" width="500" height="112" rx="56" fill="rgba(20,8,60,0.85)" stroke="#FFB45E" strokeWidth="6" />
            <text y="16" textAnchor="middle" fontFamily="Lilita" fontSize="64" fill="url(#goldT)">{days225} EARTH DAYS</text>
          </g>
        )}
        {ringsIn > 0.01 && (
          <g>
            <Ring x={300} y={470} p={c01(p2)} title="1 ORBIT" value="225" color="#5FD3FF" inP={ringsIn} done={p2 >= 1} />
            <Ring x={780} y={470} p={c01(rotP)} title="1 ROTATION" value="243" color="#FFB45E" inP={ringsIn} done={rotP >= 0.999} />
            {t > orbitDone && t < rotDone + 0.6 && <T x={300} y={640} size={40} fill="#5FD3FF" sw={8} scale={outBack(seg(t, orbitDone, orbitDone + 0.25))}>A YEAR!</T>}
            {t > orbitDone && t < rotDone && <T x={780} y={640} size={40} fill="#FFB45E" sw={8} scale={outBack(seg(t, orbitDone, orbitDone + 0.25))}>NOT YET...</T>}
            <Note y={1300} text="sunrise to sunrise on Venus: about 117 Earth days" o={ringsIn} />
          </g>
        )}
        {stamp > 0 && stampOut < 1 && (
          <g transform={`translate(540 ${860}) rotate(-8) scale(${lerp(2.2, 1, outCubic(stamp)) * (1 - stampOut)})`} opacity={c01(stamp * 3)}>
            <rect x="-330" y="-120" width="660" height="210" rx="30" fill="rgba(42,15,85,0.92)" stroke="#FF6B8A" strokeWidth="12" />
            <text y="-12" textAnchor="middle" fontFamily="Lilita" fontSize="104" fill="url(#goldT)">243 &gt; 225</text>
            <text y="62" textAnchor="middle" fontFamily="Lilita" fontSize="52" fill="#FF8AA8">LONGER THAN A YEAR!</text>
          </g>
        )}
      </Svg>
    </AbsoluteFill>
  );
};

// ================================================================= 4. "AT A SNAIL'S PACE" kinetic type (drawn over the space scene)
const Idiom: React.FC<{ t: number }> = ({ t }) => {
  if (t < EV.at - 0.1 || t > SC.chat + 0.3) return null;
  const out = 1 - seg(t, SC.chat - 0.3, SC.chat);
  const w = (at: number) => outBack(seg(t, at - 0.06, at + 0.25));
  const pace = "PACE".split("");
  const card = outBack(seg(t, EV.means - 0.05, EV.means + 0.3));
  const hl = seg(t, EV.extremely, EV.slowly + 0.4);
  return (
    <Svg style={{ opacity: out }}>
      <T x={232} y={420} size={118} fill="#fff" scale={w(EV.at)}>AT</T>
      <T x={392} y={420} size={118} fill="#fff" scale={w(EV.a)}>A</T>
      <T x={690} y={420} size={118} fill="#fff" scale={w(EV.snails)}>SNAIL’S</T>
      {pace.map((ch, i) => {
        const at = EV.pace + i * 0.11, p = seg(t, at - 0.05, at + 0.7);
        const x = 540 + (i - 1.5) * 128;
        return <T key={i} x={lerp(x - 160, x, outCubic(p))} y={600} size={196} fill="url(#goldT)" sw={18} opacity={c01(p * 3)} rot={(1 - p) * -12}>{ch}</T>;
      })}
      <path d={`M300 630 L${300 + 480 * seg(t, EV.pace, EV.pace + 1.6)} 630`} stroke="#C9B8FF" strokeWidth="10" strokeLinecap="round" opacity="0.6" strokeDasharray="2 22" />
      {card > 0.01 && (
        <g transform={`translate(540 720) scale(${card})`}>
          <rect x="-400" y="-58" width="800" height="138" rx="40" fill="rgba(20,8,60,0.88)" stroke="#FFC24D" strokeWidth="6" />
          <text y="0" textAnchor="middle" fontFamily="NunitoX" fontWeight={900} fontSize="46" fill="#fff">= extremely slowly</text>
          <text y="56" textAnchor="middle" fontFamily="NunitoX" fontWeight={900} fontSize="44" fill="#FFC24D">Juda sekin, imillab.</text>
          <rect x="-190" y="12" width={380 * hl} height="6" rx="3" fill="#FFC24D" opacity="0.8" />
        </g>
      )}
    </Svg>
  );
};

// ================================================================= 5. ENDING: "I'm almost there!"
const Bubble: React.FC<{ x: number; y: number; w: number; text: string; side: "l" | "r"; p: number; typing: boolean; t: number }> = ({ x, y, w, text, side, p, typing, t }) => (
  <g transform={`translate(${x} ${y}) scale(${p})`} opacity={c01(p * 2)}>
    <rect x={side === "l" ? 0 : -w} y="-50" width={w} height="100" rx="36" fill={side === "l" ? "#F2EEFF" : "#5FB8FF"} />
    <path d={side === "l" ? "M10 30 L-14 54 L36 40Z" : "M-10 30 L14 54 L-36 40Z"} fill={side === "l" ? "#F2EEFF" : "#5FB8FF"} />
    {typing ? [0, 1, 2].map((i) => <circle key={i} cx={(side === "l" ? 40 : -w + 40) + i * 30} cy={Math.sin(t * 12 + i) * 6} r="10" fill="#8E7CF0" />)
      : <text x={side === "l" ? 30 : -w + 30} y="14" fontFamily="NunitoX" fontWeight={900} fontSize="42" fill={side === "l" ? "#2A0F55" : "#fff"}>{text}</text>}
  </g>
);
const Ending: React.FC<{ t: number }> = ({ t }) => {
  const in1 = outBack(seg(t, 22.05, 22.35));
  const typing1 = t < 22.45;
  const in2 = outBack(seg(t, EV.ask - 0.05, EV.ask + 0.25));
  const typing2 = t < EV.earth - 0.1;
  const fast = t > EV.v8end && t < EV.ask ? (t - EV.v8end) * 2400 : t >= EV.ask ? (EV.ask - EV.v8end) * 2400 : 0;
  const min = t * 6 + fast, hr = t * 0.5 + fast / 12;
  const lookClock = seg(t, EV.v8end - 0.05, EV.v8end + 0.15), lookWin = seg(t, EV.ask - 0.05, EV.ask + 0.15), lookCam = seg(t, EV.end - 0.1, EV.end + 0.1);
  const lx = lerp(lerp(lerp(0, 0.9, lookClock), -0.9, lookWin), 0.1, lookCam);
  const ly = lerp(lerp(lerp(0.75, -0.7, lookClock), -0.7, lookWin), 0, lookCam);
  const brow = lerp(lerp(0, 0.4, lookWin), 1, lookCam);
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(#1C1645, #2E2370 70%, #1C1645)" }} />
      <Svg>
        <clipPath id="win2"><rect x="100" y="320" width="330" height="270" rx="18" /></clipPath>
        <rect x="100" y="320" width="330" height="270" rx="18" fill="#0B0A2E" />
        <g clipPath="url(#win2)">
          {Array.from({ length: 16 }, (_, i) => <circle key={i} cx={110 + hash(i + 40) * 310} cy={330 + hash(i + 41) * 250} r={1.5 + 2 * hash(i + 42)} fill="#fff" opacity={0.5 + 0.4 * Math.sin(t * 3 + i)} />)}
          <g transform="translate(265 460)"><Venus r={88} spin={t * 0.01} id="wv" lids={0.4} faceRot={-(t - SC.chat) * 0.6} mouth={t > EV.end ? "smirk" : "smile"} wink={tri(t, EV.end + 0.35, 0.18)} /></g>
        </g>
        <rect x="100" y="320" width="330" height="270" rx="18" fill="none" stroke="#9E8CF0" strokeWidth="14" />
        <path d="M265 320 L265 590" stroke="#9E8CF0" strokeWidth="8" opacity="0.6" />
        <g transform="translate(820 455)">
          <circle r="112" fill="#F2EEFF" stroke="#FF6B8A" strokeWidth="14" />
          {Array.from({ length: 12 }, (_, i) => <rect key={i} x="-4" y="-96" width="8" height={i % 3 ? 14 : 24} fill="#2A0F55" transform={`rotate(${i * 30})`} />)}
          <rect x="-5" y="-70" width="10" height="72" rx="5" fill="#2A0F55" transform={`rotate(${min})`} />
          <rect x="-6" y="-48" width="12" height="50" rx="6" fill="#FF6B8A" transform={`rotate(${hr + 120})`} />
          <circle r="10" fill="#2A0F55" />
          {fast > 0 && t < EV.ask + 0.3 && [0, 1, 2].map((i) => <path key={i} d={`M${130 + i * 12} ${-60 + i * 50} l22 -6`} stroke="#FFE07A" strokeWidth="7" strokeLinecap="round" />)}
        </g>
        <Bubble x={90} y={650} w={560} text="I'm almost there! 🏃" side="l" p={in1} typing={typing1} t={t} />
        <Bubble x={990} y={770} w={620} text="On Earth… or on Venus? 🪐" side="r" p={in2} typing={typing2} t={t} />
        <g transform={`translate(540 ${lerp(1750, 1460, outCubic(seg(t, SC.chat, SC.chat + 0.5)))}) scale(1.02)`}>
          <rect x="-300" y="20" width="600" height="600" fill="#6C4CE0" />
          <Waiter t={t} lookX={lx} lookY={ly} brow={brow} smirk={lookCam} blink={tri(t, 23.9, 0.1)} />
        </g>
      </Svg>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- Uzbek subtitles, school watermark, camera
const UzSub: React.FC<{ t: number }> = ({ t }) => {
  const u = UZ.find((x) => t >= x.s && t < x.e);
  if (!u) return null;
  const a = c01((t - u.s) / 0.14) * (1 - c01((t - (u.e - 0.1)) / 0.1));
  const parts = u.text.split(/(“[^”]*”|\b\d{3}\b)/g);
  return (
    <div style={{ position: "absolute", left: 56, right: 56, top: 1352, display: "flex", justifyContent: "center", opacity: a, transform: `translateY(${(1 - a) * 12}px)` }}>
      <div style={{ maxWidth: 950, padding: "14px 34px 18px", borderRadius: 34, background: "rgba(16, 8, 48, 0.74)", border: "3px solid rgba(255, 194, 77, 0.55)", textAlign: "center", fontFamily: "NunitoX", fontWeight: 900, fontSize: 50, lineHeight: 1.18, color: "#FFFFFF", textShadow: "0 3px 8px rgba(0,0,0,0.55)" }}>
        {parts.map((p, i) => <span key={i} style={/^“|^\d{3}$/.test(p) ? { color: "#FFC24D" } : undefined}>{p}</span>)}
      </div>
    </div>
  );
};
// brand rule (brands/bakhriddinov-school/README.md): official logo, top-right, as in Episode 1
const SchoolWatermark: React.FC = () => (
  <Img src={staticFile("logo-watermark.png")} style={{ position: "absolute", top: 104, right: 44, width: 252, opacity: 0.85, filter: "drop-shadow(0 2px 6px rgba(0,8,30,0.7))" }} />
);
const camAt = (t: number) => {
  const punch = (t0: number, a: number) => (t >= t0 ? a * Math.exp(-(t - t0) * 6) : 0);
  const shake = (t0: number, a: number) => (t >= t0 ? a * Math.exp(-(t - t0) * 8) * Math.sin((t - t0) * 70) : 0);
  const z = 1 + punch(EV.meet, 0.05) + punch(EV.once + 0.15, 0.03) + punch(EV.v5end, 0.05) + punch(EV.pace, 0.03) + punch(EV.end, 0.03);
  const x = Math.sin(t * 0.5) * 6 + shake(EV.meet, 10) + shake(EV.v5end, 8);
  const y = Math.cos(t * 0.45) * 6;
  return `translate(${x}px, ${y}px) scale(${z})`;
};

export const Episode: React.FC = () => {
  const t = useCurrentFrame() / 30;
  const zoom = inOut(seg(t, 2.95, 3.5));
  const star = inOut(seg(t, SC.chat - 0.3, SC.chat + 0.25));
  const starPts = Array.from({ length: 10 }, (_, i) => { const a = -Math.PI / 2 + (i * Math.PI) / 5, r = (i % 2 ? 0.45 : 1) * 2400 * star; return `${540 + Math.cos(a) * r}px ${900 + Math.sin(a) * r}px`; }).join(",");
  return (
    <AbsoluteFill style={{ background: "#0B0A2E", overflow: "hidden" }}>
      <style>{FONTS}</style>
      <Defs />
      <AbsoluteFill style={{ transform: camAt(t) }}>
        {t >= 2.9 && t < SC.chat + 0.3 && <AbsoluteFill style={{ opacity: c01((t - 2.95) / 0.35) }}><SpaceScene t={t} /></AbsoluteFill>}
        {t < 3.5 && <AbsoluteFill style={{ transform: `scale(${1 + 2.4 * zoom})`, transformOrigin: "540px 580px", opacity: 1 - c01((t - 3.15) / 0.3) }}><Hook t={t} /></AbsoluteFill>}
        {t >= SC.chat - 0.3 && <AbsoluteFill style={star < 1 ? { clipPath: `polygon(${starPts})` } : undefined}><Ending t={t} /></AbsoluteFill>}
      </AbsoluteFill>
      <Idiom t={t} />
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 560, background: "linear-gradient(transparent, rgba(8,4,30,0.4))" }} />
      <UzSub t={t} />
      <SchoolWatermark />
      <Audio src={staticFile("audio/mix.wav")} />
    </AbsoluteFill>
  );
};
