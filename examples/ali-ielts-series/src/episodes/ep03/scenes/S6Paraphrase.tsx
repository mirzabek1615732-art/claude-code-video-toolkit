import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {DuckedSfx} from '../../../audio/EpisodeAudio';
import {AliCharacter, EXPRESSIONS, mixExpression, mixPose, POSES, type Expression, type Pose} from '../../../components/AliCharacter';
import {CameraMovement} from '../../../components/CameraMovement';
import {EASE, pop, track, tween} from '../../../components/anim';
import {COLORS, FONT_FAMILY} from '../../../theme';
import {wordAt, type TLScene} from '../../buildTimeline';
import {Stage} from '../../../scenes/Stage';
import {Lightbulb} from './common';
import {Mark} from './S5Reveal';

// three aligned columns so matching words sit exactly above each other
const COLS = [170, 330, 400];
const LEFT = 90;
const colCenter = (i: number) => LEFT + COLS.slice(0, i).reduce((a, b) => a + b, 0) + COLS[i] / 2;
const ROW_Q = 520;
const ROW_P = 860;

const Row: React.FC<{label: string; words: [string, string, string]; top: number; p: number; marks: [number, number]; color: string}> = ({label, words, top, p, marks, color}) => (
  <div style={{position: 'absolute', left: LEFT - 30, width: 960, top: top - 110, transform: `scale(${0.85 + 0.15 * p})`, opacity: Math.min(1, p * 1.6)}}>
    <div style={{fontFamily: FONT_FAMILY, fontWeight: 900, fontSize: 30, letterSpacing: 5, color: COLORS.blue, marginLeft: 30, marginBottom: 6}}>{label}</div>
    <div style={{display: 'flex', alignItems: 'center', height: 150, background: '#FFFDF7', border: `6px solid ${COLORS.ink}`, borderRadius: 28, boxShadow: '10px 12px 0 rgba(15,23,42,0.35)', paddingLeft: 30, fontFamily: FONT_FAMILY, fontWeight: 800, fontSize: 64, color: COLORS.navy}}>
      <span style={{width: COLS[0], textAlign: 'center'}}>{words[0]}</span>
      <span style={{width: COLS[1], textAlign: 'center'}}>
        <Mark p={marks[0]} color={color} bold>
          {words[1]}
        </Mark>
      </span>
      <span style={{width: COLS[2], textAlign: 'center'}}>
        <Mark p={marks[1]} color={color} bold>
          {words[2]}
        </Mark>
      </span>
    </div>
  </div>
);

/** 0:29 — paraphrase trap: same meaning, different words. */
export const S6Paraphrase: React.FC<{scene: TLScene}> = ({scene}) => {
  const f = useCurrentFrame();
  const WARN = wordAt(scene, 'l12', 0); // "Lekin"
  const Q = wordAt(scene, 'l12', 3); // "Javobdagi"
  const P = wordAt(scene, 'l12', 5); // "matnda"
  const M1 = wordAt(scene, 'l12', 6); // "boshqa"
  const M2 = wordAt(scene, 'l12', 8); // "bilan"
  const LBL = wordAt(scene, 'l12', 9); // "ifodalanishi"
  const AHA = wordAt(scene, 'l12', 10); // "mumkin"
  const end = scene.durationInFrames;

  const pose = track<Pose>(
    f,
    [
      {at: 0, v: {...POSES.stand, armR: [30, 40], lookX: 0.6, lookY: -0.8, headTurn: 0.4}},
      {at: WARN - 2, v: {...POSES.stand, armL: [40, 120], armR: [40, 120], lookY: -0.5, headTilt: -6}, dur: 4},
      {at: Q, v: {...POSES.stand, armR: [110, 20], lookX: 0.8, lookY: -0.9, headTurn: 0.6}, dur: 6},
      {at: AHA - 2, v: {...POSES.fistUp, lookX: 0.3, lookY: -0.5}, dur: 5},
    ],
    mixPose,
  );
  const expr = track<Expression>(
    f,
    [
      {at: 0, v: EXPRESSIONS.focused},
      {at: WARN - 2, v: mixExpression(EXPRESSIONS.disappointed, EXPRESSIONS.shocked, 0.5), dur: 4},
      {at: Q, v: EXPRESSIONS.focused, dur: 6},
      {at: AHA - 2, v: EXPRESSIONS.idea, dur: 4},
    ],
    mixExpression,
  );
  const warn = pop(f, WARN, 30, {damping: 8, stiffness: 260});
  const warnOut = tween(f, [Q - 6, Q], [1, 0]);
  const m1 = tween(f, [M1, M1 + 8], [0, 1]);
  const m2 = tween(f, [M2, M2 + 8], [0, 1]);
  const link = (at: number) => tween(f, [at + 4, at + 12], [0, 1], EASE.out);
  const aha = pop(f, AHA, 30, {damping: 9, stiffness: 220});

  return (
    <AbsoluteFill style={{background: '#FFF4E6'}}>
      <CameraMovement focus={[540, 760]} keys={[{f: 0, zoom: 1.0}, {f: AHA - 2, zoom: 1.0}, {f: AHA + 4, zoom: 1.06, ease: EASE.power4Out}, {f: end, zoom: 1.08}]} shakes={[{from: WARN, duration: 8, amplitude: 8}]}>
        <Stage>
          <defs>
            <pattern id="pp-dots" width={46} height={46} patternUnits="userSpaceOnUse">
              <circle cx={23} cy={23} r={3} fill="#FDBA74" />
            </pattern>
          </defs>
          <rect width={1080} height={1920} fill="url(#pp-dots)" />
          {/* warning sign */}
          {warnOut > 0 && f >= WARN ? (
            <g transform={`translate(540 640) scale(${warn * warnOut}) rotate(${Math.sin(f / 2) * 4})`}>
              <path d="M 0 -200 L 210 160 L -210 160 Z" fill={COLORS.yellow} stroke={COLORS.ink} strokeWidth={14} strokeLinejoin="round" />
              <rect x={-16} y={-90} width={32} height={150} rx={14} fill={COLORS.ink} />
              <circle cy={110} r={20} fill={COLORS.ink} />
              <text y={260} textAnchor="middle" fontFamily="Montserrat" fontWeight={900} fontSize={84} fill={COLORS.red} stroke={COLORS.white} strokeWidth={10} paintOrder="stroke">
                EHTIYOT BO‘L!
              </text>
            </g>
          ) : null}
          {/* connectors between matching meanings */}
          {[
            {i: 1, at: M1},
            {i: 2, at: M2},
          ].map(({i, at}) => {
            const p = link(at);
            if (p <= 0) return null;
            const x = colCenter(i);
            const y0 = ROW_Q + 46;
            const y1 = ROW_P - 120;
            return (
              <g key={i}>
                <line x1={x} y1={y0} x2={x} y2={y0 + (y1 - y0) * p} stroke={COLORS.green} strokeWidth={14} strokeLinecap="round" strokeDasharray="2 26" />
                {p > 0.9 ? (
                  <g transform={`translate(${x} ${(y0 + y1) / 2}) scale(${pop(f, at + 12)})`}>
                    <circle r={44} fill={COLORS.green} stroke={COLORS.ink} strokeWidth={6} />
                    <text y={22} textAnchor="middle" fontFamily="Montserrat" fontWeight={900} fontSize={64} fill={COLORS.white}>
                      =
                    </text>
                  </g>
                ) : null}
              </g>
            );
          })}
          <AliCharacter x={170} y={2060} scale={1.0} pose={pose} expression={expr} handL="open" handR={f >= Q ? 'point' : 'open'} shadow={0} />
          {f >= AHA ? (
            <g>
              <g transform={`translate(360 1560) scale(${aha * 0.7})`}>
                <Lightbulb glow={Math.min(1, aha)} colorful />
              </g>
              <g transform={`translate(880 1130) scale(${aha})`}>
                <circle r={86} fill={COLORS.green} stroke={COLORS.ink} strokeWidth={8} />
                <path d="M -40 2 L -10 34 L 44 -30" fill="none" stroke={COLORS.white} strokeWidth={20} strokeLinecap="round" strokeLinejoin="round" />
              </g>
            </g>
          ) : null}
        </Stage>
        {f >= Q ? <Row label="QUESTION" words={['The', 'price', 'increased.']} top={ROW_Q} p={pop(f, Q)} marks={[m1, m2]} color="#FDE68A" /> : null}
        {f >= P ? <Row label="PASSAGE" words={['The', 'cost', 'went up.']} top={ROW_P} p={pop(f, P)} marks={[m1, m2]} color="#86EFAC" /> : null}
        {f >= LBL ? (
          <div style={{position: 'absolute', left: 0, right: 0, top: 1000, display: 'flex', justifyContent: 'center', transform: `scale(${pop(f, LBL)}) rotate(-3deg)`}}>
            <div style={{background: COLORS.blue, color: COLORS.white, border: `6px solid ${COLORS.ink}`, borderRadius: 999, padding: '12px 40px', fontFamily: FONT_FAMILY, fontWeight: 900, fontSize: 52, letterSpacing: 2, boxShadow: '8px 9px 0 rgba(15,23,42,0.3)'}}>
              PARAPHRASE = BIR XIL MA’NO
            </div>
          </div>
        ) : null}
      </CameraMovement>
      <DuckedSfx name="boing" at={WARN} gainDb={-8} />
      <DuckedSfx name="card_flip" at={Q} gainDb={-6} />
      <DuckedSfx name="card_flip" at={P} gainDb={-6} />
      <DuckedSfx name="pop" at={M1 + 12} gainDb={-8} />
      <DuckedSfx name="pop" at={M2 + 12} gainDb={-8} />
      <DuckedSfx name="ding" at={AHA} gainDb={-6} />
    </AbsoluteFill>
  );
};
