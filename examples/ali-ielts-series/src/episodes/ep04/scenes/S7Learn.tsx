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
import {QuestionCard, Wave} from './common';

/** One word with its stressed syllable drawn big; pulses while the English voice says it. */
const StressCard: React.FC<{top: number; p: number; pulse: number; t: number; weak: string; strong: string; strongFirst: boolean; num: string; color: string}> = ({top, p, pulse, t, weak, strong, strongFirst, num, color}) => {
  const syl = (text: string, big: boolean) => (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4}}>
      <div style={{width: big ? 26 : 12, height: big ? 26 : 12, borderRadius: 13, background: big ? color : '#CBD5E1', transform: `scale(${big ? 1 + pulse * 0.6 : 1})`}} />
      <div style={{fontFamily: FONT_FAMILY, fontWeight: 900, fontSize: big ? 118 : 70, lineHeight: 1, color: big ? color : COLORS.navy, transform: `scale(${big ? 1 + pulse * 0.14 : 1})`, transformOrigin: 'center bottom'}}>{text}</div>
      <svg width={big ? 210 : 110} height={50} viewBox={`${big ? -105 : -55} -25 ${big ? 210 : 110} 50`}>
        <Wave w={big ? 200 : 100} h={big ? 46 : 18} t={t} level={pulse * (big ? 1 : 0.3)} color={big ? color : '#94A3B8'} bars={big ? 12 : 6} seed={text} />
      </svg>
    </div>
  );
  return (
    <div style={{position: 'absolute', left: 60, right: 60, top, height: 290, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#FFFDF7', border: `6px solid ${COLORS.ink}`, borderRadius: 34, boxShadow: '10px 12px 0 rgba(15,23,42,0.3)', padding: '0 36px', transform: `translateX(${(1 - p) * (strongFirst ? 900 : -900)}px) scale(${1 + pulse * 0.03})`}}>
      <div style={{display: 'flex', alignItems: 'flex-end', gap: 6}}>
        {strongFirst ? syl(strong, true) : syl(weak, false)}
        {strongFirst ? syl(weak, false) : syl(strong, true)}
      </div>
      <div style={{width: 190, height: 190, borderRadius: 40, background: color, border: `7px solid ${COLORS.ink}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT_FAMILY, fontWeight: 900, fontSize: 118, color: COLORS.white, transform: `rotate(${strongFirst ? 4 : -4}deg)`}}>{num}</div>
    </div>
  );
};

/** 0:40 — the lesson: stress as a clue (thirTEEN / THIRty), and listen past the first answer. */
export const S7Learn: React.FC<{scene: TLScene}> = ({scene}) => {
  const f = useCurrentFrame();
  const L = scene.lines;
  const A = L.l13a.localFrom;
  const E2 = L.e02;
  const E3 = L.e03;
  const NOTE = L.l13c.localFrom + 20;
  const B = L.l14.localFrom - 6; // "but most important…"
  const DIQ = wordAt(scene, 'l14', 8); // "diqqatni"
  const C = L.l15.localFrom - 4;
  const CHANGE = wordAt(scene, 'l15', 4); // "o‘zgartirilishi"
  const end = scene.durationInFrames;
  const phaseA = f < B;
  const env = (l: {localFrom: number; localTo: number}) => (f >= l.localFrom && f <= l.localTo + 4 ? 0.55 + 0.45 * Math.abs(Math.sin((f - l.localFrom) / 2.4)) : 0);

  const pose = track<Pose>(
    f,
    [
      {at: 0, v: {...POSES.pointUpRight, armR: [112, 10], lookX: 0.8, lookY: -0.8, headTurn: 0.5}},
      {at: B, v: {...POSES.stand, armL: [40, 120], armR: [40, 120], lookY: -0.4}, dur: 5},
      {at: DIQ - 3, v: {...POSES.pointUpRight, armR: [130, 10], lookX: 0.5, lookY: -0.8, headTurn: 0.3}, dur: 5},
    ],
    mixPose,
  );
  const expr = track<Expression>(
    f,
    [
      {at: 0, v: EXPRESSIONS.focused},
      {at: E2.localFrom, v: EXPRESSIONS.idea, dur: 5},
      {at: B, v: mixExpression(EXPRESSIONS.shocked, EXPRESSIONS.focused, 0.5), dur: 5},
      {at: DIQ, v: EXPRESSIONS.confident, dur: 6},
    ],
    mixExpression,
  );
  const outA = tween(f, [B - 6, B], [0, 1], EASE.in);
  const sorry = pop(f, B + 2, 30, {damping: 12, stiffness: 190});
  const qc = pop(f, B + 10, 30, {damping: 12, stiffness: 190});
  const wrong = tween(f, [DIQ - 14, DIQ - 6], [0, 1]);
  const fix = pop(f, DIQ - 4, 30, {damping: 9, stiffness: 230});
  const tl = tween(f, [C, C + 10], [0, 1], EASE.out);
  const head = tween(f, [C + 6, end - 14], [0, 1]);

  return (
    <AbsoluteFill style={{background: '#EAF2FF'}}>
      <CameraMovement focus={[540, 800]} keys={[{f: 0, zoom: 1.06}, {f: 14, zoom: 1.0, ease: EASE.out}, {f: end, zoom: 1.03}]}>
        <Stage>
          <defs>
            <pattern id="ln-grid" width={60} height={60} patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#BFDBFE" strokeWidth={2} />
            </pattern>
          </defs>
          <rect width={1080} height={1920} fill="url(#ln-grid)" />
          <AliCharacter x={150} y={2030} scale={0.9} pose={pose} expression={expr} handL="open" handR="point" shadow={0} />
        </Stage>
        {phaseA ? (
          <AbsoluteFill style={{opacity: 1 - outA, transform: `translateY(${-outA * 80}px)`}}>
            <StressCard top={330} p={pop(f, A, 30, {damping: 14, stiffness: 170})} pulse={env(E2)} t={f} weak="thir" strong="TEEN" strongFirst={false} num="13" color={COLORS.orange} />
            <StressCard top={660} p={pop(f, E2.localTo + 4, 30, {damping: 14, stiffness: 170})} pulse={env(E3)} t={f} weak="ty" strong="THIR" strongFirst num="30" color={COLORS.green} />
            {f >= NOTE ? (
              <div style={{position: 'absolute', left: 0, right: 0, top: 1010, display: 'flex', justifyContent: 'center', transform: `scale(${pop(f, NOTE)}) rotate(-2deg)`}}>
                <div style={{background: COLORS.navy, color: COLORS.white, borderRadius: 20, padding: '12px 30px', fontFamily: FONT_FAMILY, fontWeight: 800, fontSize: 44, textAlign: 'center'}}>
                  Urg‘u — foydali belgi, <span style={{color: COLORS.yellow}}>lekin qoida emas!</span>
                </div>
              </div>
            ) : null}
          </AbsoluteFill>
        ) : (
          <AbsoluteFill>
            <div style={{position: 'absolute', left: 0, right: 0, top: 300, display: 'flex', justifyContent: 'center', transform: `scale(${sorry}) rotate(-3deg)`}}>
              <div style={{background: COLORS.yellow, border: `7px solid ${COLORS.ink}`, borderRadius: 30, padding: '18px 50px', fontFamily: FONT_FAMILY, fontWeight: 900, fontSize: 96, color: COLORS.navy, boxShadow: '10px 12px 0 rgba(15,23,42,0.35)'}}>“Sorry, I mean…”</div>
            </div>
            <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
              <g transform={`translate(540 650) scale(${qc})`}>
                <QuestionCard answer="13" write={1} wrong={wrong} fixed="30" fix={fix} />
              </g>
              {/* the whole recording: the first number is not the end */}
              {f >= C ? (
                <g transform="translate(540 1010)" opacity={tl}>
                  <rect x={-430} y={-14} width={860} height={28} rx={14} fill="#CBD5E1" stroke={COLORS.ink} strokeWidth={5} />
                  <rect x={-430} y={-14} width={860 * head} height={28} rx={14} fill={COLORS.blue} />
                  <g transform="translate(-200 0)">
                    <circle r={30} fill={head > 0.27 ? COLORS.red : COLORS.white} stroke={COLORS.ink} strokeWidth={5} />
                    <text y={-48} textAnchor="middle" fontFamily="Montserrat" fontWeight={900} fontSize={44} fill={COLORS.red}>
                      13?
                    </text>
                  </g>
                  <g transform="translate(180 0)">
                    <circle r={30 + (head > 0.71 ? Math.sin(f / 3) * 4 : 0)} fill={head > 0.71 ? COLORS.green : COLORS.white} stroke={COLORS.ink} strokeWidth={5} />
                    <text y={-48} textAnchor="middle" fontFamily="Montserrat" fontWeight={900} fontSize={44} fill="#15803D">
                      30!
                    </text>
                  </g>
                  <g transform={`translate(${-430 + 860 * head} 0)`}>
                    <circle r={22} fill={COLORS.yellow} stroke={COLORS.ink} strokeWidth={5} />
                  </g>
                  <text y={96} textAnchor="middle" fontFamily="Montserrat" fontWeight={900} fontSize={46} fill={COLORS.navy}>
                    {f >= CHANGE ? 'JAVOB O‘ZGARISHI MUMKIN!' : 'OXIRIGACHA TINGLA'}
                  </text>
                </g>
              ) : null}
            </svg>
            {f >= DIQ && f < C ? (
              <At x={540} y={900}>
                <AnimatedText text={'DIQQAT BILAN|TINGLA!'} from={DIQ} stagger={4} entrance="pop" size={104} color={COLORS.white} accentWords={['TINGLA!']} accent={COLORS.yellow} exitAt={C - 8} />
              </At>
            ) : null}
          </AbsoluteFill>
        )}
      </CameraMovement>
      <DuckedSfx name="swish" at={A} gainDb={-8} />
      <DuckedSfx name="swish" at={E2.localTo + 4} gainDb={-8} />
      <DuckedSfx name="pop" at={NOTE} gainDb={-10} />
      <DuckedSfx name="card_flip" at={B + 2} gainDb={-6} />
      <DuckedSfx name="pop" at={DIQ - 4} gainDb={-8} />
      <DuckedSfx name="ding" at={C + 4} gainDb={-10} />
      <DuckedSfx name="success" at={CHANGE} gainDb={-10} />
    </AbsoluteFill>
  );
};
