import React from 'react';
import {AbsoluteFill} from 'remotion';
import {loadBrandFonts} from './fonts';
import {LogoMark, type LogoText} from './LogoMark';

loadBrandFonts();

/** Static vector logo (1254×1254 by default). `transparent` drops the background. */
export const LogoStill: React.FC<LogoText & {transparent: boolean}> = ({transparent, ...text}) => (
  <AbsoluteFill style={{background: transparent ? 'transparent' : '#000'}}>
    <svg viewBox="0 0 1254 1254" width="100%" height="100%">
      <LogoMark text={text} id="still" />
    </svg>
  </AbsoluteFill>
);
