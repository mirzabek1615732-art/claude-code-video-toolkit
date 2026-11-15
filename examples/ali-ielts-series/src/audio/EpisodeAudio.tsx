import React, {createContext, useContext} from 'react';
import {Html5Audio, Sequence, staticFile} from 'remotion';

/* ------------------------------------------------------------------ *
 * Shared, voice-first audio system for all episodes.
 *
 * Levels (all assets pre-normalised by scripts/normalize_audio_assets.py,
 * narration by scripts/episode_voice.py):
 *   narration   -17 LUFS, played at unity gain — always the loudest thing
 *   SFX         cue gain + duck: -14 dB under speech, -6 dB in pauses
 *   music       -23 dB under speech, -15 dB in pauses
 * Ducking follows the actual narration clips, with smooth attack/release
 * ramps so nothing jumps.
 * ------------------------------------------------------------------ */

export type Stem = 'all' | 'voice' | 'fx' | 'music';

export type Span = {from: number; to: number}; // absolute frames of narration

export const MIX = {
  sfxUnderSpeechDb: -14,
  sfxInPauseDb: -6,
  musicUnderSpeechDb: -25,
  musicInPauseDb: -15,
  attack: 4, // frames to duck down before speech
  release: 10, // frames to come back up after speech
};

const db = (x: number) => Math.pow(10, x / 20);

/** 0 = silence … 1 = narrator speaking, with smooth attack/release. */
export const speechEnvelope = (spans: Span[], f: number) => {
  let v = 0;
  for (const s of spans) {
    if (f >= s.from - MIX.attack && f <= s.to + MIX.release) {
      const a = f < s.from ? (f - (s.from - MIX.attack)) / MIX.attack : 1;
      const r = f > s.to ? 1 - (f - s.to) / MIX.release : 1;
      v = Math.max(v, Math.min(a, r));
    }
  }
  // smoothstep for click-free gain changes
  return v * v * (3 - 2 * v);
};

type Ctx = {spans: Span[]; offset: number; stem: Stem};
const AudioCtx = createContext<Ctx>({spans: [], offset: 0, stem: 'all'});

export const EpisodeAudioProvider: React.FC<{spans: Span[]; stem: Stem; children: React.ReactNode}> = ({spans, stem, children}) => (
  <AudioCtx.Provider value={{spans, offset: 0, stem}}>{children}</AudioCtx.Provider>
);

/** Shift the absolute-frame origin for scenes rendered inside a <Sequence>. */
export const AudioOffset: React.FC<{offset: number; children: React.ReactNode}> = ({offset, children}) => {
  const c = useContext(AudioCtx);
  return <AudioCtx.Provider value={{...c, offset: c.offset + offset}}>{children}</AudioCtx.Provider>;
};

/**
 * A sound effect that can never overpower the narrator.
 * `gainDb` is the cue's own level (0 = reference; keep impacts ≤ 0).
 */
export const DuckedSfx: React.FC<{name: string; at: number; gainDb?: number; rate?: number}> = ({name, at, gainDb = 0, rate = 1}) => {
  const {spans, offset, stem} = useContext(AudioCtx);
  if (stem !== 'all' && stem !== 'fx') return null;
  const start = Math.max(0, Math.round(at));
  return (
    <Sequence from={start} layout="none" name={`sfx:${name}`}>
      <Html5Audio
        src={staticFile(`audio/norm/${name}.wav`)}
        playbackRate={rate}
        volume={(f) => {
          const s = speechEnvelope(spans, offset + start + f);
          const duck = MIX.sfxInPauseDb + (MIX.sfxUnderSpeechDb - MIX.sfxInPauseDb) * s;
          return Math.min(1, db(gainDb + duck));
        }}
      />
    </Sequence>
  );
};

export type NarrationClip = {from: number; durationInFrames: number; src: string};

export const Narration: React.FC<{clips: NarrationClip[]}> = ({clips}) => {
  const {stem} = useContext(AudioCtx);
  if (stem !== 'all' && stem !== 'voice') return null;
  return (
    <>
      {clips.map((c) => (
        <Sequence key={c.src} from={c.from} durationInFrames={c.durationInFrames + 6} layout="none" name={`vo:${c.src}`}>
          <Html5Audio src={staticFile(c.src)} volume={1} />
        </Sequence>
      ))}
    </>
  );
};

/** Music bed with automatic ducking under narration. */
export const MusicBed: React.FC<{src: string; from?: number; durationInFrames: number; fadeIn?: number; fadeOut?: number; extraDb?: number}> = ({
  src,
  from = 0,
  durationInFrames,
  fadeIn = 10,
  fadeOut = 20,
  extraDb = 0,
}) => {
  const {spans, offset, stem} = useContext(AudioCtx);
  if (stem !== 'all' && stem !== 'music' && stem !== 'fx') return null;
  return (
    <Sequence from={from} durationInFrames={durationInFrames} layout="none" name={`music:${src}`}>
      <Html5Audio
        src={staticFile(src)}
        volume={(f) => {
          const s = speechEnvelope(spans, offset + from + f);
          const base = MIX.musicInPauseDb + (MIX.musicUnderSpeechDb - MIX.musicInPauseDb) * s;
          const fi = Math.min(1, f / fadeIn);
          const fo = Math.min(1, (durationInFrames - f) / fadeOut);
          return Math.max(0, Math.min(1, db(base + extraDb) * fi * fo));
        }}
      />
    </Sequence>
  );
};
