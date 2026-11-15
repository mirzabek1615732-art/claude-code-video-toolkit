import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {DuckedSfx} from '../../../audio/EpisodeAudio';
import {AliCharacter, EXPRESSIONS, mixExpression, mixPose, POSES, type Expression, type Pose} from '../../../components/AliCharacter';
import {CameraMovement} from '../../../components/CameraMovement';
import {Desk} from '../../../components/Props';
import {EASE, pop, track, tween} from '../../../components/anim';
import {COLORS} from '../../../theme';
import {wordAt, type TLScene} from '../../buildTimeline';
import {Stage} from '../../../scenes/Stage';
import {AudioPlayer, QuestionCard} from './common';

/** Shared exam-room set under a spotlight (also used by the trap scene). */
export const SpotlightRoom: React.FC<{light: number}> = ({light}) => (
  <g>
    <rect width={1080} height={1920} fill="#0B1226" />
    <defs>
      <linearGradient id="sp-cone" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#FDE68A" stopOpacity={0.5} />
        <stop offset="100%" stopColor="#FDE68A" stopOpacity={0.06} />
      </linearGradient>
    </defs>
    <path d="M 470 -40 L 610 -40 L 1010 1920 L 70 1920 Z" fill="url(#sp-cone)" opacity={light} />
    <ellipse cx={540} cy={1880} rx={520} ry={70} fill="#FDE68A" opacity={0.12 * light} />
  </g>
);

/** 0:06 — the test begins: headphones adjusted, pen spun, the player and question appear. */
export const S2Begins: React.FC<{scene: TLScene}> = ({scene}) => {
  const f = useCurrentFrame();
  const START = scene.lines.l03.localFrom;
  const ADJ = wordAt(scene, 'l04', 0); // "Quloqchinni"
  const PEN = wordAt(scene, 'l04', 2); // "ruchkani"
  const READY = scene.lines.l04.localTo;
  const end = scene.durationInFrames;

  const pose = track<Pose>(
    f,
    [
      {at: 0, v: {...POSES.stand, armL: [20, 40], armR: [20, 40], lookY: -0.3}},
      {at: ADJ - 2, v: {...POSES.stand, armL: [110, 120], armR: [110, 120], headTilt: 6}, dur: 5},
      {at: ADJ + 10, v: {...POSES.stand, armL: [110, 120], armR: [110, 120], headTilt: -6}, dur: 5},
      {at: PEN - 3, v: {...POSES.stand, armL: [20, 40], armR: [30, -120], headTilt: 0, lookX: 0.5, lookY: 0.2}, dur: 5},
      {at: READY, v: {...POSES.stand, armL: [20, 40], armR: [24, -96], headTilt: 0, lookY: -0.5}, dur: 5},
    ],
    mixPose,
  );
  const expr = track<Expression>(
    f,
    [
      {at: 0, v: EXPRESSIONS.confident},
      {at: ADJ, v: EXPRESSIONS.focused, dur: 5},
      {at: PEN, v: EXPRESSIONS.smug, dur: 5},
      {at: READY, v: mixExpression(EXPRESSIONS.confident, EXPRESSIONS.focused, 0.5), dur: 5},
    ],
    mixExpression,
  );
  const spin = f >= PEN && f < READY ? (f - PEN) * 42 : 0;
  const nod = f >= READY ? Math.sin((f - READY) / 3) * 5 : 0;
  const player = pop(f, START + 2, 30, {damping: 14, stiffness: 160});
  const card = pop(f, ADJ + 6, 30, {damping: 12, stiffness: 190});

  return (
    <AbsoluteFill style={{background: '#0B1226'}}>
      <CameraMovement focus={[540, 1100]} keys={[{f: 0, zoom: 1.0}, {f: PEN, zoom: 1.0}, {f: PEN + 8, zoom: 1.1, y: 80, ease: EASE.power4Out}, {f: READY, zoom: 1.1, y: 80}, {f: end, zoom: 1.0, y: 0, ease: EASE.inOut}]}>
        <Stage>
          <SpotlightRoom light={tween(f, [0, 10], [0, 1])} />
          <g transform={`translate(540 ${420 - (1 - player) * 600})`}>
            <AudioPlayer t={f} level={0} progress={0} />
          </g>
          <g transform={`translate(540 800) scale(${card})`}>
            <QuestionCard />
          </g>
          <g transform={`rotate(${nod} 540 1500)`}>
            <AliCharacter x={540} y={1850} scale={1.25} pose={{...pose, itemAngle: spin}} expression={expr} handL="open" handR={f >= PEN - 3 ? 'fist' : 'open'} itemR={f >= PEN - 3 ? 'pen' : 'none'} headphones shadow={0} />
          </g>
          <Desk x={540} y={1400} width={980} toFloor />
          <g transform="translate(330 1392)">
            <rect x={-110} y={-12} width={220} height={12} fill="#FFFDF7" stroke={COLORS.ink} strokeWidth={4} />
          </g>
        </Stage>
      </CameraMovement>
      <DuckedSfx name="swish" at={START + 2} gainDb={-8} />
      <DuckedSfx name="pop" at={ADJ + 6} gainDb={-8} />
      <DuckedSfx name="clock_spin" at={PEN} gainDb={-12} />
      <DuckedSfx name="ding" at={READY} gainDb={-8} />
    </AbsoluteFill>
  );
};
