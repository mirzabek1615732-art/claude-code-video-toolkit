import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {DuckedSfx} from '../../../audio/EpisodeAudio';
import {AliCharacter, EXPRESSIONS, mixExpression, mixPose, POSES, type Expression, type Pose} from '../../../components/AliCharacter';
import {RoomBackground} from '../../../components/AnimatedBackground';
import {AnimatedText} from '../../../components/AnimatedText';
import {CameraMovement} from '../../../components/CameraMovement';
import {Desk, IeltsBook} from '../../../components/Props';
import {EASE, impactSquash, pop, track} from '../../../components/anim';
import {COLORS} from '../../../theme';
import {wordAt, type TLScene} from '../../buildTimeline';
import {At, Stage} from '../../../scenes/Stage';
import {Trophy} from '../../ep04/scenes/common';
import {Puff} from './common';

/** 0:00 — Ali at his desk "becomes" a professor in a puff of smoke; dreams of Writing 8.0. */
export const S1Hook: React.FC<{scene: TLScene}> = ({scene}) => {
  const f = useCurrentFrame();
  const POOF = wordAt(scene, 'l02', 3); // "Writing'dan"
  const EIGHT = wordAt(scene, 'l02', 4); // "sakkiz"
  const ADJ = EIGHT + 10;
  const end = scene.durationInFrames;
  const prof = f >= POOF + 3;

  const pose = track<Pose>(
    f,
    [
      {at: 0, v: {...POSES.writing, armL: [-14, -100], armR: [-8, -95], lookY: 0.2, headTilt: 0, lookX: 0.6}},
      {at: 8, v: {...POSES.writing, armL: [60, 40], armR: [60, 40], lookY: -0.1, lookX: 0, headTilt: -4}, dur: 5},
      {at: POOF + 3, v: {...POSES.writing, armL: [-14, -100], armR: [150, 20], lookY: -0.5, lookX: 0.4, headTilt: -6}, dur: 5},
      {at: ADJ, v: {...POSES.writing, armL: [-14, -100], armR: [-10, -160], lookY: 0, lookX: 0, headTilt: 4}, dur: 5},
      {at: ADJ + 12, v: {...POSES.writing, armL: [-14, -100], armR: [-8, -95], lookY: 0, lookX: 0.2, headTilt: -4}, dur: 6},
    ],
    mixPose,
  );
  const expr = track<Expression>(
    f,
    [
      {at: 0, v: EXPRESSIONS.focused},
      {at: 8, v: EXPRESSIONS.excited, dur: 4},
      {at: POOF + 3, v: EXPRESSIONS.professor, dur: 4},
      {at: ADJ + 12, v: mixExpression(EXPRESSIONS.professor, EXPRESSIONS.smug, 0.6), dur: 6},
    ],
    mixExpression,
  );
  const trophy = pop(f, EIGHT, 30, {damping: 9, stiffness: 210});
  const books = pop(f, POOF + 4, 30, {damping: 10, stiffness: 220});
  // glasses push-up bounce
  const glass = prof ? 1.25 + (f >= ADJ && f < ADJ + 10 ? Math.sin(((f - ADJ) / 10) * Math.PI) * 0.12 : 0) : 0;

  return (
    <AbsoluteFill style={{background: COLORS.navy}}>
      <CameraMovement
        focus={[540, 1180]}
        keys={[{f: 0, zoom: 1.12}, {f: 10, zoom: 1.0, ease: EASE.out}, {f: POOF - 1, zoom: 1.0}, {f: POOF + 4, zoom: 1.14, y: 40, ease: EASE.power4Out}, {f: end, zoom: 1.18, y: 50}]}
        shakes={[{from: POOF, duration: 8, amplitude: 10}]}
      >
        <Stage>
          <RoomBackground wall="#5B4B8A" wall2="#463A70" pan={-f * 0.5} shelf={false} />
          {trophy > 0.01 ? (
            <g transform={`translate(830 ${940 + Math.sin(f / 6) * 10}) scale(${trophy}) rotate(${Math.sin(f / 7) * 4})`}>
              <Trophy label="8.0" size={0.78} />
              {[0, 1, 2].map((i) => (
                <path key={i} d="M 0 -16 L 5 -5 L 16 0 L 5 5 L 0 16 L -5 5 L -16 0 L -5 -5 Z" fill={COLORS.white} transform={`translate(${[-150, 140, 120][i]} ${[-230, -250, -60][i]}) scale(${1 + Math.sin(f / 3 + i * 2) * 0.5})`} />
              ))}
            </g>
          ) : null}
          <AliCharacter x={500} y={1830} scale={1.25} squash={impactSquash(f, POOF + 3, 0.2)} pose={pose} expression={expr} handL="open" handR={f >= ADJ && f < ADJ + 12 ? 'point' : 'open'} glasses={glass} gradCap={prof} shadow={0} />
          <Desk x={540} y={1400} width={980} toFloor />
          {/* the professor's enormous books */}
          {books > 0.01 ? (
            <g transform={`translate(190 1400) scale(${books})`}>
              {[0, 1, 2].map((i) => (
                <g key={i} transform={`translate(${i % 2 ? 8 : -6} ${-60 - i * 92}) rotate(${i % 2 ? -3 : 2})`}>
                  <rect x={-140} y={-46} width={280} height={92} rx={10} fill={['#7C2D12', '#1E3A8A', '#065F46'][i]} stroke={COLORS.ink} strokeWidth={6} />
                  <rect x={-118} y={-12} width={236} height={24} rx={4} fill="#FDE68A" />
                </g>
              ))}
            </g>
          ) : (
            <g transform="translate(220 1388)">
              <IeltsBook x={0} y={-60} width={150} rotate={-90} />
            </g>
          )}
          <g transform={`translate(500 ${1830 - 520 * 1.25})`}>
            <Puff t={f - POOF} r={280} />
          </g>
        </Stage>
      </CameraMovement>
      <At x={540} y={235}>
        {f < EIGHT - 4 ? (
          <AnimatedText text={'MANA BU|ALI!'} from={0} stagger={7} entrance="slam" size={140} accentWords={['ALI!']} rotate={-4} exitAt={EIGHT - 10} />
        ) : (
          <AnimatedText text={'WRITING|8.0?!'} from={EIGHT} stagger={6} entrance="slam" size={140} accentWords={['8.0?!']} accent={COLORS.yellow} rotate={-3} />
        )}
      </At>
      <DuckedSfx name="whoosh" at={0} gainDb={-6} />
      <DuckedSfx name="boom" at={POOF} gainDb={-12} />
      <DuckedSfx name="ding" at={EIGHT} gainDb={-8} />
      <DuckedSfx name="swish" at={ADJ} gainDb={-12} />
    </AbsoluteFill>
  );
};
