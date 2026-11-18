import React from 'react';
import {AbsoluteFill, random, useCurrentFrame} from 'remotion';
import {DuckedSfx} from '../../../audio/EpisodeAudio';
import {AliCharacter, EXPRESSIONS, mixExpression, mixPose, POSES, type Expression, type Pose} from '../../../components/AliCharacter';
import {CameraMovement} from '../../../components/CameraMovement';
import {EASE, pop, track, tween} from '../../../components/anim';
import {COLORS, FONT_FAMILY} from '../../../theme';
import {wordAt, type TLScene} from '../../buildTimeline';
import {Stage} from '../../../scenes/Stage';
import {PhoneFeed, talkAmount, VocabChip} from './common';

const WORDS = ['Moreover', 'Furthermore', 'Notwithstanding', 'Plethora', 'Paramount', 'Ubiquitous', 'Indispensable', 'Manifestation'];

/** 0:04 — a fictional "band8.guru" promises Band 8 words; they fly out of the phone, Ali screenshots everything. */
export const S2Insta: React.FC<{scene: TLScene}> = ({scene}) => {
  const f = useCurrentFrame();
  const L = scene.lines;
  const SCROLL_END = L.i01.localFrom - 2;
  const GURU = L.i01.localFrom;
  const BAND = wordAt(scene, 'i01', 0);
  const OUT = wordAt(scene, 'i01', 5); // "so‘zlarni"
  const STAR = L.l04.localFrom;
  const SNAP = wordAt(scene, 'l04', 3); // "yodlab"
  const end = scene.durationInFrames;
  const scroll = tween(f, [0, SCROLL_END], [1500, 0], EASE.out);
  const shots = f >= SNAP ? Math.min(99, Math.floor((f - SNAP) * 3.2)) : 0;
  const flash = f >= SNAP && (f - SNAP) % 3 === 0 && f < end - 8 ? 0.55 : 0;

  const pose = track<Pose>(
    f,
    [
      {at: 0, v: {...POSES.holdPhone, lookY: -0.4, lookX: 0.1, headTilt: 4}},
      {at: GURU, v: {...POSES.holdPhone, lookY: -0.7, lookX: 0, headTilt: -2, bodyTilt: -3}, dur: 5},
      {at: STAR, v: {...POSES.holdPhone, armL: [60, 70], lookY: -0.7, headTilt: -6}, dur: 4},
    ],
    mixPose,
  );
  const expr = track<Expression>(
    f,
    [
      {at: 0, v: EXPRESSIONS.lazy},
      {at: GURU, v: mixExpression(EXPRESSIONS.distracted, EXPRESSIONS.shocked, 0.5), dur: 4},
      {at: STAR, v: EXPRESSIONS.ecstatic, dur: 4},
    ],
    mixExpression,
  );

  return (
    <AbsoluteFill style={{background: '#1E1B4B'}}>
      <CameraMovement focus={[540, 900]} keys={[{f: 0, zoom: 1.0}, {f: GURU, zoom: 1.0}, {f: GURU + 8, zoom: 1.06, ease: EASE.out}, {f: STAR - 2, zoom: 1.06}, {f: STAR + 6, zoom: 1.0, ease: EASE.out}, {f: end, zoom: 1.03}]}>
        <Stage>
          <defs>
            <radialGradient id="in-bg" cx="0.5" cy="0.35" r="0.8">
              <stop offset="0%" stopColor="#4C1D95" />
              <stop offset="100%" stopColor="#0F0A2A" />
            </radialGradient>
          </defs>
          <rect width={1080} height={1920} fill="url(#in-bg)" />
          <g transform={`translate(540 ${650 - (1 - pop(f, 0, 30, {damping: 14, stiffness: 150})) * 300}) scale(0.82)`}>
            <PhoneFeed t={f} banner={pop(f, BAND, 30, {damping: 9, stiffness: 230})} talk={talkAmount(f, [L.i01])} scroll={scroll} />
          </g>
          {/* the words leave the phone and swirl around Ali */}
          {f >= OUT
            ? WORDS.map((w, i) => {
                const t = f - OUT - i * 3;
                if (t < 0) return null;
                const p = Math.min(1, t / 16);
                const ang = random(`ang${i}`) * Math.PI * 2;
                const tx = 540 + Math.cos(ang + t / 30) * (230 + random(`r${i}`) * 220);
                const ty = 1080 + Math.sin(ang + t / 30) * (180 + random(`q${i}`) * 140);
                return (
                  <g key={w} transform={`translate(${540 + (tx - 540) * p} ${650 + (ty - 650) * p}) rotate(${(random(`rot${i}`) - 0.5) * 30}) scale(${0.4 + 0.6 * p})`}>
                    <VocabChip word={w} color={[COLORS.yellow, COLORS.white, '#FBCFE8', '#BBF7D0'][i % 4]} size={34} />
                  </g>
                );
              })
            : null}
          <AliCharacter x={540} y={1860} scale={1.0} pose={pose} expression={expr} handL="open" handR="open" itemR="phone" starEyes={f >= STAR} shadow={0} />
        </Stage>
      </CameraMovement>
      {/* screenshot flashes + counter */}
      <AbsoluteFill style={{background: COLORS.white, opacity: flash}} />
      {f >= SNAP ? (
        <div style={{position: 'absolute', left: 40, top: 1180, transform: `rotate(-6deg) scale(${pop(f, SNAP)})`, background: COLORS.red, color: COLORS.white, border: `5px solid ${COLORS.ink}`, borderRadius: 18, padding: '8px 20px', fontFamily: FONT_FAMILY, fontWeight: 900, fontSize: 38}}>SCREENSHOT ×{shots}</div>
      ) : null}
      <DuckedSfx name="swish" at={0} gainDb={-12} />
      <DuckedSfx name="notification" at={GURU - 2} gainDb={-14} />
      <DuckedSfx name="pop" at={BAND} gainDb={-12} />
      <DuckedSfx name="whoosh" at={OUT} gainDb={-12} />
      <DuckedSfx name="ding" at={STAR} gainDb={-12} />
      {[0, 6, 12, 18].map((d) => (
        <DuckedSfx key={d} name="card_flip" at={SNAP + d} gainDb={-16} rate={1.6} />
      ))}
    </AbsoluteFill>
  );
};
