import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {AliCharacter, EXPRESSIONS, mixExpression, mixPose, POSES, type Expression, type HeldItem, type Pose} from '../components/AliCharacter';
import {FloatingShapes, RoomBackground} from '../components/AnimatedBackground';
import {AnimatedText} from '../components/AnimatedText';
import {Sfx} from '../components/AudioManager';
import {StreakCalendar} from '../components/CalendarFlip';
import {CameraMovement} from '../components/CameraMovement';
import {ProgressBar} from '../components/ProgressBar';
import {IeltsBook, Lamp, VocabCard} from '../components/Props';
import {EASE, pop, track, tween} from '../components/anim';
import {TIMELINE} from '../episode/timeline';
import {COLORS} from '../theme';
import {At, Stage, type SceneProps} from './Stage';

const VOCAB = [
  {word: 'ACHIEVE', meaning: 'erishmoq', x: 290, y: 420, r: -8, color: COLORS.white},
  {word: 'IMPROVE', meaning: 'yaxshilamoq', x: 790, y: 470, r: 7, color: COLORS.yellow},
  {word: 'SKILL', meaning: 'ko‘nikma', x: 300, y: 690, r: 5, color: '#BBF7D0'},
  {word: 'DAILY', meaning: 'har kuni', x: 790, y: 740, r: -6, color: '#FED7AA'},
];

/** 0:29 — study montage: phone away, book, listening, reading, vocab, progress. */
export const Scene7Transformation: React.FC<SceneProps> = ({scene}) => {
  const frame = useCurrentFrame();
  const b = scene.beats;
  const words = TIMELINE.lines.find((l) => l.id === 'l15')?.words ?? [];
  const local = (i: number, fallback: number) => (words[i] ? words[i].from - scene.from : fallback);
  const THROW = 12;
  const LAND = THROW + 14;
  const OPEN = b.l14.to - 18;
  const LISTEN = local(2, b.l15.from + 10);
  const READ = local(3, b.l15.from + 27);
  const VOC = local(5, b.l15.from + 45);
  const RESULT = b.l16.from - 2;
  const steps = [RESULT + 14, RESULT + 30, RESULT + 46];
  const PROUD = RESULT + 50;
  const end = scene.durationInFrames;

  const desk: Pose = {...POSES.writing};
  const pose = track<Pose>(
    frame,
    [
      {at: 0, v: {...desk, armR: [40, -100], lookX: 0.4, lookY: 0.4, headTilt: 0}},
      {at: THROW - 6, v: {...desk, armR: [150, 10], lookX: 0.9, lookY: -0.2, headTilt: -4, bodyTilt: -4}, dur: 5},
      {at: THROW, v: {...desk, armR: [75, 20], lookX: 1, lookY: 0.2, headTilt: 6, bodyTilt: 4}, dur: 3},
      {at: OPEN - 4, v: desk, dur: 6},
      {at: LISTEN, v: {...desk, headTilt: -6, lookX: -0.4, lookY: -0.2, armL: [40, 120]}, dur: 6},
      {at: READ, v: {...desk, armR: [-6, -88]}, dur: 5},
      {at: VOC, v: {...desk, lookY: -0.8, headTilt: 0}, dur: 6},
      {at: PROUD, v: {...POSES.thumbsUp, thighScale: 0.32, legL: [8, -8], legR: [8, -8], headTilt: 5}, dur: 7},
    ],
    mixPose,
  );
  const expr = track<Expression>(
    frame,
    [
      {at: 0, v: EXPRESSIONS.motivated},
      {at: LISTEN, v: mixExpression(EXPRESSIONS.motivated, EXPRESSIONS.neutral, 0.4), dur: 6},
      {at: VOC, v: EXPRESSIONS.motivated, dur: 6},
      {at: RESULT, v: EXPRESSIONS.excited, dur: 8},
      {at: PROUD, v: EXPRESSIONS.confident, dur: 8},
    ],
    mixExpression,
  );
  let itemR: HeldItem = 'none';
  if (frame < THROW) itemR = 'phone';
  else if (frame >= READ && frame < VOC) itemR = 'highlighter';
  else if (frame >= VOC && frame < PROUD) itemR = 'pen';
  const headphones = frame >= LISTEN + 4;
  const hpDrop = tween(frame, [LISTEN - 2, LISTEN + 4], [-400, 0], EASE.in);

  // phone arc into the "KEYIN" box
  const pt = tween(frame, [THROW, LAND], [0, 1], (t) => t);
  const px = 640 + (880 - 640) * pt;
  const py = 1150 - Math.sin(pt * Math.PI) * 360 + (1260 - 1150) * pt;
  const lid = tween(frame, [LAND, LAND + 5], [0, 1], EASE.back);

  const bookOpen = tween(frame, [OPEN, OPEN + 8], [0, 1], EASE.out);
  const value = frame < steps[0] ? 4.0 : frame < steps[1] ? 4.5 : frame < steps[2] ? 5.0 : 5.5;
  const smooth = tween(frame, [steps[0] - 4, steps[0] + 4], [4.0, 4.5]) + tween(frame, [steps[1] - 4, steps[1] + 4], [0, 0.5]) + tween(frame, [steps[2] - 4, steps[2] + 4], [0, 0.5]);
  const resultIn = pop(frame, RESULT, 30, {damping: 12, stiffness: 180});
  const cardsOut = tween(frame, [RESULT - 6, RESULT + 4], [0, 1], EASE.in);
  const readIn = pop(frame, READ, 30);
  const readOut = tween(frame, [VOC - 4, VOC + 2], [0, 1], EASE.in);

  const headings: Array<{at: number; text: string; accent: string[]}> = [
    {at: 2, text: 'TELEFON → KEYIN!', accent: ['KEYIN!']},
    {at: OPEN - 6, text: 'KITOB OCHILDI!', accent: ['OCHILDI!']},
    {at: LISTEN - 2, text: 'LISTENING', accent: ['LISTENING']},
    {at: READ - 2, text: 'READING', accent: []},
    {at: VOC - 2, text: 'YANGI SO‘ZLAR', accent: ['SO‘ZLAR']},
    {at: RESULT, text: 'HAR KUNI ozgina', accent: ['ozgina']},
  ];
  const current = headings.filter((h) => frame >= h.at).pop() ?? headings[0];
  const heading = current.text;
  const headingAt = current.at;
  const headingAccent = current.accent;

  return (
    <AbsoluteFill style={{background: COLORS.blue}}>
      <CameraMovement
        focus={[540, 1150]}
        keys={[
          {f: 0, zoom: 1.12},
          {f: THROW, zoom: 1.0, ease: EASE.out},
          {f: OPEN, zoom: 1.0},
          {f: OPEN + 5, zoom: 1.1, ease: EASE.power4Out},
          {f: LISTEN, zoom: 1.0, x: 40},
          {f: LISTEN + 5, zoom: 1.16, x: 60, ease: EASE.power4Out},
          {f: READ, zoom: 1.16, x: 60},
          {f: READ + 6, zoom: 1.0, x: 0, ease: EASE.power4Out},
          {f: VOC, zoom: 1.0},
          {f: RESULT, zoom: 1.04},
          {f: end, zoom: 1.0, ease: EASE.inOut},
        ]}
        shakes={[{from: LAND, duration: 8, amplitude: 10}]}
      >
        <Stage>
          <RoomBackground wall="#3D63C2" wall2="#2C4C9F" pan={-frame * 0.5} floor="#8B6A47" shelf={false} />
          <FloatingShapes seed="tr" depth={0.4} colors={[COLORS.yellow, COLORS.white, COLORS.green]} count={8} />
          <AliCharacter
            x={540}
            y={1630}
            scale={1.35}
            pose={pose}
            expression={expr}
            itemR={itemR}
            handR={frame >= PROUD ? 'thumbsUp' : 'fist'}
            headphones={headphones}
            shadow={0}
          />
          {frame >= LISTEN - 2 && !headphones ? (
            <g transform={`translate(540 ${1678 - 555 * 1.35 + hpDrop}) scale(1.23)`}>
              <path d="M -114 30 Q -120 -140 0 -142 Q 120 -140 114 30" stroke={COLORS.orange} strokeWidth={16} fill="none" />
            </g>
          ) : null}
          {/* sound waves while listening */}
          {headphones && frame < VOC
            ? [0, 1, 2].map((i) => {
                const t = ((frame - LISTEN) * 1.4 + i * 12) % 36;
                return (
                  <g key={i} opacity={1 - t / 36}>
                    <path d={`M ${700 + t * 3} ${1000 - t} Q ${740 + t * 4} ${1080} ${700 + t * 3} ${1160 + t}`} stroke={COLORS.yellow} strokeWidth={10} fill="none" strokeLinecap="round" />
                    <path d={`M ${380 - t * 3} ${1000 - t} Q ${340 - t * 4} ${1080} ${380 - t * 3} ${1160 + t}`} stroke={COLORS.yellow} strokeWidth={10} fill="none" strokeLinecap="round" />
                  </g>
                );
              })
            : null}
          {/* desk */}
          <rect x={-40} y={1300} width={1160} height={60} rx={12} fill="#B45309" stroke={COLORS.ink} strokeWidth={8} />
          <rect x={-40} y={1356} width={1160} height={600} fill="#92400E" stroke={COLORS.ink} strokeWidth={8} />
          <Lamp x={170} y={1300} />
          {/* KEYIN box */}
          <g transform="translate(880 1300)">
            <rect x={-95} y={-120} width={190} height={120} rx={10} fill="#D97706" stroke={COLORS.ink} strokeWidth={6} />
            <text y={-46} textAnchor="middle" fontFamily="Montserrat" fontWeight={900} fontSize={40} fill={COLORS.white}>
              KEYIN
            </text>
            <g transform={`rotate(${-70 + 70 * lid} -95 -120)`}>
              <rect x={-100} y={-136} width={200} height={20} rx={6} fill="#B45309" stroke={COLORS.ink} strokeWidth={5} />
            </g>
          </g>
          {frame >= THROW && frame < LAND ? (
            <g transform={`translate(${px} ${py}) rotate(${pt * 540})`}>
              <rect x={-30} y={-56} width={60} height={112} rx={12} fill={COLORS.ink} />
              <rect x={-24} y={-48} width={48} height={96} rx={8} fill="#334155" />
            </g>
          ) : null}
          {/* book on desk: closed → open */}
          <g transform="translate(560 1296)">
            {bookOpen < 0.5 ? (
              <g transform={`scale(${1 - bookOpen * 2} 1) rotate(-90)`}>
                <IeltsBook x={0} y={0} width={60} rotate={0} />
              </g>
            ) : (
              <g transform={`scale(${(bookOpen - 0.5) * 2} 1)`}>
                <path d="M 0 -6 L -160 -20 L -170 10 L 0 16 Z" fill="#F8FAFC" stroke={COLORS.ink} strokeWidth={5} />
                <path d="M 0 -6 L 160 -20 L 170 10 L 0 16 Z" fill="#F1F5F9" stroke={COLORS.ink} strokeWidth={5} />
              </g>
            )}
            {frame >= OPEN + 4 && frame < OPEN + 24
              ? [0, 1, 2, 3, 4, 5].map((i) => {
                  const t = frame - OPEN - 4;
                  const a = -Math.PI / 2 + (i - 2.5) * 0.4;
                  return <circle key={i} cx={Math.cos(a) * t * 9} cy={Math.sin(a) * t * 9} r={8} fill={COLORS.yellow} opacity={1 - t / 20} />;
                })
              : null}
          </g>
          {/* reading card with highlighter sweep */}
          {frame >= READ && readOut < 1 ? (
            <g transform={`translate(540 560) scale(${readIn * (1 - readOut)}) rotate(-3)`}>
              <rect x={-380} y={-230} width={760} height={460} rx={26} fill="#FFFDF5" stroke={COLORS.ink} strokeWidth={8} />
              <text x={-330} y={-150} fontFamily="Montserrat" fontWeight={900} fontSize={44} fill={COLORS.navy}>
                READING • Passage 1
              </text>
              {[0, 1, 2, 3, 4].map((i) => {
                const hl = tween(frame, [READ + 4 + i * 4, READ + 10 + i * 4], [0, 1]);
                const w = 640 - (i % 2) * 120;
                return (
                  <g key={i}>
                    {i === 1 || i === 3 ? <rect x={-330} y={-96 + i * 62} width={w * hl} height={40} rx={8} fill={COLORS.yellow} opacity={0.85} /> : null}
                    <rect x={-320} y={-84 + i * 62} width={w - 20} height={16} rx={8} fill="#94A3B8" />
                  </g>
                );
              })}
            </g>
          ) : null}
          {/* vocab cards */}
          {frame >= VOC && cardsOut < 1
            ? VOCAB.map((c, i) => {
                const p = pop(frame, VOC + i * 4, 30, {damping: 12, stiffness: 200});
                const fromX = i % 2 === 0 ? -400 : 1480;
                const x = fromX + (c.x - fromX) * p;
                const outY = cardsOut * -900;
                return (
                  <g key={c.word} transform={`translate(${x} ${c.y + outY}) rotate(${c.r * p + (1 - p) * 40}) scale(0.95)`}>
                    <VocabCard word={c.word} meaning={c.meaning} color={c.color} />
                  </g>
                );
              })
            : null}
          {/* progress + streak */}
          {frame >= RESULT ? (
            <g>
              <g transform={`translate(540 ${430 + (1 - resultIn) * -400})`}>
                <ProgressBar value={Math.min(smooth, value + 0.001)} frame={frame} label="MOCK BALL" />
              </g>
              <g transform={`translate(540 760) scale(${resultIn * 0.95})`}>
                <StreakCalendar frame={frame} from={RESULT + 4} stagger={6} />
              </g>
              {steps.map((s, i) =>
                frame >= s && frame < s + 16 ? (
                  <text
                    key={s}
                    x={240 + i * 200 + 40}
                    y={330 - (frame - s) * 3}
                    textAnchor="middle"
                    fontFamily="Montserrat"
                    fontWeight={900}
                    fontSize={56}
                    fill={COLORS.green}
                    stroke={COLORS.navy}
                    strokeWidth={8}
                    paintOrder="stroke"
                    opacity={1 - (frame - s) / 16}
                  >
                    +0.5
                  </text>
                ) : null,
              )}
            </g>
          ) : null}
        </Stage>
      </CameraMovement>
      <At x={540} y={190}>
        <AnimatedText key={heading} text={heading} from={headingAt} size={heading.length > 13 ? 92 : 110} accentWords={headingAccent} entrance="pop" stagger={3} />
      </At>
      <Sfx name="whoosh" at={THROW - 2} volume={0.45} />
      <Sfx name="pop" at={LAND} volume={0.6} />
      <Sfx name="stamp" at={LAND + 3} volume={0.35} />
      <Sfx name="paper" at={OPEN} volume={0.6} />
      <Sfx name="ding" at={OPEN + 4} volume={0.3} />
      <Sfx name="swish" at={LISTEN - 2} volume={0.5} />
      <Sfx name="pop" at={LISTEN + 4} volume={0.45} />
      <Sfx name="swish" at={READ} volume={0.45} />
      <Sfx name="typing" at={READ + 4} volume={0.35} />
      {VOCAB.map((_, i) => (
        <Sfx key={i} name="card_flip" at={VOC + i * 4} volume={0.55} />
      ))}
      <Sfx name="whoosh" at={RESULT - 4} volume={0.45} />
      {steps.map((s) => (
        <Sfx key={s} name="ding" at={s} volume={0.4} />
      ))}
      <Sfx name="success" at={PROUD} volume={0.5} />
    </AbsoluteFill>
  );
};
