import React from 'react';
import {AbsoluteFill, random, useCurrentFrame} from 'remotion';
import {AliCharacter, EXPRESSIONS, mixExpression, mixPose, POSES, walkPose, type Expression, type Pose} from '../components/AliCharacter';
import {SpeedLines} from '../components/AnimatedBackground';
import {Sfx} from '../components/AudioManager';
import {CameraMovement} from '../components/CameraMovement';
import {Desk} from '../components/Props';
import {ScoreReveal} from '../components/ScoreReveal';
import {EASE, pop, track, tween} from '../components/anim';
import {COLORS} from '../theme';
import {Stage, type SceneProps} from './Stage';

/** 0:16 — mock test: walk in, scores slam, crash zoom, 7.0 dream bursts. */
export const Scene5Reality: React.FC<SceneProps> = ({scene}) => {
  const frame = useCurrentFrame();
  const b = scene.beats;
  const SIT = 34;
  const PAPER = b.l09.to - 4;
  const L_SCORE = b.l10.from + 14; // "to‘rt yarim"
  const R_SCORE = b.l11.from + 9; // "to‘rt!"
  const CRASH = b.l12.from - 2;
  const DREAM = CRASH + 8;
  const BURST = b.l12.from + 46; // "oshmayapti"
  const end = scene.durationInFrames;

  // walk in from the left, then sit behind the desk
  const walkX = tween(frame, [0, SIT - 6], [-150, 540], EASE.out);
  const sitting = tween(frame, [SIT - 6, SIT + 2], [0, 1], EASE.inOut);
  const walking: Pose = walkPose({...POSES.stand, headTurn: 0.4, lookX: 0.6}, frame / 14, 1 - sitting);
  const seated: Pose = {...POSES.seated, armL: [-14, -80], armR: [-14, -80], lookY: -0.6};
  const pose = track<Pose>(
    frame,
    [
      {at: 0, v: walking},
      {at: SIT - 6, v: seated, dur: 8},
      {at: PAPER + 4, v: {...seated, lookY: -0.9, headTilt: -4}, dur: 6},
      {at: L_SCORE, v: {...seated, lookY: -0.9, headTilt: -8, bodyY: 10}, dur: 3},
      {at: R_SCORE, v: {...POSES.armsUpShock, thighScale: 0.32, legL: [8, -8], legR: [8, -8], lookY: -0.3}, dur: 3},
      {at: CRASH, v: {...seated, armL: [60, 75], armR: [60, 75], lookY: 0, headTilt: 6}, dur: 4},
    ],
    mixPose,
  );
  const frameWalk = frame < SIT - 6 ? walking : pose;
  const expr = track<Expression>(
    frame,
    [
      {at: 0, v: EXPRESSIONS.confident},
      {at: PAPER, v: EXPRESSIONS.neutral, dur: 6},
      {at: L_SCORE, v: mixExpression(EXPRESSIONS.shocked, EXPRESSIONS.neutral, 0.4), dur: 3},
      {at: R_SCORE, v: EXPRESSIONS.shocked, dur: 3},
      {at: CRASH, v: mixExpression(EXPRESSIONS.shocked, EXPRESSIONS.disappointed, 0.35), dur: 5},
      {at: BURST + 4, v: EXPRESSIONS.disappointed, dur: 8},
    ],
    mixExpression,
  );
  const talk = frame > b.l12.from + 16 && frame < b.l12.to ? Math.abs(Math.sin(frame / 1.8)) * 0.4 : 0;
  const aliY = 1620 + (1 - sitting) * -160;
  const paperP = pop(frame, PAPER, 30, {damping: 13, stiffness: 140});
  const paperY = -500 + paperP * 1060;
  const dream = pop(frame, DREAM, 30, {damping: 9, stiffness: 160});
  const burstT = frame - BURST;
  const crashLines = frame >= CRASH && frame < CRASH + 14 ? 1 - (frame - CRASH) / 14 : 0;

  return (
    <AbsoluteFill style={{background: '#CBD5E1'}}>
      <CameraMovement
        focus={[540, 980]}
        keys={[
          {f: 0, zoom: 1.0},
          {f: PAPER, zoom: 1.0},
          {f: L_SCORE, zoom: 1.0},
          {f: L_SCORE + 3, zoom: 1.08, ease: EASE.power4Out},
          {f: R_SCORE, zoom: 1.08},
          {f: R_SCORE + 3, zoom: 1.16, ease: EASE.power4Out},
          {f: CRASH, zoom: 1.16, y: 0},
          {f: CRASH + 6, zoom: 1.85, y: 60, ease: EASE.power4Out},
          {f: end, zoom: 1.95, y: 60},
        ]}
        shakes={[
          {from: L_SCORE, duration: 10, amplitude: 18},
          {from: R_SCORE, duration: 12, amplitude: 24},
          {from: CRASH + 3, duration: 14, amplitude: 16},
          {from: BURST, duration: 10, amplitude: 14},
        ]}
      >
        <Stage>
          {/* exam hall */}
          <rect width={1080} height={1920} fill="#E2E8F0" />
          <rect y={1180} width={1080} height={740} fill="#94A3B8" />
          <g transform={`translate(${-frame * 0.3} ${tween(frame, [PAPER - 4, PAPER + 6], [0, -560], EASE.in)})`}>
            <rect x={160} y={180} width={860} height={300} rx={18} fill="#14532D" stroke={COLORS.ink} strokeWidth={10} />
            <text x={590} y={300} textAnchor="middle" fontFamily="Montserrat" fontWeight={900} fontSize={84} fill="#F8FAFC" opacity={0.9}>
              MOCK TEST
            </text>
            <text x={590} y={400} textAnchor="middle" fontFamily="Montserrat" fontWeight={600} fontSize={44} fill="#F8FAFC" opacity={0.75}>
              Listening • Reading
            </text>
          </g>
          {/* other candidates' desks (far layer) */}
          <g transform={`translate(${-frame * 0.6} 0)`} opacity={0.55}>
            {[-80, 330, 760, 1160].map((x, i) => (
              <g key={x} transform={`translate(${x} 1060)`}>
                <circle cx={0} cy={-80} r={46} fill="#475569" />
                <rect x={-50} y={-40} width={100} height={110} rx={30} fill="#475569" />
                <rect x={-110} y={50} width={220} height={26} rx={8} fill="#64748B" />
                <rect x={-90} y={76} width={180} height={90} fill="#64748B" opacity={i % 2 ? 0.8 : 1} />
              </g>
            ))}
          </g>
          <AliCharacter x={walkX} y={aliY} scale={1.15} pose={frameWalk} expression={expr} handL={frame >= R_SCORE && frame < CRASH ? 'open' : 'fist'} handR={frame >= R_SCORE && frame < CRASH ? 'open' : 'fist'} talk={talk} shadow={1 - sitting} />
          <Desk x={540} y={1260} width={820} />
          {/* answer sheet on the desk */}
          {frame >= PAPER + 10 ? <rect x={430} y={1232} width={220} height={36} rx={4} fill="#FFFDF5" stroke={COLORS.ink} strokeWidth={4} transform="skewX(-20)" /> : null}
          {/* falling result sheet */}
          {frame >= PAPER ? (
            <g transform={`translate(540 ${paperY}) rotate(${(1 - Math.min(1, paperP)) * 25 - 2}) scale(0.92)`} opacity={tween(frame, [CRASH, CRASH + 5], [1, 0])}>
              <ScoreReveal
                frame={frame}
                rows={[
                  {label: 'LISTENING', score: '4.5', at: L_SCORE},
                  {label: 'READING', score: '4.0', at: R_SCORE},
                ]}
              />
            </g>
          ) : null}
          {/* dream bubble */}
          {frame >= DREAM && burstT < 0 ? (
            <g transform={`translate(${610 + Math.sin(frame / 6) * 6} ${660}) scale(${dream * (1 + Math.max(0, frame - BURST + 8) * 0.02)})`}>
              <circle cx={-150} cy={250} r={18} fill={COLORS.white} stroke={COLORS.ink} strokeWidth={5} />
              <circle cx={-110} cy={180} r={28} fill={COLORS.white} stroke={COLORS.ink} strokeWidth={5} />
              <ellipse rx={170} ry={125} fill={COLORS.white} stroke={COLORS.ink} strokeWidth={7} />
              <text y={-20} textAnchor="middle" fontFamily="Montserrat" fontWeight={800} fontSize={46} fill={COLORS.blue}>
                IELTS
              </text>
              <text y={70} textAnchor="middle" fontFamily="Montserrat" fontWeight={900} fontSize={110} fill={COLORS.green}>
                7.0
              </text>
            </g>
          ) : null}
          {burstT >= 0 && burstT < 26
            ? Array.from({length: 18}).map((_, i) => {
                const a = (i / 18) * Math.PI * 2 + random(`b${i}`);
                const d = burstT * (14 + random(`bd${i}`) * 10);
                return (
                  <rect
                    key={i}
                    x={610 + Math.cos(a) * d - 14}
                    y={660 + Math.sin(a) * d + burstT * burstT * 0.4 - 14}
                    width={28}
                    height={28}
                    rx={6}
                    fill={i % 3 === 0 ? COLORS.green : COLORS.white}
                    stroke={COLORS.ink}
                    strokeWidth={4}
                    opacity={1 - burstT / 26}
                    transform={`rotate(${burstT * 20 + i * 30} ${610 + Math.cos(a) * d} ${660 + Math.sin(a) * d})`}
                  />
                );
              })
            : null}
          {/* ?! marks */}
          {frame >= b.l12.from + 18
            ? ['?', '!', '?'].map((m, i) => {
                const p = pop(frame, b.l12.from + 18 + i * 6, 30);
                return (
                  <text
                    key={i}
                    x={360 + i * 150}
                    y={790 - i * 20}
                    textAnchor="middle"
                    fontFamily="Montserrat"
                    fontWeight={900}
                    fontSize={110}
                    fill={i === 1 ? COLORS.red : COLORS.orange}
                    stroke={COLORS.ink}
                    strokeWidth={8}
                    paintOrder="stroke"
                    transform={`rotate(${(i - 1) * 18 + Math.sin(frame / 4 + i) * 6} ${360 + i * 150} ${790 - i * 20}) scale(1)`}
                    opacity={p}
                  >
                    {m}
                  </text>
                );
              })
            : null}
          {crashLines > 0 ? <SpeedLines cx={540} cy={1000} opacity={crashLines} /> : null}
        </Stage>
      </CameraMovement>
      {/* red flash on bad scores */}
      {[L_SCORE, R_SCORE].map((f) =>
        frame >= f && frame < f + 8 ? <AbsoluteFill key={f} style={{background: COLORS.red, opacity: 0.25 * (1 - (frame - f) / 8)}} /> : null,
      )}
      <Sfx name="paper" at={PAPER} volume={0.6} />
      <Sfx name="swish" at={PAPER + 2} volume={0.35} />
      <Sfx name="impact" at={L_SCORE} volume={0.7} />
      <Sfx name="dramatic_hit" at={R_SCORE} volume={0.55} />
      <Sfx name="whoosh" at={CRASH - 2} volume={0.6} rate={1.3} />
      <Sfx name="bubble_pop" at={DREAM} volume={0.5} />
      <Sfx name="glass_burst" at={BURST} volume={0.6} />
    </AbsoluteFill>
  );
};
