import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {DuckedSfx} from '../../../audio/EpisodeAudio';
import {AliCharacter, EXPRESSIONS, mixExpression, mixPose, POSES, type Expression, type Pose} from '../../../components/AliCharacter';
import {RoomBackground} from '../../../components/AnimatedBackground';
import {CameraMovement} from '../../../components/CameraMovement';
import {Desk} from '../../../components/Props';
import {EASE, pop, track, tween} from '../../../components/anim';
import {COLORS} from '../../../theme';
import {wordAt, type TLScene} from '../../buildTimeline';
import {Stage} from '../../../scenes/Stage';
import {Dictionary, ReadingPage, WordCard} from './common';

export const PASSAGE = [
  'However, the significant growth of',
  'online learning has changed how',
  'students read. Consequently, many',
  'readers now skim long texts before',
  'they read them closely.',
];

/** 0:04 — opens the passage, freezes on line one; the words jump out at him. */
export const S2Problem: React.FC<{scene: TLScene}> = ({scene}) => {
  const f = useCurrentFrame();
  const OPEN = wordAt(scene, 'l03', 2); // "ochdi-yu"
  const STOP = wordAt(scene, 'l03', 5); // "to‘xtab"
  const W = [wordAt(scene, 'l04', 0), wordAt(scene, 'l04', 1), wordAt(scene, 'l04', 2)];
  const INTO = scene.lines.l04.localFrom - 10; // camera dives into the page
  const end = scene.durationInFrames;

  // ---- shot A: at the desk
  const seated: Pose = {...POSES.seated, armL: [-14, -88], armR: [-14, -88], lookY: 0.9, headTilt: 8};
  const reading = (t: number): Pose => ({...seated, lookX: Math.sin(t / 3) * 0.8, lookY: 0.95});
  const poseA = track<Pose>(
    f,
    [
      {at: 0, v: {...seated, lookY: 0.2, headTilt: 0, armL: [10, 20], armR: [10, 20]}},
      {at: OPEN - 4, v: {...seated, armL: [60, 40], armR: [60, 40], lookY: 0.9}, dur: 5},
      {at: OPEN + 6, v: reading(f), dur: 5},
      {at: STOP, v: {...seated, lookY: 0.95, lookX: 0, headTilt: 14, bodyY: 6}, dur: 3},
    ],
    mixPose,
  );
  const exprA = track<Expression>(
    f,
    [
      {at: 0, v: EXPRESSIONS.confident},
      {at: OPEN + 6, v: EXPRESSIONS.focused, dur: 6},
      {at: STOP, v: mixExpression(EXPRESSIONS.shocked, EXPRESSIONS.disappointed, 0.3), dur: 3},
    ],
    mixExpression,
  );
  const pageOpen = tween(f, [OPEN - 2, OPEN + 8], [0, 1], EASE.back);
  const line1 = tween(f, [STOP - 2, STOP + 6], [0, 1]);

  // ---- shot B: inside the page
  const inPage = f >= INTO + 10;
  const confusion = tween(f, [W[0], W[2] + 14], [0, 1]);
  const dart = Math.sin(f / 1.6) * (0.5 + confusion * 0.5);
  const cards = [
    {en: 'However', uz: '???', x: 300, y: 560, r: -8, at: W[0]},
    {en: 'Significant', uz: '???', x: 760, y: 760, r: 7, at: W[1]},
    {en: 'Consequently', uz: '???', x: 360, y: 980, r: -5, at: W[2]},
  ];
  // word positions inside the passage (line, approx x) the cards jump out of
  const origins = [
    [190, 470],
    [520, 470],
    [600, 610],
  ];

  return (
    <AbsoluteFill style={{background: COLORS.navy}}>
      {!inPage ? (
        <CameraMovement
          focus={[540, 1180]}
          keys={[
            {f: 0, zoom: 1.0},
            {f: STOP, zoom: 1.0},
            {f: STOP + 6, zoom: 1.18, ease: EASE.power4Out},
            {f: INTO, zoom: 1.22},
            {f: INTO + 10, zoom: 3.4, y: 120, ease: EASE.in},
          ]}
          shakes={[{from: STOP, duration: 8, amplitude: 8}]}
        >
          <Stage>
            <RoomBackground wall="#2F4A85" wall2="#21366A" pan={-30 - f * 0.4} shelf={false} />
            <AliCharacter x={540} y={1790} scale={1.5} pose={poseA} expression={exprA} handL="open" handR="open" shadow={0} />
            <Desk x={540} y={1240} width={900} toFloor />
            {/* open passage on the desk */}
            <g transform={`translate(540 1236) scale(${(0.3 + 0.7 * pageOpen) * 0.9} ${pageOpen * 0.32}) rotate(-1)`}>
              <ReadingPage w={600} h={380} lines={PASSAGE.slice(0, 3)} size={26} highlights={[{line: 0, from: 0, to: 34, color: '#FCA5A5', p: line1}]} />
            </g>
            {f >= STOP ? (
              <g transform={`translate(540 760) rotate(-6) scale(${pop(f, STOP)})`}>
                <text textAnchor="middle" y={40} fontFamily="Montserrat" fontWeight={900} fontSize={120} fill={COLORS.red} stroke={COLORS.navy} strokeWidth={14} paintOrder="stroke">
                  ?!
                </text>
              </g>
            ) : null}
          </Stage>
        </CameraMovement>
      ) : (
        <CameraMovement focus={[540, 760]} keys={[{f: INTO + 10, zoom: 1.12, rot: -1}, {f: end, zoom: 1.0, rot: 1, ease: EASE.out}]}>
          <Stage>
            <rect width={1080} height={1920} fill="#E8E2D0" />
            <g transform="translate(540 700)">
              <ReadingPage w={1000} h={760} lines={PASSAGE} size={44} />
            </g>
            {/* the words leave the text and become giant cards */}
            {cards.map((c, i) => {
              if (f < c.at) return null;
              const p = pop(f, c.at, 30, {damping: 10, stiffness: 160, mass: 0.7});
              const ox = origins[i][0];
              const oy = origins[i][1];
              const x = ox + (c.x - ox) * Math.min(1, p);
              const y = oy + (c.y - oy) * Math.min(1, p);
              const wob = Math.sin((f - c.at) / 5 + i) * 3;
              return (
                <g key={c.en} transform={`translate(${x} ${y}) rotate(${c.r * p + wob}) scale(${0.4 + 0.75 * p})`}>
                  <WordCard en={c.en} uz={c.uz} color={[COLORS.yellow, COLORS.white, '#FED7AA'][i]} />
                </g>
              );
            })}
            {/* Ali close-up, bottom right, frantically flipping the dictionary */}
            <g transform="translate(0 0)">
              <AliCharacter
                x={800}
                y={2050}
                scale={1.9}
                pose={{...POSES.stand, armL: [-10, -120], armR: [-6, -110], headTilt: 6 + Math.sin(f / 4) * 3, lookX: dart, lookY: -0.2, headTurn: -0.2}}
                expression={mixExpression(EXPRESSIONS.focused, EXPRESSIONS.panic, confusion)}
                handL="open"
                handR="open"
                shadow={0}
              />
              <g transform={`translate(${690} ${1520}) rotate(-6)`}>
                <Dictionary w={200} h={250} open={1} flip={(f / 4) % 1} />
              </g>
            </g>
          </Stage>
        </CameraMovement>
      )}
      <DuckedSfx name="paper" at={OPEN - 2} gainDb={-4} />
      <DuckedSfx name="record_scratch" at={STOP} gainDb={-8} />
      <DuckedSfx name="whoosh" at={INTO} gainDb={-6} rate={1.2} />
      {W.map((w) => (
        <DuckedSfx key={w} name="pop" at={w} gainDb={-6} />
      ))}
      <DuckedSfx name="typing" at={W[0] + 4} gainDb={-8} />
    </AbsoluteFill>
  );
};
