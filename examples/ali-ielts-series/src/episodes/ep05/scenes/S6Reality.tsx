import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {DuckedSfx} from '../../../audio/EpisodeAudio';
import {AliCharacter, EXPRESSIONS, mixExpression, POSES} from '../../../components/AliCharacter';
import {AnimatedText} from '../../../components/AnimatedText';
import {CameraMovement} from '../../../components/CameraMovement';
import {EASE, pop, tween} from '../../../components/anim';
import {COLORS, FONT_FAMILY} from '../../../theme';
import {wordAt, type TLScene} from '../../buildTimeline';
import {At, Stage} from '../../../scenes/Stage';
import {ConfidenceMeter, SERIF} from './common';
import {SENTENCE} from './S4Essay';

const FANCY = [4, 5, 7, 8]; // indispensable, manifestation, intellectual, sophistication.

/** 0:36 — the big words fall off the page; what he meant was simply "reading books is useful". Confidence 999% → 1%. */
export const S6Reality: React.FC<{scene: TLScene}> = ({scene}) => {
  const f = useCurrentFrame();
  const DROP = wordAt(scene, 'l09', 0); // "Bechora"
  const MEANT = wordAt(scene, 'l09', 4); // "foydali"
  const end = scene.durationInFrames;
  const conf = Math.max(1, 999 * Math.pow(1 - tween(f, [DROP, MEANT + 6], [0, 1], EASE.in), 2));
  const reveal = pop(f, MEANT, 30, {damping: 11, stiffness: 200});
  const text = pop(f, MEANT + 10, 30, {damping: 10, stiffness: 220});

  return (
    <AbsoluteFill style={{background: '#334155'}}>
      <CameraMovement focus={[540, 900]} keys={[{f: 0, zoom: 1.0}, {f: end, zoom: 1.05}]}>
        <Stage>
          <rect width={1080} height={1920} fill="#334155" />
          <rect y={1500} width={1080} height={420} fill="#1E293B" />
          <AliCharacter x={560} y={1990} scale={1.15} pose={{...POSES.stand, armL: [-12, -150], armR: [-12, -150], headTilt: 10, lookY: -0.8, lookX: -0.3, bodyY: 10}} expression={f < MEANT ? mixExpression(EXPRESSIONS.devastated, EXPRESSIONS.embarrassed, 0.4) : EXPRESSIONS.embarrassed} handL="open" handR="open" glasses={tween(f, [DROP, DROP + 10], [1.75, 1.0])} shadow={0} />
          <g transform="translate(950 1720)">
            <ConfidenceMeter value={conf} h={480} />
          </g>
        </Stage>
        {/* the page: fancy words fall, the plain meaning appears */}
        <div style={{position: 'absolute', left: 70, right: 70, top: 300, minHeight: 470, background: '#FFFDF7', border: `6px solid ${COLORS.ink}`, borderRadius: 22, padding: '34px 40px', display: 'flex', flexWrap: 'wrap', alignContent: 'flex-start', gap: '4px 16px', fontFamily: SERIF, fontSize: 60, lineHeight: 1.18, color: COLORS.ink, boxShadow: '10px 12px 0 rgba(0,0,0,0.3)'}}>
          {SENTENCE.map((w, i) => {
            const k = FANCY.indexOf(i);
            const t0 = DROP + 4 + Math.max(0, k) * 5;
            const fall = k >= 0 ? Math.max(0, f - t0) : 0;
            const plainFade = k < 0 && f >= MEANT - 4 ? 0.25 : 1;
            return (
              <span key={i} style={{display: 'inline-block', fontWeight: k >= 0 ? 700 : 400, color: k >= 0 ? '#7C2D12' : COLORS.ink, transform: `translate(${fall * (k % 2 ? 6 : -4)}px, ${fall * fall * 2.4}px) rotate(${fall * (k % 2 ? 7 : -6)}deg)`, opacity: fall > 40 ? 0 : plainFade}}>
                {w}
              </span>
            );
          })}
          {f >= MEANT ? (
            <div style={{position: 'absolute', left: 40, right: 40, top: 150, transform: `scale(${reveal})`, background: '#DCFCE7', border: `6px solid ${COLORS.green}`, borderRadius: 20, padding: '18px 26px', fontFamily: SERIF, fontWeight: 700, fontSize: 70, color: '#14532D', textAlign: 'center'}}>
              Reading books is useful.
              <div style={{fontFamily: FONT_FAMILY, fontWeight: 800, fontSize: 30, color: '#166534'}}>(Kitob o‘qish foydali — xolos!)</div>
            </div>
          ) : null}
        </div>
      </CameraMovement>
      {f >= MEANT + 10 ? (
        <At x={540} y={830}>
          <div style={{transform: `scale(${text}) rotate(-3deg)`}}>
            <AnimatedText text={'KO‘P SO‘Z ≠|YAXSHI ESSAY'} from={MEANT + 10} stagger={4} entrance="slam" size={96} accentWords={['≠', 'YAXSHI', 'ESSAY']} accent={COLORS.yellow} />
          </div>
        </At>
      ) : null}
      <DuckedSfx name="record_scratch" at={0} gainDb={-14} />
      {FANCY.map((_, k) => (
        <DuckedSfx key={k} name="slide_down" at={DROP + 4 + k * 5} gainDb={-18} />
      ))}
      <DuckedSfx name="ding" at={MEANT} gainDb={-14} />
    </AbsoluteFill>
  );
};
