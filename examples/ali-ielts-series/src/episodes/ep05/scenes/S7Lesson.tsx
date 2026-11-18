import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {DuckedSfx} from '../../../audio/EpisodeAudio';
import {AliCharacter, EXPRESSIONS, mixExpression, mixPose, POSES, type Expression, type Pose} from '../../../components/AliCharacter';
import {CameraMovement} from '../../../components/CameraMovement';
import {EASE, pop, track, tween} from '../../../components/anim';
import {COLORS, FONT_FAMILY} from '../../../theme';
import {wordAt, type TLScene} from '../../buildTimeline';
import {Stage} from '../../../scenes/Stage';
import {SERIF} from './common';

const hl = (p: number, color: string): React.CSSProperties => ({
  backgroundImage: `linear-gradient(${color}, ${color})`,
  backgroundRepeat: 'no-repeat',
  backgroundSize: `${Math.max(0, Math.min(1, p)) * 100}% 80%`,
  backgroundPosition: '0 70%',
  fontWeight: 700,
});

/** 0:40 — side by side: overcomplicated vs clear; what Writing actually rewards; Ali finally understands his sentence. */
export const S7Lesson: React.FC<{scene: TLScene}> = ({scene}) => {
  const f = useCurrentFrame();
  const L = scene.lines;
  const A = L.l10.localFrom;
  const CHK = [wordAt(scene, 'l11', 1), wordAt(scene, 'l11', 2), wordAt(scene, 'l11', 5), wordAt(scene, 'l11', 6)];
  const E = L.e02;
  const DEV = wordAt(scene, 'e02', 4);
  const KNOW = wordAt(scene, 'e02', 6);
  const THINK = wordAt(scene, 'e02', 8);
  const GOT = L.l13.localFrom;
  const end = scene.durationInFrames;
  const checklist = ['Aniq fikr (clear ideas)', 'Mavzuga mos so‘zlar (relevant vocabulary)', 'To‘g‘ri grammatika (accurate grammar)', 'O‘rinli so‘z tanlash (appropriate word choice)'];
  const cardB = pop(f, E.localFrom - 4, 30, {damping: 13, stiffness: 170});
  const listOut = 1 - tween(f, [E.localFrom - 8, E.localFrom - 2], [0, 1]);

  const pose = track<Pose>(
    f,
    [
      {at: 0, v: {...POSES.stand, armL: [-12, -150], armR: [-12, -150], headTilt: 8, lookX: 0.6, lookY: -0.8}},
      {at: E.localFrom, v: {...POSES.stand, armL: [20, 30], armR: [40, -110], lookX: 0.7, lookY: -0.9, headTilt: -4, headTurn: 0.4, itemAngle: 0}, dur: 6},
      {at: GOT, v: {...POSES.thumbsUp, lookX: 0.3, lookY: -0.3}, dur: 6},
    ],
    mixPose,
  );
  const expr = track<Expression>(
    f,
    [
      {at: 0, v: EXPRESSIONS.embarrassed},
      {at: E.localFrom, v: EXPRESSIONS.focused, dur: 6},
      {at: GOT, v: EXPRESSIONS.idea, dur: 4},
      {at: GOT + 14, v: EXPRESSIONS.proud, dur: 8},
    ],
    mixExpression,
  );
  const card: React.CSSProperties = {position: 'absolute', left: 60, right: 60, background: '#FFFDF7', border: `6px solid ${COLORS.ink}`, borderRadius: 24, padding: '16px 26px 20px', boxShadow: '8px 10px 0 rgba(15,23,42,0.3)'};
  const tag = (text: string, bg: string): React.ReactNode => (
    <div style={{display: 'inline-block', background: bg, color: COLORS.white, borderRadius: 10, padding: '2px 14px', fontFamily: FONT_FAMILY, fontWeight: 900, fontSize: 28, letterSpacing: 2, marginBottom: 6}}>{text}</div>
  );

  return (
    <AbsoluteFill style={{background: '#EAF2FF'}}>
      <CameraMovement focus={[540, 800]} keys={[{f: 0, zoom: 1.04}, {f: 12, zoom: 1.0, ease: EASE.out}, {f: end, zoom: 1.02}]}>
        <Stage>
          <defs>
            <pattern id="ls-grid" width={60} height={60} patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#BFDBFE" strokeWidth={2} />
            </pattern>
          </defs>
          <rect width={1080} height={1920} fill="url(#ls-grid)" />
          <AliCharacter x={160} y={2040} scale={0.92} pose={pose} expression={expr} handL="open" handR={f >= GOT ? 'thumbsUp' : 'open'} shadow={0} />
        </Stage>
        {/* overcomplicated */}
        <div style={{...card, top: 225, transform: `scale(${pop(f, A, 30, {damping: 13, stiffness: 180})})`, opacity: f >= E.localFrom - 4 ? 0.8 : 1}}>
          {tag('MURAKKAB, LEKIN MA’NOSIZ', COLORS.red)}
          <div style={{fontFamily: SERIF, fontSize: 50, lineHeight: 1.25, color: '#7C2D12', textDecoration: f >= E.localFrom - 4 ? 'line-through' : undefined, textDecorationColor: COLORS.red, textDecorationThickness: 5}}>Reading books is an indispensable manifestation of intellectual sophistication.</div>
        </div>
        {/* what IELTS Writing rewards */}
        {listOut > 0 ? (
          <div style={{position: 'absolute', left: 60, right: 60, top: 640, display: 'flex', flexDirection: 'column', gap: 14, opacity: listOut}}>
            {checklist.map((c, i) =>
              f >= CHK[i] - 2 ? (
                <div key={c} style={{display: 'flex', alignItems: 'center', gap: 16, transform: `translateX(${(1 - pop(f, CHK[i] - 2, 30, {damping: 13, stiffness: 200})) * -120}px)`, background: COLORS.white, border: `5px solid ${COLORS.ink}`, borderRadius: 999, padding: '8px 22px 8px 8px', fontFamily: FONT_FAMILY, fontWeight: 800, fontSize: 36, color: COLORS.navy}}>
                  <span style={{width: 52, height: 52, borderRadius: 26, background: COLORS.green, color: COLORS.white, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 32, border: `4px solid ${COLORS.ink}`, flexShrink: 0}}>✓</span>
                  {c}
                </div>
              ) : null,
            )}
          </div>
        ) : null}
        {/* clear and relevant */}
        {f >= E.localFrom - 4 ? (
          <div style={{...card, top: 640, border: `6px solid ${COLORS.green}`, transform: `translateY(${(1 - cardB) * 160}px)`, opacity: Math.min(1, cardB * 1.4)}}>
            {tag('ANIQ VA O‘RINLI', COLORS.green)}
            <div style={{fontFamily: SERIF, fontSize: 60, lineHeight: 1.3, color: COLORS.ink}}>
              Reading books helps people <span style={hl(tween(f, [DEV, KNOW + 6], [0, 1]), '#FDE68A')}>develop their knowledge</span> and <span style={hl(tween(f, [THINK, THINK + 12], [0, 1]), '#86EFAC')}>think critically</span>.
            </div>
          </div>
        ) : null}
        {f >= GOT ? (
          <div style={{position: 'absolute', left: 300, right: 50, top: 1110, transform: `scale(${pop(f, GOT + 6)})`, transformOrigin: 'left center', background: COLORS.navy, color: COLORS.white, borderRadius: 18, padding: '12px 22px', fontFamily: FONT_FAMILY, fontWeight: 800, fontSize: 30, lineHeight: 1.3}}>
            Murakkab so‘z yomon emas — <span style={{color: COLORS.yellow}}>ma’nosini bilib, o‘rinli ishlatsang</span> foydali!
          </div>
        ) : null}
      </CameraMovement>
      <DuckedSfx name="card_flip" at={A} gainDb={-12} />
      {CHK.map((c, i) => (
        <DuckedSfx key={i} name="pop" at={c - 2} gainDb={-16} rate={1 + i * 0.08} />
      ))}
      <DuckedSfx name="swish" at={E.localFrom - 4} gainDb={-14} />
      <DuckedSfx name="ding" at={GOT} gainDb={-12} />
    </AbsoluteFill>
  );
};
