import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {AliCharacter, EXPRESSIONS, mixExpression, mixPose, POSES, type Expression, type Pose} from '../components/AliCharacter';
import {BurstBackground, FloatingShapes, HalftoneDrift} from '../components/AnimatedBackground';
import {AnimatedText} from '../components/AnimatedText';
import {Sfx} from '../components/AudioManager';
import {CameraMovement} from '../components/CameraMovement';
import {DustBurst} from '../components/Particles';
import {TargetBoard} from '../components/Props';
import {EASE, impactSquash, pop, track, tween} from '../components/anim';
import {COLORS} from '../theme';
import {At, Stage, type SceneProps} from './Stage';

/** 0:00 — Ali crashes into frame, IELTS 7.0 target, "MANA BU ALI!" */
export const Scene1Hook: React.FC<SceneProps> = ({scene}) => {
  const frame = useCurrentFrame();
  const b = scene.beats;
  const LAND = 11;
  const tPoint = b.l02.from + 2;
  const groundY = 1350;
  const aliX = 390;

  // fall with gravity, then squash on landing
  const fall = tween(frame, [0, LAND], [0, 1], EASE.in);
  const y = -500 + (groundY + 500) * fall;
  const squash = frame < LAND ? -0.18 * fall : impactSquash(frame, LAND, 0.32);

  const ta = {...POSES.stand, armL: [150, 10], armR: [150, 10], headTilt: 0} as Pose; // falling arms up
  const presenting = {...POSES.shrug, armL: [95, 40], armR: [95, 40], headTilt: -5} as Pose;
  const pose = track<Pose>(
    frame,
    [
      {at: 0, v: ta},
      {at: LAND, v: {...POSES.stand, bodyY: 30, armL: [40, 20], armR: [40, 20]}, dur: 3},
      {at: b.l01.from - 2, v: presenting, dur: 6},
      {at: tPoint, v: POSES.pointUpRight, dur: 7},
    ],
    mixPose,
  );
  const expr = track<Expression>(
    frame,
    [
      {at: 0, v: EXPRESSIONS.shocked},
      {at: LAND + 4, v: EXPRESSIONS.excited, dur: 6},
      {at: tPoint + 20, v: mixExpression(EXPRESSIONS.excited, EXPRESSIONS.confident, 0.5), dur: 10},
    ],
    mixExpression,
  );

  const targetIn = pop(frame, LAND + 3, 30, {damping: 10, stiffness: 120});
  const targetPulse = frame > b.l02.from + 15 ? 1 + 0.06 * Math.sin((frame - b.l02.from) / 2.2) * Math.exp(-(frame - b.l02.from - 15) / 25) : 1;
  const talk = 0;

  return (
    <AbsoluteFill style={{background: COLORS.blue}}>
      <CameraMovement
        focus={[aliX, 880]}
        keys={[
          {f: 0, zoom: 1.1},
          {f: LAND, zoom: 1.0, ease: EASE.in},
          {f: LAND + 5, zoom: 1.16, ease: EASE.power4Out},
          {f: b.l01.to - 6, zoom: 1.26, x: 30},
          {f: tPoint + 8, zoom: 1.0, x: 0, ease: EASE.out},
          {f: scene.durationInFrames, zoom: 1.08, ease: EASE.inOut},
        ]}
        shakes={[{from: LAND, duration: 16, amplitude: 26}]}
      >
        <Stage>
          <BurstBackground id="hook" a={COLORS.blueLight} b={COLORS.blueDark} cx={730} cy={900} speed={0.6} />
          <HalftoneDrift />
          <FloatingShapes seed="hook" depth={0.3} />
          <g transform={`translate(730 900) scale(${targetIn * targetPulse}) rotate(${(1 - targetIn) * -140})`}>
            <TargetBoard r={220} />
            <g transform="translate(0 -262)">
              <rect x={-120} y={-44} width={240} height={70} rx={20} fill={COLORS.navy} />
              <text y={10} textAnchor="middle" fontFamily="Montserrat" fontWeight={900} fontSize={46} fill={COLORS.yellow}>
                IELTS
              </text>
            </g>
          </g>
          {/* floor */}
          <ellipse cx={540} cy={groundY + 420} rx={900} ry={480} fill={COLORS.navy} opacity={0.35} />
          <AliCharacter
            x={aliX}
            y={y}
            scale={1.2}
            squash={squash}
            pose={pose}
            expression={expr}
            handR={frame >= tPoint ? 'point' : 'open'}
            handL="open"
            talk={talk}
            shadow={frame >= LAND ? 1 : 0.4 + fall * 0.6}
          />
          <DustBurst x={aliX} y={groundY} at={LAND} />
        </Stage>
      </CameraMovement>
      <At x={540} y={170}>
        <AnimatedText
          text={'MANA BU|ALI!'}
          from={b.l01.from}
          stagger={0}
          entrance="slam"
          size={150}
          accentWords={['ALI!']}
          exitAt={b.l02.from + 22}
          rotate={-4}
          style={{gap: 0}}
        />
      </At>
      {/* per-word timing for the headline */}
      <Sfx name="whoosh" at={0} volume={0.7} />
      <Sfx name="boom" at={LAND - 1} volume={0.9} />
      <Sfx name="pop" at={LAND + 4} volume={0.5} />
      <Sfx name="impact" at={b.l01.from + 8} volume={0.45} />
      <Sfx name="swish" at={tPoint} volume={0.5} />
      <Sfx name="ding" at={b.l02.from + 15} volume={0.35} />
    </AbsoluteFill>
  );
};
