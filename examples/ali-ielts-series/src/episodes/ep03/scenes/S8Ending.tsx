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
import {BookIcon, ClockIcon, F} from './common';

const COMMENTS = [
  {name: 'dilnoza_ielts', text: 'VAQT! Har doim ulgurmayman', side: -1},
  {name: 'sardor.07', text: 'Notanish so‘zlar 😅', side: 1},
  {name: 'madina_b', text: 'Ikkalasi ham!', side: -1},
];

const Choice: React.FC<{x: number; y: number; p: number; active: number; label: string; color: string; icon: 'clock' | 'book'; t: number}> = ({x, y, p, active, label, color, icon, t}) => (
  <g transform={`translate(${x} ${y}) scale(${p * (1 + 0.1 * active)}) rotate(${(x < 540 ? -4 : 4) * (1 - active * 0.5)})`}>
    <rect x={-215} y={-200} width={430} height={400} rx={40} fill={COLORS.ink} opacity={0.3} transform="translate(10 12)" />
    <rect x={-215} y={-200} width={430} height={400} rx={40} fill={color} stroke={active > 0.5 ? COLORS.yellow : COLORS.ink} strokeWidth={active > 0.5 ? 14 : 8} />
    <g transform="translate(0 -50)">{icon === 'clock' ? <ClockIcon size={95} t={t} /> : <BookIcon size={95} />}</g>
    {label.split(' ').length > 1 ? (
      label.split(' ').map((w, i) => (
        <text key={w} y={108 + i * 54} textAnchor="middle" fontFamily={F} fontWeight={900} fontSize={48} fill={COLORS.white} stroke={COLORS.ink} strokeWidth={8} paintOrder="stroke">
          {w}
        </text>
      ))
    ) : (
      <text y={130} textAnchor="middle" fontFamily={F} fontWeight={900} fontSize={60} fill={COLORS.white} stroke={COLORS.ink} strokeWidth={8} paintOrder="stroke">
        {label}
      </text>
    )}
  </g>
);

/** 0:39 — the question to the viewer, comments, follow. */
export const S8Ending: React.FC<{scene: TLScene}> = ({scene}) => {
  const f = useCurrentFrame();
  const SENCHI = scene.lines.l15a.localFrom;
  const Q = scene.lines.l15b.localFrom;
  const VAQT = wordAt(scene, 'l15b', 5);
  const NOT = wordAt(scene, 'l15b', 7);
  const IZOH = wordAt(scene, 'l16', 0);
  const FOLLOWQ = scene.lines.l17.localFrom;
  const OBUNA = wordAt(scene, 'l17', 6);
  const end = scene.durationInFrames;
  const finalAt = Math.min(end - 50, OBUNA + 30);

  const pose = track<Pose>(
    f,
    [
      {at: 0, v: {...POSES.stand, lookY: -0.2}},
      {at: SENCHI - 2, v: {...POSES.pointAtViewer, lookX: 0, lookY: 0}, dur: 5},
      {at: VAQT - 4, v: {...POSES.stand, armL: [120, 10], armR: [10, 20], lookX: -0.9, lookY: -0.5, headTurn: -0.5}, dur: 5},
      {at: NOT - 4, v: {...POSES.stand, armR: [120, 10], armL: [10, 20], lookX: 0.9, lookY: -0.5, headTurn: 0.5}, dur: 5},
      {at: IZOH - 4, v: {...POSES.pointViewer, lookX: 0, lookY: 0}, dur: 5},
      {at: FOLLOWQ + 4, v: {...POSES.pointUpRight, armR: [125, 10], lookX: 0.3, lookY: -0.8, headTurn: 0.2}, dur: 6},
      {at: OBUNA - 6, v: {...POSES.thumbsUp, lookX: 0.4, lookY: -0.3}, dur: 6},
      {at: finalAt, v: {...POSES.fistUp, lookX: 0, lookY: -0.2}, dur: 6},
    ],
    mixPose,
  );
  const expr = track<Expression>(
    f,
    [
      {at: 0, v: EXPRESSIONS.confident},
      {at: SENCHI - 2, v: EXPRESSIONS.excited, dur: 4},
      {at: Q + 10, v: mixExpression(EXPRESSIONS.confident, EXPRESSIONS.idea, 0.4), dur: 6},
      {at: IZOH - 4, v: EXPRESSIONS.excited, dur: 5},
      {at: OBUNA - 6, v: EXPRESSIONS.excited, dur: 5},
    ],
    mixExpression,
  );
  const handR = f >= OBUNA - 6 && f < finalAt ? 'thumbsUp' : f >= finalAt ? 'fist' : f >= NOT - 4 || (f >= SENCHI - 2 && f < VAQT - 4) || f >= IZOH - 4 ? 'point' : 'open';
  const handL = f >= VAQT - 4 && f < NOT - 4 ? 'point' : 'open';

  const choicesOn = f >= Q && f < IZOH + 8;
  const cA = pop(f, Q + 4, 30, {damping: 11, stiffness: 200});
  const cB = pop(f, Q + 10, 30, {damping: 11, stiffness: 200});
  const aOn = tween(f, [VAQT - 2, VAQT + 4], [0, 1]) * (1 - tween(f, [NOT - 2, NOT + 4], [0, 1]));
  const bOn = tween(f, [NOT - 2, NOT + 4], [0, 1]) * (1 - tween(f, [IZOH - 2, IZOH + 4], [0, 1]));
  const choicesY = 700;
  const choicesS = 1 - tween(f, [IZOH, IZOH + 8], [0, 1], EASE.in);

  const tap = OBUNA + 4;
  const followed = f >= tap;
  const btn = pop(f, FOLLOWQ + 6, 30, {damping: 12, stiffness: 200});
  const press = f >= tap && f < tap + 6 ? 0.9 : 1;
  const aliX = 540;
  const aliY = f >= FOLLOWQ ? 1880 : 1850;

  return (
    <AbsoluteFill style={{background: COLORS.navy}}>
      <CameraMovement focus={[540, 900]} keys={[{f: 0, zoom: 1.12}, {f: SENCHI + 4, zoom: 1.0, ease: EASE.power4Out}, {f: finalAt, zoom: 1.0}, {f: finalAt + 8, zoom: 1.06, ease: EASE.power4Out}, {f: end, zoom: 1.08}]} shakes={[{from: SENCHI, duration: 8, amplitude: 8}]}>
        <Stage>
          <defs>
            <radialGradient id="en-bg" cx="0.5" cy="0.4" r="0.8">
              <stop offset="0%" stopColor="#2563EB" />
              <stop offset="100%" stopColor="#111827" />
            </radialGradient>
          </defs>
          <rect width={1080} height={1920} fill="url(#en-bg)" />
          {Array.from({length: 16}).map((_, i) => (
            <rect key={i} x={540 - 30} y={-1400} width={60} height={1400} fill={COLORS.white} opacity={0.04} transform={`translate(0 900) rotate(${i * 22.5 + f * 0.3} 540 0)`} />
          ))}
          {choicesOn ? (
            <g transform={`translate(540 ${choicesY}) scale(${choicesS}) translate(-540 0)`}>
              <Choice x={300} y={0} p={cA} active={aOn} label="VAQT" color={COLORS.orange} icon="clock" t={f * 3} />
              <Choice x={780} y={0} p={cB} active={bOn} label="NOTANISH SO‘ZLAR" color={COLORS.blue} icon="book" t={0} />
              <g transform={`translate(540 0) scale(${Math.min(cA, cB)})`}>
                <circle r={62} fill={COLORS.yellow} stroke={COLORS.ink} strokeWidth={7} />
                <text y={22} textAnchor="middle" fontFamily={F} fontWeight={900} fontSize={58} fill={COLORS.navy}>
                  ?
                </text>
              </g>
            </g>
          ) : null}
          <AliCharacter x={aliX} y={aliY} scale={1.3} pose={pose} expression={expr} handL={handL} handR={handR} shadow={0} />
          <Confetti at={finalAt} count={90} />
        </Stage>
      </CameraMovement>
      {/* comment bubbles */}
      {f >= IZOH && f < FOLLOWQ + 10
        ? COMMENTS.map((c, i) => {
            const at = IZOH + 4 + i * 7;
            if (f < at) return null;
            const p = pop(f, at, 30, {damping: 12, stiffness: 220});
            const out = tween(f, [FOLLOWQ, FOLLOWQ + 10], [1, 0]);
            return (
              <div key={i} style={{position: 'absolute', top: 480 + i * 160, [c.side < 0 ? 'left' : 'right']: 50, transform: `scale(${p * out})`, transformOrigin: c.side < 0 ? 'left center' : 'right center', display: 'flex', alignItems: 'center', gap: 14, background: COLORS.white, border: `5px solid ${COLORS.ink}`, borderRadius: 30, padding: '12px 24px 12px 12px', boxShadow: '6px 8px 0 rgba(0,0,0,0.3)'}}>
                <div style={{width: 76, height: 76, borderRadius: 38, background: [COLORS.orange, COLORS.green, COLORS.yellow][i], border: `4px solid ${COLORS.ink}`}} />
                <div style={{fontFamily: FONT_FAMILY}}>
                  <div style={{fontWeight: 800, fontSize: 30, color: '#64748B'}}>@{c.name}</div>
                  <div style={{fontWeight: 900, fontSize: 42, color: COLORS.navy}}>{c.text.replace(' 😅', '')}</div>
                </div>
              </div>
            );
          })
        : null}
      {/* follow button */}
      {f >= FOLLOWQ + 6 && f < finalAt + 6 ? (
        <div style={{position: 'absolute', left: 0, right: 0, top: 760, display: 'flex', justifyContent: 'center', transform: `scale(${btn * press * (1 - tween(f, [finalAt, finalAt + 6], [0, 1]))})`}}>
          <div style={{background: followed ? COLORS.white : COLORS.blue, color: followed ? COLORS.navy : COLORS.white, border: `7px solid ${COLORS.ink}`, borderRadius: 999, padding: '22px 70px', fontFamily: FONT_FAMILY, fontWeight: 900, fontSize: 72, boxShadow: '10px 12px 0 rgba(0,0,0,0.35)'}}>{followed ? '✓ OBUNA BO‘LDINGIZ' : '+ OBUNA BO‘LISH'}</div>
        </div>
      ) : null}
      {/* tap ripple on the follow button */}
      {f >= tap && f < tap + 16 ? (
        <div style={{position: 'absolute', left: 540 - 60, top: 815 - 60, width: 120, height: 120, borderRadius: 60, border: `8px solid ${COLORS.yellow}`, transform: `scale(${1 + (f - tap) / 5})`, opacity: 1 - (f - tap) / 16}} />
      ) : null}
      <At x={540} y={225}>
        {f < Q ? <AnimatedText text={'SEN-CHI?'} from={SENCHI} stagger={4} entrance="slam" size={150} accentWords={['SEN-CHI?']} /> : null}
        {f >= Q && f < IZOH ? <AnimatedText text={'ENG KATTA|MUAMMOING?'} from={Q} stagger={5} entrance="pop" size={104} accentWords={['MUAMMOING?']} /> : null}
        {f >= IZOH && f < FOLLOWQ ? <AnimatedText text={'IZOHLARDA|YOZ!'} from={IZOH} stagger={5} entrance="slam" size={130} accentWords={['YOZ!']} accent={COLORS.yellow} /> : null}
        {f >= finalAt ? <AnimatedText text={'ALI BILAN|IELTS O‘RGAN!'} from={finalAt} stagger={5} entrance="slam" size={106} accentWords={['IELTS', 'O‘RGAN!']} accent={COLORS.yellow} rotate={-3} /> : null}
      </At>
      <DuckedSfx name="whoosh" at={SENCHI - 2} gainDb={-8} />
      <DuckedSfx name="card_flip" at={Q + 4} gainDb={-8} />
      <DuckedSfx name="card_flip" at={Q + 10} gainDb={-8} />
      <DuckedSfx name="ding" at={VAQT} gainDb={-10} />
      <DuckedSfx name="ding" at={NOT} gainDb={-10} rate={1.2} />
      {COMMENTS.map((_, i) => (
        <DuckedSfx key={i} name="bubble_pop" at={IZOH + 4 + i * 7} gainDb={-8} />
      ))}
      <DuckedSfx name="pop" at={FOLLOWQ + 6} gainDb={-8} />
      <DuckedSfx name="notification" at={tap} gainDb={-4} />
      <DuckedSfx name="success" at={finalAt} gainDb={-4} />
    </AbsoluteFill>
  );
};
