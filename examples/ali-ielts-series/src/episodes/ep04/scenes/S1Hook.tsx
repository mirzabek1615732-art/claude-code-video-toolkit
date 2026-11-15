import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';
import {DuckedSfx} from '../../../audio/EpisodeAudio';
import {AliCharacter, EXPRESSIONS, mixExpression, mixPose, POSES, type Expression, type Pose} from '../../../components/AliCharacter';
import {RoomBackground} from '../../../components/AnimatedBackground';
import {AnimatedText} from '../../../components/AnimatedText';
import {CameraMovement} from '../../../components/CameraMovement';
import {Desk} from '../../../components/Props';
import {EASE, impactSquash, pop, track} from '../../../components/anim';
import {COLORS} from '../../../theme';
import {wordAt, type TLScene} from '../../buildTimeline';
import {At, Stage} from '../../../scenes/Stage';
import {Pencil, Trophy} from './common';

/** 0:00 — Ali slides into the exam room, headphones on, dreaming of 8.0; knocks his pencil off. */
export const S1Hook: React.FC<{scene: TLScene}> = ({scene}) => {
  const f = useCurrentFrame();
  const STOP = 10;
  const PHONES = wordAt(scene, 'l02', 4); // "Listening'dan"
  const EIGHT = wordAt(scene, 'l02', 5); // "sakkiz"
  const KNOCK = wordAt(scene, 'l02', 7); // "deb"
  const end = scene.durationInFrames;

  const x = interpolate(f, [0, STOP, STOP + 5, STOP + 10], [1250, 500, 556, 540], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.bezier(0.2, 0.9, 0.3, 1)});
  const lean = f < STOP ? -16 : interpolate(f, [STOP, STOP + 12], [10, 0], {extrapolateRight: 'clamp', easing: EASE.out});
  const pose = track<Pose>(
    f,
    [
      {at: 0, v: {...POSES.stand, armL: [60, 30], armR: [60, 30]}},
      {at: STOP, v: {...POSES.shrug, armL: [80, 40], armR: [80, 40], headTilt: -6}, dur: 6},
      {at: PHONES - 4, v: {...POSES.stand, armL: [110, 120], armR: [110, 120], headTilt: 0}, dur: 5},
      {at: EIGHT - 2, v: {...POSES.stand, armL: [-10, -150], armR: [-10, -150], headTilt: 8, lookY: -0.8}, dur: 6},
      {at: KNOCK - 4, v: {...POSES.stand, armL: [30, 60], armR: [20, 40], headTilt: -8, bodyTilt: -4}, dur: 3},
      {at: KNOCK, v: {...POSES.pointViewer, armR: [96, 10], armL: [-10, -150], headTilt: -10, bodyTilt: 6}, dur: 3},
      {at: KNOCK + 14, v: {...POSES.pointViewer, armR: [96, 10], armL: [-10, -150], headTilt: -4, bodyTilt: 4, lookX: 0.9, lookY: 0.6}, dur: 4},
    ],
    mixPose,
  );
  const expr = track<Expression>(
    f,
    [
      {at: 0, v: EXPRESSIONS.excited},
      {at: PHONES, v: EXPRESSIONS.confident, dur: 5},
      {at: EIGHT - 2, v: EXPRESSIONS.smug, dur: 5},
      {at: KNOCK + 12, v: mixExpression(EXPRESSIONS.smug, EXPRESSIONS.embarrassed, 0.8), dur: 4},
    ],
    mixExpression,
  );
  const trophy = pop(f, EIGHT, 30, {damping: 9, stiffness: 200});
  // pencil gets knocked off the desk: parabola + spin
  const k = Math.max(0, f - KNOCK);
  const pencilX = 800 + k * 26;
  const pencilY = 1384 - k * 34 + k * k * 2.6;
  const pencilRot = k * 38;

  return (
    <AbsoluteFill style={{background: COLORS.navy}}>
      <CameraMovement
        focus={[540, 1150]}
        keys={[
          {f: 0, zoom: 1.1},
          {f: STOP + 8, zoom: 1.0, ease: EASE.out},
          {f: EIGHT - 2, zoom: 1.0},
          {f: EIGHT + 4, zoom: 1.12, y: 60, ease: EASE.power4Out},
          {f: KNOCK - 2, zoom: 1.12, y: 60},
          {f: KNOCK + 6, zoom: 1.0, y: 0, ease: EASE.out},
          {f: end, zoom: 1.04},
        ]}
        shakes={[
          {from: STOP, duration: 8, amplitude: 12},
          {from: KNOCK, duration: 6, amplitude: 8},
        ]}
      >
        <Stage>
          <RoomBackground wall="#3F6B5C" wall2="#2C4F45" pan={-f * 0.6} shelf={false} />
          {/* exam-room sign */}
          <g transform="translate(250 760) rotate(-3)">
            <rect x={-170} y={-60} width={340} height={120} rx={14} fill="#FFFDF7" stroke={COLORS.ink} strokeWidth={6} />
            <text y={-6} textAnchor="middle" fontFamily="Montserrat" fontWeight={900} fontSize={36} fill={COLORS.navy}>
              EXAM ROOM
            </text>
            <text y={38} textAnchor="middle" fontFamily="Montserrat" fontWeight={800} fontSize={28} fill={COLORS.red}>
              JIM! · QUIET!
            </text>
          </g>
          {f < STOP + 2
            ? Array.from({length: 8}).map((_, i) => <rect key={i} x={x + 150 + (i % 3) * 100} y={900 + i * 70} width={480 + (i % 4) * 80} height={14} rx={7} fill={COLORS.white} opacity={0.6 * (1 - f / (STOP + 2))} />)
            : null}
          <AliCharacter x={x} y={1850} scale={1.25} squash={impactSquash(f, STOP, 0.2)} rotate={lean} pose={pose} expression={expr} handL={f >= EIGHT - 2 ? 'fist' : 'open'} handR={f >= KNOCK ? 'point' : f >= EIGHT - 2 ? 'fist' : 'open'} headphones={f >= PHONES} shadow={0} />
          {/* imaginary 8.0 trophy floating above his head */}
          {trophy > 0.01 && f < KNOCK + 4 ? (
            <g transform={`translate(${x} ${1050 + Math.sin(f / 6) * 10}) scale(${trophy * (f >= KNOCK ? Math.max(0, 1 - (f - KNOCK) / 4) : 1)})`} opacity={0.96}>
              <Trophy label="8.0" size={0.8} />
              {[0, 1, 2, 3].map((i) => (
                <path key={i} d="M 0 -16 L 5 -5 L 16 0 L 5 5 L 0 16 L -5 5 L -16 0 L -5 -5 Z" fill={COLORS.white} transform={`translate(${[-150, 150, -120, 130][i]} ${[-190, -210, -60, -40][i]}) scale(${1 + Math.sin(f / 3 + i * 2) * 0.5})`} />
              ))}
            </g>
          ) : null}
          <Desk x={540} y={1400} width={980} toFloor />
          <g transform="translate(330 1392)">
            <rect x={-110} y={-12} width={220} height={12} fill="#FFFDF7" stroke={COLORS.ink} strokeWidth={4} />
          </g>
          {pencilY < 2100 ? (
            <g transform={`translate(${pencilX} ${pencilY}) rotate(${pencilRot})`}>
              <Pencil />
            </g>
          ) : null}
          {f >= PHONES && f < PHONES + 10 ? (
            <g transform={`translate(${x} 1150) scale(${1 + (f - PHONES) / 6})`} opacity={1 - (f - PHONES) / 10}>
              <circle r={150} fill="none" stroke={COLORS.yellow} strokeWidth={10} />
            </g>
          ) : null}
        </Stage>
      </CameraMovement>
      <At x={540} y={225}>
        {f < EIGHT - 6 ? (
          <AnimatedText text={'MANA BU|ALI!'} from={0} stagger={7} entrance="slam" size={140} accentWords={['ALI!']} rotate={-4} exitAt={EIGHT - 12} />
        ) : (
          <AnimatedText text={'LISTENING|8.0?!'} from={EIGHT} stagger={6} entrance="slam" size={128} accentWords={['8.0?!']} accent={COLORS.yellow} rotate={-3} />
        )}
      </At>
      <DuckedSfx name="whoosh" at={0} gainDb={-2} />
      <DuckedSfx name="impact" at={STOP} gainDb={-6} />
      <DuckedSfx name="pop" at={PHONES} gainDb={-6} />
      <DuckedSfx name="ding" at={EIGHT} gainDb={-6} />
      <DuckedSfx name="boing" at={KNOCK} gainDb={-6} />
      <DuckedSfx name="slide_down" at={KNOCK + 4} gainDb={-10} />
    </AbsoluteFill>
  );
};
