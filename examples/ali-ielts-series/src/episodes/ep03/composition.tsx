import React from 'react';
import {AbsoluteFill, Sequence} from 'remotion';
import {AudioOffset, EpisodeAudioProvider, MusicBed, Narration, type Stem} from '../../audio/EpisodeAudio';
import {EpisodeSubtitles} from '../../components/EpisodeSubtitles';
import {SchoolWatermark} from '../../components/Watermark';
import {SceneTransition, type TransitionKind} from '../../components/SceneTransition';
import {loadFonts} from '../../fonts';
import {COLORS} from '../../theme';
import type {TLScene} from '../buildTimeline';
import {S1Hook} from './scenes/S1Hook';
import {S2Problem} from './scenes/S2Problem';
import {S3Trap} from './scenes/S3Trap';
import {S4Disaster} from './scenes/S4Disaster';
import {S5Reveal} from './scenes/S5Reveal';
import {S6Paraphrase} from './scenes/S6Paraphrase';
import {S7Improve} from './scenes/S7Improve';
import {S8Ending} from './scenes/S8Ending';
import {EP03} from './timeline';

loadFonts();

const Placeholder: React.FC<{scene: TLScene}> = ({scene}) => (
  <AbsoluteFill style={{background: COLORS.navy2, color: COLORS.white, fontSize: 60, fontFamily: 'Montserrat', alignItems: 'center', justifyContent: 'center'}}>{scene.id}</AbsoluteFill>
);

export const SCENES: Record<string, React.FC<{scene: TLScene}>> = {
  hook: S1Hook,
  problem: S2Problem,
  trap: S3Trap,
  disaster: S4Disaster,
  reveal: S5Reveal,
  paraphrase: S6Paraphrase,
  improve: S7Improve,
  ending: S8Ending,
};

/** Transition drawn over the cut INTO each scene. */
const TRANSITIONS: Record<string, {kind: TransitionKind; color: string; color2?: string}> = {
  problem: {kind: 'shutter', color: COLORS.yellow, color2: COLORS.navy},
  trap: {kind: 'circle', color: COLORS.white, color2: COLORS.blue},
  disaster: {kind: 'flash', color: COLORS.red},
  reveal: {kind: 'flash', color: COLORS.white},
  paraphrase: {kind: 'shutter', color: COLORS.orange, color2: COLORS.blue},
  improve: {kind: 'circle', color: COLORS.green, color2: COLORS.white},
  ending: {kind: 'shutter', color: COLORS.yellow, color2: COLORS.orange},
};

/** Captions drop lower where Ali's face sits in the default caption band. */
const LOW_CAPTION_SCENES = ['problem', 'trap', 'disaster', 'improve', 'ending'];
const subtitleTop = (f: number) => {
  const s = EP03.scenes.find((x) => f >= x.from && f < x.from + x.durationInFrames);
  return s && LOW_CAPTION_SCENES.includes(s.id) ? 1460 : 1290;
};

const LIGHT_SCENES = ['reveal', 'paraphrase', 'improve'];

export type Ep03Props = {stem: Stem};

export const Ep03AliReading: React.FC<Ep03Props> = ({stem}) => {
  const spans = EP03.lines.filter((l) => !l.placeholder).map((l) => ({from: l.from, to: l.from + l.durationInFrames}));
  const clips = EP03.lines.filter((l) => l.file).map((l) => ({from: l.from, durationInFrames: l.durationInFrames, src: l.file as string}));
  const disaster = EP03.scenes.find((s) => s.id === 'disaster')!;
  return (
    <EpisodeAudioProvider spans={spans} stem={stem}>
      <AbsoluteFill style={{background: COLORS.navy}}>
        {EP03.scenes.map((s) => {
          const C = SCENES[s.id] ?? Placeholder;
          return (
            <Sequence key={s.id} from={s.from} durationInFrames={s.durationInFrames} name={`scene:${s.id}`}>
              <AudioOffset offset={s.from}>
                <C scene={s} />
              </AudioOffset>
            </Sequence>
          );
        })}
        {/* the white logo needs a dark ground: soft top scrim on the light-background scenes */}
        {EP03.scenes
          .filter((s) => LIGHT_SCENES.includes(s.id))
          .map((s) => (
            <Sequence key={`scrim-${s.id}`} from={s.from} durationInFrames={s.durationInFrames} name={`scrim:${s.id}`}>
              <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 340, background: 'linear-gradient(to bottom, rgba(10,20,50,0.78), rgba(10,20,50,0.45) 55%, rgba(10,20,50,0))', pointerEvents: 'none'}} />
            </Sequence>
          ))}
        <EpisodeSubtitles lines={EP03.lines} hideIds={['l01', 'l09']} top={subtitleTop} />
        {EP03.scenes.map((s) => {
          const t = TRANSITIONS[s.id];
          return t ? <SceneTransition key={`t-${s.id}`} at={s.from} kind={t.kind} color={t.color} color2={t.color2} half={6} /> : null;
        })}
        <Narration clips={clips} />
        {/* series music bed, ducked under the narrator; tension bed for the time disaster */}
        <MusicBed src="audio/norm/music_main.wav" durationInFrames={disaster.from + 6} />
        <MusicBed src="audio/norm/music_tension.wav" from={disaster.from} durationInFrames={disaster.durationInFrames + 10} fadeIn={6} fadeOut={14} extraDb={2} />
        <MusicBed src="audio/norm/music_main.wav" from={disaster.from + disaster.durationInFrames} durationInFrames={EP03.durationInFrames - disaster.from - disaster.durationInFrames} fadeIn={14} />
        {/* official school logo: last layer, every frame, outside the camera */}
        <SchoolWatermark />
      </AbsoluteFill>
    </EpisodeAudioProvider>
  );
};

export const EP03_DURATION = EP03.durationInFrames;
