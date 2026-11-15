import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {AliCharacter, EXPRESSIONS, mixExpression, mixPose, POSES, type Expression, type Pose} from '../components/AliCharacter';
import {AnimatedText} from '../components/AnimatedText';
import {Sfx} from '../components/AudioManager';
import {CameraMovement} from '../components/CameraMovement';
import {IeltsBook} from '../components/Props';
import {EASE, track, tween} from '../components/anim';
import {TIMELINE} from '../episode/timeline';
import {COLORS} from '../theme';
import {At, Stage, type SceneProps} from './Stage';

/** 0:24 — freeze frame, darkness, the punchline word by word, spotlight on the book. */
export const Scene6WakeUp: React.FC<SceneProps> = ({scene}) => {
  const frame = useCurrentFrame();
  const b = scene.beats;
  const line = TIMELINE.lines.find((l) => l.id === 'l13');
  const sceneFrom = scene.from;
  // word start frames (scene-local) for the kinetic type
  const w = (i: number) => (line ? line.words[Math.min(i, line.words.length - 1)].from - sceneFrom : b.l13.from + i * 10);
  const SPOT = w(7) + 6; // after "oshmaydi!"
  const LOOK = SPOT + 6;
  const DECIDE = LOOK + 14;
  const end = scene.durationInFrames;

  const dark = tween(frame, [0, 10], [0, 1]);
  const color = tween(frame, [SPOT, SPOT + 10], [0, 1]);
  const spot = tween(frame, [SPOT, SPOT + 6], [0, 1], EASE.out);
  const textOut = tween(frame, [SPOT + 2, SPOT + 10], [0, 1], EASE.in);

  const frozen: Pose = {...POSES.seated, armL: [60, 75], armR: [60, 75], headTilt: 6, legL: [3, -2], legR: [3, -2], thighScale: 1};
  const pose = track<Pose>(
    frame,
    [
      {at: 0, v: frozen},
      {at: LOOK, v: {...POSES.stand, headTurn: 0.8, lookX: 1, lookY: 0.4, headTilt: 6, armL: [12, 10], armR: [12, 10]}, dur: 8},
      {at: DECIDE, v: {...POSES.fistsChest, headTurn: 0.5, lookX: 0.8, lookY: 0.2, headTilt: -2}, dur: 6},
    ],
    mixPose,
  );
  const expr = track<Expression>(
    frame,
    [
      {at: 0, v: EXPRESSIONS.disappointed},
      {at: LOOK, v: mixExpression(EXPRESSIONS.disappointed, EXPRESSIONS.neutral, 0.6), dur: 8},
      {at: DECIDE, v: EXPRESSIONS.motivated, dur: 6},
    ],
    mixExpression,
  );
  const nod = frame > DECIDE ? Math.sin((frame - DECIDE) / 2.5) * 6 * Math.exp(-(frame - DECIDE) / 14) : 0;

  return (
    <AbsoluteFill style={{background: '#020617'}}>
      <CameraMovement
        focus={[330, 1000]}
        keys={[
          {f: 0, zoom: 1.5, x: 120, y: 120},
          {f: 10, zoom: 1.5, x: 120, y: 120},
          {f: w(2), zoom: 1.0, x: 0, y: 0, ease: EASE.inOut},
          {f: SPOT, zoom: 1.0},
          {f: end, zoom: 1.12, x: -40, ease: EASE.inOut},
        ]}
        shakes={[{from: w(7), duration: 10, amplitude: 12}]}
      >
        <Stage>
          <rect width={1080} height={1920} fill={COLORS.navy} opacity={1 - dark * 0.75} />
          {/* spotlight cone onto the book */}
          {spot > 0 ? (
            <g opacity={spot}>
              <defs>
                <linearGradient id="spot" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={COLORS.yellow} stopOpacity={0.05} />
                  <stop offset="100%" stopColor={COLORS.yellow} stopOpacity={0.45} />
                </linearGradient>
              </defs>
              <path d="M 720 -50 L 860 -50 L 1060 1420 L 520 1420 Z" fill="url(#spot)" />
              <ellipse cx={790} cy={1420} rx={270} ry={60} fill={COLORS.yellow} opacity={0.4} />
            </g>
          ) : null}
          <g transform="translate(790 1420)">
            <rect x={-110} y={-120} width={220} height={120} rx={12} fill="#1F2937" stroke={COLORS.ink} strokeWidth={6} />
          </g>
          <IeltsBook x={790} y={1220 + Math.sin(frame / 8) * 6 * spot} width={150} rotate={Math.sin(frame / 10) * 3 * spot} glow={spot} />
          {spot > 0
            ? [0, 1, 2, 3, 4].map((i) => {
                const t = (frame - SPOT + i * 7) % 30;
                return <circle key={i} cx={720 + i * 36} cy={1200 - t * 5} r={6} fill={COLORS.yellow} opacity={(1 - t / 30) * spot} />;
              })
            : null}
          <g style={{filter: `grayscale(${1 - color}) brightness(${0.55 + 0.45 * color})`}}>
            <AliCharacter x={330} y={1580} scale={1.1} pose={pose} expression={expr} frozen={frame < SPOT} rotate={nod * 0.2} />
          </g>
        </Stage>
      </CameraMovement>
      {/* freeze-frame film bars */}
      <AbsoluteFill style={{border: `${tween(frame, [0, 6], [0, 26])}px solid #000`, opacity: 1 - color}} />
      <At x={540} y={240}>
        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, opacity: 1 - textOut, transform: `translateY(${-textOut * 80}px)`}}>
          <AnimatedText text="CHUNKI, ALI..." from={w(0)} stagger={w(1) - w(0)} size={72} color="#CBD5E1" entrance="rise" />
          <AnimatedText text="IELTS BALLARI" from={w(2)} stagger={w(3) - w(2)} size={92} entrance="rise" />
          <AnimatedText text="ORZU QILISH" from={w(4)} stagger={w(5) - w(4)} size={112} accentWords={['ORZU']} accent={COLORS.orange} entrance="slam" />
          <AnimatedText text="BILAN" from={w(6)} size={80} entrance="rise" />
          <AnimatedText text="OSHMAYDI!" from={w(7)} size={136} color={COLORS.yellow} entrance="slam" />
        </div>
      </At>
      {frame >= SPOT + 6 ? (
        <At x={540} y={330}>
          <AnimatedText text="QAROR VAQTI!" from={SPOT + 8} size={110} color={COLORS.white} accentWords={['QAROR']} entrance="pop" stagger={5} rotate={-3} />
        </At>
      ) : null}
      <Sfx name="record_scratch" at={0} volume={0.6} />
      <Sfx name="impact" at={w(4)} volume={0.35} />
      <Sfx name="boom" at={w(7)} volume={0.5} />
      <Sfx name="ding" at={SPOT} volume={0.55} />
      <Sfx name="riser" at={end - 48} volume={0.5} />
      <Sfx name="pop" at={DECIDE} volume={0.45} />
    </AbsoluteFill>
  );
};
