import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {AliCharacter, EXPRESSIONS, mixExpression, mixPose, POSES, type Expression, type Pose} from '../components/AliCharacter';
import {FloatingShapes, RoomBackground} from '../components/AnimatedBackground';
import {AnimatedText} from '../components/AnimatedText';
import {Sfx} from '../components/AudioManager';
import {CameraMovement} from '../components/CameraMovement';
import {PhoneScreen} from '../components/PhoneScreen';
import {FloatingIcons} from '../components/Particles';
import {Clock} from '../components/Props';
import {EASE, pop, track, tween} from '../components/anim';
import {COLORS} from '../theme';
import {At, Stage, type SceneProps} from './Stage';

/** 0:10 — giant phone, endless scroll, clock 15:00 → 18:00, "3 SOAT?!" */
export const Scene4Social: React.FC<SceneProps> = ({scene}) => {
  const frame = useCurrentFrame();
  const b = scene.beats;
  const SWITCH = b.l07.from - 3; // feed → vertical clips
  const PULL = b.l08.from - 6; // camera pulls back to reveal Ali
  const UCH = b.l08.from + 16; // "uch soat"
  const end = scene.durationInFrames;

  // feed scroll: fast flicks
  const feedScroll = frame * 34 + Math.sin(frame / 3) * 30;
  const shortsIndex = Math.max(0, Math.floor((frame - SWITCH) / 9));
  const shortsScroll = shortsIndex * 1330 + tween((frame - SWITCH) % 9, [0, 5], [-1330, 0], EASE.out) + 1330;
  const mode = frame < SWITCH ? 'feed' : 'shorts';

  const hours = tween(frame, [PULL + 4, UCH + 2], [15, 18], EASE.inOut);
  const hh = Math.floor(hours);
  const mm = Math.floor((hours % 1) * 60);
  const timeStr = `${hh}:${mm.toString().padStart(2, '0')}`;

  // giant phone shrinks into Ali's hand
  const shrink = tween(frame, [PULL, PULL + 12], [0, 1], EASE.inOut);
  const phoneScale = 0.98 - shrink * 0.72;
  const phoneX = 540 + shrink * (548 - 540);
  const phoneY = 1030 + shrink * (1192 - 1030);
  const roomOpacity = shrink;

  const pose: Pose = {...POSES.holdPhone, armR: [-6, -128], headTilt: 4, lookY: 0.5 - tween(frame, [UCH - 4, UCH], [0, 1.2]), lookX: -0.15};
  const expr = track<Expression>(
    frame,
    [
      {at: 0, v: EXPRESSIONS.distracted},
      {at: PULL + 14, v: mixExpression(EXPRESSIONS.distracted, EXPRESSIONS.shocked, 0.45), dur: 20},
      {at: UCH - 3, v: EXPRESSIONS.shocked, dur: 3},
    ],
    mixExpression,
  );
  const aliPose = track<Pose>(
    frame,
    [
      {at: 0, v: pose},
      {at: UCH - 2, v: {...POSES.armsUpShock, headTilt: 0, lookY: -0.3}, dur: 4},
    ],
    mixPose,
  );
  const soat = pop(frame, UCH, 30, {damping: 8, stiffness: 260, mass: 0.6});
  const clockWobble = frame >= PULL ? Math.sin(frame / 1.5) * 6 * (1 - tween(frame, [UCH, UCH + 10], [0, 1])) : 0;

  return (
    <AbsoluteFill style={{background: COLORS.navy3}}>
      <CameraMovement
        focus={[540, 900]}
        keys={[
          {f: 0, zoom: 1.0, rot: -2},
          {f: SWITCH, zoom: 1.08, rot: 2},
          {f: PULL, zoom: 1.12, rot: 0},
          {f: PULL + 12, zoom: 1.0, ease: EASE.out},
          {f: UCH, zoom: 1.0},
          {f: UCH + 5, zoom: 1.18, ease: EASE.power4Out},
          {f: end, zoom: 1.24},
        ]}
        shakes={[{from: UCH, duration: 14, amplitude: 22}]}
      >
        <Stage>
          <g opacity={roomOpacity}>
            <RoomBackground night={tween(frame, [PULL, UCH], [0, 1])} wall="#2B3A5C" wall2="#1A2440" shelf={false} />
            <g transform={`translate(830 420) scale(${0.8 + 0.2 * roomOpacity})`}>
              <Clock x={0} y={0} r={130} hours={hours} wobble={clockWobble} />
            </g>
            <g transform="translate(260 380)">
              <rect x={-150} y={-56} width={300} height={112} rx={24} fill={COLORS.navy} stroke={COLORS.white} strokeWidth={6} />
              <text y={26} textAnchor="middle" fontFamily="Montserrat" fontWeight={900} fontSize={76} fill={hours > 17.5 ? COLORS.red : COLORS.yellow}>
                {timeStr}
              </text>
            </g>
            <AliCharacter x={560} y={1680} scale={1.25} pose={aliPose} expression={expr} itemR={frame < UCH - 2 ? 'phone' : 'none'} phoneGlow={1} handL="open" handR={frame >= UCH - 2 ? 'open' : 'fist'} shadow={0} />
          </g>
          {/* glow from the screen */}
          <circle cx={phoneX} cy={phoneY} r={700 * phoneScale} fill={COLORS.blueLight} opacity={0.12 * (1 - shrink)} />
          {shrink < 1 ? (
            <g transform={`translate(${phoneX} ${phoneY}) scale(${phoneScale})`} opacity={1 - tween(frame, [PULL + 8, PULL + 12], [0, 1])}>
              <PhoneScreen
                frame={frame}
                scroll={mode === 'feed' ? feedScroll : shortsScroll}
                mode={mode}
                time={frame < PULL ? '15:00' : timeStr}
                notifications={[
                  {at: 10, text: '+128 ta like!'},
                  {at: SWITCH + 14, text: 'Yangi video!', color: COLORS.blue},
                ]}
              />
            </g>
          ) : null}
          {frame < PULL + 10 ? <FloatingIcons from={0} to={PULL} rate={3} area={[60, 500, 960, 1100]} /> : null}
          <FloatingShapes seed="soc" depth={0.8} colors={[COLORS.blueLight, COLORS.white]} count={6} />
          {/* 3 SOAT burst */}
          {frame >= UCH ? (
            <g transform={`translate(540 560) scale(${soat * 0.72}) rotate(${-8 + (1 - soat) * 30})`}>
              <path
                d="M 0 -260 L 70 -150 L 210 -200 L 170 -70 L 320 -20 L 180 50 L 250 190 L 100 140 L 40 270 L -40 140 L -190 220 L -150 70 L -320 20 L -170 -50 L -240 -190 L -80 -140 Z"
                fill={COLORS.yellow}
                stroke={COLORS.ink}
                strokeWidth={10}
                strokeLinejoin="round"
              />
            </g>
          ) : null}
        </Stage>
      </CameraMovement>
      {frame >= UCH ? (
        <At x={540} y={490}>
          <AnimatedText text="3 SOAT?!" from={UCH} entrance="slam" size={140} color={COLORS.red} strokeColor={COLORS.navy} stroke={16} rotate={-8} stagger={3} />
        </At>
      ) : null}
      <At x={540} y={110}>
        {frame < SWITCH ? (
          <AnimatedText text="5 DAQIQA..." from={b.l06.from} size={96} accentWords={['5']} entrance="drop" stagger={3} exitAt={SWITCH - 6} />
        ) : frame < PULL + 4 ? (
          <AnimatedText text="YANA 5 DAQIQA..." from={SWITCH + 2} size={88} accentWords={['5']} accent={COLORS.orange} entrance="drop" stagger={3} exitAt={PULL - 2} />
        ) : null}
      </At>
      <Sfx name="notification" at={10} volume={0.5} />
      <Sfx name="swish" at={4} volume={0.35} />
      <Sfx name="whoosh" at={SWITCH} volume={0.55} />
      {Array.from({length: Math.max(0, Math.floor((PULL - SWITCH) / 9))}).map((_, i) => (
        <Sfx key={i} name="swish" at={SWITCH + 9 * (i + 1)} volume={0.28} />
      ))}
      <Sfx name="notification" at={SWITCH + 14} volume={0.4} />
      <Sfx name="whoosh" at={PULL} volume={0.45} rate={0.8} />
      <Sfx name="clock_spin" at={PULL + 4} volume={0.6} />
      <Sfx name="boom" at={UCH - 1} volume={0.6} />
      <Sfx name="boing" at={UCH + 2} volume={0.45} />
    </AbsoluteFill>
  );
};
