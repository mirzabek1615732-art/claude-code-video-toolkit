import React from 'react';
import {AbsoluteFill, Sequence} from 'remotion';
import {AudioManager, Sfx} from './components/AudioManager';
import {SceneTransition, type TransitionKind} from './components/SceneTransition';
import {SubtitleRenderer} from './components/SubtitleRenderer';
import {TIMELINE, sceneTiming, type SceneId, type SceneTiming} from './episode/timeline';
import {loadFonts} from './fonts';
import {Scene1Hook} from './scenes/Scene1Hook';
import {Scene2Problem} from './scenes/Scene2Problem';
import {Scene3Procrastination} from './scenes/Scene3Procrastination';
import {Scene4Social} from './scenes/Scene4Social';
import {Scene5Reality} from './scenes/Scene5Reality';
import {Scene6WakeUp} from './scenes/Scene6WakeUp';
import {Scene7Transformation} from './scenes/Scene7Transformation';
import {Scene8CTA} from './scenes/Scene8CTA';
import {COLORS} from './theme';

loadFonts();

const SCENES: Record<SceneId, React.FC<{scene: SceneTiming}>> = {
  hook: Scene1Hook,
  problem: Scene2Problem,
  procrastination: Scene3Procrastination,
  social: Scene4Social,
  reality: Scene5Reality,
  wakeup: Scene6WakeUp,
  transformation: Scene7Transformation,
  cta: Scene8CTA,
};

/** Transition drawn over the cut INTO each scene. */
const TRANSITIONS: Partial<Record<SceneId, {kind: TransitionKind; color: string; color2?: string}>> = {
  problem: {kind: 'shutter', color: COLORS.yellow, color2: COLORS.navy},
  procrastination: {kind: 'shutter', color: COLORS.orange, color2: COLORS.blue},
  social: {kind: 'circle', color: COLORS.navy, color2: COLORS.blueLight},
  reality: {kind: 'shutter', color: COLORS.white, color2: COLORS.red},
  wakeup: {kind: 'flash', color: COLORS.white},
  transformation: {kind: 'circle', color: COLORS.yellow, color2: COLORS.white},
  cta: {kind: 'circle', color: COLORS.orange, color2: COLORS.yellow},
};

export const Reel: React.FC = () => {
  const reality = sceneTiming('reality');
  const wakeup = sceneTiming('wakeup');
  return (
    <AbsoluteFill style={{background: COLORS.navy}}>
      {TIMELINE.scenes.map((s) => {
        const Scene = SCENES[s.id];
        return (
          <Sequence key={s.id} from={s.from} durationInFrames={s.durationInFrames} name={`scene:${s.id}`}>
            <Scene scene={s} />
          </Sequence>
        );
      })}
      <SubtitleRenderer hideIn={['wakeup']} hideLines={['l01']} />
      {TIMELINE.scenes.map((s) => {
        const t = TRANSITIONS[s.id];
        if (!t) return null;
        return (
          <React.Fragment key={`t-${s.id}`}>
            <SceneTransition at={s.from} kind={t.kind} color={t.color} color2={t.color2} />
            {t.kind !== 'flash' ? <Sfx name="whoosh" at={s.from - 7} volume={0.32} /> : null}
          </React.Fragment>
        );
      })}
      <AudioManager
        musicVolume={0.17}
        musicDropouts={[[wakeup.from, wakeup.from + wakeup.durationInFrames - 20]]}
        tensionAt={[reality.from + reality.beats.l12.from - 4, wakeup.from + wakeup.durationInFrames - 20]}
      />
    </AbsoluteFill>
  );
};
