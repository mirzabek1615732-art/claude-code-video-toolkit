import React from "react";
import { AbsoluteFill, Audio, Img, staticFile, useCurrentFrame } from "remotion";
import { BMood, Brain, FaceHouse, Nose, SMood, Student } from "./Cast";
import { EV, SC, UZ, boingAt, c01, hash, inOut, kf, lerp, outBack, outCubic, outElastic, seg, smooth, tri } from "./util";

const FONTS = `
@font-face{font-family:RubikX;font-weight:900;src:url(${staticFile("fonts/rubik-latin-900-normal.woff2")}) format("woff2");unicode-range:U+0000-00FF,U+2000-206F;}
@font-face{font-family:RubikX;font-weight:900;src:url(${staticFile("fonts/rubik-latin-ext-900-normal.woff2")}) format("woff2");unicode-range:U+0100-02FF,U+1E00-1EFF;}
@font-face{font-family:RubikX;font-weight:800;src:url(${staticFile("fonts/rubik-latin-800-normal.woff2")}) format("woff2");unicode-range:U+0000-00FF,U+2000-206F;}
@font-face{font-family:RubikX;font-weight:800;src:url(${staticFile("fonts/rubik-latin-ext-800-normal.woff2")}) format("woff2");unicode-range:U+0100-02FF,U+1E00-1EFF;}
@font-face{font-family:NunitoX;font-weight:900;src:url(${staticFile("fonts/nunito-latin-900-normal.woff2")}) format("woff2");unicode-range:U+0000-00FF,U+2000-206F;}
@font-face{font-family:NunitoX;font-weight:900;src:url(${staticFile("fonts/nunito-latin-ext-800-normal.woff2")}) format("woff2");unicode-range:U+0100-02FF,U+1E00-1EFF;}
`;
const MINT = "#5FF2C8", CORAL = "#FF7A6B", VIOLET = "#8E7CFF", NAVY = "#0D1440";
const Defs: React.FC = () => (
  <svg width="0" height="0" style={{ position: "absolute" }}>
    <defs>
      <radialGradient id="brainG" cx="0.4" cy="0.3" r="0.8"><stop offset="0" stopColor="#FFC2CF" /><stop offset="0.6" stopColor="#FF8FA6" /><stop offset="1" stopColor="#E0607E" /></radialGradient>
      <radialGradient id="noseG" cx="0.4" cy="0.3" r="0.8"><stop offset="0" stopColor="#F6C7A2" /><stop offset="1" stopColor="#D08A62" /></radialGradient>
      <linearGradient id="roomG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#0B1238" /><stop offset="1" stopColor="#2A1B66" /></linearGradient>
      <linearGradient id="screenG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#13306B" /><stop offset="1" stopColor="#0B1A45" /></linearGradient>
      <linearGradient id="deskG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#3B2E8F" /><stop offset="1" stopColor="#1B1450" /></linearGradient>
      <linearGradient id="curtG" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#7A1E4A" /><stop offset="0.5" stopColor="#C2366E" /><stop offset="1" stopColor="#7A1E4A" /></linearGradient>
      <linearGradient id="phraseG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#FFFFFF" /><stop offset="0.5" stopColor="#B9FFE9" /><stop offset="1" stopColor="#5FF2C8" /></linearGradient>
      <radialGradient id="spot"><stop offset="0" stopColor="#FFF2C2" stopOpacity="0.55" /><stop offset="1" stopColor="#FFF2C2" stopOpacity="0" /></radialGradient>
      <linearGradient id="roomPOV" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#BFE9FF" /><stop offset="1" stopColor="#E8E0FF" /></linearGradient>
    </defs>
  </svg>
);
const Svg: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <svg width="1080" height="1920" viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0, overflow: "visible", ...style }}>{children}</svg>
);
const T: React.FC<{ x: number; y: number; size: number; children: React.ReactNode; fill?: string; stroke?: string; sw?: number; rot?: number; scale?: number; opacity?: number; weight?: number; anchor?: "middle" | "start" }> = ({ x, y, size, children, fill = "#fff", stroke = NAVY, sw = 14, rot = 0, scale = 1, opacity = 1, weight = 900, anchor = "middle" }) => (
  <text transform={`translate(${x} ${y}) rotate(${rot}) scale(${scale})`} textAnchor={anchor} fontFamily="RubikX" fontWeight={weight} fontSize={size} fill={fill} stroke={stroke} strokeWidth={sw} strokeLinejoin="round" paintOrder="stroke fill" opacity={opacity} style={{ filter: "drop-shadow(0 8px 0 rgba(8,10,40,0.45))" }}>{children}</text>
);
const Chip: React.FC<{ x: number; y: number; en: string; uz?: string; color: string; p: number; w: number; dark?: boolean }> = ({ x, y, en, uz, color, p, w, dark }) => (
  <g transform={`translate(${x} ${y}) scale(${p})`} opacity={c01(p * 2)}>
    <rect x={-w / 2} y="-44" width={w} height={uz ? 112 : 88} rx="30" fill={dark ? "rgba(13,20,64,0.88)" : "#fff"} stroke={color} strokeWidth="6" />
    <text y="12" textAnchor="middle" fontFamily="RubikX" fontWeight={900} fontSize="42" fill={dark ? "#fff" : color}>{en}</text>
    {uz && <text y="52" textAnchor="middle" fontFamily="NunitoX" fontWeight={900} fontSize="30" fill={dark ? MINT : "#3B2E8F"}>{uz}</text>}
  </g>
);

// ================================================================= control room (hook and ending)
const Monitor: React.FC<{ x: number; y: number; w: number; h: number; t: number; kind: number; alert: number; nose: number; children?: React.ReactNode }> = ({ x, y, w, h, t, kind, alert, nose, children }) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x={-w / 2 - 8} y={-h / 2 - 8} width={w + 16} height={h + 16} rx="14" fill="#2A2A6A" />
    <rect x={-w / 2} y={-h / 2} width={w} height={h} rx="10" fill={alert > 0.5 ? "#3A0A1E" : "url(#screenG)"} />
    <clipPath id={`m${x}${y}`}><rect x={-w / 2} y={-h / 2} width={w} height={h} rx="10" /></clipPath>
    <g clipPath={`url(#m${x}${y})`}>
      {nose > 0.05 ? <g opacity={nose} transform={`translate(0 ${h * 0.42}) scale(${h / 520})`}><Nose t={t} wave={1} /></g>
        : kind === 0 ? <path d={Array.from({ length: 30 }, (_, i) => `${i ? "L" : "M"}${-w / 2 + (i / 29) * w} ${Math.sin(i * 0.8 + t * 6) * h * 0.25}`).join(" ")} stroke={MINT} strokeWidth="5" fill="none" />
          : kind === 1 ? <g><ellipse rx={w * 0.3} ry={h * 0.22} fill="none" stroke={MINT} strokeWidth="5" /><circle cx={Math.sin(t * 2) * w * 0.12} r={h * 0.12} fill={MINT} /></g>
            : kind === 2 ? Array.from({ length: 5 }, (_, i) => <rect key={i} x={-w / 2 + 14 + i * (w - 28) / 5} y={h / 2 - 10 - (0.3 + 0.6 * Math.abs(Math.sin(t * 3 + i))) * h * 0.7} width={(w - 28) / 5 - 8} height={(0.3 + 0.6 * Math.abs(Math.sin(t * 3 + i))) * h * 0.7} fill={i % 2 ? VIOLET : MINT} />)
              : <g><rect x={-w / 2} y={((t * 120) % h) - h / 2} width={w} height="6" fill={MINT} opacity="0.6" />{Array.from({ length: 4 }, (_, i) => <rect key={i} x={-w * 0.35} y={-h * 0.3 + i * h * 0.17} width={w * (0.3 + 0.4 * hash(i + kind))} height="10" rx="5" fill="#8EA6FF" opacity="0.6" />)}</g>}
      {children}
    </g>
    {alert > 0.05 && <rect x={-w / 2} y={-h / 2} width={w} height={h} rx="10" fill="none" stroke="#FF3D5A" strokeWidth={6 + 4 * alert} opacity={alert} />}
  </g>
);
const ControlRoom: React.FC<{ t: number; alert: number; noseScreens: number; brainMood: BMood; press: number; palm: number; studentOnScreen: number; talk: number }> = ({ t, alert, noseScreens, brainMood, press, palm, studentOnScreen, talk }) => {
  const mons = [[190, 330, 280, 180, 0], [890, 330, 280, 180, 2], [190, 560, 280, 180, 3], [890, 560, 280, 180, 1]];
  return (
    <AbsoluteFill>
      <Svg>
        <rect width="1080" height="1920" fill="url(#roomG)" />
        {Array.from({ length: 12 }, (_, i) => <path key={i} d={`M${i * 100} 0 L${i * 100} 1920`} stroke="#3A3A9A" strokeWidth="2" opacity="0.25" />)}
        {Array.from({ length: 20 }, (_, i) => <path key={`h${i}`} d={`M0 ${i * 100} L1080 ${i * 100}`} stroke="#3A3A9A" strokeWidth="2" opacity="0.18" />)}
        {mons.map(([x, y, w, h, k], i) => <Monitor key={i} x={x} y={y} w={w} h={h} t={t + i} kind={k} alert={alert * (0.6 + 0.4 * Math.sin(t * 8 + i))} nose={noseScreens * c01((noseScreens * 4) - i * 0.6)} />)}
        <Monitor x={540} y={445} w={360} h={400} t={t} kind={3} alert={alert} nose={0}>
          {alert > 0.05 && studentOnScreen < 0.5 && <g opacity={alert}><text y="-20" textAnchor="middle" fontFamily="RubikX" fontWeight={900} fontSize="52" fill="#FF3D5A">SECRET</text><text y="44" textAnchor="middle" fontFamily="RubikX" fontWeight={900} fontSize="52" fill="#FF3D5A">DETECTED!</text><path d="M0 -140 L40 -80 L-40 -80Z" fill="#FF3D5A" /><text y="-92" textAnchor="middle" fontFamily="RubikX" fontWeight={900} fontSize="40" fill="#3A0A1E">!</text></g>}
          {studentOnScreen > 0.05 && <g opacity={studentOnScreen} transform="translate(0 270) scale(0.62)"><rect x="-400" y="-760" width="800" height="900" fill="#BFE9FF" /><Student t={t} mood="deadpan" talk={talk} /></g>}
        </Monitor>
        <g transform="translate(540 900)"><Brain t={t} mood={brainMood} press={press} palm={palm} blink={tri(t, 1.6, 0.08) + tri(t, 26.0, 0.08)} lookX={brainMood === "sneaky" ? -0.6 : 0} /></g>
        <path d="M0 1060 L1080 1060 L1080 1920 L0 1920Z" fill="url(#deskG)" />
        {Array.from({ length: 6 }, (_, i) => <rect key={`p${i}`} x={60 + i * 165} y="1540" width="130" height="260" rx="16" fill="#2A2070" stroke="#4A3AA8" strokeWidth="4" />)}
        <rect x="0" y="1050" width="1080" height="20" fill={VIOLET} opacity="0.7" />
        {Array.from({ length: 10 }, (_, i) => <circle key={i} cx={120 + i * 40} cy={1130 + (i % 2) * 40} r="10" fill={i % 3 ? MINT : CORAL} opacity={0.5 + 0.5 * Math.abs(Math.sin(t * 4 + i))} />)}
        <g transform={`translate(760 ${1110 + press * 14})`}>
          <ellipse cy="30" rx="120" ry="34" fill="#1B1450" />
          <ellipse cy={press * 6} rx="96" ry="40" fill="#FF3D5A" stroke="#9E0F2A" strokeWidth="6" />
          <text y={12 + press * 6} textAnchor="middle" fontFamily="RubikX" fontWeight={900} fontSize="42" fill="#fff">HIDE!</text>
        </g>
      </Svg>
      {alert > 0.05 && <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 30%, rgba(255,40,80,0.18), transparent 70%)", opacity: alert * (0.6 + 0.4 * Math.sin(t * 7)) }} />}
    </AbsoluteFill>
  );
};

// ================================================================= the curtain reveal
const Reveal: React.FC<{ t: number }> = ({ t }) => {
  const open = outCubic(seg(t, SC.reveal + 0.05, SC.reveal + 0.5));
  const noseIn = outElastic(seg(t, EV.nose3 - 0.15, EV.nose3 + 0.5));
  return (
    <AbsoluteFill>
      <Svg>
        <rect width="1080" height="1920" fill="#14103A" />
        <ellipse cx="540" cy="1150" rx="380" ry="80" fill="#2A1B66" />
        <polygon points="420,0 660,0 840,1150 240,1150" fill="url(#spot)" />
        <g transform={`translate(540 1150) scale(${1.25 * noseIn})`}><Nose t={t} wave={1} /></g>
        {[0, 1, 2, 3, 4, 5].map((i) => <circle key={i} cx={300 + i * 95} cy={1210} r="5" fill="#FFF2C2" opacity={0.4 + 0.5 * Math.abs(Math.sin(t * 6 + i))} />)}
        <g transform={`translate(${-560 * open} 0)`}><path d={`M0 0 L560 0 C${540 + 20 * Math.sin(t * 3)} 600 560 1200 ${540 + 30 * open} 1920 L0 1920Z`} fill="url(#curtG)" />{[1, 2, 3].map((k) => <path key={k} d={`M${k * 130} 0 L${k * 130 + 10 * Math.sin(t * 2 + k)} 1920`} stroke="#5A0F34" strokeWidth="8" opacity="0.4" />)}</g>
        <g transform={`translate(${560 * open} 0)`}><path d={`M1080 0 L520 0 C${540 - 20 * Math.sin(t * 3)} 600 520 1200 ${540 - 30 * open} 1920 L1080 1920Z`} fill="url(#curtG)" />{[1, 2, 3].map((k) => <path key={k} d={`M${1080 - k * 130} 0 L${1080 - k * 130 - 10 * Math.sin(t * 2 + k)} 1920`} stroke="#5A0F34" strokeWidth="8" opacity="0.4" />)}</g>
        <path d="M0 0 L1080 0 L1080 190 C900 230 720 170 540 210 C360 170 180 230 0 190Z" fill="#5A0F34" />
        {noseIn > 0.3 && <T x={540} y={520} size={150} fill={CORAL} stroke="#fff" sw={14} scale={outBack(seg(t, EV.nose3 - 0.05, EV.nose3 + 0.25))} rot={-4}>YOUR NOSE!</T>}
      </Svg>
    </AbsoluteFill>
  );
};

// ================================================================= first-person view (pov) and the try-it moment share a room
const PovRoom: React.FC<{ t: number; sway: number }> = ({ t, sway }) => (
  <Svg>
    <rect width="1080" height="1920" fill="url(#roomPOV)" />
    <g transform={`translate(${sway * 30} ${sway * 10})`}>
      <rect x="560" y="260" width="400" height="520" rx="20" fill="#7FD3FF" stroke="#fff" strokeWidth="18" />
      <path d="M560 640 C700 600 820 660 960 610 L960 780 L560 780Z" fill="#5FC88F" />
      <circle cx="880" cy="360" r="40" fill="#FFE27A" />
      <path d="M760 520 L760 780 M560 520 L960 520" stroke="#fff" strokeWidth="12" />
      <rect x="120" y="300" width="300" height="200" rx="14" fill="#fff" stroke="#C9C1FF" strokeWidth="8" />
      {[0, 1, 2].map((i) => <rect key={i} x="150" y={330 + i * 50} width={200 - i * 40} height="22" rx="11" fill="#E0DAFF" />)}
      <rect x="40" y="980" width="1000" height="40" rx="12" fill="#8E6BD8" />
      <rect x="80" y="1020" width="920" height="900" fill="#B9A6F0" />
      <g transform="translate(540 940)"><rect x="-230" y="-180" width="460" height="290" rx="22" fill="#2A2A6A" /><rect x="-210" y="-160" width="420" height="250" rx="12" fill="#E8F6FF" /><rect x="-280" y="110" width="560" height="30" rx="10" fill="#3A3A8A" /></g>
      <g transform="translate(890 960)"><path d="M-40 0 L40 0 L30 80 L-30 80Z" fill="#FF7A6B" /><path d="M-10 -10 q-30 -80 10 -110 q20 50 -10 110Z M10 -10 q40 -60 60 -60 q-10 50 -60 60Z" fill="#3FBF6A" /></g>
    </g>
  </Svg>
);
const BlurNose: React.FC<{ o: number; t: number; dx?: number }> = ({ o, t, dx = 0 }) => (
  <svg width="1080" height="1920" viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0, opacity: o * 0.7, filter: "blur(22px)" }}>
    <g transform={`translate(${540 + dx} 2080) scale(2.0)`}><path d="M0 -330 C40 -320 70 -200 110 -140 C150 -90 130 -50 80 -54 L-80 -54 C-130 -50 -150 -90 -110 -140 C-70 -200 -40 -320 0 -330Z" fill="#E2A97E" /></g>
    <g transform={`translate(${540 + dx + 50} 2095) scale(1.95)`} opacity="0.5"><path d="M0 -330 C40 -320 70 -200 110 -140 C150 -90 130 -50 80 -54 L-80 -54 C-130 -50 -150 -90 -110 -140 C-70 -200 -40 -320 0 -330Z" fill="#E2A97E" /></g>
  </svg>
);
const Pov: React.FC<{ t: number }> = ({ t }) => {
  const sway = Math.sin(t * 0.9);
  const outline = seg(t, EV.field - 0.1, EV.field + 0.4) * (1 - seg(t, EV.but4, EV.but4 + 0.3));
  const push = smooth(seg(t, EV.but4 + 0.2, EV.ignores + 0.4));
  const filt = outBack(seg(t, EV.n4end + 0.05, EV.n4end + 0.4));
  return (
    <AbsoluteFill>
      <PovRoom t={t} sway={sway} />
      <BlurNose o={lerp(0.85, 0.22, push)} t={t} dx={push * 40} />
      <Svg>
        {outline > 0.01 && <g opacity={outline}><ellipse cx="540" cy="1820" rx="280" ry="330" fill="none" stroke={CORAL} strokeWidth="10" strokeDasharray="30 20" strokeDashoffset={-t * 60} /><path d="M540 1490 L540 1230" stroke={CORAL} strokeWidth="8" /></g>}
        <Chip x={540} y={1170} en="IN YOUR FIELD OF VISION" uz="ko‘rish maydoningizda" color={CORAL} p={outBack(seg(t, EV.field, EV.field + 0.3)) * (1 - seg(t, EV.but4, EV.but4 + 0.2))} w={720} />
        {/* a giant mint glove: the brain nudging the nose out of attention (a metaphor) */}
        {push > 0.01 && push < 1 && <g transform={`translate(${lerp(-200, 380, push)} ${1560}) rotate(-20)`}><ellipse rx="130" ry="90" fill={MINT} stroke="#1E7A66" strokeWidth="8" />{[0, 1, 2, 3].map((k) => <rect key={k} x={60 + 0} y={-80 + k * 44} width="110" height="40" rx="20" fill={MINT} stroke="#1E7A66" strokeWidth="8" />)}</g>}
        {filt > 0.01 && (
          <g>
            <T x={540} y={330} size={80} fill="#fff" stroke={NAVY} sw={10} scale={filt}>YOUR BRAIN</T>
            <T x={540} y={428} size={80} fill={MINT} stroke={NAVY} sw={10} scale={filt}>FILTERS IT OUT</T>
            {[[760, 560, "sky"], [540, 880, "screen"], [890, 920, "plant"]].map(([x, y], i) => <circle key={i} cx={x as number} cy={y as number} r={70 + 8 * Math.sin(t * 5 + i)} fill="none" stroke={MINT} strokeWidth="8" opacity={filt * c01((t - EV.n4end - 0.3 - i * 0.2) * 4)} />)}
            <Chip x={540} y={1180} en="ALWAYS THERE = USUALLY IGNORED" uz="doim joyida, shuning uchun sezilmaydi" color={VIOLET} p={outBack(seg(t, EV.n4end + 0.5, EV.n4end + 0.8))} w={860} dark />
          </g>
        )}
      </Svg>
    </AbsoluteFill>
  );
};

const studentMood = (t: number): SMood => {
  if (t < EV.try) return "curious";
  if (t < EV.blurry) return "neutral";
  if (t < EV.n6end + 0.05) return "cross";
  if (t < EV.n7end + 0.3) return "shock";
  if (t < EV.cant8) return "ignore";
  if (t < EV.unsee8 + 0.4) return "peek";
  if (t < EV.s1end + 0.2) return "point";
  if (t < EV.notice9) return "shock";
  if (t < EV.stop9 - 0.3) return "ignore";
  if (t < EV.stop9 + 0.2) return "peek";
  return "shock";
};
const TryIt: React.FC<{ t: number }> = ({ t }) => {
  const sway = Math.sin(t * 0.9) + 0.6 * Math.sin(t * 2.3) * seg(t, EV.try, EV.try + 0.5);
  const nose = seg(t, EV.try - 0.1, EV.now + 0.3);
  const arrow = outBack(seg(t, EV.blurry - 0.1, EV.blurry + 0.25)) * (1 - seg(t, EV.n7end, EV.n7end + 0.3));
  const mood = studentMood(t);
  const enter = outBack(seg(t, SC.try, SC.try + 0.5));
  const phrasePhase = t > SC.phrase;
  const sx = phrasePhase ? lerp(540, 780, smooth(seg(t, EV.s1end + 0.1, EV.say9))) : 540;
  const ss = phrasePhase ? lerp(1, 0.72, smooth(seg(t, EV.s1end + 0.1, EV.say9))) : 1;
  const sq = boingAt(t, EV.n6end + 0.05, 0.12) * boingAt(t, EV.i1, 0.1);
  return (
    <AbsoluteFill>
      <PovRoom t={t} sway={sway * 0.6} />
      <AbsoluteFill style={{ background: "rgba(13,20,64,0.25)" }} />
      <Svg>
        <g transform={`translate(${sx} ${lerp(2300, 1430, enter)}) scale(${ss * 0.95} ${ss * 0.95 * sq})`}><Student t={t} mood={mood} blink={tri(t, 11.6, 0.08)} headTilt={mood === "ignore" ? -8 : mood === "curious" ? 6 : 0} lookX={mood === "neutral" ? 0 : 0} /></g>
        <Chip x={540} y={330} en="TRY IT NOW 👀" uz="hozir sinab ko‘ring" color={CORAL} p={outBack(seg(t, EV.try - 0.05, EV.try + 0.3)) * (1 - seg(t, SC.phrase - 0.3, SC.phrase))} w={520} />
        {arrow > 0.01 && <g transform={`translate(860 1560) scale(${arrow})`}><path d="M0 0 L-150 230" stroke={CORAL} strokeWidth="16" strokeLinecap="round" /><path d="M-150 230 L-160 170 M-150 230 L-100 200" stroke={CORAL} strokeWidth="16" strokeLinecap="round" /><text x="20" y="-20" textAnchor="middle" fontFamily="RubikX" fontWeight={900} fontSize="44" fill="#fff" stroke={NAVY} strokeWidth="10" paintOrder="stroke fill">BLURRY SHAPE?</text></g>}
      </Svg>
      <BlurNose o={0.75 * nose * (phrasePhase ? 0.6 + 0.4 * Math.abs(Math.sin(t * 3)) : 1)} t={t} dx={sway * -30} />
    </AbsoluteFill>
  );
};

// ================================================================= "I CAN'T UNSEE IT!" and the house example
const Phrase: React.FC<{ t: number }> = ({ t }) => {
  if (t < EV.i1 - 0.1 || t > SC.lab + 0.2) return null;
  const out = 1 - seg(t, SC.lab - 0.3, SC.lab);
  const settle = inOut(seg(t, EV.s1end + 0.15, EV.s1end + 0.6));
  const w = (at: number) => outBack(seg(t, at - 0.05, at + 0.22));
  const words: [string, number, number, number][] = [["I", EV.i1, 212, 430], ["CAN'T", EV.cant1, 610, 430], ["UNSEE", EV.unsee1, 370, 610], ["IT!", EV.it1, 867, 610]];
  const small: [number, number][] = [[141, 330], [334, 330], [650, 330], [891, 330]];
  const card = outBack(seg(t, EV.s1end - 0.1, EV.s1end + 0.2));
  return (
    <Svg style={{ opacity: out }}>
      {words.map(([wd, at, x, y], i) => {
        const p = w(at);
        const X = lerp(x, small[i][0], settle), Y = lerp(y, small[i][1], settle), S = lerp(1, 0.48, settle);
        return <T key={i} x={X} y={Y} size={170 * S} fill="url(#phraseG)" stroke={NAVY} sw={lerp(18, 10, settle)} scale={p} rot={(1 - settle) * (i % 2 ? 3 : -3)}>{wd}</T>;
      })}
      {card > 0.01 && (
        <g transform={`translate(540 ${lerp(720, 440, settle)}) scale(${card})`}>
          <rect x="-450" y="-50" width="900" height="100" rx="30" fill="rgba(13,20,64,0.9)" stroke={MINT} strokeWidth="6" />
          <text y="16" textAnchor="middle" fontFamily="NunitoX" fontWeight={900} fontSize="46" fill={MINT}>Endi buni ko‘rmaganga ololmayman!</text>
        </g>
      )}
    </Svg>
  );
};
const Example: React.FC<{ t: number }> = ({ t }) => {
  const inP = outBack(seg(t, EV.s1end + 0.55, EV.s1end + 0.95)) * (1 - seg(t, SC.lab - 0.35, SC.lab - 0.05));
  if (inP < 0.01) return null;
  const b1 = outBack(seg(t, EV.say9 + 0.15, EV.say9 + 0.45)), glow = seg(t, EV.notice9, EV.notice9 + 0.4), b2 = outBack(seg(t, EV.notice9 + 0.5, EV.notice9 + 0.8));
  return (
    <Svg>
      <g transform={`translate(330 ${940 + (1 - inP) * 600}) rotate(-4)`}>
        <rect x="-200" y="-380" width="400" height="760" rx="46" fill="#1B1450" stroke="#C9C1FF" strokeWidth="8" />
        <rect x="-180" y="-350" width="360" height="700" rx="28" fill="#F4F2FF" />
        <rect x="-170" y="-330" width="340" height="300" rx="20" fill="#BFE9FF" />
        <g transform="translate(0 -150) scale(0.9)"><FaceHouse glow={glow} /></g>
        <g transform={`translate(-160 40) scale(${b1})`}><rect x="0" y="-40" width="300" height="80" rx="26" fill="#E0DAFF" /><text x="20" y="12" fontFamily="NunitoX" fontWeight={900} fontSize="28" fill="#23185A">Look! It has a face!</text></g>
        <g transform={`translate(160 160) scale(${b2})`}><rect x="-300" y="-44" width="300" height="88" rx="26" fill={MINT} /><text x="-282" y="12" fontFamily="NunitoX" fontWeight={900} fontSize="30" fill="#0D1440">I can't unsee it! 😳</text></g>
      </g>
      <Chip x={330} y={1260} en="WHEN TO SAY IT" uz="qachon aytiladi" color={CORAL} p={outBack(seg(t, EV.say9, EV.say9 + 0.3))} w={420} />
    </Svg>
  );
};

// ---------------------------------------------------------------- subtitles, watermark, camera
const UzSub: React.FC<{ t: number }> = ({ t }) => {
  const u = UZ.find((x) => t >= x.s && t < x.e);
  if (!u) return null;
  const a = c01((t - u.s) / 0.12) * (1 - c01((t - (u.e - 0.1)) / 0.1));
  const quote = u.text.startsWith("“");
  return (
    <div style={{ position: "absolute", left: 60, right: 60, top: 1362, display: "flex", justifyContent: "center", opacity: a, transform: `translateY(${(1 - a) * 10}px)` }}>
      <div style={{ maxWidth: 960, textAlign: "center", fontFamily: "NunitoX", fontWeight: 900, fontSize: 54, lineHeight: 1.16, color: quote ? MINT : "#FFFFFF", WebkitTextStroke: "10px rgba(13,16,52,0.92)", paintOrder: "stroke fill", textShadow: "0 5px 12px rgba(0,0,0,0.55)" }}>{u.text}</div>
    </div>
  );
};
// brand rule (brands/bakhriddinov-school/README.md): official logo, top-right, as in Episode 1
const SchoolWatermark: React.FC = () => (
  <Img src={staticFile("logo-watermark.png")} style={{ position: "absolute", top: 104, right: 44, width: 252, opacity: 0.85, filter: "drop-shadow(0 2px 6px rgba(0,8,30,0.7))" }} />
);
const camAt = (t: number) => {
  const shake = (t0: number, a: number) => (t >= t0 ? a * Math.exp(-(t - t0) * 9) * Math.sin((t - t0) * 70) : 0);
  const z = kf(t, [[0, 1.0], [3.3, 1.12], [3.45, 1.0], [SC.lab, 1.0], [EV.end, 1.08], [30, 1.1]]);
  const x = shake(EV.n2end + 0.08, 10) + shake(EV.s1end, 8);
  const y = shake(EV.n10end + 0.05, 6);
  return `translate(${x}px, ${y}px) scale(${z})`;
};

export const Episode: React.FC = () => {
  const t = useCurrentFrame() / 30;
  const alert = t < SC.reveal ? c01((t - 0.25) * 3) : t > SC.lab ? c01((t - SC.lab - 0.2) * 3) : 0;
  const hookPress = t < SC.reveal ? tri(t, EV.n2end + 0.12, 0.12) : 0;
  const mash = t > EV.n10end && t < EV.n10end + 0.6 ? Math.abs(Math.sin((t - EV.n10end) * Math.PI * 10)) : 0;
  const palm = smooth(seg(t, EV.end + 0.05, EV.end + 0.35));
  const bm: BMood = t < SC.reveal ? (t < 0.7 ? "calm" : "panic") : t < EV.too ? "panic" : palm > 0.1 ? "facepalm" : "alarm";
  const wipe = (a: number, b: number) => inOut(seg(t, a, b));
  const w1 = wipe(SC.reveal - 0.15, SC.reveal + 0.1), w2 = wipe(SC.pov - 0.2, SC.pov + 0.15), w3 = wipe(SC.try - 0.2, SC.try + 0.15), w4 = wipe(SC.lab - 0.25, SC.lab + 0.1);
  return (
    <AbsoluteFill style={{ background: NAVY, overflow: "hidden" }}>
      <style>{FONTS}</style>
      <Defs />
      <AbsoluteFill style={{ transform: camAt(t) }}>
        {t < SC.reveal + 0.1 && <ControlRoom t={t} alert={alert} noseScreens={0} brainMood={bm} press={hookPress} palm={0} studentOnScreen={0} talk={0} />}
        {t > SC.reveal - 0.15 && t < SC.pov + 0.15 && <AbsoluteFill style={w1 < 1 ? { clipPath: `inset(0 ${50 - 50 * w1}% 0 ${50 - 50 * w1}%)` } : undefined}><Reveal t={t} /></AbsoluteFill>}
        {t > SC.pov - 0.2 && t < SC.try + 0.15 && <AbsoluteFill style={w2 < 1 ? { clipPath: `circle(${w2 * 1200}px at 540px 1700px)` } : undefined}><Pov t={t} /></AbsoluteFill>}
        {t > SC.try - 0.2 && t < SC.lab + 0.1 && <AbsoluteFill style={w3 < 1 ? { clipPath: `inset(${100 - 100 * w3}% 0 0 0)` } : undefined}><TryIt t={t} /></AbsoluteFill>}
        {t > SC.lab - 0.25 && <AbsoluteFill style={w4 < 1 ? { clipPath: `circle(${w4 * 1400}px at 540px 445px)` } : undefined}><ControlRoom t={t} alert={alert} noseScreens={seg(t, SC.lab, SC.lab + 1.2)} brainMood={bm} press={mash} palm={palm} studentOnScreen={seg(t, EV.too - 0.3, EV.too)} talk={t > EV.too && t < EV.end ? Math.abs(Math.sin(t * 16)) : 0} /></AbsoluteFill>}
      </AbsoluteFill>
      <Phrase t={t} />
      <Example t={t} />
      <UzSub t={t} />
      <SchoolWatermark />
      <Audio src={staticFile("audio/mix.wav")} />
    </AbsoluteFill>
  );
};
export { hash, lerp, outElastic };
