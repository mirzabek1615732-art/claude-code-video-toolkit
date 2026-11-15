import React from 'react';
import {AbsoluteFill, Sequence} from 'remotion';
import {AudioOffset, EpisodeAudioProvider, MusicBed, Narration, type Stem} from '../../audio/EpisodeAudio';
import {EpisodeSubtitles} from '../../components/EpisodeSubtitles';
import {SceneTransition, type TransitionKind} from '../../components/SceneTransition';
import {SchoolWatermark} from '../../components/Watermark';
import {loadFonts} from '../../fonts';
import {COLORS} from '../../theme';
import type {TLScene} from '../buildTimeline';
import {S1Hook} from './scenes/S1Hook';
import {S2Begins} from './scenes/S2Begins';
import {S3Trap} from './scenes/S3Trap';
import {S4Celebrate} from './scenes/S4Celebrate';
import {S5Reality} from './scenes/S5Reality';
import {S6Punch} from './scenes/S6Punch';
import {S7Learn} from './scenes/S7Learn';
import {S8Ending} from './scenes/S8Ending';
import {EP04} from './timeline';

loadFonts();

const SCENES: Record<string, React.FC<{scene: TLScene}>> = {
  hook: S1Hook,
  begins: S2Begins,
  trap: S3Trap,
  celebrate: S4Celebrate,
  reality: S5Reality,
  punch: S6Punch,
  learn: S7Learn,
  ending: S8Ending,
};

/** Transition drawn over the cut INTO each scene (the dream → reality cut is a hard record-scratch cut). */
const TRANSITIONS: Record<string, {kind: TransitionKind; color: string; color2?: string}> = {
  begins: {kind: 'shutter', color: COLORS.navy, color2: COLORS.yellow},
  celebrate: {kind: 'circle', color: COLORS.white, color2: '#A855F7'},
  punch: {kind: 'flash', color: COLORS.white},
  learn: {kind: 'shutter', color: COLORS.blue, color2: COLORS.white},
  ending: {kind: 'shutter', color: COLORS.yellow, color2: COLORS.orange},
};

/** Captions sit at 1460 where Ali's face is in the default band; 1290 where he stands in the corner. */
const HIGH_CAPTION_SCENES = ['learn'];
const subtitleTop = (f: number) => {
  const s = EP04.scenes.find((x) => f >= x.from && f < x.from + x.durationInFrames);
  return s && HIGH_CAPTION_SCENES.includes(s.id) ? 1290 : 1460;
};
/** White logo needs a dark ground on light scenes. */
const LIGHT_SCENES = ['learn'];

export type Ep04Props = {stem: Stem};

export const Ep04AliListening: React.FC<Ep04Props> = ({stem}) => {
  const spans = EP04.lines.filter((l) => !l.placeholder).map((l) => ({from: l.from, to: l.from + l.durationInFrames}));
  const clips = EP04.lines.filter((l) => l.file).map((l) => ({from: l.from, durationInFrames: l.durationInFrames, src: l.file as string}));
  const dream = EP04.scenes.find((s) => s.id === 'celebrate')!;
  const dreamEnd = dream.from + dream.durationInFrames;
  return (
    <EpisodeAudioProvider spans={spans} stem={stem}>
      <AbsoluteFill style={{background: COLORS.navy}}>
        {EP04.scenes.map((s) => {
          const C = SCENES[s.id];
          return (
            <Sequence key={s.id} from={s.from} durationInFrames={s.durationInFrames} name={`scene:${s.id}`}>
              <AudioOffset offset={s.from}>
                <C scene={s} />
              </AudioOffset>
            </Sequence>
          );
        })}
        {EP04.scenes
          .filter((s) => LIGHT_SCENES.includes(s.id))
          .map((s) => (
            <Sequence key={`scrim-${s.id}`} from={s.from} durationInFrames={s.durationInFrames} name={`scrim:${s.id}`}>
              <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 340, background: 'linear-gradient(to bottom, rgba(10,20,50,0.78), rgba(10,20,50,0.45) 55%, rgba(10,20,50,0))', pointerEvents: 'none'}} />
            </Sequence>
          ))}
        {/* e01–e03 are shown as designed on-screen English; l07 is the big kinetic title */}
        <EpisodeSubtitles lines={EP04.lines} hideIds={['l01', 'e01', 'l07', 'e02', 'e03']} top={subtitleTop} />
        {EP04.scenes.map((s) => {
          const t = TRANSITIONS[s.id];
          return t ? <SceneTransition key={`t-${s.id}`} at={s.from} kind={t.kind} color={t.color} color2={t.color2} half={6} /> : null;
        })}
        <Narration clips={clips} />
        {/* music: series bed, silent under the record scratch, tension bed for the reality check */}
        <MusicBed src="audio/norm/music_main.wav" durationInFrames={dreamEnd} fadeOut={3} />
        <MusicBed src="audio/norm/music_tension.wav" from={dreamEnd + 20} durationInFrames={EP04.scenes.find((s) => s.id === 'learn')!.from - dreamEnd - 20} fadeIn={10} fadeOut={14} />
        <MusicBed src="audio/norm/music_main.wav" from={EP04.scenes.find((s) => s.id === 'learn')!.from} durationInFrames={EP04.durationInFrames - EP04.scenes.find((s) => s.id === 'learn')!.from} fadeIn={14} />
        <SchoolWatermark />
      </AbsoluteFill>
    </EpisodeAudioProvider>
  );
};

export const EP04_DURATION = EP04.durationInFrames;
