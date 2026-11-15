import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {DuckedSfx} from '../../../audio/EpisodeAudio';
import {AliCharacter, EXPRESSIONS, mixExpression, mixPose, POSES, type Expression, type Pose} from '../../../components/AliCharacter';
import {AnimatedText} from '../../../components/AnimatedText';
import {CameraMovement} from '../../../components/CameraMovement';
import {EASE, pop, track, tween} from '../../../components/anim';
import {COLORS, FONT_FAMILY} from '../../../theme';
import {wordAt, type TLScene} from '../../buildTimeline';
import {At, Stage} from '../../../scenes/Stage';
import {Lightbulb} from './common';

/** Highlighter mark that sweeps in left→right (HTML). */
export const Mark: React.FC<{p: number; color: string; children: React.ReactNode; bold?: boolean}> = ({p, color, children, bold}) => (
  <span
    style={{
      backgroundImage: `linear-gradient(${color}, ${color})`,
      backgroundRepeat: 'no-repeat',
      backgroundSize: `${Math.max(0, Math.min(1, p)) * 100}% 78%`,
      backgroundPosition: '0 70%',
      fontWeight: bold && p > 0.5 ? 800 : undefined,
      padding: '0 2px',
    }}
  >
    {children}
  </span>
);

const card: React.CSSProperties = {
  background: '#FFFDF7',
  border: `6px solid ${COLORS.ink}`,
  borderRadius: 26,
  boxShadow: `10px 12px 0 rgba(15,23,42,0.35)`,
  padding: '22px 30px',
};

/** 0:20 — the fix: read the question, find keywords, scan for the information. */
export const S5Reveal: React.FC<{scene: TLScene}> = ({scene}) => {
  const f = useCurrentFrame();
  const BULB = 14;
  const SHART = wordAt(scene, 'l10', 8); // "shart"
  const S1 = wordAt(scene, 'l11', 0); // "Avval"
  const KEY = wordAt(scene, 'l11', 4); // "so‘zlarni" (keywords)
  const S2 = wordAt(scene, 'l11', 3); // "Kalit"
  const S3 = wordAt(scene, 'l11', 6); // "Matndan"
  const FOUND = wordAt(scene, 'l11', 9); // "izla!"
  const end = scene.durationInFrames;
  const phaseB = f >= S1 - 8;

  const pose = track<Pose>(
    f,
    [
      {at: 0, v: {...POSES.armsUpShock, lookY: -0.2}},
      {at: BULB, v: {...POSES.stand, armR: [150, 20], armL: [14, 30], lookY: -0.9, lookX: 0.3, headTilt: -6}, dur: 6},
      {at: SHART - 4, v: {...POSES.pointUpRight, armR: [120, 10], lookX: 0.2, lookY: -0.2}, dur: 5},
      {at: S1 - 8, v: {...POSES.pointUpRight, armR: [100, 10], lookX: 0.9, lookY: -0.7, headTurn: 0.5}, dur: 8},
    ],
    mixPose,
  );
  const expr = track<Expression>(
    f,
    [
      {at: 0, v: EXPRESSIONS.shocked},
      {at: BULB, v: EXPRESSIONS.idea, dur: 5},
      {at: S1, v: mixExpression(EXPRESSIONS.focused, EXPRESSIONS.confident, 0.4), dur: 8},
    ],
    mixExpression,
  );
  const aliT = tween(f, [S1 - 10, S1 + 4], [0, 1], EASE.inOut);
  const aliX = 540 + (150 - 540) * aliT;
  const aliY = 1790 + (2030 - 1790) * aliT;
  const aliS = 1.5 + (0.9 - 1.5) * aliT;
  const bulb = pop(f, BULB, 30, {damping: 9, stiffness: 220});

  const steps = [
    {n: 1, en: 'READ THE QUESTION', at: S1},
    {n: 2, en: 'IDENTIFY KEYWORDS', at: S2},
    {n: 3, en: 'SCAN FOR RELEVANT INFORMATION', at: S3},
  ];
  const kw = tween(f, [KEY, KEY + 10], [0, 1]);
  const passIn = pop(f, S2 + 6, 30, {damping: 14, stiffness: 170});
  const scanY = tween(f, [S3, FOUND], [0, 1]);
  const found = tween(f, [FOUND - 4, FOUND + 6], [0, 1]);
  const answer = pop(f, FOUND + 8, 30, {damping: 10, stiffness: 220});

  return (
    <AbsoluteFill style={{background: '#EAF2FF'}}>
      <CameraMovement focus={[540, 900]} keys={[{f: 0, zoom: 1.12}, {f: 12, zoom: 1.0, ease: EASE.out}, {f: S1 - 8, zoom: 1.0}, {f: end, zoom: 1.04}]}>
        <Stage>
          <defs>
            <pattern id="rv-grid" width={60} height={60} patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#BFDBFE" strokeWidth={2} />
            </pattern>
          </defs>
          <rect width={1080} height={1920} fill="url(#rv-grid)" />
          {!phaseB ? <circle cx={540} cy={900} r={700} fill={COLORS.white} opacity={0.6} /> : null}
          <AliCharacter x={aliX} y={aliY} scale={aliS} pose={pose} expression={expr} handL="open" handR={f >= SHART - 4 ? 'point' : 'open'} shadow={phaseB ? 0 : 0.8} />
          {bulb > 0.01 && !phaseB ? (
            <g transform={`translate(${aliX} ${aliY - 700 * aliS}) scale(${bulb})`}>
              <Lightbulb glow={Math.min(1, bulb)} />
            </g>
          ) : null}
        </Stage>
        {phaseB ? (
          <AbsoluteFill>
            {/* step list */}
            <div style={{position: 'absolute', left: 50, right: 50, top: 225, display: 'flex', flexDirection: 'column', gap: 10}}>
              {steps.map((s) => {
                if (f < s.at) return null;
                const p = pop(f, s.at, 30, {damping: 13, stiffness: 200});
                const active = f >= s.at && (s.n === 3 || f < steps[s.n].at);
                return (
                  <div
                    key={s.n}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 18,
                      transform: `translateX(${(1 - p) * -80}px)`,
                      opacity: Math.min(1, p * 1.6),
                      background: active ? COLORS.blue : COLORS.white,
                      color: active ? COLORS.white : COLORS.navy,
                      border: `5px solid ${COLORS.ink}`,
                      borderRadius: 999,
                      padding: '10px 24px 10px 10px',
                      fontFamily: FONT_FAMILY,
                      fontWeight: 900,
                      fontSize: 40,
                      boxShadow: '6px 7px 0 rgba(15,23,42,0.3)',
                    }}
                  >
                    <span style={{width: 62, height: 62, borderRadius: 31, flexShrink: 0, background: COLORS.yellow, color: COLORS.navy, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `4px solid ${COLORS.ink}`}}>{s.n}</span>
                    {s.en}
                  </div>
                );
              })}
            </div>
            {/* question card */}
            {f >= S1 ? (
              <div style={{...card, position: 'absolute', left: 70, right: 70, top: 520, transform: `scale(${0.85 + 0.15 * pop(f, S1)})`, fontFamily: FONT_FAMILY, fontSize: 46, lineHeight: 1.35, color: COLORS.navy}}>
                <div style={{fontWeight: 900, fontSize: 30, letterSpacing: 4, color: COLORS.blue, marginBottom: 6}}>QUESTION 1</div>
                When did the <Mark p={kw} color={COLORS.yellow} bold>central library</Mark> start opening at <Mark p={tween(f, [KEY + 4, KEY + 14], [0, 1])} color={COLORS.yellow} bold>weekends</Mark>?
              </div>
            ) : null}
            {/* passage card with scan beam */}
            {f >= S2 + 6 ? (
              <div style={{...card, position: 'absolute', left: 70, right: 70, top: 755, transform: `translateY(${(1 - passIn) * 120}px)`, opacity: Math.min(1, passIn * 1.5), fontFamily: 'Georgia, serif', fontSize: 40, lineHeight: 1.5, color: COLORS.ink, overflow: 'hidden'}}>
                <div style={{fontFamily: FONT_FAMILY, fontWeight: 900, fontSize: 30, letterSpacing: 4, color: COLORS.blue, marginBottom: 4}}>PASSAGE</div>
                Reading habits in the city have changed in recent years. In <Mark p={found} color="#86EFAC" bold>2019</Mark>, the{' '}
                <Mark p={found} color="#86EFAC" bold>central library began opening at weekends</Mark>, and the number of visitors rose by a third.
                {f >= S3 && f < FOUND + 10 ? (
                  <div style={{position: 'absolute', left: 0, right: 0, top: 60 + scanY * 330, height: 46, background: 'linear-gradient(to bottom, rgba(37,99,235,0), rgba(37,99,235,0.28), rgba(37,99,235,0))'}} />
                ) : null}
              </div>
            ) : null}
            {/* answer + honest note */}
            {f >= FOUND + 8 ? (
              <div style={{position: 'absolute', left: 40, right: 40, top: 1085, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 8, transform: `scale(${answer})`, transformOrigin: 'center top'}}>
                <div style={{background: COLORS.green, color: COLORS.white, border: `5px solid ${COLORS.ink}`, borderRadius: 999, padding: '10px 30px', fontFamily: FONT_FAMILY, fontWeight: 900, fontSize: 48, whiteSpace: 'nowrap'}}>JAVOB: 2019 ✓</div>
                <div style={{background: COLORS.white, color: COLORS.navy, border: `4px solid ${COLORS.ink}`, borderRadius: 18, padding: '8px 18px', fontFamily: FONT_FAMILY, fontWeight: 800, fontSize: 30, whiteSpace: 'nowrap'}}>Topilgan joyni diqqat bilan o‘qi!</div>
              </div>
            ) : null}
          </AbsoluteFill>
        ) : null}
      </CameraMovement>
      {!phaseB && f >= SHART - 2 ? (
        <At x={540} y={225}>
          <AnimatedText text={'HAR BIR SO‘ZNI|TARJIMA QILMA!'} from={SHART - 2} stagger={4} entrance="pop" size={104} color={COLORS.white} accentWords={['QILMA!']} accent={COLORS.yellow} exitAt={S1 - 12} />
        </At>
      ) : null}
      <DuckedSfx name="ding" at={BULB} gainDb={-6} />
      <DuckedSfx name="pop" at={SHART - 2} gainDb={-8} />
      {steps.map((s) => (
        <DuckedSfx key={s.n} name="swish" at={s.at} gainDb={-8} />
      ))}
      <DuckedSfx name="typing" at={KEY} gainDb={-10} />
      <DuckedSfx name="success" at={FOUND + 8} gainDb={-8} />
    </AbsoluteFill>
  );
};
