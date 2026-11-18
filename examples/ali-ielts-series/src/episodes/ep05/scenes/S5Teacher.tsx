import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {DuckedSfx} from '../../../audio/EpisodeAudio';
import {AliCharacter, EXPRESSIONS, GradCap, mixExpression, mixPose, POSES, type Expression, type Pose} from '../../../components/AliCharacter';
import {AnimatedText} from '../../../components/AnimatedText';
import {CameraMovement} from '../../../components/CameraMovement';
import {mixFace, TEACHER_FACES, TeacherCharacter, type TeacherFace} from '../../../components/TeacherCharacter';
import {EASE, track, tween} from '../../../components/anim';
import {COLORS} from '../../../theme';
import {type TLScene} from '../../buildTimeline';
import {At, Stage} from '../../../scenes/Stage';
import {Classroom, Loading, talkAmount} from './common';

const ALI = {x: 300, y: 1880, s: 1.12};
const TEA = {x: 770, y: 1880, s: 1.22};

/** 0:28 — "Ali, nima demoqchisan?" … silence, loading, crickets, the cap slides off … "O‘zim ham bilmayman!" */
export const S5Teacher: React.FC<{scene: TLScene}> = ({scene}) => {
  const f = useCurrentFrame();
  const L = scene.lines;
  const ASK = L.t01.localFrom;
  const ASKED = L.t01.localTo;
  const ANS = L.a02.localFrom;
  const DONE = L.a02.localTo;
  const end = scene.durationInFrames;
  const silent = f >= ASKED && f < ANS;
  const capFall = tween(f, [ASKED + 16, ANS - 2], [0, 1], EASE.in);

  const face = track<TeacherFace>(
    f,
    [
      {at: 0, v: TEACHER_FACES.reading},
      {at: 18, v: mixFace(TEACHER_FACES.reading, TEACHER_FACES.skeptical, 0.5), dur: 16},
      {at: ASK - 8, v: TEACHER_FACES.skeptical, dur: 10},
      {at: ANS + 4, v: mixFace(TEACHER_FACES.skeptical, TEACHER_FACES.disappointed, 0.4), dur: 6},
      {at: DONE + 2, v: TEACHER_FACES.disappointed, dur: 10},
    ],
    mixFace,
  );
  const tLook = f < ASK - 8 ? {x: 0, y: 0.8} : {x: -1, y: 0.1};
  const pose = track<Pose>(
    f,
    [
      {at: 0, v: {...POSES.stand, armL: [20, 40], armR: [20, 40], lookX: 0.8, lookY: 0, headTilt: -4}},
      {at: ASK, v: {...POSES.stand, armL: [14, 20], armR: [14, 20], lookX: 0.8, lookY: -0.1, headTilt: 0}, dur: 4},
      {at: ASKED + 4, v: {...POSES.stand, armL: [10, 10], armR: [10, 10], lookX: 0.2, lookY: -0.5, headTilt: 4}, dur: 12},
      {at: ANS - 2, v: {...POSES.shrug, armL: [60, 75], armR: [60, 75], lookX: 0.6, lookY: 0.2, headTilt: 10}, dur: 5},
    ],
    mixPose,
  );
  const expr = track<Expression>(
    f,
    [
      {at: 0, v: EXPRESSIONS.professor},
      {at: ASK + 6, v: mixExpression(EXPRESSIONS.professor, EXPRESSIONS.shocked, 0.4), dur: 6},
      {at: ASKED + 4, v: EXPRESSIONS.blank, dur: 10},
      {at: ANS - 2, v: EXPRESSIONS.embarrassed, dur: 5},
    ],
    mixExpression,
  );
  const aliHead = {x: ALI.x, y: ALI.y - 600 * ALI.s};
  const teaHead = {x: TEA.x, y: TEA.y - 520 * TEA.s};
  // the camera: wide → slow push on Ali during the silence → snap to the teacher's face after the answer
  return (
    <AbsoluteFill style={{background: '#C7D2B5'}}>
      <CameraMovement
        focus={[540, 1150]}
        keys={[
          {f: 0, zoom: 1.0, x: 0, y: 0},
          {f: ASKED, zoom: 1.0, x: 0, y: 0},
          {f: ANS - 2, zoom: 1.22, x: 540 - aliHead.x, y: 1150 - aliHead.y - 120, ease: EASE.inOut},
          {f: DONE, zoom: 1.22, x: 540 - aliHead.x, y: 1150 - aliHead.y - 120},
          {f: DONE + 5, zoom: 2.1, x: 540 - teaHead.x, y: 1150 - teaHead.y - 40, ease: EASE.power4Out},
          {f: end, zoom: 2.16, x: 540 - teaHead.x, y: 1150 - teaHead.y - 40},
        ]}
      >
        <Stage>
          <Classroom />
          <TeacherCharacter x={TEA.x} y={TEA.y} scale={TEA.s} face={face} lookX={tLook.x} lookY={tLook.y} headTilt={f >= DONE ? 4 : 0} talk={talkAmount(f, [L.t01])} armL={f < ASK - 6 ? 'paper' : 'hip'} armR={f < ASK - 6 ? 'paper' : 'down'} />
          <AliCharacter x={ALI.x} y={ALI.y} scale={ALI.s} pose={pose} expression={expr} handL="open" handR="open" glasses={1.75} gradCap={capFall <= 0} talk={talkAmount(f, [L.a02])} shadow={0} />
          {capFall > 0 && capFall < 1.01 ? <GradCap x={ALI.x + 18 + capFall * 130} y={aliHead.y - 30 + capFall * (ALI.y - aliHead.y - 10)} tilt={-8 + capFall * 120} tassel={capFall} /> : null}
          {f >= ANS - 2 ? <GradCap x={ALI.x + 148} y={ALI.y - 30} tilt={112} tassel={1} /> : null}
          {silent && f >= ASKED + 8 ? (
            <g transform={`translate(${aliHead.x} ${aliHead.y - 150})`}>
              <Loading t={f} />
            </g>
          ) : null}
          {/* tiny crickets in the corner during the silence */}
          {silent
            ? [0, 1].map((i) => (
                <g key={i} transform={`translate(${880 + i * 70} ${1700 + (i ? 30 : 0)}) scale(0.8)`}>
                  <ellipse rx={30} ry={14} fill="#365314" stroke={COLORS.ink} strokeWidth={4} />
                  <path d={`M 20 -6 L ${46 + Math.sin(f) * 4} -40`} stroke={COLORS.ink} strokeWidth={4} />
                  <path d="M -10 10 L -26 30 M 6 10 L 14 30" stroke={COLORS.ink} strokeWidth={4} />
                </g>
              ))
            : null}
        </Stage>
      </CameraMovement>
      <At x={540} y={235}>{f >= ANS + 2 && f < DONE + 4 ? <AnimatedText text={'O‘ZIM HAM|BILMAYMAN!'} from={ANS + 2} stagger={5} entrance="pop" size={112} accentWords={['BILMAYMAN!']} accent={COLORS.yellow} rotate={-3} /> : null}</At>
      <DuckedSfx name="paper" at={ASK - 8} gainDb={-14} />
      <DuckedSfx name="crickets" at={ASKED + 6} gainDb={-16} />
      <DuckedSfx name="slide_down" at={ASKED + 16} gainDb={-18} />
      <DuckedSfx name="impact" at={DONE + 5} gainDb={-16} />
    </AbsoluteFill>
  );
};
