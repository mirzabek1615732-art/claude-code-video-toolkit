import React from 'react';
import {AbsoluteFill, Easing, interpolate, random, useCurrentFrame} from 'remotion';
import {DuckedSfx} from '../../../audio/EpisodeAudio';
import {AliCharacter, EXPRESSIONS, mixExpression, POSES} from '../../../components/AliCharacter';
import {HalftoneDrift} from '../../../components/AnimatedBackground';
import {AnimatedText} from '../../../components/AnimatedText';
import {CameraMovement} from '../../../components/CameraMovement';
import {Desk} from '../../../components/Props';
import {EASE, pop, tween} from '../../../components/anim';
import {COLORS} from '../../../theme';
import {wordAt, type TLScene} from '../../buildTimeline';
import {At, Stage} from '../../../scenes/Stage';
import {ClockIcon, Dictionary, WordCard} from './common';

const VOCAB: Array<[string, string]> = [
  ['However', 'ammo'],
  ['significant', 'muhim'],
  ['growth', 'o‘sish'],
  ['learning', 'o‘rganish'],
  ['changed', 'o‘zgardi'],
  ['Consequently', 'natijada'],
  ['readers', 'o‘quvchilar'],
  ['skim', 'tez ko‘z yugurtirmoq'],
  ['closely', 'diqqat bilan'],
  ['before', 'oldin'],
  ['texts', 'matnlar'],
  ['online', 'onlayn'],
];

/** 0:10 — translating every word: the dictionary grows, cards multiply, time flies. */
export const S3Trap: React.FC<{scene: TLScene}> = ({scene}) => {
  const f = useCurrentFrame();
  const TARJ = wordAt(scene, 'l05', 4); // "tarjima"
  const TEN = wordAt(scene, 'l06', 0); // "O‘n"
  const end = scene.durationInFrames;

  // dictionary grows with elastic overshoot, taller than Ali
  const grow = interpolate(f, [0, TARJ, TARJ + 10, TARJ + 18, TEN], [1, 1.5, 2.6, 2.35, 2.9], {extrapolateRight: 'clamp', easing: Easing.bezier(0.3, 0, 0.3, 1)});
  // cards spawn faster and faster
  const spawn: number[] = [];
  for (let t = 2, gap = 9; t < end; t += Math.max(2, gap), gap *= 0.84) spawn.push(Math.round(t));
  const bury = tween(f, [TEN + 8, end], [0, 1], EASE.in);
  const clockT = interpolate(f, [0, end], [0, 600], {easing: Easing.in(Easing.cubic)});

  return (
    <AbsoluteFill style={{background: '#253B73'}}>
      <CameraMovement
        focus={[420, 1100]}
        keys={[
          {f: 0, zoom: 1.0, rot: 0},
          {f: TARJ, zoom: 1.06, rot: -1},
          {f: TEN, zoom: 1.1, rot: 1.5},
          {f: TEN + 4, zoom: 1.22, rot: -2, ease: EASE.power4Out},
          {f: end, zoom: 1.28, rot: -3},
        ]}
        shakes={[{from: TEN, duration: 10, amplitude: 14}]}
      >
        <Stage>
          <HalftoneDrift opacity={0.08} speed={1.2} />
          <AliCharacter
            x={330}
            y={1790}
            scale={1.4}
            pose={{...POSES.seated, armL: [-14, -88], armR: [70, 60 + Math.sin(f / 2) * 25], headTilt: 10 + Math.sin(f / 3) * 4, lookX: 0.9, lookY: -0.6 - grow * 0.1, headTurn: 0.5}}
            expression={mixExpression(EXPRESSIONS.focused, EXPRESSIONS.panic, tween(f, [0, end], [0.1, 0.9]))}
            handL="open"
            handR="open"
            shadow={0}
          />
          <Desk x={540} y={1240} width={900} toFloor />
          <g transform={`translate(760 1240) scale(${grow})`}>
            <Dictionary w={210} h={280} />
          </g>
          {/* clock spinning, top right */}
          <g transform="translate(900 300)">
            <ClockIcon size={100} t={clockT} />
          </g>
          {/* flying translation cards */}
          {spawn.map((s, i) => {
            const t = f - s;
            if (t < 0) return null;
            const [en, uz] = VOCAB[i % VOCAB.length];
            const sx = 760;
            const sy = 1240 - 280 * grow * 0.6;
            const tx = 120 + random(`tx${i}`) * 840;
            const ty = 260 + random(`ty${i}`) * 820;
            const k = 1 - Math.exp(-t / 6);
            // after "o‘n daqiqa" the cards fall and bury Ali
            const fall = bury * (1 - Math.exp(-Math.max(0, f - TEN - 8 - i) / 6));
            const fx = tx + (300 + (i % 5) * 18 - tx) * fall;
            const fy = ty + (1180 - (i % 6) * 34 - ty) * fall;
            const x = sx + (fx - sx) * k;
            const y = sy + (fy - sy) * k;
            const rot = (random(`r${i}`) - 0.5) * 50 * (1 - fall) + (i % 2 ? 8 : -8) * fall;
            return (
              <g key={i} transform={`translate(${x} ${y}) rotate(${rot}) scale(${0.55 * Math.min(1, t / 4)})`}>
                <WordCard en={en} uz={uz} color={i % 3 === 0 ? COLORS.yellow : i % 3 === 1 ? COLORS.white : '#BFDBFE'} />
              </g>
            );
          })}
          {/* +10:00 timer stamp */}
          {f >= TEN ? (
            <g transform={`translate(860 520) rotate(8) scale(${pop(f, TEN, 30, {damping: 8, stiffness: 260})})`}>
              <rect x={-170} y={-70} width={340} height={140} rx={24} fill={COLORS.red} stroke={COLORS.ink} strokeWidth={8} />
              <text y={30} textAnchor="middle" fontFamily="Montserrat" fontWeight={900} fontSize={84} fill={COLORS.white}>
                +10:00
              </text>
            </g>
          ) : null}
        </Stage>
      </CameraMovement>
      {f >= TEN ? (
        <At x={540} y={225}>
          <AnimatedText text="10 DAQIQA!" from={TEN} entrance="slam" size={150} color={COLORS.yellow} accentWords={['10']} accent={COLORS.orange} stagger={4} rotate={-5} />
        </At>
      ) : null}
      <DuckedSfx name="whoosh" at={TARJ} gainDb={-8} />
      {spawn.filter((s) => s % 3 === 0).map((s) => (
        <DuckedSfx key={s} name="card_flip" at={s} gainDb={-10} />
      ))}
      <DuckedSfx name="clock_spin" at={TARJ + 6} gainDb={-8} />
      <DuckedSfx name="stamp" at={TEN} gainDb={-6} />
    </AbsoluteFill>
  );
};
