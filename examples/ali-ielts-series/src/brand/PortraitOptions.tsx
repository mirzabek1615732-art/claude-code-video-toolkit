import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {loadBrandFonts} from './fonts';
import {LogoMark} from './LogoMark';

loadBrandFonts();

export type PortraitVariant = 'studioCanvas' | 'studioLowKey' | 'studioLight' | 'infoCard' | 'textBehind' | 'story' | 'pfp' | 'pfpBadge';

export type PortraitProps = {
  variant: PortraitVariant;
  /** transparent PNG cut-out of the person (853×1280 source) */
  photo: string;
  firstName: string;
  lastName: string;
  title: string;
  subtitle: string;
  handle: string;
  monogram: string;
  schoolLine1: string;
  schoolLine2: string;
  tagline: string;
};

const SRC_W = 853;
const SRC_H = 1280;
const ARCHIVO = 'Archivo';
const BLACK = 'Archivo Black';

/** Painted studio backdrop + film grain built from SVG noise (no stock images). */
const Backdrop: React.FC<{w: number; h: number; center: string; edge: string; mottle: number; spotY: number; id: string}> = ({w, h, center, edge, mottle, spotY, id}) => (
  <svg width={w} height={h} style={{position: 'absolute', inset: 0}}>
    <defs>
      <radialGradient id={`${id}-g`} cx="0.5" cy={spotY} r="0.8">
        <stop offset="0" stopColor={center} />
        <stop offset="1" stopColor={edge} />
      </radialGradient>
      <filter id={`${id}-m`} x="0" y="0" width="100%" height="100%">
        <feTurbulence type="fractalNoise" baseFrequency="0.0035" numOctaves={4} seed={7} />
        <feColorMatrix type="saturate" values="0" />
      </filter>
    </defs>
    <rect width={w} height={h} fill={`url(#${id}-g)`} />
    <rect width={w} height={h} filter={`url(#${id}-m)`} opacity={mottle} style={{mixBlendMode: 'overlay'}} />
  </svg>
);

const Grain: React.FC<{w: number; h: number; amount: number}> = ({w, h, amount}) => (
  <svg width={w} height={h} style={{position: 'absolute', inset: 0, mixBlendMode: 'overlay', opacity: amount}}>
    <filter id="grain">
      <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={3} />
      <feColorMatrix type="saturate" values="0" />
    </filter>
    <rect width={w} height={h} filter="url(#grain)" />
  </svg>
);

const Person: React.FC<{photo: string; x: number; y: number; scale: number; fadeFrom?: number; fadeTo?: number; shadow?: boolean}> = ({photo, x, y, scale, fadeFrom, fadeTo, shadow}) => {
  const mask =
    fadeFrom !== undefined && fadeTo !== undefined
      ? `linear-gradient(to bottom, #000 ${(fadeFrom / SRC_H) * 100}%, transparent ${(fadeTo / SRC_H) * 100}%)`
      : undefined;
  const style: React.CSSProperties = {position: 'absolute', left: x, top: y, width: SRC_W * scale, height: SRC_H * scale, WebkitMaskImage: mask, maskImage: mask};
  return (
    <>
      {shadow ? <Img src={staticFile(photo)} style={{...style, left: x + 46, top: y + 10, filter: 'brightness(0) blur(28px)', opacity: 0.28}} /> : null}
      <Img src={staticFile(photo)} style={style} />
    </>
  );
};

const Logo: React.FC<{p: PortraitProps; width: number; style?: React.CSSProperties}> = ({p, width, style}) => (
  <svg viewBox="160 460 935 330" width={width} height={(width * 330) / 935} style={style}>
    <LogoMark id="pl" text={{monogram: p.monogram, line1: p.schoolLine1, line2: p.schoolLine2, tagline: p.tagline}} />
  </svg>
);

export const PortraitOptions: React.FC<PortraitProps> = (p) => {
  const full = 1080 / SRC_W; // person scaled to cover the full width
  switch (p.variant) {
    case 'studioCanvas': // classic warm painted canvas, Rembrandt-style falloff
      return (
        <AbsoluteFill>
          <Backdrop w={1080} h={1350} center="#8f7e6b" edge="#2f2822" mottle={0.55} spotY={0.3} id="sc" />
          <Person photo={p.photo} x={0} y={70} scale={full} />
          <Grain w={1080} h={1350} amount={0.18} />
        </AbsoluteFill>
      );
    case 'studioLowKey': // near-black studio, soft light on the wall behind
      return (
        <AbsoluteFill>
          <Backdrop w={1080} h={1350} center="#3a3c40" edge="#060607" mottle={0.35} spotY={0.28} id="lk" />
          <Person photo={p.photo} x={0} y={70} scale={full} />
          <Grain w={1080} h={1350} amount={0.16} />
        </AbsoluteFill>
      );
    case 'studioLight': // light-grey seamless paper, key light from the left
      return (
        <AbsoluteFill>
          <Backdrop w={1080} h={1350} center="#f1f0ed" edge="#a9abad" mottle={0.18} spotY={0.32} id="lt" />
          <Person photo={p.photo} x={0} y={70} scale={full} shadow />
          <Grain w={1080} h={1350} amount={0.12} />
        </AbsoluteFill>
      );
    case 'infoCard': {
      const s = 1.0;
      return (
        <AbsoluteFill style={{background: '#0b0b0c'}}>
          <Backdrop w={1080} h={1350} center="#26282b" edge="#070708" mottle={0.3} spotY={0.25} id="ic" />
          <Person photo={p.photo} x={1080 - SRC_W * s + 150} y={150} scale={s} fadeFrom={720} fadeTo={1000} />
          <div style={{position: 'absolute', left: 70, top: 110, width: 560, color: '#fff'}}>
            <div style={{fontFamily: ARCHIVO, fontWeight: 600, fontSize: 30, letterSpacing: 8, opacity: 0.75}}>{p.tagline}</div>
            <div style={{fontFamily: BLACK, fontSize: 92, lineHeight: 0.98, marginTop: 26}}>{p.firstName.toUpperCase()}</div>
            <div style={{fontFamily: BLACK, fontSize: 70, lineHeight: 1.05}}>{p.lastName.toUpperCase()}</div>
            <div style={{width: 120, height: 8, background: '#fff', margin: '34px 0'}} />
            <div style={{fontFamily: ARCHIVO, fontWeight: 700, fontSize: 40, lineHeight: 1.25}}>{p.title}</div>
            <div style={{fontFamily: ARCHIVO, fontWeight: 500, fontSize: 32, lineHeight: 1.35, opacity: 0.85, marginTop: 14}}>{p.subtitle}</div>
          </div>
          <div style={{position: 'absolute', left: 70, bottom: 90, color: '#fff'}}>
            <Logo p={p} width={430} />
            <div style={{fontFamily: ARCHIVO, fontWeight: 700, fontSize: 34, marginTop: 26, display: 'flex', alignItems: 'center', gap: 16}}>
              <span style={{border: '4px solid #fff', padding: '6px 14px', fontSize: 26, letterSpacing: 3}}>TELEGRAM</span>
              {p.handle}
            </div>
          </div>
          <Grain w={1080} h={1350} amount={0.14} />
        </AbsoluteFill>
      );
    }
    case 'pfp':
    case 'pfpBadge': {
      // square profile picture in the info-card look; face centred for the circle crop
      const s = 1.22;
      return (
        <AbsoluteFill style={{background: '#0b0b0c'}}>
          <Backdrop w={1080} h={1080} center="#2c2e32" edge="#070708" mottle={0.3} spotY={0.3} id="pf" />
          <Person photo={p.photo} x={540 - 426 * s} y={130 - 88 * s} scale={s} />
          {p.variant === 'pfpBadge' ? (
            <div style={{position: 'absolute', left: 0, right: 0, bottom: 70, display: 'flex', justifyContent: 'center'}}>
              <div style={{background: '#000', border: '7px solid #fff', padding: '6px 26px 2px', fontFamily: BLACK, fontSize: 70, color: '#fff', lineHeight: 1.1}}>
                {p.monogram}
              </div>
            </div>
          ) : null}
          <Grain w={1080} h={1080} amount={0.14} />
        </AbsoluteFill>
      );
    }
    case 'textBehind':
      return (
        <AbsoluteFill style={{background: '#000'}}>
          <Backdrop w={1080} h={1350} center="#2b2d31" edge="#030303" mottle={0.3} spotY={0.3} id="tb" />
          <div style={{position: 'absolute', top: 40, width: 1080, textAlign: 'center', fontFamily: BLACK, fontSize: 330, lineHeight: 1, color: '#fff', letterSpacing: -6}}>IELTS</div>
          <Person photo={p.photo} x={0} y={175} scale={full} />
          <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 420, background: 'linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,0.92) 55%)'}} />
          <div style={{position: 'absolute', left: 0, right: 0, bottom: 90, textAlign: 'center', color: '#fff'}}>
            <div style={{fontFamily: BLACK, fontSize: 64}}>{`${p.firstName} ${p.lastName}`.toUpperCase()}</div>
            <div style={{fontFamily: ARCHIVO, fontWeight: 600, fontSize: 32, letterSpacing: 6, marginTop: 12, opacity: 0.85}}>{p.title.toUpperCase()}</div>
          </div>
          <Grain w={1080} h={1350} amount={0.14} />
        </AbsoluteFill>
      );
    case 'story':
      return (
        <AbsoluteFill style={{background: '#000'}}>
          <Backdrop w={1080} h={1920} center="#34363a" edge="#040405" mottle={0.32} spotY={0.32} id="st" />
          <Person photo={p.photo} x={0} y={400} scale={full} />
          <div style={{position: 'absolute', top: 240, width: 1080, display: 'flex', justifyContent: 'center'}}>
            <Logo p={p} width={640} />
          </div>
          <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 760, background: 'linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,0.94) 45%)'}} />
          <div style={{position: 'absolute', left: 0, right: 0, bottom: 230, textAlign: 'center', color: '#fff'}}>
            <div style={{fontFamily: BLACK, fontSize: 70}}>{`${p.firstName} ${p.lastName}`.toUpperCase()}</div>
            <div style={{fontFamily: ARCHIVO, fontWeight: 600, fontSize: 36, marginTop: 14, opacity: 0.9}}>{p.subtitle}</div>
            <div style={{display: 'inline-block', marginTop: 46, border: '6px solid #fff', padding: '20px 44px', fontFamily: BLACK, fontSize: 40, letterSpacing: 1}}>
              TELEGRAM: {p.handle}
            </div>
          </div>
          <Grain w={1080} h={1920} amount={0.14} />
        </AbsoluteFill>
      );
  }
};
