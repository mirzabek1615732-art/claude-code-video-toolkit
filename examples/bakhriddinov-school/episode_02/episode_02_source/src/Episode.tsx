import React from "react";
import { AbsoluteFill, Audio, Img, staticFile, useCurrentFrame } from "remotion";
import { Compare, Ending, Hook, Lapse, Mirror, Water } from "./Scenes";
import { EV, SC, UZ, c01, hash, inOut, lerp, outBack, outCubic, seg, smooth } from "./util";

const FONTS = `
@font-face{font-family:Baloo;font-weight:800;src:url(${staticFile("fonts/baloo-2-latin-800-normal.woff2")}) format("woff2");unicode-range:U+0000-00FF,U+2000-206F;}
@font-face{font-family:Baloo;font-weight:800;src:url(${staticFile("fonts/baloo-2-latin-ext-800-normal.woff2")}) format("woff2");unicode-range:U+0100-02FF,U+1E00-1EFF;}
@font-face{font-family:NunitoX;font-weight:800;src:url(${staticFile("fonts/nunito-latin-800-normal.woff2")}) format("woff2");unicode-range:U+0000-00FF,U+2000-206F;}
@font-face{font-family:NunitoX;font-weight:800;src:url(${staticFile("fonts/nunito-latin-ext-800-normal.woff2")}) format("woff2");unicode-range:U+0100-02FF,U+1E00-1EFF;}
@font-face{font-family:NunitoX;font-weight:900;src:url(${staticFile("fonts/nunito-latin-900-normal.woff2")}) format("woff2");unicode-range:U+0000-00FF,U+2000-206F;}
@font-face{font-family:NunitoX;font-weight:900;src:url(${staticFile("fonts/nunito-latin-ext-900-normal.woff2")}) format("woff2");unicode-range:U+0100-02FF,U+1E00-1EFF;}
@font-face{font-family:SGrotesk;font-weight:700;src:url(${staticFile("fonts/space-grotesk-latin-700-normal.woff2")}) format("woff2");}
`;

const Defs: React.FC = () => (
  <svg width="0" height="0" style={{ position: "absolute" }}>
    <defs>
      <linearGradient id="lagoonG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#2FC6C6" /><stop offset="1" stopColor="#0B5E86" /></linearGradient>
      <linearGradient id="seaG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#2BD3DA" /><stop offset="1" stopColor="#0F9DB5" /></linearGradient>
      <linearGradient id="sandG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#FFE6BF" /><stop offset="1" stopColor="#F2BE86" /></linearGradient>
      <radialGradient id="flashG"><stop offset="0" stopColor="#fff" stopOpacity="1" /><stop offset="1" stopColor="#fff" stopOpacity="0" /></radialGradient>
      <linearGradient id="mirrorG" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#E9FBFF" /><stop offset="1" stopColor="#9FD8EC" /></linearGradient>
      <linearGradient id="featherG" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stopColor="#FF4F86" /><stop offset="1" stopColor="#FFB3C6" /></linearGradient>
      <linearGradient id="pigG" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#FF7A3D" /><stop offset="1" stopColor="#FF3D7F" /></linearGradient>
      <linearGradient id="smoothieG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#FF9CC0" /><stop offset="1" stopColor="#FF4F8B" /></linearGradient>
      <linearGradient id="eatG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#FFE07A" /><stop offset="0.5" stopColor="#FF8A5C" /><stop offset="1" stopColor="#FF3D7F" /></linearGradient>
    </defs>
  </svg>
);

// ---------------------------------------------------------------- "YOU ARE WHAT YOU EAT": big kinetic type that settles into a header with the Uzbek meaning
const WORDS_K = [
  { w: "YOU", k: "you1" }, { w: "ARE", k: "are" }, { w: "WHAT", k: "what" }, { w: "YOU", k: "you2" }, { w: "EAT!", k: "eat" },
];
const cw = (w: string, size: number) => w.replace("!", "").length * size * 0.6 + (w.endsWith("!") ? size * 0.25 : 0);
const bigLayout = (() => {
  const lines: { words: number[]; y: number; size: number }[] = [{ words: [0, 1], y: 440, size: 150 }, { words: [2, 3], y: 600, size: 150 }, { words: [4], y: 810, size: 230 }];
  const pos: { x: number; y: number; size: number }[] = [];
  lines.forEach((l) => {
    const total = l.words.reduce((a, i) => a + cw(WORDS_K[i].w, l.size), 0) + (l.words.length - 1) * l.size * 0.42;
    let x = 540 - total / 2;
    l.words.forEach((i) => { const w = cw(WORDS_K[i].w, l.size); pos[i] = { x: x + w / 2, y: l.y, size: l.size }; x += w + l.size * 0.42; });
  });
  return pos;
})();
const headLayout = (() => {
  const size = 78, total = WORDS_K.reduce((a, w) => a + cw(w.w.replace("!", ""), size), 0) + 4 * size * 0.42;
  let x = 540 - total / 2; const pos: { x: number; y: number; size: number }[] = [];
  WORDS_K.forEach((w) => { const ww = cw(w.w.replace("!", ""), size); pos.push({ x: x + ww / 2, y: 335, size }); x += ww + size * 0.42; });
  return pos;
})();

const Expression: React.FC<{ t: number }> = ({ t }) => {
  if (t < EV.you1 - 0.1 || t > SC.friend + 0.1) return null;
  const k = inOut(seg(t, 19.45, 19.95));
  const out = 1 - seg(t, SC.friend - 0.35, SC.friend - 0.05);
  const pulse = t > 23.9 ? 1 + 0.08 * Math.sin((t - 23.9) * 14) * Math.exp(-(t - 23.9) * 4) : 1;
  const card = outBack(seg(t, 19.6, 19.95));
  return (
    <svg width="1080" height="1920" viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0, opacity: out }}>
      {k > 0.02 && <rect x={540 - 470 * k} y="262" width={940 * k} height="120" rx="60" fill="#B0175A" opacity={0.92 * k} style={{ filter: "drop-shadow(0 10px 0 rgba(60,10,40,0.3))" }} />}
      <g transform={`translate(540 335) scale(${pulse}) translate(-540 -335)`}>
        {WORDS_K.map((w, i) => {
          const at = EV[w.k];
          const p = outBack(seg(t, at - 0.06, at + 0.22));
          const a = bigLayout[i], b = headLayout[i];
          const x = lerp(a.x, b.x, k), y = lerp(a.y, b.y, k), size = lerp(a.size, b.size, k);
          const isEat = i === 4;
          return (
            <text key={i} x={x} y={y} textAnchor="middle" fontFamily="Baloo" fontWeight="800" fontSize={size} transform={`rotate(${(1 - k) * (isEat ? -5 : i % 2 ? 3 : -3)} ${x} ${y}) translate(${x} ${y}) scale(${p}) translate(${-x} ${-y})`}
              fill={isEat ? "url(#eatG)" : k > 0.5 ? "#fff" : "#fff"} stroke={k > 0.5 ? "#7A0F3E" : "#B0175A"} strokeWidth={lerp(isEat ? 20 : 16, 6, k)} paintOrder="stroke fill" strokeLinejoin="round"
              style={{ filter: k < 0.5 ? "drop-shadow(0 10px 0 rgba(90,10,50,0.35))" : undefined }}>{k > 0.5 ? w.w.replace("!", "") : w.w}</text>
          );
        })}
      </g>
      {t > EV.eat && t < EV.eat + 0.7 && Array.from({ length: 10 }, (_, i) => { const p = seg(t, EV.eat, EV.eat + 0.7); return <circle key={i} cx={540 + Math.cos(i * 0.63) * 320 * outCubic(p)} cy={740 + Math.sin(i * 0.63) * 160 * outCubic(p)} r={18 * (1 - p)} fill={["#FFE07A", "#FF8A5C", "#FF3D7F"][i % 3]} />; })}
      {card > 0.01 && (
        <g transform={`translate(540 470) scale(${card})`}>
          <rect x="-470" y="-62" width="940" height="150" rx="40" fill="#fff" stroke="#FF8FAB" strokeWidth="6" style={{ filter: "drop-shadow(0 10px 0 rgba(176,23,90,0.25))" }} />
          <rect x="-470" y="-62" width="170" height="44" rx="22" fill="#FF5C8A" />
          <text x="-385" y="-31" textAnchor="middle" fontFamily="NunitoX" fontWeight="900" fontSize="26" fill="#fff">MA’NOSI</text>
          <text x="0" y="20" textAnchor="middle" fontFamily="NunitoX" fontWeight="900" fontSize="42" fill="#5A0F35">Yegan ovqating tanang va</text>
          <text x="0" y="70" textAnchor="middle" fontFamily="NunitoX" fontWeight="900" fontSize="42" fill="#5A0F35">sog‘lig‘ingga ta’sir qiladi.</text>
        </g>
      )}
    </svg>
  );
};

// ---------------------------------------------------------------- burned-in Uzbek subtitles (phrase level)
const UzSub: React.FC<{ t: number }> = ({ t }) => {
  const u = UZ.find((x) => t >= x.s && t < x.e);
  if (!u) return null;
  const a = c01((t - u.s) / 0.14) * (1 - c01((t - (u.e - 0.1)) / 0.1));
  const parts = u.text.split(/(“[^”]*”|pigmentlar)/g);
  return (
    <div style={{ position: "absolute", left: 60, right: 60, top: 1350, display: "flex", justifyContent: "center", opacity: a, transform: `translateY(${(1 - a) * 12}px) scale(${0.97 + 0.03 * a})` }}>
      <div style={{ maxWidth: 940, padding: "14px 34px 18px", borderRadius: 34, background: "rgba(42, 10, 40, 0.68)", border: "3px solid rgba(255, 143, 171, 0.55)", textAlign: "center", fontFamily: "NunitoX", fontWeight: 900, fontSize: 52, lineHeight: 1.18, color: "#FFFFFF", textShadow: "0 3px 8px rgba(0,0,0,0.55)" }}>
        {parts.map((p, i) => <span key={i} style={/^“|^pigment/.test(p) ? { color: "#FFD84D" } : undefined}>{p}</span>)}
      </div>
    </div>
  );
};

// ---------------------------------------------------------------- school watermark (official BS mark + exact name), every frame
const Watermark: React.FC = () => (
  <div style={{ position: "absolute", left: 44, top: 140, display: "flex", alignItems: "center", gap: 14, padding: "8px 18px 8px 10px", borderRadius: 16, background: "rgba(25,4,30,0.26)", opacity: 0.86, filter: "drop-shadow(0 2px 5px rgba(20,0,30,0.5))" }}>
    <Img src={staticFile("bs-mark.png")} style={{ height: 50 }} />
    <div style={{ fontFamily: "SGrotesk", fontWeight: 700, fontSize: 25, letterSpacing: 4.5, color: "#FFFFFF", lineHeight: 1 }}>BAKHRIDDINOV SCHOOL</div>
  </div>
);

// ---------------------------------------------------------------- camera: drift plus small punches on story beats
const camAt = (t: number) => {
  const punch = (t0: number, a: number) => (t >= t0 ? a * Math.exp(-(t - t0) * 6) : 0);
  const shake = (t0: number, a: number) => (t >= t0 ? a * Math.exp(-(t - t0) * 8) * Math.sin((t - t0) * 70) : 0);
  const z = 1 + punch(EV.wait, 0.05) + punch(EV.pink1e - 0.05, 0.05) + punch(EV.gray + 0.1, 0.04) + punch(EV.pigments, 0.03) + punch(EV.eat, 0.04) + punch(EV.end, 0.05)
    + (t < SC.mirror ? 0.04 * smooth(seg(t, 0, 0.3)) : 0) + (t > EV.painted - 0.3 && t < SC.water ? 0.06 * smooth(seg(t, EV.painted - 0.3, EV.painted + 0.4)) : 0);
  const x = Math.sin(t * 0.6) * 6 + shake(EV.wait, 12) + shake(EV.pink1e, 10) + (t > EV.painted - 0.3 && t < SC.water ? -60 * smooth(seg(t, EV.painted - 0.3, EV.painted + 0.4)) : 0);
  const y = Math.cos(t * 0.5) * 6 + shake(EV.end, 10);
  return `translate(${x}px, ${y}px) scale(${z})`;
};

const Layer: React.FC<{ show: boolean; style?: React.CSSProperties; children: React.ReactNode }> = ({ show, style, children }) => (show ? <AbsoluteFill style={style}>{children}</AbsoluteFill> : null);
const wave = (yLine: number, t: number, amp = 40) => {
  const pts: string[] = [];
  for (let i = 0; i <= 24; i++) { const x = (i / 24) * 1080; pts.push(`${x}px ${yLine + Math.sin(i * 0.9 + t * 8) * amp}px`); }
  return pts;
};

export const Episode: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  const whip = smooth(seg(t, 3.02, 3.34));
  const dive = inOut(seg(t, 8.5, 9.05));
  const diveY = lerp(2050, -160, dive);
  const iris = outCubic(seg(t, 15.55, 16.05));
  const slide = outCubic(seg(t, 20.25, 20.7));
  const pour = inOut(seg(t, 24.4, 25.0));
  const pourY = lerp(2150, -300, pour);
  const cam = camAt(t);
  return (
    <AbsoluteFill style={{ background: "#2A0F2E", overflow: "hidden" }}>
      <style>{FONTS}</style>
      <Defs />
      <AbsoluteFill style={{ transform: cam }}>
        <Layer show={t < 3.4} style={{ transform: `translateX(${-1080 * whip}px)`, filter: whip > 0 && whip < 1 ? `blur(${18 * Math.sin(whip * Math.PI)}px)` : undefined }}><Hook t={t} /></Layer>
        <Layer show={t >= 3.0 && t < 9.1} style={{ transform: `translateX(${1080 * (1 - whip)}px)`, filter: whip > 0 && whip < 1 ? `blur(${18 * Math.sin(whip * Math.PI)}px)` : undefined }}><Mirror t={t} /></Layer>
        <Layer show={t >= 8.5 && t < 16.1} style={dive < 1 ? { clipPath: `polygon(${wave(diveY, t).join(",")}, 1080px 1920px, 0px 1920px)` } : undefined}><Water t={t} /></Layer>
        {dive > 0 && dive < 1 && (
          <svg width="1080" height="1920" style={{ position: "absolute", inset: 0 }}>
            <polyline points={wave(diveY, t).map((p) => p.replace(/px/g, "")).join(" ")} fill="none" stroke="#E6FFFF" strokeWidth="16" opacity="0.9" />
            {Array.from({ length: 14 }, (_, i) => <circle key={i} cx={hash(i) * 1080} cy={diveY + 40 + hash(i + 1) * 260} r={8 + 16 * hash(i + 2)} fill="none" stroke="#fff" strokeWidth="4" opacity="0.8" />)}
          </svg>
        )}
        <Layer show={t >= 15.55 && t < 20.8} style={iris < 1 ? { clipPath: `circle(${1300 * iris}px at 540px 900px)` } : undefined}><Lapse t={t} /></Layer>
        {iris > 0 && iris < 1 && (
          <svg width="1080" height="1920" style={{ position: "absolute", inset: 0 }}>
            <circle cx="540" cy="900" r={1300 * iris} fill="none" stroke="#E6FFFF" strokeWidth="18" opacity="0.8" />
            {Array.from({ length: 16 }, (_, i) => { const a = (i / 16) * Math.PI * 2, r = 1300 * iris + 30 + 40 * hash(i); return <circle key={i} cx={540 + Math.cos(a) * r} cy={900 + Math.sin(a) * r} r={10 + 14 * hash(i + 3)} fill="none" stroke="#fff" strokeWidth="4" opacity="0.7" />; })}
          </svg>
        )}
        <Layer show={t >= 20.25 && t < 25.1} style={{ transform: `translateY(${1920 * (1 - slide)}px)` }}><Compare t={t} /></Layer>
        <Layer show={t >= 24.4} style={pour < 1 ? { clipPath: `polygon(${wave(pourY + 260, t, 30).join(",")}, 1080px 1920px, 0px 1920px)` } : undefined}><Ending t={t} /></Layer>
        {pour > 0 && pour < 1 && (
          <svg width="1080" height="1920" style={{ position: "absolute", inset: 0 }}>
            <polygon points={`${wave(pourY, t, 34).map((p) => p.replace(/px/g, "")).join(" ")} 1080,${pourY + 300} 0,${pourY + 300}`} fill="#FF7FA8" />
            <polyline points={wave(pourY, t, 34).map((p) => p.replace(/px/g, "")).join(" ")} fill="none" stroke="#FFC2D6" strokeWidth="16" />
            <polygon points={`${wave(pourY + 260, t, 30).map((p) => p.replace(/px/g, "")).join(" ")} 1080,${pourY + 200} 0,${pourY + 200}`} fill="#FF7FA8" />
          </svg>
        )}
      </AbsoluteFill>
      <Expression t={t} />
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 560, background: "linear-gradient(transparent, rgba(30,6,30,0.35))" }} />
      <UzSub t={t} />
      <Watermark />
      <Audio src={staticFile("audio/mix.wav")} />
    </AbsoluteFill>
  );
};
