import React from 'react';
import {AbsoluteFill} from 'remotion';
import {AliCharacter, EXPRESSIONS, POSES} from '../../../components/AliCharacter';
import {AnimatedText} from '../../../components/AnimatedText';
import {loadFonts} from '../../../fonts';
import {COLORS} from '../../../theme';
import {At, Stage} from '../../../scenes/Stage';
import {Countdown, Dictionary, F, SweatBurst, WordCard} from '../scenes/common';

loadFonts();

/** Cover for Episode 3. Key content sits in the centre 1080×1350 so the 4:5 grid crop keeps it. */
export const Ep03Thumbnail: React.FC = () => (
  <AbsoluteFill style={{background: '#3A0D16'}}>
    <Stage>
      <defs>
        <radialGradient id="th3-bg" cx="0.5" cy="0.5" r="0.75">
          <stop offset="0%" stopColor="#B91C1C" />
          <stop offset="100%" stopColor="#1A0509" />
        </radialGradient>
      </defs>
      <rect width={1080} height={1920} fill="url(#th3-bg)" />
      {Array.from({length: 18}).map((_, i) => (
        <rect key={i} x={510} y={-1500} width={60} height={1500} fill={COLORS.white} opacity={0.05} transform={`translate(0 1000) rotate(${i * 20} 540 0)`} />
      ))}
      <g transform="translate(540 930)">
        <Countdown r={300} remaining={0.12} label="0:59" pulse={0.6} danger />
      </g>
      <g transform="translate(190 820) rotate(-14) scale(1.1)">
        <WordCard en="However" uz="???" color={COLORS.yellow} />
      </g>
      <g transform="translate(880 700) rotate(10) scale(1.05)">
        <WordCard en="Significant" uz="???" color={COLORS.white} />
      </g>
      <AliCharacter x={500} y={1960} scale={1.55} pose={{...POSES.armsUpShock, armL: [160, 20], armR: [150, 30], headTilt: -6}} expression={EXPRESSIONS.panic} handL="open" handR="open" shadow={0} frozen blink={0} />
      <SweatBurst x={500} y={1960 - 505 * 1.55} t={6} seed="th3" count={8} />
      <g transform="translate(880 1330) rotate(-7) scale(0.95)">
        <WordCard en="Consequently" uz="???" color="#FED7AA" />
      </g>
      <g transform="translate(160 1420) rotate(-12)">
        <Dictionary w={180} h={230} open={1} flip={0.4} />
      </g>
    </Stage>
    <At x={540} y={300}>
      <AnimatedText text={'VAQT QAYERGA|KETDI?!'} from={-60} size={112} accentWords={['KETDI?!']} accent={COLORS.yellow} rotate={-4} />
    </At>
    <div style={{position: 'absolute', left: 0, right: 0, top: 1490, display: 'flex', justifyContent: 'center'}}>
      <div style={{background: COLORS.yellow, color: COLORS.navy, border: `7px solid ${COLORS.navy}`, borderRadius: 999, padding: '12px 40px', fontFamily: F, fontWeight: 900, fontSize: 46, whiteSpace: 'nowrap', transform: 'rotate(-2deg)', boxShadow: '8px 10px 0 rgba(0,0,0,0.4)'}}>
        ALI VA IELTS READING · 3-QISM
      </div>
    </div>
  </AbsoluteFill>
);
