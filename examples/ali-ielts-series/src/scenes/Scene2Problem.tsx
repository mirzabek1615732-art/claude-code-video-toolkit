import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {AliCharacter, EXPRESSIONS, mixExpression, mixPose, POSES, type Expression, type Pose} from '../components/AliCharacter';
import {RoomBackground} from '../components/AnimatedBackground';
import {Sfx} from '../components/AudioManager';
import {CameraMovement} from '../components/CameraMovement';
import {IeltsBook, Sofa} from '../components/Props';
import {EASE, noise1, pop, track, tween} from '../components/anim';
import {COLORS} from '../theme';
import {Stage, type SceneProps} from './Stage';

/** 0:04 — lazy on the sofa, phone lights up, 0% MOTIVATION. */
export const Scene2Problem: React.FC<SceneProps> = ({scene}) => {
  const frame = useCurrentFrame();
  const b = scene.beats;
  const PING = 6;
  const GRAB = 16;
  const meterAt = b.l03.from + 34; // "niyati"
  const yoqAt = b.l03.from + 46; // "yo‘q!"

  const seatedPhone: Pose = {...POSES.seatedLazy, armR: [-5, -118], headTilt: 6, lookX: -0.1, lookY: 0.9, bodyTilt: -8};
  const reach: Pose = {...POSES.seatedLazy, armR: [70, 20], lookX: 1, lookY: 0.6, headTilt: 8, bodyTilt: -4};
  const pose = track<Pose>(
    frame,
    [
      {at: 0, v: POSES.seatedLazy},
      {at: PING + 3, v: {...POSES.seatedLazy, lookX: 1, lookY: 0.5, headTilt: 2}, dur: 4},
      {at: GRAB - 4, v: reach, dur: 4},
      {at: GRAB + 2, v: seatedPhone, dur: 6},
    ],
    mixPose,
  );
  const expr = track<Expression>(
    frame,
    [
      {at: 0, v: EXPRESSIONS.lazy},
      {at: PING + 3, v: mixExpression(EXPRESSIONS.lazy, EXPRESSIONS.excited, 0.6), dur: 3},
      {at: GRAB + 4, v: EXPRESSIONS.distracted, dur: 6},
    ],
    mixExpression,
  );
  const hasPhone = frame >= GRAB + 1;
  const buzz = frame >= PING && frame < GRAB ? noise1(frame * 3, 4) * 8 : 0;
  const meter = pop(frame, meterAt, 30, {damping: 9, stiffness: 200});
  const meterLevel = tween(frame, [meterAt + 4, yoqAt + 2], [0.32, 0.0], EASE.in);
  const flicker = frame > yoqAt && Math.floor(frame / 3) % 2 === 0 ? 0.4 : 1;

  return (
    <AbsoluteFill style={{background: COLORS.navy}}>
      <CameraMovement
        focus={[540, 1100]}
        keys={[
          {f: 0, zoom: 1.12, x: -20},
          {f: GRAB, zoom: 1.2, x: -40, ease: EASE.inOut},
          {f: meterAt, zoom: 1.0, x: 0, ease: EASE.power4Out},
          {f: scene.durationInFrames, zoom: 1.06},
        ]}
        shakes={[
          {from: meterAt, duration: 10, amplitude: 14},
          {from: yoqAt, duration: 12, amplitude: 18},
        ]}
      >
        <Stage>
          <RoomBackground pan={-frame * 0.6} wall="#3B4A6B" wall2="#26324A" />
          <Sofa x={540} y={1430} layer="back" />
          <IeltsBook x={250} y={1210} width={120} rotate={-78} />
          <AliCharacter x={560} y={1400} scale={1.05} pose={pose} expression={expr} itemR={hasPhone ? 'phone' : 'none'} phoneGlow={hasPhone ? 1 : 0} handR="fist" shadow={0} />
          {!hasPhone ? (
            <g transform={`translate(${820 + buzz} 1212) rotate(${-70 + buzz})`}>
              {frame >= PING ? <circle r={120 * (1 + ((frame - PING) % 8) / 16)} fill={COLORS.blueLight} opacity={0.35 - ((frame - PING) % 8) / 30} /> : null}
              <rect x={-36} y={-66} width={72} height={132} rx={14} fill={COLORS.ink} />
              <rect x={-30} y={-58} width={60} height={116} rx={9} fill={frame >= PING ? COLORS.blueLight : '#1F2937'} />
            </g>
          ) : null}
          {frame >= PING && frame < GRAB + 10 ? (
            <g transform={`translate(860 1040) scale(${pop(frame, PING, 30)})`}>
              <circle r={44} fill={COLORS.red} stroke={COLORS.white} strokeWidth={8} />
              <text y={18} textAnchor="middle" fontFamily="Montserrat" fontWeight={900} fontSize={50} fill={COLORS.white}>
                1
              </text>
            </g>
          ) : null}
          <Sofa x={540} y={1430} layer="front" />
          {/* 0% MOTIVATION meter */}
          {frame >= meterAt ? (
            <g transform={`translate(540 480) scale(${meter}) rotate(${(1 - meter) * 10 - 3})`}>
              <rect x={-420} y={-190} width={840} height={380} rx={40} fill={COLORS.redDark} stroke={COLORS.ink} strokeWidth={10} />
              <rect x={-400} y={-170} width={800} height={340} rx={30} fill={COLORS.red} />
              <rect x={-330} y={10} width={600} height={120} rx={20} fill={COLORS.navy} stroke={COLORS.white} strokeWidth={8} />
              <rect x={276} y={44} width={34} height={52} rx={8} fill={COLORS.white} />
              <rect x={-318} y={22} width={576 * meterLevel} height={96} rx={12} fill={COLORS.yellow} opacity={flicker} />
              <text x={0} y={-40} textAnchor="middle" fontFamily="Montserrat" fontWeight={900} fill={COLORS.white} stroke={COLORS.navy} strokeWidth={10} paintOrder="stroke">
                <tspan fontSize={150}>{Math.round(meterLevel * 100)}%</tspan>
                <tspan fontSize={70} dx={24} dy={-10}>
                  MOTIVATION
                </tspan>
              </text>
            </g>
          ) : null}
        </Stage>
      </CameraMovement>
      <Sfx name="notification" at={PING} volume={0.6} />
      <Sfx name="swish" at={GRAB - 3} volume={0.45} />
      <Sfx name="pop" at={GRAB + 1} volume={0.6} />
      <Sfx name="impact" at={meterAt} volume={0.55} />
      <Sfx name="slide_down" at={meterAt + 3} volume={0.4} />
      <Sfx name="boing" at={yoqAt} volume={0.5} />
    </AbsoluteFill>
  );
};
