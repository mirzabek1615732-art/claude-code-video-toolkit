import React from 'react';
import {AbsoluteFill, Freeze, useCurrentFrame} from 'remotion';
import {DuckedSfx} from '../../../audio/EpisodeAudio';
import {AliCharacter, EXPRESSIONS, mixExpression, mixPose, POSES, type Expression, type Pose} from '../../../components/AliCharacter';
import {CameraMovement} from '../../../components/CameraMovement';
import {EASE, pop, track, tween} from '../../../components/anim';
import {COLORS, FONT_FAMILY} from '../../../theme';
import {wordAt, type TLScene} from '../../buildTimeline';
import {Stage} from '../../../scenes/Stage';
import {EP04} from '../timeline';
import {Cross, StormCloud, Tick, Trophy} from './common';
import {DreamStage} from './S4Celebrate';

/** 0:28 — record scratch: the dream freezes, the replay shows the correction, 13 becomes 30. */
export const S5Reality: React.FC<{scene: TLScene}> = ({scene}) => {
  const f = useCurrentFrame();
  const dream = EP04.scenes.find((s) => s.id === 'celebrate')!;
  const WAKE = scene.lines.l10.localFrom - 4; // cut from the frozen dream to reality
  const SORRY = wordAt(scene, 'l10', 1); // “sorry”
  const ANS = scene.lines.l11.localFrom;
  const SHAKE = wordAt(scene, 'l11', 1); // "o‘n"
  const T30 = wordAt(scene, 'l11', 4); // "O‘TTIZ"
  const end = scene.durationInFrames;

  if (f < WAKE) {
    const grey = tween(f, [0, 8], [0, 0.85]);
    return (
      <AbsoluteFill style={{background: '#6D28D9'}}>
        <CameraMovement focus={[540, 900]} keys={[{f: 0, zoom: 1.1, rot: 2}, {f: 6, zoom: 1.3, rot: -2, ease: EASE.power4Out}, {f: WAKE, zoom: 1.36, rot: -2}]} shakes={[{from: 0, duration: 8, amplitude: 14}]}>
          <AbsoluteFill style={{filter: `grayscale(${grey}) brightness(${1 - grey * 0.25})`}}>
            <Stage>
              <Freeze frame={dream.durationInFrames - 1}>
                <DreamStage f={dream.durationInFrames - 1} scene={dream} frozen />
              </Freeze>
            </Stage>
          </AbsoluteFill>
        </CameraMovement>
        {/* pause badge */}
        <div style={{position: 'absolute', left: 0, right: 0, top: 250, display: 'flex', justifyContent: 'center', transform: `scale(${pop(f, 2, 30, {damping: 9, stiffness: 240})})`}}>
          <div style={{display: 'flex', gap: 26, background: COLORS.white, border: `8px solid ${COLORS.ink}`, borderRadius: 40, padding: '34px 44px', boxShadow: '10px 12px 0 rgba(0,0,0,0.4)'}}>
            <div style={{width: 40, height: 130, background: COLORS.red, borderRadius: 10}} />
            <div style={{width: 40, height: 130, background: COLORS.red, borderRadius: 10}} />
          </div>
        </div>
        <DuckedSfx name="record_scratch" at={0} gainDb={-4} />
      </AbsoluteFill>
    );
  }

  const pose = track<Pose>(
    f,
    [
      {at: WAKE, v: {...POSES.armsUpShock, armL: [150, 20], armR: [150, 20], lookY: -0.5}},
      {at: SORRY - 2, v: {...POSES.stand, armL: [30, 50], armR: [30, 50], lookX: -0.2, lookY: -0.9, headTilt: -6}, dur: 5},
      {at: T30, v: {...POSES.stand, armL: [-12, -160], armR: [-12, -160], lookX: -0.7, lookY: -0.7, headTilt: 8, bodyY: 8}, dur: 4},
    ],
    mixPose,
  );
  const expr = track<Expression>(
    f,
    [
      {at: WAKE, v: EXPRESSIONS.ecstatic},
      {at: SORRY - 2, v: mixExpression(EXPRESSIONS.suspicious, EXPRESSIONS.shocked, 0.4), dur: 5},
      {at: SHAKE, v: EXPRESSIONS.shocked, dur: 4},
      {at: T30, v: EXPRESSIONS.panic, dur: 3},
      {at: T30 + 26, v: EXPRESSIONS.devastated, dur: 8},
    ],
    mixExpression,
  );
  const replay = pop(f, WAKE + 2, 30, {damping: 13, stiffness: 180});
  const hl = tween(f, [SORRY, SORRY + 10], [0, 1]);
  const trophyIn = pop(f, ANS - 6, 30, {damping: 11, stiffness: 190});
  const crack = tween(f, [SHAKE, T30], [0, 1]);
  const shake = f >= SHAKE && f < T30 ? Math.sin(f * 2.6) * (4 + crack * 12) : 0;
  const morph = pop(f, T30, 30, {damping: 8, stiffness: 230});
  const cloud = tween(f, [T30 + 4, T30 + 22], [0, 1], EASE.out);
  const flash = f >= T30 + 24 && f < T30 + 30 ? 1 : 0;

  return (
    <AbsoluteFill style={{background: '#1F2937'}}>
      <CameraMovement
        focus={[540, 1000]}
        keys={[
          {f: WAKE, zoom: 1.15},
          {f: WAKE + 8, zoom: 1.0, ease: EASE.out},
          {f: T30 - 2, zoom: 1.0},
          {f: T30 + 4, zoom: 1.1, y: 60, ease: EASE.power4Out},
          {f: end, zoom: 1.14, y: 80},
        ]}
        shakes={[
          {from: WAKE, duration: 8, amplitude: 12},
          {from: T30, duration: 12, amplitude: 16},
        ]}
      >
        <Stage>
          <defs>
            <radialGradient id="rl-bg" cx="0.5" cy="0.45" r="0.8">
              <stop offset="0%" stopColor="#475569" />
              <stop offset="100%" stopColor="#0F172A" />
            </radialGradient>
          </defs>
          <rect width={1080} height={1920} fill="url(#rl-bg)" />
          <AliCharacter x={540} y={1850} scale={1.25} pose={pose} expression={expr} handL="open" handR="open" headphones shadow={0} />
          {/* golden 13 cracks and becomes the real answer */}
          {f >= ANS - 6 ? (
            <g transform={`translate(${250 + shake} 1040)`}>
              {morph < 0.5 ? (
                <g transform={`scale(${trophyIn * (1 - morph)})`}>
                  <Trophy label="13" size={0.72} crack={crack} dull={crack} />
                </g>
              ) : null}
              {f >= T30 ? (
                <g transform={`translate(0 -130) scale(${morph}) rotate(-6)`}>
                  <circle r={150} fill={COLORS.green} stroke={COLORS.ink} strokeWidth={9} />
                  <text y={62} textAnchor="middle" fontFamily="Montserrat" fontWeight={900} fontSize={180} fill={COLORS.white} stroke={COLORS.ink} strokeWidth={10} paintOrder="stroke">
                    30
                  </text>
                </g>
              ) : null}
            </g>
          ) : null}
          {cloud > 0 ? (
            <g transform={`translate(${1300 - cloud * 700} ${930}) scale(0.85)`}>
              <StormCloud t={f} flash={flash} />
            </g>
          ) : null}
          {/* 13 ✗  30 ✓ */}
          {f >= T30 ? (
            <g transform={`translate(430 330) scale(${morph}) rotate(-3)`}>
              <text x={-190} y={50} textAnchor="middle" fontFamily="Montserrat" fontWeight={900} fontSize={150} fill={COLORS.white} stroke={COLORS.ink} strokeWidth={14} paintOrder="stroke">
                13
              </text>
              <g transform="translate(-50 0)">
                <Cross r={52} />
              </g>
              <text x={160} y={50} textAnchor="middle" fontFamily="Montserrat" fontWeight={900} fontSize={150} fill={COLORS.yellow} stroke={COLORS.ink} strokeWidth={14} paintOrder="stroke">
                30
              </text>
              <g transform="translate(305 0)">
                <Tick r={52} />
              </g>
            </g>
          ) : null}
        </Stage>
        {/* replay of what the speaker really said */}
        <div style={{position: 'absolute', left: 60, right: 60, top: 300 + 170 * tween(f, [T30 - 4, T30 + 4], [0, 1], EASE.inOut), transform: `scale(${replay})`, transformOrigin: 'center top', background: COLORS.white, border: `6px solid ${COLORS.ink}`, borderRadius: 30, padding: '16px 28px 20px', boxShadow: '8px 10px 0 rgba(0,0,0,0.4)', fontFamily: FONT_FAMILY, color: COLORS.navy}}>
          <div style={{fontWeight: 900, fontSize: 28, letterSpacing: 4, color: COLORS.blue}}>◀◀ QAYTA ESHITAMIZ</div>
          <div style={{fontWeight: 800, fontSize: 52, lineHeight: 1.3}}>
            Take bus number <span style={{color: COLORS.red, textDecoration: 'line-through', fontWeight: 900}}>thirteen</span>…
          </div>
          <div style={{fontWeight: 900, fontSize: 60, lineHeight: 1.3}}>
            <span style={{backgroundImage: `linear-gradient(${COLORS.yellow}, ${COLORS.yellow})`, backgroundRepeat: 'no-repeat', backgroundSize: `${hl * 100}% 86%`, backgroundPosition: '0 60%', padding: '0 6px'}}>Sorry, I mean</span>{' '}
            <span style={{color: '#15803D'}}>thirty.</span>
          </div>
        </div>
      </CameraMovement>
      <DuckedSfx name="glass_burst" at={WAKE} gainDb={-10} />
      <DuckedSfx name="notification" at={SORRY} gainDb={-10} />
      <DuckedSfx name="tick" at={SHAKE} gainDb={-8} />
      <DuckedSfx name="dramatic_hit" at={T30} gainDb={-8} />
      <DuckedSfx name="boom" at={T30 + 24} gainDb={-10} />
    </AbsoluteFill>
  );
};
