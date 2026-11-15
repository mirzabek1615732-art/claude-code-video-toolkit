import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {DuckedSfx} from '../../../audio/EpisodeAudio';
import {AliCharacter, EXPRESSIONS, mixExpression, mixPose, POSES, type Expression, type Pose} from '../../../components/AliCharacter';
import {CameraMovement} from '../../../components/CameraMovement';
import {Confetti} from '../../../components/Particles';
import {Desk} from '../../../components/Props';
import {EASE, pop, track, tween} from '../../../components/anim';
import {COLORS} from '../../../theme';
import {wordAt, type TLScene} from '../../buildTimeline';
import {Stage} from '../../../scenes/Stage';
import {Dictionary, F, ReadingPage} from './common';

const LINES = ['The central library began opening at', 'weekends in 2019. Since then, the', 'number of visitors has risen by a', 'third, and most of them are students.'];

/** 0:34 — Ali changes method: closes the dictionary, scans with a highlighter, score climbs. */
export const S7Improve: React.FC<{scene: TLScene}> = ({scene}) => {
  const f = useCurrentFrame();
  const CLOSE = wordAt(scene, 'l13', 3); // "usulini"
  const SCAN = wordAt(scene, 'l14', 4); // "ma’lumotni"
  const IZLAB = wordAt(scene, 'l14', 5);
  const WIN = wordAt(scene, 'l14', 6); // "o‘qiydi!"
  const end = scene.durationInFrames;

  const pose = track<Pose>(
    f,
    [
      {at: 0, v: {...POSES.stand, armR: [40, 60], armL: [40, 60], lookY: 0.6, headTilt: 4}},
      {at: CLOSE - 2, v: {...POSES.stand, armR: [70, 20], armL: [-20, -60], lookX: 0.8, lookY: 0.2, headTurn: 0.4}, dur: 5},
      {at: SCAN - 6, v: {...POSES.stand, armR: [30, -110], armL: [20, 40], lookX: 0.6, lookY: 0.8, headTilt: 6, headTurn: 0.3, itemAngle: -30}, dur: 6},
      {at: WIN - 2, v: {...POSES.fistUp, lookX: 0.2, lookY: -0.4}, dur: 5},
    ],
    mixPose,
  );
  const expr = track<Expression>(
    f,
    [
      {at: 0, v: mixExpression(EXPRESSIONS.neutral, EXPRESSIONS.confident, 0.5)},
      {at: CLOSE - 2, v: EXPRESSIONS.confident, dur: 5},
      {at: SCAN - 6, v: EXPRESSIONS.focused, dur: 6},
      {at: WIN - 2, v: EXPRESSIONS.proud, dur: 5},
    ],
    mixExpression,
  );
  // dictionary shuts and slides off the desk
  const shut = tween(f, [CLOSE, CLOSE + 6], [1, 0]);
  const slide = tween(f, [CLOSE + 6, CLOSE + 18], [0, 1], EASE.in);
  // highlighter sweeps line 1 then line 2 (the answer)
  const h1 = tween(f, [SCAN, IZLAB + 4], [0, 1]);
  const h2 = tween(f, [IZLAB + 4, WIN + 2], [0, 1]);
  const scanX = SCAN <= f && f <= WIN + 2 ? (f < IZLAB + 4 ? h1 : h2) : -1;
  // progress: correct answers climb; no band score promised
  const score = Math.round(tween(f, [SCAN, WIN + 10], [12, 26], EASE.inOut));
  const bar = (score - 0) / 40;
  const bump = pop(f, WIN, 30, {damping: 8, stiffness: 260});

  return (
    <AbsoluteFill style={{background: '#E7F8EE'}}>
      <CameraMovement focus={[540, 900]} keys={[{f: 0, zoom: 1.06, x: -30}, {f: SCAN - 6, zoom: 1.0, x: 0}, {f: WIN - 2, zoom: 1.0}, {f: WIN + 4, zoom: 1.08, ease: EASE.power4Out}, {f: end, zoom: 1.1}]}>
        <Stage>
          <defs>
            <radialGradient id="im-bg" cx="0.5" cy="0.45" r="0.75">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="100%" stopColor="#BBF7D0" />
            </radialGradient>
          </defs>
          <rect width={1080} height={1920} fill="url(#im-bg)" />
          {/* progress bar */}
          <g transform="translate(540 300)">
            <text y={-40} textAnchor="middle" fontFamily={F} fontWeight={900} fontSize={44} fill={COLORS.navy}>
              TO‘G‘RI JAVOBLAR
            </text>
            <rect x={-420} y={0} width={840} height={70} rx={35} fill={COLORS.white} stroke={COLORS.ink} strokeWidth={6} />
            <rect x={-414} y={6} width={Math.max(58, 828 * bar)} height={58} rx={29} fill={COLORS.green} />
            <g transform={`translate(0 160) scale(${1 + 0.25 * Math.max(0, bump - (f > WIN + 10 ? 1 : 0))})`}>
              <text textAnchor="middle" fontFamily={F} fontWeight={900} fontSize={96} fill={COLORS.navy} stroke={COLORS.white} strokeWidth={10} paintOrder="stroke">
                {score}/40
              </text>
            </g>
          </g>
          {/* passage on a stand */}
          <g transform="translate(540 760)">
            <ReadingPage
              w={940}
              h={430}
              lines={LINES}
              size={38}
              highlights={[
                {line: 0, from: 4, to: 37, color: COLORS.yellow, p: h1},
                {line: 1, from: 0, to: 18, color: '#86EFAC', p: h2},
              ]}
            />
            {scanX >= 0 ? (
              <g transform={`translate(${-430 + 40 + (f < IZLAB + 4 ? 33 : 18) * 38 * 0.56 * scanX} ${f < IZLAB + 4 ? -75 : -16}) rotate(30)`}>
                <rect x={-14} y={-90} width={28} height={90} rx={8} fill={COLORS.yellow} stroke={COLORS.ink} strokeWidth={4} />
                <path d="M -14 0 L 14 0 L 6 22 L -6 22 Z" fill="#EAB308" stroke={COLORS.ink} strokeWidth={4} />
              </g>
            ) : null}
          </g>
          <AliCharacter x={540} y={1850} scale={1.25} pose={pose} expression={expr} handL="open" handR={f >= WIN - 2 ? 'fist' : 'open'} itemR={f >= SCAN - 6 && f < WIN - 2 ? 'highlighter' : 'none'} shadow={0} />
          <Desk x={540} y={1400} width={980} toFloor />
          {slide < 1 ? (
            <g transform={`translate(${250 - slide * 700} ${1400}) rotate(${-slide * 30})`}>
              <Dictionary w={200} h={250} open={shut} />
            </g>
          ) : null}
          {f >= WIN ? (
            <g transform={`translate(860 1250) scale(${bump}) rotate(-8)`}>
              <rect x={-150} y={-50} width={300} height={100} rx={50} fill={COLORS.blue} stroke={COLORS.ink} strokeWidth={6} />
              <text y={18} textAnchor="middle" fontFamily={F} fontWeight={900} fontSize={50} fill={COLORS.white}>
                TEZROQ!
              </text>
            </g>
          ) : null}
          <Confetti at={WIN} count={60} />
        </Stage>
      </CameraMovement>
      <DuckedSfx name="paper" at={CLOSE} gainDb={-6} />
      <DuckedSfx name="whoosh" at={CLOSE + 6} gainDb={-10} />
      <DuckedSfx name="swish" at={SCAN} gainDb={-10} />
      <DuckedSfx name="swish" at={IZLAB + 4} gainDb={-10} />
      <DuckedSfx name="success" at={WIN} gainDb={-6} />
    </AbsoluteFill>
  );
};
