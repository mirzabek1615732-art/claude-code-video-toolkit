import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {Sfx} from '../components/AudioManager';
import {loadBrandFonts} from './fonts';
import {LogoMark, type LogoState, type LogoText} from './LogoMark';

loadBrandFonts();

export type LogoRevealProps = LogoText & {transparent: boolean; sound: boolean};

const p = (f: number, a: number, b: number) => interpolate(f, [a, b], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

/** Animated logo sting (4 s). Works at any aspect ratio: the logo is centred. */
export const LogoReveal: React.FC<LogoRevealProps> = ({transparent, sound, ...text}) => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const state: LogoState = {
    frame: p(frame, 0, 18),
    divider: p(frame, 10, 22),
    monogram: p(frame, 14, 28),
    line1: p(frame, 20, 34),
    line2: p(frame, 25, 39),
    tagline: p(frame, 36, 58),
    sheen: interpolate(frame, [58, 82], [-0.3, 1.3], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}),
  };
  // gentle settle, then a very slow push during the hold
  const settle = interpolate(frame, [0, 40], [1.05, 1], {extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)});
  const push = interpolate(frame, [40, 120], [0, 0.02], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  // view box: logo region (box spans x 171–1082) with margin, matched to the output aspect ratio
  const vw = 1034;
  const vh = (vw * height) / width;
  const cx = 627;
  const cy = 622;
  return (
    <AbsoluteFill style={{background: transparent ? 'transparent' : '#000'}}>
      <AbsoluteFill style={{transform: `scale(${settle + push})`}}>
        <svg viewBox={`${cx - vw / 2} ${cy - vh / 2} ${vw} ${vh}`} width={width} height={height}>
          <LogoMark text={text} state={state} id="reveal" />
        </svg>
      </AbsoluteFill>
      {sound ? (
        <>
          <Sfx name="swish" at={0} volume={0.35} />
          <Sfx name="impact" at={16} volume={0.45} />
          <Sfx name="whoosh" at={20} volume={0.25} rate={1.3} />
          <Sfx name="ding" at={60} volume={0.22} />
        </>
      ) : null}
    </AbsoluteFill>
  );
};
