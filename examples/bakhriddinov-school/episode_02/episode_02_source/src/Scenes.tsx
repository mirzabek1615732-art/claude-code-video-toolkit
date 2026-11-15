import React from "react";
import { AbsoluteFill } from "remotion";
import { Chick, Flamingo, Friend, Shrimp } from "./Characters";
import { EV, SC, boingAt, c01, hash, inCubic, kf, lerp, mixHex, outBack, outCubic, outElastic, seg, smooth, tri } from "./util";

const Svg: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <svg width="1080" height="1920" viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0, overflow: "visible", ...style }}>{children}</svg>
);
const T: React.FC<{ x: number; y: number; size: number; children: React.ReactNode; fill?: string; stroke?: string; sw?: number; rot?: number; scale?: number; opacity?: number; anchor?: "middle" | "start" | "end"; font?: "baloo" | "nunito"; shadow?: boolean }> = ({ x, y, size, children, fill = "#fff", stroke = "#7A1E4A", sw = 14, rot = 0, scale = 1, opacity = 1, anchor = "middle", font = "baloo", shadow = true }) => (
  <text transform={`translate(${x} ${y}) rotate(${rot}) scale(${scale})`} textAnchor={anchor} fontFamily={font === "baloo" ? "Baloo" : "NunitoX"} fontWeight={800} fontSize={size} fill={fill} stroke={stroke} strokeWidth={sw} strokeLinejoin="round" paintOrder="stroke fill" opacity={opacity} style={shadow ? { filter: "drop-shadow(0 8px 0 rgba(60,10,40,0.35))" } : undefined}>{children}</text>
);
const Spark: React.FC<{ x: number; y: number; r: number; rot?: number; fill?: string; o?: number }> = ({ x, y, r, rot = 0, fill = "#fff", o = 1 }) => (
  <path d={`M0 ${-r} Q${r * 0.15} ${-r * 0.15} ${r} 0 Q${r * 0.15} ${r * 0.15} 0 ${r} Q${-r * 0.15} ${r * 0.15} ${-r} 0 Q${-r * 0.15} ${-r * 0.15} 0 ${-r}Z`} transform={`translate(${x} ${y}) rotate(${rot})`} fill={fill} opacity={o} />
);
const Palm: React.FC<{ x: number; y: number; s: number; t: number; color: string; flip?: number }> = ({ x, y, s, t, color, flip = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s * flip} ${s})`}>
    <path d="M0 0 C10 -150 30 -300 70 -420" stroke={color} strokeWidth="26" fill="none" strokeLinecap="round" />
    {[0, 1, 2, 3, 4, 5].map((i) => { const a = -150 + i * 55 + Math.sin(t * 1.3 + i) * 5; return <path key={i} d="M0 0 C60 -40 140 -30 200 30 C140 -10 70 -10 0 0Z" fill={color} transform={`translate(70 -420) rotate(${a})`} />; })}
  </g>
);

// =================================================================== 1. HOOK: celebrity flamingo, record scratch
export const Hook: React.FC<{ t: number }> = ({ t }) => {
  const pauseA = EV.wait, pauseB = EV.wait + 0.75;
  const ta = t < pauseA ? t : t < pauseB ? pauseA : t - 0.75;           // character time stops during the scratch
  const frozen = t >= pauseA && t < pauseB;
  const flashes = [0.04, 0.18, 0.27, 1.25, 1.6, 2.3, 2.62];
  const flash = flashes.reduce((m, f) => Math.max(m, t >= f ? Math.exp(-(t - f) * 22) : 0), 0);
  const chickX = kf(t, [[0.12, 1260], [0.5, 800]], outCubic);
  const chickHop = t > 0.12 && t < 0.55 ? Math.abs(Math.sin((t - 0.12) * 22)) * 40 : 0;
  const drop = smooth(seg(t, pauseA + 0.05, pauseA + 0.35));
  const bornP = outBack(seg(t, EV.born1 - 0.05, EV.born1 + 0.3));
  const nope = seg(t, EV.pink1e - 0.1, EV.pink1e + 0.12);
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(#3B1E6E 0%, #A33A8E 34%, #FF6F91 56%, #FFB46B 70%)" }} />
      <Svg>
        <circle cx="560" cy="980" r="240" fill="#FFD27A" opacity="0.9" style={{ filter: "drop-shadow(0 0 80px #FFB45E)" }} />
        {[0, 1, 2, 3].map((i) => <rect key={i} x="320" y={900 + i * 40} width="480" height={10 - i * 2} fill="#FF8C6B" opacity="0.6" />)}
        <Palm x={-30} y={1180} s={1.05} t={t} color="#2A1645" />
        <Palm x={1110} y={1190} s={1.15} t={t} color="#2A1645" flip={-1} />
        <rect x="0" y="1140" width="1080" height="780" fill="url(#lagoonG)" />
        {[0, 1, 2, 3, 4, 5].map((i) => <rect key={i} x={430 + Math.sin(t * 2 + i) * 30 - i * 10} y={1170 + i * 34} width={180 + i * 30} height="8" rx="4" fill="#FFD27A" opacity={0.5 - i * 0.06} />)}
        {[0, 1].map((i) => <polygon key={i} points={`${i ? 1080 : 0},0 ${i ? 1000 : 80},0 ${520 + Math.sin(t * 0.8 + i) * 60 + 160},1250 ${520 + Math.sin(t * 0.8 + i) * 60 - 160},1250`} fill="#fff" opacity="0.1" />)}
        <ellipse cx="380" cy="1292" rx="210" ry="28" fill="#2A1645" opacity="0.35" />
        <g transform={`translate(350 ${1282}) scale(1.45)`}>
          <Flamingo t={ta} pink={1} neck={Math.sin(ta * 1.7) * 0.7} tilt={Math.sin(ta * 1.3) * 7 + (frozen ? -4 : 0)} legUp={1} glasses={1} glassesDrop={drop} eye={1 + 0.25 * drop} lookX={drop} blink={tri(t, 2.05, 0.08)} bob={Math.sin(ta * 3.4) * 6} />
        </g>
        <ellipse cx={chickX} cy="1300" rx="115" ry="18" fill="#2A1645" opacity="0.35" />
        <g transform={`translate(${chickX} ${1292 - chickHop}) scale(${-1 * 1.12} 1.12)`}>
          <Chick t={t} walk={t < 0.55 ? (t - 0.12) * 3 : 0} stretch={boingAt(t, 0.5, 0.14) * boingAt(t, EV.pink1e, 0.1)} lookY={-0.6} lookX={0.3} happy={c01((t - 0.6) * 3) * (1 - nope)} shock={0.3 * nope} blink={tri(t, 1.7, 0.08)} />
        </g>
        {flashes.map((f, i) => t >= f && t < f + 0.25 ? <g key={i} opacity={Math.exp(-(t - f) * 14)}><circle cx={150 + hash(i) * 780} cy={500 + hash(i + 9) * 500} r="110" fill="url(#flashG)" /><Spark x={150 + hash(i) * 780} y={500 + hash(i + 9) * 500} r={80} fill="#fff" /></g> : null)}
        {bornP > 0.01 && <T x={540} y={360} size={150} fill="#fff" stroke="#B0175A" sw={18} scale={bornP} rot={-3}>BORN PINK?</T>}
        {nope > 0.01 && (
          <g transform={`translate(${770 + (t < EV.pink1e + 0.3 ? Math.sin(t * 90) * 6 : 0)} 640) rotate(-11) scale(${lerp(2.4, 1, outCubic(nope))})`} opacity={c01(nope * 3)}>
            <rect x="-210" y="-100" width="420" height="170" rx="26" fill="#FFF3E8" stroke="#E5214F" strokeWidth="14" />
            <text x="0" y="40" textAnchor="middle" fontFamily="Baloo" fontWeight="800" fontSize="150" fill="#E5214F">NOPE!</text>
          </g>
        )}
      </Svg>
      <AbsoluteFill style={{ background: "#fff", opacity: flash * 0.35 }} />
    </AbsoluteFill>
  );
};

// =================================================================== 2. MIRROR: the gray chick discovers itself
const Beach: React.FC<{ t: number; sky?: [string, string] }> = ({ t, sky = ["#62CFFF", "#CFF6FF"] }) => (
  <>
    <div style={{ position: "absolute", inset: 0, background: `linear-gradient(${sky[0]} 0%, ${sky[1]} 46%)` }} />
    <Svg>
      {[0, 1, 2].map((i) => <ellipse key={i} cx={(200 + i * 360 + t * 12) % 1300 - 100} cy={300 + i * 110} rx={130 - i * 20} ry={38 - i * 6} fill="#fff" opacity="0.8" />)}
      <rect x="0" y="880" width="1080" height="320" fill="url(#seaG)" />
      {[0, 1, 2, 3].map((i) => <path key={i} d={`M${-60 + ((t * 40 + i * 290) % 1200)} ${930 + i * 60} q30 -12 60 0`} stroke="#fff" strokeWidth="6" fill="none" opacity="0.55" strokeLinecap="round" />)}
      <path d={`M0 1180 C300 ${1150 + Math.sin(t) * 6} 700 ${1200 - Math.sin(t) * 6} 1080 1160 L1080 1920 L0 1920Z`} fill="url(#sandG)" />
      <path d={`M0 1180 C300 ${1150 + Math.sin(t) * 6} 700 ${1200 - Math.sin(t) * 6} 1080 1160`} stroke="#fff" strokeWidth="10" fill="none" opacity="0.7" />
    </Svg>
  </>
);
export const Mirror: React.FC<{ t: number }> = ({ t }) => {
  const shock = c01((t - EV.gray) * 6) * (1 - seg(t, EV.gray + 1.6, EV.gray + 2.2) * 0.6);
  const stretch = boingAt(t, EV.gray, 0.26, 16, 4);
  const look = t < EV.painted - 0.2 ? -0.8 : t < EV.food ? 0.9 : 0.2;
  const brushIn = outBack(seg(t, EV.painted - 0.35, EV.painted + 0.15)), brushOut = seg(t, EV.nobody + 0.15, EV.nobody + 0.45);
  const xDraw = seg(t, EV.nobody - 0.05, EV.nobody + 0.2);
  const plate = outElastic(seg(t, EV.food - 0.05, EV.food + 0.6));
  const grayChip = outBack(seg(t, EV.gray + 0.1, EV.gray + 0.4)) * (1 - seg(t, EV.painted - 0.5, EV.painted - 0.2));
  const bgFlam = (x: number, s: number, ph: number) => (
    <g transform={`translate(${x} 1060) scale(${s})`} style={{ filter: "blur(1.4px)" }}>
      <Flamingo t={t + ph} pink={1} neck={Math.sin(t * 1.5 + ph) * 0.8} tilt={Math.sin(t * 1.2 + ph) * 6} legUp={ph > 1 ? 1 : 0} blink={tri((t + ph) % 3, 1.5, 0.08)} />
    </g>
  );
  const Q = (sx: number) => (
    <g>
      <ellipse cx="0" cy="0" rx="150" ry="230" fill="url(#mirrorG)" />
      <g transform={`scale(${sx} 1) translate(0 205) scale(0.86)`}><Chick t={t} shock={shock} stretch={stretch} lookX={0.8} blink={tri(t, 6.2, 0.08)} /></g>
      <path d="M-90 -150 L-30 -200 M-110 -80 L-10 -170" stroke="#fff" strokeWidth="14" strokeLinecap="round" opacity="0.45" />
    </g>
  );
  return (
    <AbsoluteFill>
      <Beach t={t} />
      <Svg>
        <Palm x={1000} y={1180} s={0.9} t={t} color="#1B8E6E" flip={-1} />
        {bgFlam(600, 0.5, 0.4)}{bgFlam(880, 0.56, 1.7)}
        {[0, 1, 2].map((i) => <Spark key={i} x={600 + i * 140 + Math.sin(t * 3 + i) * 10} y={650 + (i % 2) * 60} r={14 + 8 * Math.abs(Math.sin(t * 4 + i))} fill="#FFF3A8" />)}
        {/* standing mirror */}
        <path d="M250 1150 L210 1290 M410 1150 L450 1290" stroke="#C98A2E" strokeWidth="18" strokeLinecap="round" />
        <g transform="translate(330 900) scale(1.08)">
          <clipPath id="mclip"><ellipse rx="150" ry="230" /></clipPath>
          <g clipPath="url(#mclip)">{Q(1)}</g>
          <ellipse rx="160" ry="240" fill="none" stroke="#FFC861" strokeWidth="24" />
          <ellipse rx="160" ry="240" fill="none" stroke="#C98A2E" strokeWidth="6" />
          <circle cx="0" cy="-252" r="16" fill="#FFC861" />
        </g>
        <ellipse cx="790" cy="1305" rx="140" ry="20" fill="#C78C55" opacity="0.4" />
        <g transform={`translate(790 1298) scale(-1.32 1.32)`}><Chick t={t} shock={shock} stretch={stretch} lookX={look > 0 ? -look : 0.8} lookY={t > EV.painted - 0.2 && t < EV.food ? -0.6 : 0} blink={tri(t, 6.2, 0.08)} /></g>
        {shock > 0.05 && <T x={900} y={790 - 30 * outBack(c01(shock))} size={130} fill="#FFD84D" stroke="#7A1E4A" sw={14} rot={12} scale={shock}>!?</T>}
        {grayChip > 0.01 && (
          <g transform={`translate(790 690) scale(${grayChip})`}>
            <rect x="-150" y="-46" width="300" height="88" rx="44" fill="#fff" stroke="#8E8794" strokeWidth="6" />
            <text x="0" y="-4" textAnchor="middle" fontFamily="Baloo" fontWeight="800" fontSize="50" fill="#5E5764">GRAY</text>
            <text x="0" y="30" textAnchor="middle" fontFamily="NunitoX" fontWeight="800" fontSize="28" fill="#8E8794">kulrang</text>
          </g>
        )}
        {brushIn > 0.01 && (
          <g transform={`translate(${lerp(1200, 760, brushIn)} ${lerp(200, 560, brushIn)}) rotate(${-35 + 10 * Math.sin(t * 6)}) scale(${1 - brushOut})`} opacity={1 - brushOut}>
            <rect x="-14" y="-260" width="28" height="200" rx="12" fill="#C98A2E" />
            <rect x="-22" y="-70" width="44" height="40" fill="#B9BCC6" />
            <path d="M-26 -32 C-30 30 30 30 26 -32Z" fill="#FF5C8A" />
            {[0, 1, 2].map((i) => <ellipse key={i} cx={-12 + i * 12} cy={12 + ((t * 120 + i * 40) % 90)} rx="6" ry="9" fill="#FF5C8A" opacity={1 - ((t * 120 + i * 40) % 90) / 90} />)}
          </g>
        )}
        {brushIn > 0.01 && t < EV.food && <T x={600} y={470} size={210} fill="#FF5C8A" stroke="#fff" sw={14} scale={brushIn * (1 - brushOut * 0.2)} rot={-8}>?</T>}
        {xDraw > 0 && t < EV.nobody + 0.6 && <path d="M650 420 L870 640 M870 420 L650 640" stroke="#E5214F" strokeWidth="26" strokeLinecap="round" strokeDasharray="320" strokeDashoffset={320 * (1 - xDraw)} opacity={1 - seg(t, EV.nobody + 0.35, EV.nobody + 0.6)} />}
        {brushOut > 0 && brushOut < 1 && [0, 1, 2, 3, 4].map((i) => <circle key={i} cx={760 + Math.cos(i * 1.3) * 90 * brushOut} cy={560 + Math.sin(i * 1.3) * 70 * brushOut} r={50 * (1 - brushOut)} fill="#fff" opacity="0.9" />)}
        {plate > 0.01 && (
          <g transform={`translate(560 600) scale(${plate})`}>
            {Array.from({ length: 12 }, (_, i) => <rect key={i} x="-6" y="-260" width="12" height="80" rx="6" fill="#FFE27A" opacity="0.7" transform={`rotate(${i * 30 + t * 40})`} />)}
            <ellipse cx="0" cy="40" rx="200" ry="70" fill="#fff" stroke="#2FA7C9" strokeWidth="12" />
            <ellipse cx="0" cy="30" rx="150" ry="44" fill="#BDEBF5" />
            {[[-80, 10, 0], [10, 0, 1], [90, 20, 2]].map(([x, y, p]) => <g key={p} transform={`translate(${x} ${y}) rotate(-12)`}><Shrimp t={t} s={0.7} glow={0.4} ph={p} /></g>)}
            {[-120, -30, 60, 130].map((x, i) => <path key={i} d={`M${x} 40 q-10 -50 10 -90 q12 30 -2 90`} fill="#2FBF8F" />)}
          </g>
        )}
      </Svg>
    </AbsoluteFill>
  );
};

// =================================================================== 3. UNDERWATER: shrimp, algae, pigments
const SHRIMP = Array.from({ length: 6 }, (_, i) => i);
const shrimpPos = (t: number, i: number) => {
  const cx = 300 + (i % 3) * 230, cy = 860 + Math.floor(i / 3) * 230;
  return { x: cx + Math.sin(t * 0.9 + i * 2) * 90, y: cy + Math.sin(t * 1.4 + i) * 40, dir: Math.cos(t * 0.9 + i * 2) >= 0 ? 1 : -1 };
};
export const Water: React.FC<{ t: number }> = ({ t }) => {
  const uptake = seg(t, EV.algae, EV.pigments + 0.6);
  const pigCard = outBack(seg(t, EV.pigments - 0.05, EV.pigments + 0.3)) * (1 - seg(t, EV.overtime + 0.2, EV.overtime + 0.5));
  const head = outCubic(seg(t, EV.overtime - 0.1, EV.overtime + 0.8));
  const prog = seg(t, EV.overtime + 0.4, SC.lapse - 0.1);
  const meter = outBack(seg(t, EV.overtime + 0.3, EV.overtime + 0.7));
  const stage = prog < 0.34 ? 0 : prog < 0.67 ? 1 : 2;
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(#22C3C9 0%, #0E8FA8 35%, #064A6E 100%)" }} />
      <Svg>
        {[0, 1, 2, 3, 4].map((i) => <polygon key={i} points={`${120 + i * 210},0 ${200 + i * 210},0 ${360 + i * 170 + Math.sin(t + i) * 40},1500 ${120 + i * 170 + Math.sin(t + i) * 40},1500`} fill="#CFFBFF" opacity={0.06 + 0.03 * Math.sin(t * 1.3 + i)} />)}
        {Array.from({ length: 9 }, (_, i) => <path key={i} d={`M${-50 + i * 140} ${120 + (i % 3) * 30} q35 ${-14 + 10 * Math.sin(t * 2 + i)} 70 0 t70 0`} stroke="#E6FFFF" strokeWidth="5" fill="none" opacity="0.18" />)}
        <path d={`M0 1290 C260 1250 560 1310 1080 1260 L1080 1920 L0 1920Z`} fill="#D9B98A" opacity="0.75" />
        {[90, 170, 250, 840, 930, 1010].map((x, i) => {
          const h = 360 + (i % 3) * 120, sw = Math.sin(t * 1.2 + i) * 30;
          return <g key={i}><path d={`M${x} 1300 C${x + sw} ${1300 - h * 0.4} ${x - sw} ${1300 - h * 0.7} ${x + sw * 1.4} ${1300 - h}`} stroke="#2FBF8F" strokeWidth="18" fill="none" strokeLinecap="round" />
            {[0.3, 0.55, 0.8].map((k, j) => <ellipse key={j} cx={x + sw * k * 1.2 + (j % 2 ? 22 : -22)} cy={1300 - h * k} rx="26" ry="11" fill="#3FD69C" transform={`rotate(${j % 2 ? -30 : 30} ${x + sw * k * 1.2 + (j % 2 ? 22 : -22)} ${1300 - h * k})`} />)}</g>;
        })}
        {Array.from({ length: 34 }, (_, i) => {
          const x = (hash(i) * 1080 + t * 14 * (hash(i + 4) - 0.5) * 4 + 1080) % 1080, y = 600 + hash(i + 2) * 660 + Math.sin(t + i) * 20;
          const g = c01((t - EV.algae + hash(i) * 0.4) * 3);
          return <circle key={i} cx={x} cy={y} r={7 + 6 * hash(i + 6)} fill={mixHex("#7FCF6A", "#FF7A3D", g * 0.8)} opacity="0.85" style={g > 0.3 ? { filter: "drop-shadow(0 0 8px rgba(255,140,60,0.9))" } : undefined} />;
        })}
        {Array.from({ length: 22 }, (_, i) => { const y = ((hash(i + 30) * 1900 - t * (60 + 60 * hash(i))) % 1900 + 1900) % 1900; return <circle key={i} cx={hash(i + 31) * 1080 + Math.sin(t * 2 + i) * 14} cy={y} r={5 + 12 * hash(i + 32)} fill="none" stroke="#E6FFFF" strokeWidth="3" opacity="0.5" />; })}
        {/* pigment particles travel from algae into shrimp */}
        {t > EV.algae && Array.from({ length: 24 }, (_, i) => {
          const p = shrimpPos(t, i % 6); const u = ((t * 0.7 + hash(i)) % 1);
          const sx = hash(i + 50) * 1080, sy = 650 + hash(i + 51) * 600;
          return <circle key={i} cx={lerp(sx, p.x, u)} cy={lerp(sy, p.y, u)} r={6 * (1 - u) + 3} fill={i % 2 ? "#FF7A3D" : "#FF5C8A"} opacity={0.85 * Math.min(1, u * 5) * (1 - head * 0.5)} style={{ filter: "drop-shadow(0 0 6px #FF8A5C)" }} />;
        })}
        {SHRIMP.map((i) => { const p = shrimpPos(t, i); const eaten = head > 0.6 && i % 3 === 1 ? seg(t, EV.turn - 0.4 + i * 0.1, EV.turn + 0.2 + i * 0.1) : 0;
          return <g key={i} transform={`translate(${lerp(p.x, 760, eaten)} ${lerp(p.y, 700, eaten)}) scale(${p.dir * (1 - eaten)} ${1 - eaten})`}><Shrimp t={t} s={1.05} glow={uptake} ph={i} /></g>; })}
        {/* upside-down feeding flamingo head (they really filter-feed head down) */}
        {head > 0 && (
          <g transform={`translate(0 ${lerp(-700, 0, head)})`}>
            <path d={`M800 -40 C${820 + Math.sin(t * 2) * 20} 200 ${720 - Math.sin(t * 2) * 20} 420 760 640`} stroke="#FF7C9E" strokeWidth="44" fill="none" strokeLinecap="round" />
            <g transform="translate(760 668) rotate(180) scale(1.5)">
              <circle r="38" fill="#FF7C9E" />
              <path d="M24 -14 C60 -20 86 -6 94 24 L83 32 C74 8 54 2 28 8Z" fill="#FBE6EC" /><path d="M80 4 C90 10 96 20 96 34 L85 38 C83 26 78 20 70 14Z" fill="#26202A" />
              <circle cx="4" cy="-8" r="11" fill="#fff" /><circle cx="6" cy="-8" r="6" fill="#22102A" />
            </g>
            {Array.from({ length: 6 }, (_, i) => { const u = ((t * 0.6 + i / 6) % 1); return <circle key={i} cx={lerp(760, 800, u) + Math.sin(u * 6) * 12} cy={lerp(640, -40, u)} r="9" fill="#FF7A3D" opacity={head * 0.9} style={{ filter: "drop-shadow(0 0 8px #FF7A3D)" }} />; })}
          </g>
        )}
        {/* feather colour meter: the change is slow */}
        {meter > 0.01 && (
          <g transform={`translate(240 560) scale(${meter})`}>
            <rect x="-170" y="-250" width="340" height="470" rx="40" fill="#fff" opacity="0.9" />
            <clipPath id="featherClip"><path d="M0 -200 C80 -160 100 -40 70 60 C50 120 20 150 0 170 C-20 150 -50 120 -70 60 C-100 -40 -80 -160 0 -200Z" /></clipPath>
            <path d="M0 -200 C80 -160 100 -40 70 60 C50 120 20 150 0 170 C-20 150 -50 120 -70 60 C-100 -40 -80 -160 0 -200Z" fill="#D6D1D9" />
            <g clipPath="url(#featherClip)"><rect x="-120" y={170 - 380 * prog} width="240" height="400" fill="url(#featherG)" /></g>
            <path d="M0 -190 L0 200" stroke="#fff" strokeWidth="7" strokeLinecap="round" />
            {[-120, -60, 0, 60].map((y, i) => <path key={i} d={`M0 ${y} l-50 30 M0 ${y} l50 30`} stroke="#fff" strokeWidth="3" opacity="0.6" />)}
            <text x="0" y="-205" textAnchor="middle" fontFamily="Baloo" fontWeight="800" fontSize="40" fill="#7A1E4A">{["WEEKS", "MONTHS", "YEARS"][stage]}</text>
            {[0, 1, 2].map((i) => <circle key={i} cx={-40 + i * 40} cy="200" r="11" fill={i <= stage ? "#FF5C8A" : "#E2DDE5"} />)}
          </g>
        )}
        {pigCard > 0.01 && (
          <g transform={`translate(540 430) scale(${pigCard})`}>
            <rect x="-380" y="-130" width="760" height="250" rx="50" fill="#fff" stroke="#FF7A3D" strokeWidth="10" style={{ filter: "drop-shadow(0 12px 0 rgba(6,60,90,0.35))" }} />
            <text x="0" y="10" textAnchor="middle" fontFamily="Baloo" fontWeight="800" fontSize="150" fill="url(#pigG)">PIGMENT</text>
            <text x="0" y="82" textAnchor="middle" fontFamily="NunitoX" fontWeight="900" fontSize="46" fill="#0E6E8C">rang beruvchi modda</text>
            {[0, 1, 2, 3].map((i) => <circle key={i} cx={-320 + (i % 2) * 640} cy={-80 + Math.floor(i / 2) * 160} r="18" fill={["#FF7A3D", "#FF5C8A", "#FFC23D", "#FF3D6E"][i]} />)}
          </g>
        )}
      </Svg>
    </AbsoluteFill>
  );
};

// =================================================================== 4. TIME-LAPSE: chick grows into a pink flamingo
export const Lapse: React.FC<{ t: number }> = ({ t }) => {
  const ph = Math.max(0, t - SC.lapse) / 0.72;
  const settle = seg(t, 17.9, 18.4);
  const day = 0.5 + 0.5 * Math.cos(ph * Math.PI * 2);
  const skyTop = mixHex(mixHex("#1B1E4A", "#62CFFF", day), "#FF8A8B", settle), skyBot = mixHex(mixHex("#3A2D6E", "#CFF6FF", day), "#FFD3A5", settle);
  const sunA = (t < 17.9 ? ph % 1 : 0.62) * Math.PI;
  const a = smooth(seg(t, SC.lapse + 0.1, 17.95));
  const ages = [1 - seg(a, 0.25, 0.4), seg(a, 0.25, 0.4) * (1 - seg(a, 0.62, 0.78)), seg(a, 0.62, 0.78)];
  const year = a < 0.33 ? 1 : a < 0.66 ? 2 : 3;
  const yrChip = outBack(seg(t, SC.lapse + 0.2, SC.lapse + 0.5)) * (1 - seg(t, 17.7, 17.95));
  const fx = lerp(520, 800, smooth(seg(t, 17.85, 18.3))), fs = lerp(1, 0.7, smooth(seg(t, 17.85, 18.3)));
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(${skyTop} 0%, ${skyBot} 50%)` }} />
      <Svg>
        {(1 - day) * (1 - settle) > 0.2 && Array.from({ length: 30 }, (_, i) => <circle key={i} cx={hash(i) * 1080} cy={hash(i + 3) * 800} r={2 + 3 * hash(i + 5)} fill="#fff" opacity={(1 - day) * (1 - settle)} />)}
        <circle cx={540 - Math.cos(sunA) * 520} cy={950 - Math.sin(sunA) * 650} r="90" fill="#FFD27A" style={{ filter: "drop-shadow(0 0 50px #FFB45E)" }} />
        <rect x="0" y="900" width="1080" height="320" fill="url(#seaG)" opacity={0.6 + 0.4 * Math.max(day, settle)} />
        <path d="M0 1180 C300 1150 700 1210 1080 1160 L1080 1920 L0 1920Z" fill="url(#sandG)" />
        <Palm x={-40} y={1190} s={1} t={t} color="#1B6E5E" />
        <ellipse cx={fx} cy="1262" rx={150 * fs} ry="20" fill="#B9844F" opacity="0.4" />
        {ages[0] > 0.01 && <g opacity={ages[0]} transform={`translate(${fx} 1255) scale(${lerp(1.1, 1.3, a / 0.4)})`}><Chick t={t} pink={a * 0.6} blink={tri(t, 16.3, 0.08)} happy={0.5} stretch={1 + 0.06 * Math.sin(t * 10)} /></g>}
        {ages[1] > 0.01 && <g opacity={ages[1]} transform={`translate(${fx} 1255) scale(${0.78 * boingAt(t, 16.8, 0.08)})`}><Flamingo t={t} pink={lerp(0.25, 0.55, seg(a, 0.3, 0.75))} neck={Math.sin(t * 2) * 0.5} lashes={false} /></g>}
        {ages[2] > 0.01 && <g opacity={ages[2]} transform={`translate(${fx} 1255) scale(${fs * boingAt(t, 17.6, 0.08)})`}><Flamingo t={t} pink={lerp(0.6, 1, seg(a, 0.7, 1))} neck={Math.sin(t * 1.6) * 0.6} tilt={Math.sin(t * 1.4) * 5} legUp={settle} blink={tri(t, 19.2, 0.08)} /></g>}
        {[16.8, 17.6].map((tt, i) => t > tt && t < tt + 0.5 ? Array.from({ length: 6 }, (_, k) => <Spark key={`${i}${k}`} x={fx + Math.cos(k) * 180 * seg(t, tt, tt + 0.5)} y={850 + Math.sin(k * 1.7) * 200 * seg(t, tt, tt + 0.5)} r={26 * (1 - seg(t, tt, tt + 0.5))} fill="#FFF3A8" />) : null)}
        {yrChip > 0.01 && (
          <g transform={`translate(540 360) scale(${yrChip})`}>
            <rect x="-230" y="-70" width="460" height="130" rx="65" fill="#fff" stroke="#FF5C8A" strokeWidth="8" />
            <text x="0" y="22" textAnchor="middle" fontFamily="Baloo" fontWeight="800" fontSize="76" fill="#B0175A">{`YEAR ${year}`}</text>
            {[1, 2, 3].map((i) => <circle key={i} cx={-60 + (i - 1) * 60} cy="88" r="12" fill={i <= year ? "#FF5C8A" : "#fff"} stroke="#FF5C8A" strokeWidth="4" />)}
          </g>
        )}
      </Svg>
    </AbsoluteFill>
  );
};

// =================================================================== 5. COMPARE: food -> body
const Card: React.FC<{ y: number; inP: number; children: React.ReactNode }> = ({ y, inP, children }) => (
  <g transform={`translate(0 ${lerp(500, 0, outBack(inP))})`} opacity={c01(inP * 3)}>
    <rect x="70" y={y} width="940" height="300" rx="46" fill="#fff" style={{ filter: "drop-shadow(0 12px 0 rgba(176,23,90,0.25))" }} />
    {children}
  </g>
);
const Arrow: React.FC<{ y: number; p: number; t: number }> = ({ y, p, t }) => (
  <g opacity={p}><path d={`M430 ${y} L${430 + 200 * p} ${y}`} stroke="#FF5C8A" strokeWidth="16" strokeLinecap="round" strokeDasharray="22 22" strokeDashoffset={-t * 80} /><path d={`M${600 + 30 * p} ${y - 34} L${650 + 30 * p} ${y} L${600 + 30 * p} ${y + 34}`} stroke="#FF5C8A" strokeWidth="16" fill="none" strokeLinecap="round" strokeLinejoin="round" /></g>
);
export const Compare: React.FC<{ t: number }> = ({ t }) => {
  const c1 = seg(t, SC.compare + 0.15, SC.compare + 0.55), c2 = seg(t, SC.compare + 0.3, SC.compare + 0.7);
  const a1 = seg(t, EV.diet, EV.diet + 0.4), r1 = outElastic(seg(t, EV.body - 0.05, EV.body + 0.5));
  const a2 = seg(t, EV.body + 0.15, EV.body + 0.5), r2 = outElastic(seg(t, EV.body + 0.35, EV.body + 0.9));
  const junk = t > 22.7 && t < 23.9;
  const sw = junk ? boingAt(t, 22.7, 0.3) : boingAt(t, 23.9, 0.3);
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(#FFE6DA, #FFB3C6)" }} />
      <Svg>
        {Array.from({ length: 16 }, (_, i) => <circle key={i} cx={hash(i) * 1080} cy={600 + hash(i + 2) * 1300} r={20 + 40 * hash(i + 3)} fill="#fff" opacity="0.25" />)}
        <Card y={620} inP={c1}>
          <text x="250" y="880" textAnchor="middle" fontFamily="Baloo" fontWeight="800" fontSize="40" fill="#B0175A">FOOD</text>
          <g transform="translate(250 770)"><ellipse cy="30" rx="140" ry="50" fill="#BDEBF5" stroke="#2FA7C9" strokeWidth="10" /><g transform="translate(-40 0) rotate(-10)"><Shrimp t={t} s={0.65} glow={0.6} /></g><g transform="translate(50 6) rotate(-10)"><Shrimp t={t} s={0.6} glow={0.6} ph={2} /></g>{[-100, 100].map((x, i) => <path key={i} d={`M${x} 30 q-10 -50 10 -90 q12 30 -2 90`} fill="#2FBF8F" />)}</g>
          <Arrow y={770} p={a1} t={t} />
          <text x="840" y="880" textAnchor="middle" fontFamily="Baloo" fontWeight="800" fontSize="40" fill="#B0175A" opacity={c01(r1)}>BODY</text>
          <g transform={`translate(830 845) scale(${0.36 * r1})`}><Flamingo t={t} pink={1} neck={Math.sin(t * 2) * 0.6} legUp={1} tilt={Math.sin(t * 1.5) * 6} /></g>
        </Card>
        <Card y={960} inP={c2}>
          <text x="250" y="1220" textAnchor="middle" fontFamily="Baloo" fontWeight="800" fontSize="40" fill="#B0175A">FOOD</text>
          <text x="250" y="1150" textAnchor="middle" fontSize="120" transform={`translate(250 1110) scale(${sw}) translate(-250 -1110)`}>{junk ? "🍩🍟" : "🥦🍎"}</text>
          <Arrow y={1110} p={a2} t={t} />
          <text x="840" y="1220" textAnchor="middle" fontFamily="Baloo" fontWeight="800" fontSize="40" fill="#B0175A" opacity={c01(r2)}>BODY</text>
          <text x="840" y="1160" textAnchor="middle" fontSize="130" transform={`translate(840 1110) scale(${r2 * sw}) translate(-840 -1110)`}>{junk ? "😴" : "💪"}</text>
          {junk && [0, 1, 2].map((i) => <text key={i} x={900 + i * 26} y={1010 - ((t * 60 + i * 30) % 90)} fontFamily="Baloo" fontWeight="800" fontSize={34 + i * 8} fill="#7A6BB0" opacity="0.8">z</text>)}
          {!junk && t > 23.9 && t < 24.6 && Array.from({ length: 6 }, (_, k) => <Spark key={k} x={840 + Math.cos(k) * 120 * seg(t, 23.9, 24.4)} y={1100 + Math.sin(k * 1.7) * 90 * seg(t, 23.9, 24.4)} r={18 * (1 - seg(t, 23.9, 24.5))} fill="#FFC23D" />)}
        </Card>
      </Svg>
    </AbsoluteFill>
  );
};

// =================================================================== 6. ENDING: the friend with the giant pink smoothie
export const Ending: React.FC<{ t: number }> = ({ t }) => {
  const enter = outBack(seg(t, SC.friend + 0.05, SC.friend + 0.55));
  const sip = t < EV.maybe - 0.15 ? 1 : 0;
  const side = smooth(seg(t, EV.maybe - 0.1, EV.maybe + 0.25));
  const shock = outBack(seg(t, EV.end, EV.end + 0.25));
  const level = lerp(0.95, 0.55, seg(t, EV.friend, EV.maybe));
  const peek = outBack(seg(t, EV.eye - 0.35, EV.eye + 0.25));
  const wink = tri(t, EV.end + 0.25, 0.15);
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(#B9F0E8, #57C7C0)" }} />
      <Svg>
        {Array.from({ length: 12 }, (_, i) => <circle key={i} cx={hash(i + 7) * 1080} cy={hash(i + 8) * 1300} r={30 + 60 * hash(i + 9)} fill={i % 3 ? "#fff" : "#FFB3C6"} opacity={0.18 + 0.1 * Math.sin(t * 2 + i)} style={{ filter: "blur(6px)" }} />)}
        {[0, 1, 2].map((i) => <path key={i} d="M0 0 C60 -40 140 -30 200 30 C140 -10 70 -10 0 0Z" fill="#1B8E6E" opacity="0.5" transform={`translate(${1080 - i * 40} ${300 + i * 120}) rotate(${150 + i * 25 + Math.sin(t + i) * 4}) scale(1.4)`} />)}
        <g transform={`translate(770 300) rotate(${Math.sin(t * 1.5) * 2})`}>
          <path d="M-60 -120 L-60 -60 M60 -120 L60 -60" stroke="#5E4B3B" strokeWidth="5" />
          <rect x="-200" y="-60" width="400" height="120" rx="30" fill="#2A1430" />
          <text x="0" y="22" textAnchor="middle" fontFamily="Baloo" fontWeight="800" fontSize="62" fill="#FF8FB8" style={{ filter: "drop-shadow(0 0 10px #FF4F8B)" }}>SMOOTHIE</text>
        </g>
        {/* flamingo peeks over the friend's shoulder: only neck and head, the body stays hidden */}
        <g transform={`translate(0 ${lerp(760, 0, peek)})`}>
          <path d={`M330 1500 C${300 + Math.sin(t * 2) * 10} 1250 ${250 - Math.sin(t * 2) * 10} 1000 ${290} 790`} stroke="#FF7C9E" strokeWidth="44" fill="none" strokeLinecap="round" />
          <path d={`M340 1500 C${310 + Math.sin(t * 2) * 10} 1250 ${262 - Math.sin(t * 2) * 10} 1000 ${300} 800`} stroke="#FFC4D3" strokeWidth="9" fill="none" strokeLinecap="round" opacity="0.5" />
          <g transform={`translate(300 760) rotate(${-6 + 10 * shock}) scale(1.6)`}>
            <circle r="38" fill="#FF7C9E" />
            <path d="M24 -14 C60 -20 86 -6 94 24 L83 32 C74 8 54 2 28 8Z" fill="#FBE6EC" /><path d="M80 4 C90 10 96 20 96 34 L85 38 C83 26 78 20 70 14Z" fill="#26202A" />
            <circle cx="12" cy="10" r="10" fill="#FF6F96" opacity="0.45" />
            <g transform="translate(4 -8) scale(1.25)"><circle r="12" fill="#fff" /><g transform={`scale(1 ${1 - wink})`}><circle cx="-4" cy="1" r="7" fill="#22102A" /><circle cx="-2" cy="-2" r="2.6" fill="#fff" /></g>
              <rect x="-13" y="-13" width="26" height={10 * side} fill="#FF7C9E" /><path d="M-8 -11 l-5 -7 M-1 -13 l-1 -8 M6 -12 l3 -7" stroke="#22102A" strokeWidth="3" strokeLinecap="round" /></g>
          </g>
        </g>
        <g transform={`translate(540 ${lerp(2300, 1300, enter)})`}>
          <rect x="-330" y="20" width="660" height="700" fill="#14A89C" />
          <Friend t={t} sip={sip} side={side} shock={shock} level={level} blink={tri(t, 26.2, 0.1)} />
        </g>
        {shock > 0.05 && <T x={360} y={520} size={120} fill="#FFD84D" stroke="#7A1E4A" sw={14} rot={-12} scale={shock}>!?</T>}
      </Svg>
    </AbsoluteFill>
  );
};
export { inCubic };
