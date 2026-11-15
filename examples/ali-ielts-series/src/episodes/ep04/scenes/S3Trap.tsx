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
import {AudioPlayer, QuestionCard} from './common';
import {SpotlightRoom} from './S2Begins';

/** 0:12 — the trap: "thirteen… Sorry, I mean thirty." Ali writes 13 and stops listening. */
export const S3Trap: React.FC<{scene: TLScene}> = ({scene}) => {
  const f = useCurrentFrame();
  const e = scene.lines.e01;
  const W = (i: number) => wordAt(scene, 'e01', i);
  const T13 = W(3);
  const SORRY = W(4);
  const T30 = W(7);
  const end = scene.durationInFrames;
  const speaking = f >= e.localFrom && f <= e.localTo;
  const words1 = ['Take', 'bus', 'number', 'thirteen…'];
  const words2 = ['Sorry,', 'I', 'mean', 'thirty.'];

  const pose = track<Pose>(
    f,
    [
      {at: 0, v: {...POSES.stand, armL: [20, 40], armR: [24, -96], lookY: -0.6}},
      {at: T13 + 2, v: {...POSES.stand, armL: [20, 40], armR: [30, -60], lookY: 0.8, lookX: 0.3, headTilt: 8}, dur: 3},
      {at: T13 + 14, v: {...POSES.armsUpShock, armL: [150, 20], armR: [150, 20], headTilt: -6, lookY: -0.6}, dur: 4},
    ],
    mixPose,
  );
  const expr = track<Expression>(
    f,
    [
      {at: 0, v: EXPRESSIONS.focused},
      {at: T13, v: EXPRESSIONS.idea, dur: 3},
      {at: T13 + 14, v: EXPRESSIONS.ecstatic, dur: 4},
    ],
    mixExpression,
  );
  const party = f >= T13 + 14;
  const bop = party ? Math.sin(f / 2.2) * 7 : 0;
  const hop = party ? Math.abs(Math.sin(f / 2.2)) * 18 : 0;
  const write = tween(f, [T13 + 3, T13 + 12], [0, 1]);
  const badge = (n: string, at: number, bg: string) =>
    f >= at ? (
      <span style={{display: 'inline-block', marginLeft: 6, background: bg, color: COLORS.white, border: `4px solid ${COLORS.ink}`, borderRadius: 16, padding: '0 14px', fontWeight: 900, transform: `scale(${pop(f, at, 30, {damping: 8, stiffness: 260})}) rotate(-4deg)`}}>{n}</span>
    ) : null;
  const tag = pop(f, SORRY, 30, {damping: 10, stiffness: 220});

  return (
    <AbsoluteFill style={{background: '#0B1226'}}>
      <CameraMovement
        focus={[540, 760]}
        keys={[
          {f: 0, zoom: 1.0},
          {f: T13 - 2, zoom: 1.0},
          {f: T13 + 4, zoom: 1.08, ease: EASE.power4Out},
          {f: SORRY - 4, zoom: 1.08},
          {f: SORRY + 4, zoom: 1.0, ease: EASE.out},
          {f: end, zoom: 1.03},
        ]}
        shakes={[{from: T13, duration: 6, amplitude: 8}]}
      >
        <Stage>
          <SpotlightRoom light={1} />
          <g transform="translate(540 380) scale(0.86)">
            <AudioPlayer t={f} level={speaking ? 1 : 0} progress={tween(f, [e.localFrom, e.localTo], [0.05, 0.4])} />
          </g>
          <g transform="translate(540 900) scale(0.9)">
            <QuestionCard answer="13" write={write} />
          </g>
          <g transform={`translate(0 ${-hop}) rotate(${bop} 540 1500)`}>
            <AliCharacter x={540} y={1850} scale={1.25} pose={pose} expression={expr} handL={party ? 'fist' : 'open'} handR="fist" itemR={party ? 'none' : 'pen'} blink={party ? 0.85 : undefined} headphones shadow={0} />
          </g>
          <Desk x={540} y={1400} width={980} toFloor />
          {/* he is humming, not listening */}
          {party
            ? [0, 1, 2].map((i) => {
                const p = ((f - T13 - 14 + i * 14) % 42) / 42;
                return (
                  <text key={i} x={[250, 830, 760][i] + Math.sin(p * 6 + i) * 20} y={1250 - p * 220} fontFamily="Georgia, serif" fontSize={80} fill={COLORS.yellow} opacity={1 - p} stroke={COLORS.ink} strokeWidth={4} paintOrder="stroke">
                    ♪
                  </text>
                );
              })
            : null}
        </Stage>
        {/* what the speaker says, word by word */}
        <div style={{position: 'absolute', left: 70, right: 70, top: 540, background: COLORS.white, border: `6px solid ${COLORS.ink}`, borderRadius: 30, padding: '18px 30px', boxShadow: '8px 10px 0 rgba(0,0,0,0.4)', fontFamily: FONT_FAMILY, fontWeight: 800, fontSize: 50, lineHeight: 1.4, color: COLORS.navy, minHeight: 180, whiteSpace: 'nowrap', transform: `scale(${pop(f, e.localFrom - 3)})`, transformOrigin: 'center top'}}>
          <div>
            {words1.map((w, i) => (
              <span key={w} style={{opacity: f >= W(i) ? 1 : 0, marginRight: 12, color: i === 3 ? COLORS.red : COLORS.navy, textDecoration: i === 3 && f >= SORRY ? 'line-through' : undefined, fontWeight: i === 3 ? 900 : 800}}>
                {w}
              </span>
            ))}
            {badge('13', T13 + 2, COLORS.red)}
          </div>
          <div>
            {words2.map((w, i) => (
              <span key={w} style={{opacity: f >= W(4 + i) ? 1 : 0, marginRight: 14, background: i === 3 && f >= T30 ? '#86EFAC' : undefined, borderRadius: 10, padding: i === 3 ? '0 8px' : undefined, fontWeight: 900, color: i === 3 ? '#166534' : COLORS.navy}}>
                {w}
              </span>
            ))}
            {badge('30', T30 + 2, COLORS.green)}
          </div>
        </div>
        {f >= SORRY ? (
          <div style={{position: 'absolute', left: 40, top: 498, transform: `rotate(-6deg) scale(${tag})`, background: COLORS.red, color: COLORS.white, border: `5px solid ${COLORS.ink}`, borderRadius: 14, padding: '4px 18px', fontFamily: FONT_FAMILY, fontWeight: 900, fontSize: 38}}>TUZATISH!</div>
        ) : null}
      </CameraMovement>
      <DuckedSfx name="pop" at={T13} gainDb={-10} />
      <DuckedSfx name="typing" at={T13 + 3} gainDb={-12} />
      <DuckedSfx name="notification" at={SORRY} gainDb={-14} />
      <DuckedSfx name="ding" at={T30 + 16} gainDb={-10} />
    </AbsoluteFill>
  );
};
