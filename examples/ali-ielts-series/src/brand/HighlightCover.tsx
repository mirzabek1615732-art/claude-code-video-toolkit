import React from 'react';
import {AbsoluteFill} from 'remotion';
import {loadBrandFonts} from './fonts';

loadBrandFonts();

export type CoverIcon = 'results' | 'courses' | 'about' | 'free' | 'faq' | 'school';

const W = '#FFFFFF';
// heavy, square-ended strokes to match the logo's block lettering
const s = {stroke: W, strokeWidth: 30, strokeLinecap: 'square', strokeLinejoin: 'miter', fill: 'none'} as const;

const Icon: React.FC<{icon: CoverIcon; monogram: string}> = ({icon, monogram}) => {
  switch (icon) {
    case 'results': // rising bars with an arrow breaking out of the top
      return (
        <g>
          <rect x={-130} y={40} width={58} height={90} fill={W} />
          <rect x={-29} y={-20} width={58} height={150} fill={W} />
          <rect x={72} y={-80} width={58} height={210} fill={W} />
          <path d="M -130 -40 L -10 -140 L 90 -140" {...s} />
          <path d="M 60 -185 L 115 -140 L 60 -95" {...s} />
        </g>
      );
    case 'courses': // two stacked books, open book on top
      return (
        <g>
          <rect x={-140} y={60} width={280} height={40} fill={W} />
          <rect x={-120} y={115} width={240} height={30} fill={W} />
          <path d="M 0 -130 L -140 -150 L -140 30 L 0 45 L 140 30 L 140 -150 Z" {...s} />
          <path d="M 0 -130 L 0 45" {...s} />
        </g>
      );
    case 'about': // bust
      return (
        <g>
          <circle cx={0} cy={-88} r={66} fill={W} />
          <path d="M -135 140 L -135 40 L -60 0 L 60 0 L 135 40 L 135 140 Z" fill={W} />
        </g>
      );
    case 'free': // gift box with bow
      return (
        <g>
          <rect x={-130} y={-30} width={260} height={170} {...s} />
          <rect x={-150} y={-90} width={300} height={60} fill={W} />
          <rect x={-16} y={-90} width={32} height={230} fill={W} />
          <path d="M 0 -95 L -85 -160 L -100 -95 M 0 -95 L 85 -160 L 100 -95" {...s} />
        </g>
      );
    case 'faq': // question mark inside a speech block
      return (
        <g>
          <path d="M -150 -150 L 150 -150 L 150 70 L -20 70 L -95 140 L -95 70 L -150 70 Z" {...s} />
          <text y={46} textAnchor="middle" fontFamily="Archivo Black" fontSize={210} fill={W}>
            ?
          </text>
        </g>
      );
    case 'school': // the logo monogram itself
      return (
        <text y={52} textAnchor="middle" fontFamily="Archivo Black" fontSize={150} textLength={250} lengthAdjust="spacingAndGlyphs" fill={W}>
          {monogram}
        </text>
      );
  }
};

/**
 * Story-highlight cover, 1080×1920: black, with the icon inside a white
 * square cell borrowed from the school logo. Instagram shows the centre circle.
 */
export const HighlightCover: React.FC<{icon: CoverIcon; monogram: string}> = ({icon, monogram}) => (
  <AbsoluteFill style={{background: '#000'}}>
    <svg viewBox="0 0 1080 1920" width={1080} height={1920}>
      <rect x={540 - 290} y={960 - 290} width={580} height={580} fill="none" stroke={W} strokeWidth={14} />
      <g transform="translate(540 960) scale(1.3)">
        <Icon icon={icon} monogram={monogram} />
      </g>
    </svg>
  </AbsoluteFill>
);
