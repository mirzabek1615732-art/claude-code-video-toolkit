import React from 'react';
import {AbsoluteFill} from 'remotion';
import {AliCharacter, EXPRESSIONS, mixExpression, POSES} from '../../../components/AliCharacter';
import {AnimatedText} from '../../../components/AnimatedText';
import {SchoolWatermark} from '../../../components/Watermark';
import {loadFonts} from '../../../fonts';
import {COLORS} from '../../../theme';
import {At, Stage} from '../../../scenes/Stage';
import {NumberTile} from '../scenes/common';

loadFonts();

/** Cover for Episode 4: Ali torn between 13 and 30. Key content inside the centre 4:5 crop. */
export const Ep04Thumbnail: React.FC = () => (
  <AbsoluteFill style={{background: '#0F766E'}}>
    <Stage>
      <defs>
        <linearGradient id="th4-l" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#F97316" />
          <stop offset="50%" stopColor="#7C2D12" />
          <stop offset="50%" stopColor="#14532D" />
          <stop offset="100%" stopColor="#22C55E" />
        </linearGradient>
      </defs>
      <rect width={1080} height={1920} fill="url(#th4-l)" />
      {Array.from({length: 14}).map((_, i) => (
        <rect key={i} x={510} y={-1500} width={60} height={1500} fill={COLORS.white} opacity={0.06} transform={`translate(0 1100) rotate(${i * 25.7} 540 0)`} />
      ))}
      <path d="M 540 520 L 500 760 L 590 900 L 520 1100 L 570 1300" fill="none" stroke={COLORS.yellow} strokeWidth={16} strokeLinejoin="round" strokeLinecap="round" opacity={0.9} />
      <g transform="translate(215 840) rotate(-10)">
        <NumberTile n="13" color={COLORS.orange} size={1.05} />
      </g>
      <g transform="translate(865 840) rotate(10)">
        <NumberTile n="30" color={COLORS.green} size={1.05} />
      </g>
      <AliCharacter x={540} y={1990} scale={1.6} pose={{...POSES.shrug, armL: [96, 60], armR: [96, 60], headTilt: 10, lookX: -0.9, lookY: -0.6}} expression={mixExpression(EXPRESSIONS.panic, EXPRESSIONS.suspicious, 0.35)} handL="open" handR="open" headphones shadow={0} frozen blink={0} />
    </Stage>
    <At x={540} y={300}>
      <AnimatedText text={'13 YOKI|30?!'} from={-60} size={170} accentWords={['30?!']} accent={COLORS.yellow} rotate={-4} />
    </At>
    <div style={{position: 'absolute', left: 0, right: 0, top: 1500, display: 'flex', justifyContent: 'center'}}>
      <div style={{background: COLORS.yellow, color: COLORS.navy, border: `7px solid ${COLORS.navy}`, borderRadius: 999, padding: '12px 40px', fontFamily: 'Montserrat', fontWeight: 900, fontSize: 44, whiteSpace: 'nowrap', transform: 'rotate(-2deg)', boxShadow: '8px 10px 0 rgba(0,0,0,0.4)'}}>ALI VA IELTS LISTENING · 4-QISM</div>
    </div>
    <SchoolWatermark />
  </AbsoluteFill>
);
