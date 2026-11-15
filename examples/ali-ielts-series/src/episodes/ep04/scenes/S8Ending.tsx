import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {DuckedSfx} from '../../../audio/EpisodeAudio';
import {AliCharacter, EXPRESSIONS, mixExpression, mixPose, POSES, type Expression, type Pose} from '../../../components/AliCharacter';
import {AnimatedText} from '../../../components/AnimatedText';
import {CameraMovement} from '../../../components/CameraMovement';
import {Confetti} from '../../../components/Particles';
import {EASE, pop, track, tween} from '../../../components/anim';
import {COLORS, FONT_FAMILY} from '../../../theme';
import {wordAt, type TLScene} from '../../buildTimeline';
import {At, Stage} from '../../../scenes/Stage';
import {NumberTile} from './common';

const COMMENTS = [
  {name: 'aziza.ielts', text: '30!', side: -1},
  {name: 'bekzod_07', text: '13… yo‘q, 30!', side: 1},
];

/** 0:55 — question to the viewer: 13 or 30? comments, sign-off. */
export const S8Ending: React.FC<{scene: TLScene}> = ({scene}) => {
  const f = useCurrentFrame();
  const Q = scene.lines.l16.localFrom;
  const N13 = wordAt(scene, 'l17', 2); // "o‘n"
  const N30 = wordAt(scene, 'l17', 5); // "o‘ttiz"
  const YOZ = scene.lines.l17.localFrom; // "Unda izohlarga…"
  const SUS = scene.lines.l17.localTo + 2;
  const FINAL = scene.lines.l18.localFrom + 6;
  const end = scene.durationInFrames;

  const pose = track<Pose>(
    f,
    [
      {at: 0, v: {...POSES.shrug, lookY: -0.2}},
      {at: Q, v: {...POSES.pointAtViewer}, dur: 5},
      {at: N13 - 4, v: {...POSES.stand, armL: [124, 10], armR: [10, 20], lookX: -0.9, lookY: -0.6, headTurn: -0.5}, dur: 5},
      {at: N30 - 4, v: {...POSES.stand, armR: [124, 10], armL: [10, 20], lookX: 0.9, lookY: -0.6, headTurn: 0.5}, dur: 5},
            {at: SUS, v: {...POSES.stand, armL: [-10, -150], armR: [-10, -150], headTilt: 10, lookX: 0.7, lookY: 0.1, bodyTilt: 4}, dur: 5},
      {at: FINAL, v: {...POSES.fistUp, lookY: -0.2}, dur: 6},
    ],
    mixPose,
  );
  const expr = track<Expression>(
    f,
    [
      {at: 0, v: EXPRESSIONS.confident},
      {at: Q, v: EXPRESSIONS.excited, dur: 4},
      {at: N13 - 4, v: mixExpression(EXPRESSIONS.confident, EXPRESSIONS.idea, 0.4), dur: 5},
      {at: SUS, v: EXPRESSIONS.suspicious, dur: 4},
      {at: FINAL, v: EXPRESSIONS.excited, dur: 5},
    ],
    mixExpression,
  );
  const handR = f >= FINAL ? 'fist' : f >= SUS ? 'open' : f >= N30 - 4 || (f >= Q && f < N13 - 4) ? 'point' : 'open';
  const handL = f >= N13 - 4 && f < N30 - 4 ? 'point' : 'open';
  const t13 = pop(f, Q + 6, 30, {damping: 10, stiffness: 200});
  const t30 = pop(f, Q + 12, 30, {damping: 10, stiffness: 200});
  const on13 = tween(f, [N13 - 2, N13 + 4], [0, 1]) * (1 - tween(f, [N30 - 2, N30 + 4], [0, 1]));
  const on30 = tween(f, [N30 - 2, N30 + 4], [0, 1]) * (1 - tween(f, [SUS - 4, SUS], [0, 1]));
  const tilesOut = 1 - tween(f, [FINAL - 6, FINAL], [0, 1], EASE.in);

  return (
    <AbsoluteFill style={{background: COLORS.navy}}>
      <CameraMovement focus={[540, 1000]} keys={[{f: 0, zoom: 1.12}, {f: Q + 4, zoom: 1.0, ease: EASE.power4Out}, {f: SUS - 2, zoom: 1.0}, {f: SUS + 6, zoom: 1.22, y: 150, ease: EASE.power4Out}, {f: FINAL - 4, zoom: 1.22, y: 150}, {f: FINAL + 6, zoom: 1.04, y: 0, ease: EASE.out}, {f: end, zoom: 1.08}]}>
        <Stage>
          <defs>
            <radialGradient id="e4-bg" cx="0.5" cy="0.4" r="0.8">
              <stop offset="0%" stopColor="#2563EB" />
              <stop offset="100%" stopColor="#111827" />
            </radialGradient>
          </defs>
          <rect width={1080} height={1920} fill="url(#e4-bg)" />
          {Array.from({length: 16}).map((_, i) => (
            <rect key={i} x={510} y={-1400} width={60} height={1400} fill={COLORS.white} opacity={0.04} transform={`translate(0 900) rotate(${i * 22.5 + f * 0.3} 540 0)`} />
          ))}
          {tilesOut > 0 ? (
            <g>
              <g transform={`translate(270 760) rotate(-5) scale(${t13 * tilesOut * (0.72 + on13 * 0.1)})`}>
                <NumberTile n="13" color={COLORS.orange} ring={on13} />
              </g>
              <g transform={`translate(810 760) rotate(5) scale(${t30 * tilesOut * (0.72 + on30 * 0.1)})`}>
                <NumberTile n="30" color={COLORS.green} ring={on30} />
              </g>
              <g transform={`translate(540 760) scale(${Math.min(t13, t30) * tilesOut})`}>
                <circle r={58} fill={COLORS.yellow} stroke={COLORS.ink} strokeWidth={7} />
                <text y={20} textAnchor="middle" fontFamily="Montserrat" fontWeight={900} fontSize={54} fill={COLORS.navy}>
                  ?
                </text>
              </g>
            </g>
          ) : null}
          <AliCharacter x={540} y={1810} scale={1.25} pose={pose} expression={expr} handL={handL} handR={handR} shadow={0} />
          <Confetti at={FINAL} count={90} />
        </Stage>
      </CameraMovement>
      {f >= YOZ && f < FINAL
        ? COMMENTS.map((c, i) => {
            const at = (i === 0 ? N13 : N30) + 8;
            if (f < at) return null;
            const out = 1 - tween(f, [FINAL - 8, FINAL], [0, 1]);
            return (
              <div key={i} style={{position: 'absolute', top: 990, [c.side < 0 ? 'left' : 'right']: 40, transform: `scale(${pop(f, at, 30, {damping: 12, stiffness: 220}) * out})`, transformOrigin: c.side < 0 ? 'left center' : 'right center', display: 'flex', alignItems: 'center', gap: 12, background: COLORS.white, border: `5px solid ${COLORS.ink}`, borderRadius: 28, padding: '10px 20px 10px 10px', boxShadow: '6px 8px 0 rgba(0,0,0,0.3)'}}>
                <div style={{width: 64, height: 64, borderRadius: 32, background: [COLORS.orange, COLORS.green][i], border: `4px solid ${COLORS.ink}`}} />
                <div style={{fontFamily: FONT_FAMILY}}>
                  <div style={{fontWeight: 800, fontSize: 24, color: '#64748B'}}>@{c.name}</div>
                  <div style={{fontWeight: 900, fontSize: 38, color: COLORS.navy}}>{c.text}</div>
                </div>
              </div>
            );
          })
        : null}
      <At x={540} y={235}>
        {f >= Q && f < YOZ ? <AnimatedText text={'SEN HAM|ADASHGANMISAN?'} from={Q} stagger={5} entrance="pop" size={92} accentWords={['ADASHGANMISAN?']} /> : null}
        {f >= YOZ && f < FINAL ? <AnimatedText text={'IZOHGA YOZ:|13 YOKI 30?'} from={YOZ} stagger={4} entrance="slam" size={108} accentWords={['13', '30?']} accent={COLORS.yellow} /> : null}
        {f >= FINAL ? <AnimatedText text={'ALI BILAN|IELTS O‘RGAN!'} from={FINAL} stagger={5} entrance="slam" size={106} accentWords={['IELTS', 'O‘RGAN!']} accent={COLORS.yellow} rotate={-3} /> : null}
      </At>
      <DuckedSfx name="whoosh" at={Q - 2} gainDb={-8} />
      <DuckedSfx name="card_flip" at={Q + 6} gainDb={-8} />
      <DuckedSfx name="card_flip" at={Q + 12} gainDb={-8} />
      <DuckedSfx name="ding" at={N13} gainDb={-10} />
      <DuckedSfx name="ding" at={N30} gainDb={-10} rate={1.2} />
      <DuckedSfx name="bubble_pop" at={N13 + 8} gainDb={-10} />
      <DuckedSfx name="bubble_pop" at={N30 + 8} gainDb={-10} />
      <DuckedSfx name="boing" at={SUS} gainDb={-10} />
      <DuckedSfx name="success" at={FINAL} gainDb={-4} />
    </AbsoluteFill>
  );
};
