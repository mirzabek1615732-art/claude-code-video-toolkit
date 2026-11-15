import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {DuckedSfx} from '../../../audio/EpisodeAudio';
import {AliCharacter, EXPRESSIONS, POSES, type Pose} from '../../../components/AliCharacter';
import {BurstBackground} from '../../../components/AnimatedBackground';
import {AnimatedText} from '../../../components/AnimatedText';
import {CameraMovement} from '../../../components/CameraMovement';
import {Confetti} from '../../../components/Particles';
import {EASE, impactSquash, pop} from '../../../components/anim';
import {COLORS} from '../../../theme';
import {wordAt, type TLScene} from '../../buildTimeline';
import {At, Stage} from '../../../scenes/Stage';
import {Crowd, Podium, Trophy} from './common';

/** The dream set, drawable at any (possibly frozen) frame. */
export const DreamStage: React.FC<{f: number; scene: TLScene; frozen?: boolean}> = ({f, scene, frozen}) => {
  const JUMP = 6;
  const WIN = scene.lines.l07.localFrom;
  const air = Math.max(0, Math.min(1, (f - JUMP) / 12));
  const jumpY = f < JUMP ? 700 : (1 - air) * 700 - Math.sin(air * Math.PI) * 260;
  const dance = f >= JUMP + 14;
  const beat = f / 2.6;
  const hop = dance ? Math.abs(Math.sin(beat)) * 46 : 0;
  const pose: Pose = dance
    ? {...POSES.armsUpShock, armL: [130 + Math.sin(beat * 2) * 30, 20], armR: [150, 16], bodyTilt: Math.sin(beat) * 9, headTilt: Math.sin(beat + 1) * 8, legL: [10 + Math.sin(beat) * 14, -10], legR: [10 - Math.sin(beat) * 14, -10], lookY: -0.4}
    : {...POSES.armsUpShock, lookY: -0.5};
  const trophy = pop(f, JUMP + 10, 30, {damping: 9, stiffness: 200});
  return (
    <g>
      <BurstBackground a="#A855F7" b="#6D28D9" id="dream" speed={frozen ? 0 : 0.9} cx={540} cy={820} />
      {/* thought-cloud frame: this is all in Ali's head */}
      {[
        [0, 0, 190], [230, -40, 170], [450, -70, 150],
        [-30, 260, 140], [-40, 480, 110], [-50, 660, 80],
      ].map(([cx, cy, r], i) => (
        <circle key={i} cx={cx} cy={cy} r={r + (frozen ? 0 : Math.sin(f / 9 + i) * 6)} fill="#FFFFFF" opacity={0.92} />
      ))}
      <g transform="translate(540 1290)">
        <Podium />
      </g>
      <g transform={`translate(0 ${jumpY - hop})`}>
        {/* the giant golden 13 he is so proud of */}
        <g transform={`translate(${800 + (dance ? Math.sin(beat) * 16 : 0)} ${900}) rotate(${dance ? Math.sin(beat) * 8 : 0}) scale(${trophy})`}>
          <Trophy label="13" size={0.62} />
        </g>
        <AliCharacter x={540} y={1290} scale={1.02} squash={impactSquash(f, JUMP + 12, 0.22)} pose={pose} expression={EXPRESSIONS.ecstatic} handL="fist" handR="open" shadow={0} frozen={frozen} blink={frozen ? 0 : undefined} />
      </g>
      <Crowd t={f} y={2010} frozen={frozen} />
      <Confetti at={WIN} count={110} />
    </g>
  );
};

/** 0:20 — inside Ali's head: podium, golden 13, fans. He is celebrating the wrong answer. */
export const S4Celebrate: React.FC<{scene: TLScene}> = ({scene}) => {
  const f = useCurrentFrame();
  const WIN = scene.lines.l07.localFrom;
  const GENIUS = wordAt(scene, 'l08', 2); // "bayramni"
  const end = scene.durationInFrames;
  return (
    <AbsoluteFill style={{background: '#6D28D9'}}>
      <CameraMovement
        focus={[540, 1000]}
        keys={[
          {f: 0, zoom: 1.25},
          {f: 16, zoom: 1.0, ease: EASE.out},
          {f: WIN - 2, zoom: 1.0},
          {f: WIN + 4, zoom: 1.1, y: 0, ease: EASE.power4Out},
          {f: GENIUS - 2, zoom: 1.05, y: 0},
          {f: GENIUS + 4, zoom: 1.12, y: 0, rot: -3, ease: EASE.power4Out},
          {f: end, zoom: 1.06, rot: 2},
        ]}
        shakes={[
          {from: 18, duration: 8, amplitude: 10},
          {from: WIN, duration: 10, amplitude: 12},
        ]}
      >
        <Stage>
          <DreamStage f={f} scene={scene} />
        </Stage>
      </CameraMovement>
      <At x={540} y={235}>
        {f >= WIN && f < GENIUS ? <AnimatedText text={'O‘N UCH!|TOPDIM!'} from={WIN} stagger={5} entrance="slam" size={112} color={COLORS.yellow} accentWords={['TOPDIM!']} accent={COLORS.white} rotate={-4} /> : null}
        {f >= GENIUS ? <AnimatedText text={'MEN|GENIYMAN!'} from={GENIUS} stagger={5} entrance="slam" size={112} accentWords={['GENIYMAN!']} accent={COLORS.yellow} rotate={3} /> : null}
      </At>
      <DuckedSfx name="riser" at={0} gainDb={-10} />
      <DuckedSfx name="boing" at={6} gainDb={-8} />
      <DuckedSfx name="impact" at={18} gainDb={-8} />
      <DuckedSfx name="success" at={WIN} gainDb={-8} />
      <DuckedSfx name="pop" at={GENIUS} gainDb={-8} />
    </AbsoluteFill>
  );
};
