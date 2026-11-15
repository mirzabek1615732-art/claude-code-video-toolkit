import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';
import {DuckedSfx} from '../../../audio/EpisodeAudio';
import {AliCharacter, EXPRESSIONS, mixExpression, mixPose, POSES, type Expression, type Pose} from '../../../components/AliCharacter';
import {RoomBackground} from '../../../components/AnimatedBackground';
import {AnimatedText} from '../../../components/AnimatedText';
import {CameraMovement} from '../../../components/CameraMovement';
import {DustBurst} from '../../../components/Particles';
import {Desk, IeltsBook} from '../../../components/Props';
import {EASE, impactSquash, pop, track} from '../../../components/anim';
import {COLORS} from '../../../theme';
import {wordAt, type TLScene} from '../../buildTimeline';
import {At, Stage} from '../../../scenes/Stage';

/** 0:00 — Ali bursts in, a giant IELTS Reading book slams onto the desk. */
export const S1Hook: React.FC<{scene: TLScene}> = ({scene}) => {
  const f = useCurrentFrame();
  const LAND = 9;
  const BOOK = wordAt(scene, 'l02', 4); // "Readingni"
  const end = scene.durationInFrames;

  // burst in from the left with stretch, overshoot, settle
  const x = interpolate(f, [0, LAND, LAND + 5, LAND + 10], [130, 560, 528, 540], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.bezier(0.2, 0.9, 0.3, 1)});
  const stretch = f < LAND ? -0.22 : impactSquash(f, LAND, 0.25);
  const lean = f < LAND ? 14 : interpolate(f, [LAND, LAND + 12], [-8, 0], {extrapolateRight: 'clamp', easing: EASE.out});

  const pose = track<Pose>(
    f,
    [
      {at: 0, v: {...POSES.stand, armL: [70, 40], armR: [70, 40], bodyTilt: 12}},
      {at: LAND, v: {...POSES.shrug, armL: [95, 30], armR: [95, 30]}, dur: 6},
      {at: BOOK - 6, v: {...POSES.stand, armL: [40, 60], armR: [40, 60], lookX: 0.9, lookY: -0.6, headTilt: -6, headTurn: 0.5}, dur: 5},
      {at: BOOK + 4, v: {...POSES.fistUp, headTilt: -5, lookX: 0.6, lookY: 0.1, headTurn: 0.3}, dur: 6},
    ],
    mixPose,
  );
  const expr = track<Expression>(
    f,
    [
      {at: 0, v: EXPRESSIONS.excited},
      {at: BOOK - 6, v: mixExpression(EXPRESSIONS.excited, EXPRESSIONS.shocked, 0.5), dur: 4},
      {at: BOOK + 4, v: EXPRESSIONS.confident, dur: 6},
    ],
    mixExpression,
  );

  // book falls from above with gravity, squashes on the desk
  const bookY = f < BOOK ? interpolate(f, [BOOK - 9, BOOK], [-500, 1180], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.in(Easing.quad)}) : 1180;
  const bookSquash = impactSquash(f, BOOK, 0.3);
  const deskShake = f >= BOOK && f < BOOK + 14 ? Math.sin((f - BOOK) * 2.4) * 10 * (1 - (f - BOOK) / 14) : 0;
  const speedLines = f < LAND + 2 ? 1 - f / (LAND + 2) : 0;
  const oson = pop(f, BOOK + 6, 30, {damping: 9, stiffness: 240, mass: 0.6});

  return (
    <AbsoluteFill style={{background: COLORS.navy}}>
      <CameraMovement
        focus={[540, 1000]}
        keys={[
          {f: 0, zoom: 1.08},
          {f: LAND + 6, zoom: 1.0, ease: EASE.out},
          {f: BOOK - 1, zoom: 1.0},
          {f: BOOK + 4, zoom: 1.14, y: 30, ease: EASE.power4Out},
          {f: end, zoom: 1.2, y: 30},
        ]}
        shakes={[
          {from: LAND, duration: 8, amplitude: 10},
          {from: BOOK, duration: 16, amplitude: 22},
        ]}
      >
        <Stage>
          <RoomBackground wall="#2F4A85" wall2="#21366A" pan={-f * 0.8} shelf={false} />
          {/* speed lines while bursting in */}
          {speedLines > 0
            ? Array.from({length: 9}).map((_, i) => (
                <rect key={i} x={x - 760 - (i % 3) * 120} y={700 + i * 70} width={520 + (i % 4) * 90} height={14} rx={7} fill={COLORS.white} opacity={0.65 * speedLines} />
              ))
            : null}
          <AliCharacter x={x} y={1790} scale={1.62} squash={stretch} rotate={lean} pose={pose} expression={expr} handL="open" handR={f >= BOOK + 4 ? 'fist' : 'open'} shadow={0} />
          <g transform={`translate(${deskShake} 0)`}>
            <Desk x={540} y={1240} width={900} toFloor />
            <g transform={`translate(830 ${bookY}) scale(${1 + bookSquash * 0.5} ${1 - bookSquash})`}>
              <IeltsBook x={0} y={-130} width={200} rotate={-90} />
              <text x={0} y={-232} textAnchor="middle" fontFamily="Montserrat" fontWeight={900} fontSize={40} fill={COLORS.white} stroke={COLORS.navy} strokeWidth={8} paintOrder="stroke">
                READING
              </text>
            </g>
          </g>
          <DustBurst x={830} y={1180} at={BOOK} count={12} spread={300} />
        </Stage>
      </CameraMovement>
      <At x={540} y={225}>
        {f < BOOK ? (
          <AnimatedText text={'MANA BU|ALI!'} from={0} stagger={7} entrance="slam" size={150} accentWords={['ALI!']} rotate={-4} exitAt={BOOK - 6} />
        ) : (
          <div style={{transform: `scale(${oson}) rotate(${-6 + (1 - Math.min(1, oson)) * 20}deg)`, opacity: Math.min(1, oson * 2)}}>
            <AnimatedText text={'READING?|OSON!'} from={BOOK + 6} stagger={6} entrance="pop" size={140} accentWords={['OSON!']} accent={COLORS.green} />
          </div>
        )}
      </At>
      <DuckedSfx name="whoosh" at={0} gainDb={-2} />
      <DuckedSfx name="impact" at={LAND} gainDb={-6} />
      <DuckedSfx name="whoosh" at={BOOK - 9} gainDb={-6} rate={1.3} />
      <DuckedSfx name="boom" at={BOOK} gainDb={-4} />
      <DuckedSfx name="pop" at={BOOK + 6} gainDb={-6} />
    </AbsoluteFill>
  );
};

