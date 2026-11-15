import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {loadBrandFonts} from './fonts';

loadBrandFonts();

export type CoverOptionProps = {
  variant: 'magazine' | 'school' | 'proof';
  portrait: string; // RGBA cut-out of the studio headshot (853×1280)
  schoolFrame: string; // video frame in front of the school logo
  cert: string; // privacy-blurred certificate still (1080×1920 space)
  certFocus: [number, number];
  name: string;
  headline: string;
  score: string;
  facts: string[];
};

const INK = '#0B0B0C';
const W = '#FFFFFF';
const BLACK = 'Archivo Black';
const SRC_W = 853;

const Grain: React.FC = () => (
  <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, mixBlendMode: 'overlay', opacity: 0.14}}>
    <filter id="cg">
      <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={5} />
      <feColorMatrix type="saturate" values="0" />
    </filter>
    <rect width={1080} height={1920} filter="url(#cg)" />
  </svg>
);

const Facts: React.FC<{name: string; facts: string[]; top: number; dark?: boolean}> = ({name, facts, top}) => (
  <div style={{position: 'absolute', left: 0, right: 0, top, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18}}>
    <div style={{background: W, color: INK, border: `6px solid ${W}`, padding: '14px 30px 10px', fontFamily: BLACK, fontSize: 60}}>{name}</div>
    <div style={{display: 'flex', gap: 12}}>
      {facts.map((f) => (
        <div key={f} style={{background: 'rgba(11,11,12,0.92)', color: W, border: `5px solid ${W}`, padding: '12px 20px', fontFamily: 'Archivo', fontWeight: 700, fontSize: 30, letterSpacing: 3}}>
          {f}
        </div>
      ))}
    </div>
  </div>
);

export const CoverOptions: React.FC<CoverOptionProps> = (p) => {
  if (p.variant === 'magazine') {
    const s = 1080 / SRC_W;
    return (
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 30%, #3a3c40 0%, #0d0e10 62%, #050506 100%)'}}>
        <div style={{position: 'absolute', top: 262, width: 1080, textAlign: 'center', fontFamily: BLACK, fontSize: 132, lineHeight: 1, color: W, letterSpacing: 2}}>IELTS</div>
        <div style={{position: 'absolute', top: 362, width: 1080, textAlign: 'center', fontFamily: BLACK, fontSize: 380, lineHeight: 1, color: W, letterSpacing: -8}}>{p.score}</div>
        <Img src={staticFile(p.portrait)} style={{position: 'absolute', left: 0, top: 545, width: SRC_W * s, height: 1280 * s}} />
        <div style={{position: 'absolute', left: 0, right: 0, top: 1240, height: 680, background: 'linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,0.75) 50%, rgba(0,0,0,0.85))'}} />
        <Facts name={p.name} facts={p.facts} top={1420} />
        <Grain />
      </AbsoluteFill>
    );
  }
  if (p.variant === 'school') {
    return (
      <AbsoluteFill>
        <Img src={staticFile(p.schoolFrame)} style={{position: 'absolute', inset: 0, width: 1080, height: 1920}} />
        <div style={{position: 'absolute', top: 280, width: 1080, textAlign: 'center', fontFamily: BLACK, fontSize: 108, lineHeight: 1, color: INK, letterSpacing: -2, whiteSpace: 'nowrap'}}>{p.headline}</div>
        <div style={{position: 'absolute', top: 412, width: 1080, display: 'flex', justifyContent: 'center'}}>
          <div style={{background: INK, color: W, padding: '10px 26px', fontFamily: 'Archivo', fontWeight: 700, fontSize: 34, letterSpacing: 4}}>IELTS {p.score} · MULTILEVEL C1</div>
        </div>
        <div style={{position: 'absolute', left: 0, right: 0, top: 1240, height: 680, background: 'linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,0.6) 45%, rgba(0,0,0,0.75))'}} />
        <Facts name={p.name} facts={p.facts} top={1420} />
        <Grain />
      </AbsoluteFill>
    );
  }
  // proof: headshot beside the real certificate
  const s = 1.02;
  const mask = 'linear-gradient(to bottom, #000 58%, transparent 80%)';
  return (
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at 35% 35%, #2e3034 0%, #0b0c0d 70%)'}}>
      <div style={{position: 'absolute', top: 250, width: 1080, textAlign: 'center', fontFamily: BLACK, fontSize: 112, lineHeight: 1, color: W}}>
        IELTS <span style={{background: W, color: INK, padding: '0 18px'}}>{p.score}</span>
      </div>
      <div style={{position: 'absolute', top: 380, width: 1080, textAlign: 'center', fontFamily: 'Archivo', fontWeight: 700, fontSize: 36, letterSpacing: 8, color: W, opacity: 0.85}}>
        {p.headline}
      </div>
      {/* certificate card, tilted, zoomed on the score row */}
      <div style={{position: 'absolute', left: 520, top: 560, width: 520, height: 700, overflow: 'hidden', border: `8px solid ${W}`, transform: 'rotate(4deg)', boxShadow: '0 30px 60px rgba(0,0,0,0.6)'}}>
        <Img src={staticFile(p.cert)} style={{position: 'absolute', width: 1080 * 1.1, height: 1920 * 1.1, left: -(p.certFocus[0] * 1.1 - 330), top: -(p.certFocus[1] * 1.1 - 330)}} />
        <div style={{position: 'absolute', left: 330 - 70, top: 330 - 56, width: 140, height: 112, border: `7px solid ${INK}`, outline: `3px solid ${W}`}} />
      </div>
      <Img src={staticFile(p.portrait)} style={{position: 'absolute', left: -170, top: 560, width: SRC_W * s, height: 1280 * s, WebkitMaskImage: mask, maskImage: mask}} />
      <Facts name={p.name} facts={p.facts} top={1420} />
      <Grain />
    </AbsoluteFill>
  );
};
