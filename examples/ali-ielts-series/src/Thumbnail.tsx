import React from 'react';
import {AbsoluteFill} from 'remotion';
import {AliCharacter, EXPRESSIONS, POSES} from './components/AliCharacter';
import {BurstBackground, HalftoneDrift} from './components/AnimatedBackground';
import {TargetBoard} from './components/Props';
import {loadFonts} from './fonts';
import {COLORS, FONT_FAMILY} from './theme';

loadFonts();

const stroke = (c: string, w: number): React.CSSProperties => ({WebkitTextStroke: `${w}px ${c}`, paintOrder: 'stroke fill'});

/** Poster / cover frame for the reel. */
export const Thumbnail: React.FC = () => (
  <AbsoluteFill style={{background: COLORS.blue}}>
    <svg viewBox="0 0 1080 1920" width={1080} height={1920} style={{position: 'absolute'}}>
      <BurstBackground id="thumb" a={COLORS.blueLight} b={COLORS.blueDark} cx={540} cy={1100} />
      <HalftoneDrift />
      <g transform="translate(780 1010) rotate(12)">
        <TargetBoard r={210} />
      </g>
      <g transform="translate(250 760) rotate(-10)">
        <rect x={-150} y={-80} width={300} height={160} rx={24} fill={COLORS.red} stroke={COLORS.navy} strokeWidth={8} />
        <text y={34} textAnchor="middle" fontFamily="Montserrat" fontWeight={900} fontSize={96} fill={COLORS.white}>
          4.0
        </text>
      </g>
      <AliCharacter x={470} y={1720} scale={1.55} pose={{...POSES.armsUpShock, headTilt: -6}} expression={EXPRESSIONS.shocked} handL="open" handR="open" blink={0} />
    </svg>
    <div style={{position: 'absolute', top: 210, width: 1080, textAlign: 'center', fontFamily: FONT_FAMILY, fontWeight: 900, lineHeight: 0.95, transform: 'rotate(-4deg)'}}>
      <div style={{fontSize: 120, color: COLORS.white, ...stroke(COLORS.navy, 16)}}>ERTADAN</div>
      <div style={{fontSize: 112, color: COLORS.yellow, ...stroke(COLORS.navy, 16)}}>BOSHLAYMAN?!</div>
    </div>
    <div
      style={{
        position: 'absolute',
        top: 560,
        left: 0,
        right: 0,
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      <div style={{background: COLORS.navy, color: COLORS.white, fontFamily: FONT_FAMILY, fontWeight: 800, fontSize: 44, padding: '12px 32px', borderRadius: 40, letterSpacing: 3}}>
        ALI va <span style={{color: COLORS.yellow}}>IELTS</span>
      </div>
    </div>
  </AbsoluteFill>
);
