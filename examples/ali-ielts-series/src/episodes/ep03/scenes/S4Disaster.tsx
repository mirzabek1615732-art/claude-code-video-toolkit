import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {DuckedSfx} from '../../../audio/EpisodeAudio';
import {AliCharacter, EXPRESSIONS, mixExpression, mixPose, POSES, type Expression, type Pose} from '../../../components/AliCharacter';
import {AnimatedText} from '../../../components/AnimatedText';
import {CameraMovement} from '../../../components/CameraMovement';
import {SpeedLines} from '../../../components/AnimatedBackground';
import {EASE, pop, track, tween} from '../../../components/anim';
import {COLORS} from '../../../theme';
import {wordAt, type TLScene} from '../../buildTimeline';
import {At, Stage} from '../../../scenes/Stage';
import {Countdown, SweatBurst} from './common';

/** 0:14 — the time disaster: countdown, panic, TIK-TAK, freeze-frame. */
export const S4Disaster: React.FC<{scene: TLScene}> = ({scene}) => {
  const raw = useCurrentFrame();
  const NOTICE = wordAt(scene, 'l07', 4); // "birinchi"
  const TIK1 = wordAt(scene, 'l08', 0);
  const TIK2 = wordAt(scene, 'l08', 1);
  const ticks = [TIK1, Math.round((TIK1 + TIK2) / 2), TIK2, Math.round(TIK2 + (TIK2 - TIK1) / 2)];
  const VAQT = wordAt(scene, 'l09', 2); // "Vaqt"
  const FREEZE = Math.min(scene.durationInFrames - 14, scene.lines.l09.localTo + 2);
  const end = scene.durationInFrames;
  const frozen = raw >= FREEZE;
  const f = frozen ? FREEZE : raw; // everything holds on the freeze-frame

  // countdown races: 50:00 → 47:xx, faster during the panic
  const secs = interpolate(f, [0, end], [3000, 2832]);
  const label = `${Math.floor(secs / 60)}:${String(Math.floor(secs % 60)).padStart(2, '0')}`;
  const pulse = ticks.reduce((m, t) => Math.max(m, f >= t ? Math.exp(-(f - t) / 3) : 0), 0);

  const pose = track<Pose>(
    f,
    [
      {at: 0, v: {...POSES.stand, armL: [-14, -88], armR: [-14, -88], lookY: 0.9, headTilt: 6}},
      {at: NOTICE - 4, v: {...POSES.stand, armL: [-14, -88], armR: [40, -120], lookY: 0.6, lookX: -0.8, headTurn: -0.4, headTilt: -4}, dur: 5},
      {at: TIK1 - 2, v: {...POSES.armsUpShock, lookY: -0.4, lookX: 0.6, headTurn: 0.3}, dur: 4},
      {at: VAQT - 3, v: {...POSES.armsUpShock, armL: [160, 20], armR: [160, 20], lookY: 0, headTilt: -8}, dur: 4},
    ],
    mixPose,
  );
  const expr = track<Expression>(
    f,
    [
      {at: 0, v: EXPRESSIONS.focused},
      {at: NOTICE, v: mixExpression(EXPRESSIONS.shocked, EXPRESSIONS.focused, 0.3), dur: 4},
      {at: TIK1 - 2, v: EXPRESSIONS.panic, dur: 3},
    ],
    mixExpression,
  );
  const sheet = pop(f, NOTICE - 2, 30, {damping: 12, stiffness: 180});
  const tremble = f >= TIK1 ? Math.sin(f * 2.2) * 4 : 0;

  return (
    <AbsoluteFill style={{background: '#3A0D16'}}>
      <CameraMovement
        focus={[540, 980]}
        keys={[
          {f: 0, zoom: 1.0},
          {f: NOTICE, zoom: 1.04},
          {f: TIK1, zoom: 1.08},
          {f: VAQT - 2, zoom: 1.08},
          {f: VAQT + 3, zoom: 1.3, y: 120, ease: EASE.power4Out},
          {f: FREEZE, zoom: 1.34, y: 120},
          {f: FREEZE + 4, zoom: 1.75, y: 260, ease: EASE.power4Out},
          {f: end, zoom: 1.78, y: 260},
        ]}
        shakes={ticks.map((t) => ({from: t, duration: 6, amplitude: 9}))}
      >
        <Stage>
          <defs>
            <radialGradient id="dz-bg" cx="0.5" cy="0.4" r="0.8">
              <stop offset="0%" stopColor="#7F1D1D" />
              <stop offset="100%" stopColor="#1A0509" />
            </radialGradient>
          </defs>
          <rect width={1080} height={1920} fill="url(#dz-bg)" />
          {/* giant countdown behind Ali */}
          <g transform="translate(540 760)" opacity={0.95}>
            <Countdown r={330} remaining={secs / 3600} label={label} pulse={pulse} danger={f >= TIK1} />
          </g>
          {/* answer sheet: only question 1 attempted */}
          <g transform={`translate(${200 + (1 - sheet) * -400} 1150) rotate(-6)`}>
            <rect x={-150} y={-230} width={300} height={400} rx={16} fill="#FFFDF7" stroke={COLORS.ink} strokeWidth={6} />
            <text x={0} y={-180} textAnchor="middle" fontFamily="Montserrat" fontWeight={900} fontSize={30} fill={COLORS.navy}>
              ANSWER SHEET
            </text>
            {Array.from({length: 7}).map((_, i) => (
              <g key={i}>
                <text x={-120} y={-120 + i * 46} fontFamily="Montserrat" fontWeight={800} fontSize={26} fill={COLORS.navy}>
                  {i + 1}.
                </text>
                <rect x={-80} y={-142 + i * 46} width={190} height={30} rx={6} fill={i === 0 ? '#FDE68A' : '#F1F5F9'} stroke="#94A3B8" strokeWidth={3} />
                {i === 0 ? (
                  <text x={15} y={-118} textAnchor="middle" fontFamily="Montserrat" fontWeight={900} fontSize={26} fill={COLORS.red}>
                    ???
                  </text>
                ) : null}
              </g>
            ))}
            <g transform="translate(70 150) rotate(-10)">
              <rect x={-70} y={-34} width={140} height={60} rx={12} fill={COLORS.red} stroke={COLORS.ink} strokeWidth={4} />
              <text y={8} textAnchor="middle" fontFamily="Montserrat" fontWeight={900} fontSize={34} fill={COLORS.white}>
                1/40
              </text>
            </g>
          </g>
          <g transform={`translate(${tremble} 0)`}>
            <AliCharacter x={640} y={1960} scale={1.5} pose={pose} expression={expr} handL="open" handR="open" shadow={0} frozen={frozen} blink={frozen ? 0 : undefined} />
          </g>
          {f >= NOTICE ? <SweatBurst x={640} y={1960 - 505 * 1.5} t={raw - NOTICE} seed="dz" count={f >= TIK1 ? 8 : 3} /> : null}
          {/* TIK / TAK bursts on the beat */}
          {ticks.map((t, i) =>
            f >= t && f < t + 12 ? (
              <text
                key={t}
                x={i % 2 ? 860 : 220}
                y={430 + (i % 2) * 60}
                textAnchor="middle"
                fontFamily="Montserrat"
                fontWeight={900}
                fontSize={110 * (1 + (1 - (f - t) / 12) * 0.25)}
                fill={i % 2 ? COLORS.yellow : COLORS.white}
                stroke={COLORS.navy}
                strokeWidth={12}
                paintOrder="stroke"
                opacity={1 - (f - t) / 12}
                transform={`rotate(${i % 2 ? 10 : -10} ${i % 2 ? 860 : 220} ${430 + (i % 2) * 60})`}
              >
                {i % 2 ? 'TAK!' : 'TIK!'}
              </text>
            ) : null,
          )}
          {f >= VAQT && f < VAQT + 14 ? <SpeedLines cx={640} cy={1000} opacity={1 - (f - VAQT) / 14} seed="dz" /> : null}
        </Stage>
      </CameraMovement>
      {/* freeze-frame treatment: halftone, frame border, label */}
      {frozen ? (
        <AbsoluteFill>
          <AbsoluteFill style={{background: 'radial-gradient(circle, rgba(0,0,0,0) 0 3px, rgba(0,0,0,0.25) 3.5px)', backgroundSize: '14px 14px', mixBlendMode: 'multiply', opacity: tween(raw, [FREEZE, FREEZE + 4], [0, 1])}} />
          <AbsoluteFill style={{border: `${tween(raw, [FREEZE, FREEZE + 4], [0, 26])}px solid ${COLORS.white}`}} />
          <div style={{position: 'absolute', left: 60, top: 1110, transform: `rotate(-8deg) scale(${pop(raw, FREEZE + 2)})`, background: COLORS.yellow, border: `6px solid ${COLORS.navy}`, padding: '8px 26px', fontFamily: 'Montserrat', fontWeight: 900, fontSize: 52, color: COLORS.navy}}>
            STOP-KADR!
          </div>
        </AbsoluteFill>
      ) : null}
      <At x={540} y={220}>
        {raw >= VAQT ? (
          <AnimatedText text={'VAQT QAYERGA|KETDI?!'} from={VAQT} stagger={wordAt(scene, 'l09', 3) - VAQT} entrance="slam" size={104} accentWords={['KETDI?!']} accent={COLORS.yellow} rotate={-4} />
        ) : null}
      </At>
      {ticks.map((t) => (
        <DuckedSfx key={t} name="tick" at={t} gainDb={-2} />
      ))}
      <DuckedSfx name="slide_down" at={NOTICE} gainDb={-10} />
      <DuckedSfx name="dramatic_hit" at={VAQT} gainDb={-8} />
      <DuckedSfx name="record_scratch" at={FREEZE} gainDb={-6} />
    </AbsoluteFill>
  );
};
