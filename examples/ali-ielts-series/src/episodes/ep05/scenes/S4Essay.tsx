import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {DuckedSfx} from '../../../audio/EpisodeAudio';
import {AliCharacter, EXPRESSIONS, mixExpression, mixPose, POSES, type Expression, type Pose} from '../../../components/AliCharacter';
import {CameraMovement} from '../../../components/CameraMovement';
import {Desk} from '../../../components/Props';
import {EASE, pop, track, tween} from '../../../components/anim';
import {COLORS, FONT_FAMILY} from '../../../theme';
import {wordAt, type TLScene} from '../../buildTimeline';
import {Stage} from '../../../scenes/Stage';
import {Flames, Laptop, MuseumFrame, SERIF} from './common';

export const SENTENCE = ['Reading', 'books', 'is', 'an', 'indispensable', 'manifestation', 'of', 'intellectual', 'sophistication.'];

/** 0:17 — the essay topic, flaming keyboard, the sentence word by word, then a museum frame and self-applause. */
export const S4Essay: React.FC<{scene: TLScene}> = ({scene}) => {
  const f = useCurrentFrame();
  const L = scene.lines;
  const TOPIC = L.l06.localFrom;
  const TYPE = L.l07.localFrom;
  const W = SENTENCE.map((_, i) => wordAt(scene, 'e01', i));
  const DONE = L.e01.localTo + 4;
  const end = scene.durationInFrames;
  const typing = f >= TYPE && f < DONE;
  const framed = pop(f, DONE, 30, {damping: 12, stiffness: 170});
  const clap = f >= DONE + 8;
  const c = clap ? Math.abs(Math.sin((f - DONE) * 0.6)) : 0;

  const pose = track<Pose>(
    f,
    [
      {at: 0, v: {...POSES.writing, armL: [-14, -100], armR: [-8, -95], lookY: -0.7, headTilt: -4}},
      {at: TYPE - 2, v: {...POSES.writing, armL: [-30, -80], armR: [-30, -80], lookY: 0.7, headTilt: 6}, dur: 4},
      {at: DONE, v: {...POSES.writing, armL: [-30, -80], armR: [-30, -80], lookY: -0.8, lookX: 0, headTilt: -10}, dur: 6},
    ],
    mixPose,
  );
  const typeJitter = typing ? Math.sin(f * 2.3) * 14 : 0;
  const clapPose: Pose = {...pose, armL: [40 - c * 34, -110 + c * 20], armR: [40 - c * 34, -110 + c * 20]};
  const expr = track<Expression>(
    f,
    [
      {at: 0, v: EXPRESSIONS.professor},
      {at: TYPE, v: mixExpression(EXPRESSIONS.focused, EXPRESSIONS.professor, 0.4), dur: 4},
      {at: DONE, v: EXPRESSIONS.proud, dur: 6},
    ],
    mixExpression,
  );

  return (
    <AbsoluteFill style={{background: '#FDF4E7'}}>
      <CameraMovement focus={[540, 760]} keys={[{f: 0, zoom: 1.0}, {f: W[4] - 4, zoom: 1.0}, {f: W[8] + 6, zoom: 1.05, ease: EASE.inOut}, {f: DONE, zoom: 1.05}, {f: DONE + 10, zoom: 0.98, ease: EASE.out}, {f: end, zoom: 1.0}]}>
        <Stage>
          <rect width={1080} height={1920} fill={f >= DONE ? '#2B1B12' : '#FDF4E7'} />
          {f >= DONE ? (
            <g>
              <path d="M 470 -40 L 610 -40 L 980 1500 L 100 1500 Z" fill="#FDE68A" opacity={0.18 * framed} />
              <rect y={1360} width={1080} height={560} fill="#4A2F20" />
            </g>
          ) : (
            <g>
              <rect y={1360} width={1080} height={560} fill="#E9D8C4" />
              {Array.from({length: 9}).map((_, i) => (
                <rect key={i} x={60 + i * 116} y={140} width={6} height={1180} fill="#F3E3CF" />
              ))}
            </g>
          )}
          <AliCharacter x={380} y={1880} scale={1.2} pose={{...clapPose, armL: [clapPose.armL[0], clapPose.armL[1] + typeJitter], armR: [clapPose.armR[0], clapPose.armR[1] - typeJitter]}} expression={expr} handL="open" handR="open" glasses={1.75} gradCap shadow={0} />
          <Desk x={540} y={1440} width={980} toFloor />
          <g transform="translate(800 1440) scale(0.8)">
            <Laptop />
            {typing ? (
              <g transform="translate(0 -26)">
                <Flames t={f} w={380} k={tween(f, [TYPE, TYPE + 10], [0.3, 1])} />
              </g>
            ) : null}
          </g>
        </Stage>
        {/* topic card */}
        {f < W[0] - 2 ? (
          <div style={{position: 'absolute', left: 70, right: 70, top: 300, transform: `scale(${pop(f, TOPIC, 30, {damping: 12, stiffness: 190})}) rotate(-1.5deg)`, background: COLORS.white, border: `7px solid ${COLORS.ink}`, borderRadius: 28, padding: '24px 34px', boxShadow: '10px 12px 0 rgba(15,23,42,0.3)', fontFamily: FONT_FAMILY}}>
            <div style={{fontWeight: 900, fontSize: 32, letterSpacing: 4, color: COLORS.blue}}>ESSAY TOPIC</div>
            <div style={{fontWeight: 800, fontSize: 56, lineHeight: 1.2, color: COLORS.navy}}>What are the benefits of reading books?</div>
          </div>
        ) : null}
        {/* the sentence, word by word with the English voice */}
        {f >= W[0] - 2 ? (
          <div style={{position: 'absolute', left: 80, right: 80, top: 300, height: 600, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            {framed > 0.01 ? (
              <svg width={1080} height={900} viewBox="-540 -450 1080 900" style={{position: 'absolute', left: -80, top: -150, transform: `scale(${0.85 + 0.15 * framed})`, opacity: Math.min(1, framed * 1.5)}}>
                <MuseumFrame w={880} h={560} />
              </svg>
            ) : null}
            <div style={{position: 'relative', width: 880, minHeight: 560, background: '#FFFDF7', border: framed > 0.01 ? 'none' : `6px solid ${COLORS.ink}`, borderRadius: framed > 0.01 ? 0 : 20, padding: '40px 46px', display: 'flex', flexWrap: 'wrap', alignContent: 'center', gap: '6px 18px', fontFamily: SERIF, fontSize: 68, lineHeight: 1.18, color: COLORS.ink}}>
              {SENTENCE.map((w, i) => (
                <span key={i} style={{opacity: f >= W[i] - 1 ? 1 : 0.12, fontWeight: i >= 4 && i !== 6 ? 700 : 400, color: i >= 4 && i !== 6 ? '#7C2D12' : COLORS.ink, transform: `translateY(${f >= W[i] - 1 ? 0 : 10}px)`}}>
                  {w}
                </span>
              ))}
            </div>
            {framed > 0.5 ? (
              <div style={{position: 'absolute', bottom: -96, left: '50%', transform: 'translateX(-50%) rotate(-2deg)', background: '#FDE68A', border: `4px solid ${COLORS.ink}`, borderRadius: 8, padding: '6px 22px', fontFamily: FONT_FAMILY, fontWeight: 900, fontSize: 30, color: COLORS.navy, whiteSpace: 'nowrap'}}>“SHEDEVR” · Ali, 2026</div>
            ) : null}
          </div>
        ) : null}
      </CameraMovement>
      <DuckedSfx name="card_flip" at={TOPIC} gainDb={-12} />
      <DuckedSfx name="typing" at={TYPE} gainDb={-16} />
      <DuckedSfx name="typing" at={W[3]} gainDb={-18} />
      <DuckedSfx name="stamp" at={DONE} gainDb={-12} />
      <DuckedSfx name="success" at={DONE + 8} gainDb={-14} />
    </AbsoluteFill>
  );
};
