import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {AliCharacter, EXPRESSIONS, mixExpression, mixPose, POSES, type Expression, type Pose} from '../components/AliCharacter';
import {BurstBackground, FloatingShapes, HalftoneDrift} from '../components/AnimatedBackground';
import {AnimatedText} from '../components/AnimatedText';
import {Sfx} from '../components/AudioManager';
import {CameraMovement} from '../components/CameraMovement';
import {Confetti} from '../components/Particles';
import {EASE, pop, track, tween} from '../components/anim';
import {COLORS, FONT_FAMILY} from '../theme';
import {At, Stage, type SceneProps} from './Stage';

/** 0:36 — CTA: point at the viewer, BUGUNDAN BOSHLA!, follow button tap. */
export const Scene8CTA: React.FC<SceneProps> = ({scene}) => {
  const frame = useCurrentFrame();
  const b = scene.beats;
  const POINT = b.l17.from;
  const TITLE = b.l18.from;
  const BUTTON = b.l19.from;
  const TAP = b.l19.from + 52; // "obuna"
  const end = scene.durationInFrames;

  const pose = track<Pose>(
    frame,
    [
      {at: 0, v: {...POSES.stand, armR: [30, 30]}},
      {at: POINT, v: POSES.pointAtViewer, dur: 5},
      {at: TITLE, v: POSES.fistUp, dur: 6},
      {at: BUTTON, v: {...POSES.pointUpRight, armR: [100, 10], headTurn: 0.5, lookX: 1, lookY: -0.1}, dur: 7},
      {at: TAP + 2, v: {...POSES.thumbsUp, armL: [150, 20]}, dur: 6},
    ],
    mixPose,
  );
  const expr = track<Expression>(
    frame,
    [
      {at: 0, v: EXPRESSIONS.confident},
      {at: TITLE, v: EXPRESSIONS.motivated, dur: 5},
      {at: BUTTON, v: EXPRESSIONS.confident, dur: 6},
      {at: TAP + 2, v: EXPRESSIONS.excited, dur: 5},
    ],
    mixExpression,
  );
  let handR: 'pointFront' | 'fist' | 'point' | 'thumbsUp' = 'fist';
  if (frame >= POINT && frame < TITLE) handR = 'pointFront';
  else if (frame >= BUTTON && frame < TAP + 2) handR = 'point';
  else if (frame >= TAP + 2) handR = 'thumbsUp';

  const btn = pop(frame, BUTTON, 30, {damping: 10, stiffness: 180});
  const tapped = frame >= TAP;
  const press = tapped ? 1 - 0.12 * Math.exp(-(frame - TAP) / 3) : 1;
  const cursorIn = tween(frame, [TAP - 22, TAP - 2], [0, 1], EASE.out);
  const bob = Math.sin(frame / 7) * 6;
  const sub = pop(frame, TITLE + 30, 30);

  return (
    <AbsoluteFill style={{background: COLORS.orange}}>
      <CameraMovement
        focus={[540, 1000]}
        keys={[
          {f: 0, zoom: 1.0},
          {f: POINT + 2, zoom: 1.0},
          {f: POINT + 7, zoom: 1.2, ease: EASE.power4Out},
          {f: TITLE - 2, zoom: 1.22},
          {f: TITLE + 6, zoom: 1.0, ease: EASE.power4Out},
          {f: end, zoom: 1.05, ease: EASE.inOut},
        ]}
        shakes={[
          {from: TITLE + 2, duration: 10, amplitude: 14},
          {from: TAP, duration: 8, amplitude: 10},
        ]}
      >
        <Stage>
          <BurstBackground id="cta" a={COLORS.yellow} b={COLORS.orange} cx={330} cy={1000} speed={0.8} rays={22} />
          <HalftoneDrift color={COLORS.navy} opacity={0.06} />
          <FloatingShapes seed="cta" depth={0.6} colors={[COLORS.white, COLORS.blue, COLORS.navy]} count={10} />
          <ellipse cx={330} cy={1372} rx={260} ry={46} fill={COLORS.navy} opacity={0.18} />
          <AliCharacter x={330} y={1360} scale={1.1} squash={frame >= TAP + 2 ? Math.sin((frame - TAP - 2) / 2) * 0.08 * Math.exp(-(frame - TAP - 2) / 8) : 0} pose={pose} expression={expr} handR={handR} handL="fist" />
          {/* follow button */}
          {frame >= BUTTON ? (
            <g transform={`translate(735 ${1000 + bob}) scale(${btn * press})`}>
              <rect x={-200} y={-80} width={400} height={160} rx={80} fill={COLORS.navy} transform="translate(0 14)" />
              <rect x={-200} y={-80} width={400} height={160} rx={80} fill={tapped ? COLORS.green : COLORS.blue} stroke={COLORS.navy} strokeWidth={8} />
              {tapped ? (
                <path d="M -150 0 L -120 30 L -80 -30" stroke={COLORS.white} strokeWidth={16} fill="none" strokeLinecap="round" strokeLinejoin="round" />
              ) : (
                <g transform="translate(-135 0)">
                  <path d="M -30 22 L 30 22 L 22 10 L 22 -12 Q 22 -38 0 -40 Q -22 -38 -22 -12 L -22 10 Z" fill={COLORS.yellow} stroke={COLORS.navy} strokeWidth={5} />
                  <circle cy={30} r={9} fill={COLORS.yellow} stroke={COLORS.navy} strokeWidth={4} />
                </g>
              )}
              <text x={40} y={tapped ? 4 : 16} textAnchor="middle" fontFamily="Montserrat" fontWeight={900} fontSize={tapped ? 42 : 44} fill={COLORS.white}>
                {tapped ? 'OBUNA' : 'OBUNA BO‘L'}
              </text>
              {tapped ? (
                <text x={40} y={50} textAnchor="middle" fontFamily="Montserrat" fontWeight={800} fontSize={34} fill={COLORS.white}>
                  BO‘LINDI!
                </text>
              ) : null}
            </g>
          ) : null}
          {/* tap cursor */}
          {frame >= TAP - 22 && frame < TAP + 26 ? (
            <g transform={`translate(${1160 - 300 * cursorIn} ${1340 - 300 * cursorIn}) scale(${frame >= TAP && frame < TAP + 4 ? 0.85 : 1}) rotate(-20)`} opacity={1 - tween(frame, [TAP + 16, TAP + 26], [0, 1])}>
              <path d="M 0 0 L 0 120 L 30 92 L 52 140 L 74 130 L 52 84 L 92 84 Z" fill={COLORS.white} stroke={COLORS.navy} strokeWidth={8} strokeLinejoin="round" />
            </g>
          ) : null}
          {tapped && frame < TAP + 14 ? <circle cx={735} cy={1000} r={(frame - TAP) * 28} fill="none" stroke={COLORS.white} strokeWidth={14 - (frame - TAP)} /> : null}
          <Confetti at={TAP} count={80} />
        </Stage>
      </CameraMovement>
      <At x={540} y={190}>
        {frame < TITLE ? (
          <AnimatedText text="ERTANI KUTMA!" from={POINT + 2} size={118} accentWords={['KUTMA!']} accent={COLORS.yellow} color={COLORS.white} entrance="drop" stagger={5} exitAt={TITLE - 6} rotate={-3} />
        ) : (
          <AnimatedText text={'BUGUNDAN|BOSHLA!'} from={TITLE + 6} stagger={14} size={140} color={COLORS.white} accentWords={['BOSHLA!']} accent={COLORS.yellow} entrance="slam" rotate={-3} />
        )}
      </At>
      {frame >= TITLE + 30 ? (
        <At x={540} y={540}>
          <div
            style={{
              fontFamily: FONT_FAMILY,
              fontWeight: 800,
              fontSize: 40,
              letterSpacing: 4,
              color: COLORS.white,
              background: COLORS.navy,
              padding: '14px 34px',
              borderRadius: 40,
              transform: `scale(${sub})`,
              whiteSpace: 'nowrap',
            }}
          >
            IELTS <span style={{color: COLORS.yellow}}>|</span> ENGLISH <span style={{color: COLORS.yellow}}>|</span> MOTIVATION
          </div>
        </At>
      ) : null}
      <Sfx name="swish" at={POINT} volume={0.5} />
      <Sfx name="impact" at={POINT + 5} volume={0.4} />
      <Sfx name="whoosh" at={TITLE} volume={0.5} />
      <Sfx name="boom" at={TITLE + 6} volume={0.45} />
      <Sfx name="stamp" at={TITLE + 20} volume={0.45} />
      <Sfx name="pop" at={TITLE + 30} volume={0.4} />
      <Sfx name="bubble_pop" at={BUTTON} volume={0.5} />
      <Sfx name="swish" at={TAP - 20} volume={0.3} />
      <Sfx name="pop" at={TAP} volume={0.7} />
      <Sfx name="success" at={TAP + 1} volume={0.55} />
    </AbsoluteFill>
  );
};
