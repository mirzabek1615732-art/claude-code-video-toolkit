import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {DuckedSfx} from '../../../audio/EpisodeAudio';
import {AliCharacter, EXPRESSIONS, mixExpression, mixPose, POSES, type Expression, type Pose} from '../../../components/AliCharacter';
import {AnimatedText} from '../../../components/AnimatedText';
import {CameraMovement} from '../../../components/CameraMovement';
import {Desk} from '../../../components/Props';
import {EASE, impactSquash, track, tween, type Key} from '../../../components/anim';
import {COLORS} from '../../../theme';
import {wordAt, type TLScene} from '../../buildTimeline';
import {At, Stage} from '../../../scenes/Stage';
import {Brain, ConfidenceMeter, F, Pill} from './common';

const ORBIT = ['E = mc²', '∑ xᵢ', 'paradigm', '√π', 'ubiquitous', '∫ f(x)dx', 'plethora'];

/** 0:10 — vocabulary pills: Ali swallows Moreover / Furthermore / Notwithstanding; brain swells, professor mode on. */
export const S3Overdose: React.FC<{scene: TLScene}> = ({scene}) => {
  const f = useCurrentFrame();
  const P = [0, 1, 2].map((i) => wordAt(scene, 'a01', i));
  const ON = scene.lines.l05.localFrom;
  const end = scene.durationInFrames;
  const gulps = P.filter((p) => f >= p + 8).length;
  const brain = 0.55 + gulps * 0.28 + (f >= ON ? 0.25 : 0);
  const brainS = brain + Math.sin(f / 4) * 0.03;
  const lift = f >= ON ? tween(f, [ON, ON + 14], [0, 150], EASE.out) + Math.sin(f / 7) * 12 : 0;
  const conf = f < P[0] ? 60 : f < ON ? 60 + gulps * 120 : Math.min(999, 420 + (f - ON) * 40);
  const glasses = tween(f, [P[2] + 8, P[2] + 18], [1.25, 1.75], EASE.back);
  const headY = 1830 - lift - 520 * 1.2;

  const pose = track<Pose>(
    f,
    [
      {at: 0, v: {...POSES.writing, armL: [-14, -100], armR: [-8, -95], lookY: -0.4, headTilt: 0}},
      ...P.flatMap((p): Array<Key<Pose>> => [
        {at: p - 6, v: {...POSES.writing, armL: [-14, -100], armR: [-30, -150], lookY: -0.2, headTilt: -10}, dur: 4},
        {at: p + 8, v: {...POSES.writing, armL: [-14, -100], armR: [-8, -95], lookY: -0.6, headTilt: 6}, dur: 4},
      ]),
      {at: ON, v: {...POSES.armsUpShock, thighScale: 0.32, legL: [30, -40], legR: [30, -40], armL: [150, 20], armR: [150, 20], headTilt: -4, lookY: -0.4}, dur: 6},
    ],
    mixPose,
  );
  const expr = track<Expression>(
    f,
    [
      {at: 0, v: EXPRESSIONS.excited},
      ...P.flatMap((p) => [
        {at: p - 6, v: {...EXPRESSIONS.excited, mouthOpen: 1, mouthWidth: 1.1}, dur: 3},
        {at: p + 8, v: mixExpression(EXPRESSIONS.professor, EXPRESSIONS.shocked, 0.35), dur: 4},
      ]),
      {at: ON, v: mixExpression(EXPRESSIONS.professor, EXPRESSIONS.ecstatic, 0.5), dur: 6},
    ],
    mixExpression,
  );

  return (
    <AbsoluteFill style={{background: '#0F172A'}}>
      <CameraMovement focus={[540, 1100]} keys={[{f: 0, zoom: 1.06}, {f: P[0] - 6, zoom: 1.0}, {f: ON - 2, zoom: 1.1, ease: EASE.inOut}, {f: ON + 8, zoom: 1.0, y: -40, ease: EASE.power4Out}, {f: end, zoom: 1.02, y: -40}]} shakes={P.map((p) => ({from: p + 8, duration: 6, amplitude: 9}))}>
        <Stage>
          <defs>
            <radialGradient id="od-bg" cx="0.5" cy="0.45" r="0.8">
              <stop offset="0%" stopColor={f >= ON ? '#7C3AED' : '#1E3A8A'} />
              <stop offset="100%" stopColor="#0B1023" />
            </radialGradient>
          </defs>
          <rect width={1080} height={1920} fill="url(#od-bg)" />
          {/* orbiting formulas, more of them with each pill */}
          {ORBIT.slice(0, 2 + gulps * 2 + (f >= ON ? 1 : 0)).map((w, i) => {
            const a = f / 22 + (i / ORBIT.length) * Math.PI * 2;
            const rx = 360;
            const ry = 120;
            const x = 540 + Math.cos(a) * rx;
            const y = headY - 300 + Math.sin(a) * ry;
            return (
              <text key={w} x={x} y={y} textAnchor="middle" fontFamily={i % 2 ? 'Georgia, serif' : F} fontStyle={i % 2 ? 'italic' : undefined} fontWeight={800} fontSize={44} fill={COLORS.white} opacity={Math.sin(a) > -0.2 ? 0.95 : 0.45}>
                {w}
              </text>
            );
          })}
          <g transform={`translate(540 ${headY - 330}) scale(${brainS * 0.8})`}>
            <Brain glow={f >= ON ? 1 : 0} />
          </g>
          <AliCharacter x={540} y={1830 - lift} scale={1.2} squash={P.reduce((m, p) => Math.max(m, impactSquash(f, p + 8, 0.18)), 0)} pose={pose} expression={expr} handL="open" handR={f >= ON ? 'fist' : 'open'} glasses={f >= P[2] + 8 ? glasses : 1.25} gradCap={f >= ON} shadow={0} />
          <Desk x={540} y={1400} width={980} toFloor />
          {/* the pills fly from the jar into his mouth */}
          <g transform="translate(860 1340)">
            <rect x={-70} y={-130} width={140} height={130} rx={20} fill="#E0F2FE" fillOpacity={0.8} stroke={COLORS.ink} strokeWidth={6} />
            <rect x={-80} y={-150} width={160} height={30} rx={8} fill={COLORS.red} stroke={COLORS.ink} strokeWidth={5} />
            <text y={-56} textAnchor="middle" fontFamily={F} fontWeight={900} fontSize={22} fill={COLORS.navy}>
              BAND 8
            </text>
            <text y={-28} textAnchor="middle" fontFamily={F} fontWeight={900} fontSize={22} fill={COLORS.navy}>
              VOCAB
            </text>
          </g>
          {['Moreover', 'Furthermore', 'Notwithstanding'].map((w, i) => {
            const t0 = P[i] - 8;
            const t = f - t0;
            if (t < 0 || t > 16) return null;
            const p = t / 16;
            const x = 860 + (540 - 860) * p;
            const y = 1240 + (headY + 110 - 1240) * p - Math.sin(p * Math.PI) * 260;
            return (
              <g key={w} transform={`translate(${x} ${y}) rotate(${p * 360}) scale(${1 - p * 0.55})`}>
                <Pill word={w} color={[COLORS.yellow, '#F472B6', COLORS.green][i]} />
              </g>
            );
          })}
          <g transform="translate(130 1260)">
            <ConfidenceMeter value={conf} h={560} />
          </g>
        </Stage>
      </CameraMovement>
      <At x={540} y={235}>{f >= ON ? <AnimatedText text={'PROFESSOR MODE:|ON'} from={ON} stagger={5} entrance="slam" size={90} accentWords={['ON']} accent={COLORS.green} rotate={-3} /> : null}</At>
      {P.map((p, i) => (
        <DuckedSfx key={i} name="bubble_pop" at={p + 8} gainDb={-14} rate={1 + i * 0.15} />
      ))}
      <DuckedSfx name="riser" at={ON - 10} gainDb={-14} />
      <DuckedSfx name="success" at={ON + 2} gainDb={-12} />
    </AbsoluteFill>
  );
};
