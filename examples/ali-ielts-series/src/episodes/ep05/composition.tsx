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
import {S2Insta} from './scenes/S2Insta';
import {S3Overdose} from './scenes/S3Overdose';
import {S4Essay} from './scenes/S4Essay';
import {S5Teacher} from './scenes/S5Teacher';
import {S6Reality} from './scenes/S6Reality';
import {S7Lesson} from './scenes/S7Lesson';
import {S8Ending} from './scenes/S8Ending';
import {EP05} from './timeline';

loadFonts();

const SCENES: Record<string, React.FC<{scene: TLScene}>> = {
  hook: S1Hook,
  insta: S2Insta,
  overdose: S3Overdose,
  essay: S4Essay,
  teacher: S5Teacher,
  reality: S6Reality,
  lesson: S7Lesson,
  ending: S8Ending,
};

/** Only story turns get a drawn transition; the rest are hard cuts. */
const TRANSITIONS: Record<string, {kind: TransitionKind; color: string; color2?: string}> = {
  insta: {kind: 'shutter', color: '#4C1D95', color2: COLORS.yellow},
  teacher: {kind: 'circle', color: COLORS.white, color2: '#C7D2B5'},
  lesson: {kind: 'shutter', color: COLORS.blue, color2: COLORS.white},
};

/** Caption band: low (1460) where Ali's face would sit in the default band, 1290 elsewhere. */
const CAPTION_TOP: Record<string, number> = {hook: 1460, insta: 1500, overdose: 1460, essay: 1500, teacher: 1500, reality: 1290, lesson: 1290, ending: 1460};
const subtitleTop = (f: number) => {
  const s = EP05.scenes.find((x) => f >= x.from && f < x.from + x.durationInFrames);
  return s ? CAPTION_TOP[s.id] : 1290;
};
const LIGHT_SCENES = ['essay', 'lesson', 'ending'];

export type Ep05Props = {stem: Stem};

export const Ep05AliWriting: React.FC<Ep05Props> = ({stem}) => {
  const spans = EP05.lines.filter((l) => !l.placeholder).map((l) => ({from: l.from, to: l.from + l.durationInFrames}));
  const clips = EP05.lines.filter((l) => l.file).map((l) => ({from: l.from, durationInFrames: l.durationInFrames, src: l.file as string}));
  const sc = (id: string) => EP05.scenes.find((s) => s.id === id)!;
  const teacher = sc('teacher');
  const afterTeacher = teacher.from + teacher.durationInFrames;
  return (
    <EpisodeAudioProvider spans={spans} stem={stem}>
      <AbsoluteFill style={{background: COLORS.navy}}>
        {EP05.scenes.map((s) => {
          const C = SCENES[s.id];
          return (
            <Sequence key={s.id} from={s.from} durationInFrames={s.durationInFrames} name={`scene:${s.id}`}>
              <AudioOffset offset={s.from}>
                <C scene={s} />
              </AudioOffset>
            </Sequence>
          );
        })}
        {EP05.scenes
          .filter((s) => LIGHT_SCENES.includes(s.id))
          .map((s) => (
            <Sequence key={`scrim-${s.id}`} from={s.from} durationInFrames={s.durationInFrames} name={`scrim:${s.id}`}>
              <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 340, background: 'linear-gradient(to bottom, rgba(10,20,50,0.72), rgba(10,20,50,0.4) 55%, rgba(10,20,50,0))', pointerEvents: 'none'}} />
            </Sequence>
          ))}
        {/* designed on-screen text replaces captions for: the hook title, the English example sentences, the vocabulary pills, Ali's answer */}
        <EpisodeSubtitles lines={EP05.lines} hideIds={['l01', 'e01', 'e02', 'a01', 'a02', 'a03', 'l14']} top={subtitleTop} />
        {EP05.scenes.map((s) => {
          const t = TRANSITIONS[s.id];
          return t ? <SceneTransition key={`t-${s.id}`} at={s.from} kind={t.kind} color={t.color} color2={t.color2} half={6} /> : null;
        })}
        <Narration clips={clips} />
        {/* music stops for the teacher scene: the silence is the joke */}
        <MusicBed src="audio/norm/music_main.wav" durationInFrames={teacher.from + 8} fadeOut={12} />
        <MusicBed src="audio/norm/music_main.wav" from={afterTeacher} durationInFrames={EP05.durationInFrames - afterTeacher} fadeIn={16} />
        <SchoolWatermark />
      </AbsoluteFill>
    </EpisodeAudioProvider>
  );
};

export const EP05_DURATION = EP05.durationInFrames;
