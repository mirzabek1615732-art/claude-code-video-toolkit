import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {AliCharacter, EXPRESSIONS, mixExpression, mixPose, POSES, type Expression, type Pose} from '../components/AliCharacter';
import {RoomBackground} from '../components/AnimatedBackground';
import {Sfx} from '../components/AudioManager';
import {CalendarFlip} from '../components/CalendarFlip';
import {CameraMovement} from '../components/CameraMovement';
import {Cobweb, IeltsBook, SpeechBubble} from '../components/Props';
import {EASE, pop, track, tween} from '../components/anim';
import {COLORS} from '../theme';
import {Stage, type SceneProps} from './Stage';

const PAGES = [
  {day: 'DUSHANBA', date: '12', note: 'ERTADAN!'},
  {day: 'SESHANBA', date: '13', note: 'ERTADAN!!'},
  {day: 'CHORSHANBA', date: '14', note: 'ERTADAN...?'},
];

/** 0:06 — "Ertadan boshlayman!" every day, calendar flips, book untouched. */
export const Scene3Procrastination: React.FC<SceneProps> = ({scene}) => {
  const frame = useCurrentFrame();
  const b = scene.beats;
  const ERTA = b.l04.from + 30; // "Ertadan"
  const flipAt = [b.l04.to - 4, b.l05.from + 9];
  const pause = b.l05.to + 2; // awkward silence
  const bubbleTimes = [ERTA, flipAt[0] + 10, flipAt[1] + 10];
  const lastBubble = bubbleTimes.filter((t) => frame >= t).pop() ?? -1;

  const pose = track<Pose>(
    frame,
    [
      {at: 0, v: {...POSES.stand, armL: [20, 40], armR: [20, 40]}},
      {at: ERTA - 4, v: POSES.fistUp, dur: 5},
      {at: flipAt[0] + 6, v: {...POSES.fistUp, armR: [130, 40], bodyTilt: -1}, dur: 5},
      {at: flipAt[1] + 6, v: {...POSES.fistUp, armR: [100, 60], bodyTilt: 2, headTilt: 4}, dur: 6},
      {at: pause, v: {...POSES.shrug, armR: [-10, -140], armL: [20, 30], headTilt: 10, lookX: 0.9, lookY: 0.4}, dur: 8},
    ],
    mixPose,
  );
  const expr = track<Expression>(
    frame,
    [
      {at: 0, v: EXPRESSIONS.neutral},
      {at: ERTA - 4, v: EXPRESSIONS.confident, dur: 5},
      {at: flipAt[1] + 6, v: mixExpression(EXPRESSIONS.confident, EXPRESSIONS.sheepish, 0.5), dur: 6},
      {at: pause, v: EXPRESSIONS.sheepish, dur: 6},
    ],
    mixExpression,
  );
  const dust = tween(frame, [flipAt[0], flipAt[1] + 12], [0, 0.9]);
  const web = tween(frame, [flipAt[1] + 6, flipAt[1] + 18], [0, 1]);
  const bubbleP = lastBubble >= 0 ? pop(frame, lastBubble, 30, {damping: 9, stiffness: 260}) : 0;
  const bubbleShrink = tween(frame, [pause - 6, pause + 4], [1, 0], EASE.in);
  const talk = frame >= ERTA && frame < b.l04.to ? Math.abs(Math.sin(frame / 2)) * 0.35 : 0;

  return (
    <AbsoluteFill style={{background: COLORS.navy}}>
      <CameraMovement
        focus={[400, 1000]}
        keys={[
          {f: 0, zoom: 1.0, x: 0},
          {f: ERTA, zoom: 1.0},
          {f: ERTA + 6, zoom: 1.14, x: 20, ease: EASE.power4Out},
          {f: flipAt[0], zoom: 1.0, x: 0, ease: EASE.inOut},
          {f: flipAt[1] + 10, zoom: 1.04},
          {f: pause, zoom: 1.04},
          {f: scene.durationInFrames, zoom: 1.32, x: 40, ease: EASE.inOut},
        ]}
        shakes={bubbleTimes.map((t) => ({from: t, duration: 8, amplitude: 10}))}
      >
        <Stage>
          <RoomBackground pan={-20 + frame * 0.25} wall="#2E3E63" wall2="#1F2A44" shelf={false} showWindow={false} />
          {/* calendar on wall */}
          <g transform={`translate(780 420) rotate(${Math.sin(frame / 9) * 1.2})`}>
            <rect x={-6} y={-60} width={12} height={40} fill="#64748B" />
            <circle cx={0} cy={-62} r={10} fill="#64748B" />
            <CalendarFlip frame={frame} pages={PAGES} flipAt={flipAt} />
          </g>
          {/* side table with the untouched book */}
          <g transform="translate(820 1340)">
            <rect x={-150} y={-180} width={300} height={30} rx={10} fill="#92400E" stroke={COLORS.ink} strokeWidth={6} />
            <rect x={-130} y={-150} width={20} height={150} fill="#78350F" stroke={COLORS.ink} strokeWidth={5} />
            <rect x={110} y={-150} width={20} height={150} fill="#78350F" stroke={COLORS.ink} strokeWidth={5} />
          </g>
          <IeltsBook x={820} y={1230} width={140} rotate={-90} dusty={dust} />
          <Cobweb x={735} y={1180} size={80} opacity={web} />
          {web > 0.5
            ? [0, 1, 2].map((i) => (
                <circle key={i} cx={760 + i * 50 + Math.sin(frame / 8 + i) * 6} cy={1150 - ((frame * 1.5 + i * 30) % 60)} r={6} fill="#E2E8F0" opacity={0.5} />
              ))
            : null}
          <AliCharacter x={380} y={1360} scale={1.15} pose={pose} expression={expr} handR="fist" handL="open" talk={talk} />
          {lastBubble >= 0 && bubbleShrink > 0 ? (
            <g transform={`translate(520 640) scale(${bubbleP * bubbleShrink}) rotate(${-4 + bubbleTimes.indexOf(lastBubble) * 3})`}>
              <SpeechBubble w={500} h={170} text={bubbleTimes.indexOf(lastBubble) === 2 ? 'ERTADAN!!!' : 'ERTADAN!'} size={86} tail="left" color={COLORS.yellow} />
              {bubbleTimes.indexOf(lastBubble) > 0 ? (
                <g transform="translate(450 -280)">
                  <circle r={52} fill={COLORS.red} stroke={COLORS.ink} strokeWidth={6} />
                  <text y={18} textAnchor="middle" fontFamily="Montserrat" fontWeight={900} fontSize={46} fill={COLORS.white}>
                    x{bubbleTimes.indexOf(lastBubble) + 1}
                  </text>
                </g>
              ) : null}
            </g>
          ) : null}
          {/* "..." awkward pause dots */}
          {frame >= pause ? (
            <g transform="translate(560 760)">
              {[0, 1, 2].map((i) => (
                <circle key={i} cx={i * 46} cy={0} r={14} fill={COLORS.white} opacity={frame >= pause + 4 + i * 5 ? 1 : 0} />
              ))}
            </g>
          ) : null}
        </Stage>
      </CameraMovement>
      <Sfx name="whoosh" at={ERTA - 4} volume={0.5} />
      <Sfx name="stamp" at={ERTA} volume={0.55} />
      {flipAt.map((f) => (
        <React.Fragment key={f}>
          <Sfx name="card_flip" at={f} volume={0.7} />
          <Sfx name="stamp" at={f + 10} volume={0.45} />
        </React.Fragment>
      ))}
      <Sfx name="crickets" at={pause} volume={0.5} />
    </AbsoluteFill>
  );
};
