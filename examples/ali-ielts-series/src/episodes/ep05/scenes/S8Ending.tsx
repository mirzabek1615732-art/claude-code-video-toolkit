import React from 'react';
import {AbsoluteFill, Img, staticFile, useCurrentFrame} from 'remotion';
import {DuckedSfx} from '../../../audio/EpisodeAudio';
import {AliCharacter, EXPRESSIONS, mixExpression, mixPose, POSES, type Expression, type Pose} from '../../../components/AliCharacter';
import {AnimatedText} from '../../../components/AnimatedText';
import {CameraMovement} from '../../../components/CameraMovement';
import {EASE, pop, track, tween} from '../../../components/anim';
import {COLORS} from '../../../theme';
import {wordAt, type TLScene} from '../../buildTimeline';
import {At, Stage} from '../../../scenes/Stage';
import {talkAmount} from './common';

const X = 540;
const Y = 2010;
const S = 1.5;

/** 0:52 — to camera: "do you have a professor friend?"; Ali sneaks the glasses back on — "Furthermore…" — the teacher takes them. Freeze, logo. */
export const S8Ending: React.FC<{scene: TLScene}> = ({scene}) => {
  const f = useCurrentFrame();
  const L = scene.lines;
  const Q = L.l14.localFrom;
  const PROF = wordAt(scene, 'l14', 3);
  const SNEAK = L.l14.localTo + 2;
  const ON = SNEAK + 12;
  const WHISPER = L.a03.localFrom;
  const GRAB = Math.max(L.a03.localTo + 4, WHISPER + 18);
  const FREEZE = GRAB + 14;
  const end = scene.durationInFrames;
  const frozen = f >= FREEZE;
  const ff = frozen ? FREEZE : f;
  const headY = Y - 505 * S;

  const pose = track<Pose>(
    ff,
    [
      {at: 0, v: {...POSES.pointAtViewer, lookX: 0, lookY: 0}},
      {at: PROF, v: {...POSES.stand, armL: [30, 50], armR: [30, 50], lookX: 0.1, lookY: 0, headTilt: 6}, dur: 5},
      {at: SNEAK, v: {...POSES.stand, armL: [20, 40], armR: [-10, -160], lookX: -0.8, lookY: 0.2, headTilt: -6, headTurn: -0.3}, dur: 6},
      {at: ON, v: {...POSES.stand, armL: [20, 40], armR: [-10, -150], lookX: 0.1, lookY: 0, headTilt: -8}, dur: 4},
      {at: GRAB, v: {...POSES.armsUpShock, armL: [130, 30], armR: [130, 30], lookX: 0.8, lookY: -0.6, headTilt: 6}, dur: 3},
    ],
    mixPose,
  );
  const expr = track<Expression>(
    ff,
    [
      {at: 0, v: EXPRESSIONS.confident},
      {at: PROF, v: mixExpression(EXPRESSIONS.confident, EXPRESSIONS.smug, 0.5), dur: 5},
      {at: SNEAK, v: EXPRESSIONS.suspicious, dur: 5},
      {at: ON, v: EXPRESSIONS.professor, dur: 5},
      {at: GRAB, v: mixExpression(EXPRESSIONS.embarrassed, EXPRESSIONS.shocked, 0.5), dur: 3},
    ],
    mixExpression,
  );
  const glassesOn = ff >= ON && ff < GRAB;
  // the teacher's hand: comes in from the right, plucks the glasses, leaves
  const handIn = tween(ff, [GRAB - 8, GRAB], [0, 1], EASE.out);
  const handOut = tween(f, [GRAB + 2, GRAB + 10], [0, 1], EASE.in);
  const hx = 1180 - (1180 - (X + 40)) * handIn + handOut * 600;
  const hy = headY - 20 - handOut * 200;
  const logo = pop(f, FREEZE + 8, 30, {damping: 14, stiffness: 160});

  return (
    <AbsoluteFill style={{background: '#F59E0B'}}>
      <CameraMovement focus={[540, 1200]} keys={[{f: 0, zoom: 1.08}, {f: 10, zoom: 1.0, ease: EASE.out}, {f: SNEAK, zoom: 1.0}, {f: ON + 4, zoom: 1.16, y: 120, ease: EASE.inOut}, {f: FREEZE, zoom: 1.16, y: 120}, {f: FREEZE + 4, zoom: 1.3, y: 160, ease: EASE.power4Out}, {f: end, zoom: 1.3, y: 160}]}>
        <Stage>
          <defs>
            <radialGradient id="e5-bg" cx="0.5" cy="0.45" r="0.8">
              <stop offset="0%" stopColor="#FDE68A" />
              <stop offset="100%" stopColor="#F59E0B" />
            </radialGradient>
          </defs>
          <rect width={1080} height={1920} fill="url(#e5-bg)" />
          {Array.from({length: 14}).map((_, i) => (
            <rect key={i} x={510} y={-1500} width={60} height={1500} fill={COLORS.white} opacity={0.08} transform={`translate(0 1150) rotate(${i * 25.7 + ff * 0.25} 540 0)`} />
          ))}
          <AliCharacter x={X} y={Y} scale={S} pose={pose} expression={expr} handL="open" handR="open" glasses={glassesOn ? 1.75 : 0} talk={talkAmount(ff, [L.a03]) * 0.5} frozen={frozen} blink={frozen ? 0 : undefined} shadow={0} />
          {/* glasses travel: from the pocket to the face, then away in the teacher's hand */}
          {ff >= SNEAK && ff < ON ? (
            <g transform={`translate(${X + 140 - tween(ff, [SNEAK, ON], [0, 140])} ${headY + 360 - tween(ff, [SNEAK, ON], [0, 360], EASE.inOut)}) scale(${S})`}>
              <circle cx={-40} r={34} fill="#DBEAFE" fillOpacity={0.3} stroke={COLORS.ink} strokeWidth={6} />
              <circle cx={40} r={34} fill="#DBEAFE" fillOpacity={0.3} stroke={COLORS.ink} strokeWidth={6} />
            </g>
          ) : null}
          {ff >= GRAB - 8 && f < GRAB + 12 ? (
            <g transform={`translate(${hx} ${hy})`}>
              <path d="M 0 0 L 420 -60" stroke={COLORS.ink} strokeWidth={70} strokeLinecap="round" />
              <path d="M 0 0 L 420 -60" stroke="#7C2D12" strokeWidth={58} strokeLinecap="round" />
              <circle r={34} fill="#D9A27A" stroke={COLORS.ink} strokeWidth={5} />
              {ff >= GRAB ? (
                <g transform={`translate(-30 10) scale(${S * 0.9})`}>
                  <circle cx={-40} r={34} fill="#DBEAFE" fillOpacity={0.3} stroke={COLORS.ink} strokeWidth={6} />
                  <circle cx={40} r={34} fill="#DBEAFE" fillOpacity={0.3} stroke={COLORS.ink} strokeWidth={6} />
                </g>
              ) : null}
            </g>
          ) : null}
        </Stage>
      </CameraMovement>
      {frozen ? (
        <AbsoluteFill>
          <AbsoluteFill style={{background: 'radial-gradient(circle, rgba(0,0,0,0) 0 3px, rgba(0,0,0,0.18) 3.5px)', backgroundSize: '14px 14px', mixBlendMode: 'multiply', opacity: tween(f, [FREEZE, FREEZE + 4], [0, 1])}} />
          <AbsoluteFill style={{border: `${tween(f, [FREEZE, FREEZE + 4], [0, 24])}px solid ${COLORS.white}`}} />
          {/* subtle sign-off: the official logo, centred */}
          <div style={{position: 'absolute', left: 0, right: 0, top: 560, display: 'flex', justifyContent: 'center', opacity: logo, transform: `scale(${0.85 + 0.15 * logo})`}}>
            <div style={{background: 'rgba(15,23,42,0.86)', borderRadius: 28, padding: '28px 40px'}}>
              <Img src={staticFile('brand/logo-watermark.png')} style={{width: 560}} />
            </div>
          </div>
        </AbsoluteFill>
      ) : null}
      <At x={540} y={235}>
        {f >= Q && f < WHISPER ? <AnimatedText text={'SENING HAM|PROFESSOR|DO‘STING BORMI?'} from={Q} stagger={4} entrance="pop" size={96} accentWords={['PROFESSOR']} accent={COLORS.yellow} /> : null}
        {f >= WHISPER && f < FREEZE + 6 ? <AnimatedText text={'“Furthermore…”'} from={WHISPER} stagger={1} entrance="pop" size={104} color={COLORS.white} /> : null}
      </At>
      <DuckedSfx name="swish" at={SNEAK} gainDb={-16} />
      <DuckedSfx name="whoosh" at={GRAB - 8} gainDb={-14} />
      <DuckedSfx name="record_scratch" at={FREEZE} gainDb={-14} />
      <DuckedSfx name="pop" at={FREEZE + 8} gainDb={-16} />
    </AbsoluteFill>
  );
};
