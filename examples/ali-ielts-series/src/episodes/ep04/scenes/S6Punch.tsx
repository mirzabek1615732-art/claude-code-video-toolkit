import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {DuckedSfx} from '../../../audio/EpisodeAudio';
import {AliCharacter, EXPRESSIONS, mixExpression, mixPose, POSES, type Expression, type Pose} from '../../../components/AliCharacter';
import {AnimatedText} from '../../../components/AnimatedText';
import {CameraMovement} from '../../../components/CameraMovement';
import {EASE, track, tween} from '../../../components/anim';
import {COLORS} from '../../../theme';
import {wordAt, type TLScene} from '../../buildTimeline';
import {At, Stage} from '../../../scenes/Stage';
import {NumberTile, Trophy} from './common';

/** 0:36 — "one number, two hopes": Ali reaches for 30, 13 keeps getting in the way. */
export const S6Punch: React.FC<{scene: TLScene}> = ({scene}) => {
  const f = useCurrentFrame();
  const BITTA = wordAt(scene, 'l12', 2); // "Bitta"
  const LOOK = Math.min(scene.durationInFrames - 20, scene.lines.l12.localTo - 4);
  const end = scene.durationInFrames;
  const a = f / 8;
  const chase = 1 - tween(f, [LOOK, LOOK + 6], [0, 1]);
  // 30 flees in an arc above his head; 13 always slides in front of his hand
  const x30 = 540 + Math.cos(a) * 340;
  const y30 = 820 - Math.abs(Math.sin(a)) * 150;
  const x13 = 540 + Math.cos(a - 0.55) * 210;
  const y13 = 950 - Math.abs(Math.sin(a - 0.55)) * 90;
  const right = x30 > 540;
  const reach = 110 + Math.abs(Math.sin(a)) * 40;
  const pose = track<Pose>(
    f,
    [
      {at: 0, v: {...POSES.stand, armL: right ? [10, 20] : [reach, 10], armR: right ? [reach, 10] : [10, 20], lookX: right ? 0.9 : -0.9, lookY: -0.8, headTilt: right ? -8 : 8, bodyTilt: right ? 5 : -5}},
      {at: LOOK, v: {...POSES.shrug, armL: [40, 60], armR: [40, 60], lookX: 0, lookY: 0, headTilt: 8}, dur: 6},
    ],
    mixPose,
  );
  const expr = track<Expression>(
    f,
    [
      {at: 0, v: mixExpression(EXPRESSIONS.devastated, EXPRESSIONS.panic, 0.3)},
      {at: LOOK, v: EXPRESSIONS.embarrassed, dur: 6},
    ],
    mixExpression,
  );
  return (
    <AbsoluteFill style={{background: '#334155'}}>
      <CameraMovement focus={[540, 1100]} keys={[{f: 0, zoom: 1.0}, {f: LOOK - 2, zoom: 1.04}, {f: LOOK + 6, zoom: 1.28, y: 120, ease: EASE.power4Out}, {f: end, zoom: 1.32, y: 120}]}>
        <Stage>
          <defs>
            <radialGradient id="pn-bg" cx="0.5" cy="0.5" r="0.8">
              <stop offset="0%" stopColor="#64748B" />
              <stop offset="100%" stopColor="#1E293B" />
            </radialGradient>
          </defs>
          <rect width={1080} height={1920} fill="url(#pn-bg)" />
          <ellipse cx={540} cy={1860} rx={460} ry={50} fill="#000" opacity={0.25} />
          {/* the broken imaginary trophy */}
          <g transform="translate(850 1700) rotate(68)">
            <Trophy label="13" size={0.5} crack={1} dull={1} />
          </g>
          <AliCharacter x={540} y={1850} scale={1.25} pose={pose} expression={expr} handL="open" handR="open" shadow={0.9} />
          <g transform={`translate(${x30} ${y30}) rotate(${Math.sin(a * 2) * 10}) scale(${0.5 * chase + 0.0001})`}>
            <NumberTile n="30" color={COLORS.green} />
          </g>
          <g transform={`translate(${x13} ${y13}) rotate(${Math.cos(a * 2) * 12}) scale(${0.42 * chase + 0.0001})`}>
            <NumberTile n="13" color={COLORS.red} />
          </g>
        </Stage>
      </CameraMovement>
      <At x={540} y={235}>{f >= BITTA ? <AnimatedText text={'BITTA RAQAM,|IKKITA UMID!'} from={BITTA} stagger={5} entrance="pop" size={100} accentWords={['IKKITA', 'UMID!']} accent={COLORS.yellow} rotate={-2} /> : null}</At>
      <DuckedSfx name="slide_down" at={2} gainDb={-10} />
      <DuckedSfx name="swish" at={BITTA} gainDb={-10} />
      <DuckedSfx name="boing" at={LOOK} gainDb={-8} />
    </AbsoluteFill>
  );
};
