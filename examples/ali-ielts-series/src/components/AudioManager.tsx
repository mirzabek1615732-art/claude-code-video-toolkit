import React from 'react';
import {Html5Audio, interpolate, Sequence, staticFile} from 'remotion';
import {TIMELINE} from '../episode/timeline';

export type SfxName =
  | 'whoosh'
  | 'swish'
  | 'boom'
  | 'impact'
  | 'pop'
  | 'bubble_pop'
  | 'notification'
  | 'ding'
  | 'tick'
  | 'clock_spin'
  | 'boing'
  | 'slide_down'
  | 'dramatic_hit'
  | 'riser'
  | 'record_scratch'
  | 'crickets'
  | 'paper'
  | 'stamp'
  | 'success'
  | 'card_flip'
  | 'glass_burst'
  | 'typing';

/** One sound effect placed at a frame (relative to the enclosing Sequence). */
export const Sfx: React.FC<{name: SfxName; at: number; volume?: number; rate?: number}> = ({name, at, volume = 0.6, rate = 1}) => (
  <Sequence from={Math.max(0, Math.round(at))} layout="none" name={`sfx:${name}`}>
    <Html5Audio src={staticFile(`audio/sfx/${name}.wav`)} volume={volume} playbackRate={rate} />
  </Sequence>
);

/** Is narration playing at absolute frame f? (used for music ducking) */
const narrationEnvelope = (f: number) => {
  let v = 0;
  for (const l of TIMELINE.lines) {
    const a = l.from - 4;
    const b = l.from + l.durationInFrames + 6;
    if (f >= a - 6 && f <= b + 6) {
      v = Math.max(v, interpolate(f, [a - 6, a, b, b + 6], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}));
    }
  }
  return v;
};

/**
 * Narration + music bed. Scene-local SFX are rendered by the scenes
 * themselves with <Sfx/> so they stay in sync with their animation.
 */
export const AudioManager: React.FC<{
  musicVolume?: number;
  /** [fromFrame, toFrame] ranges where the upbeat music drops out */
  musicDropouts?: Array<[number, number]>;
  tensionAt?: [number, number];
}> = ({musicVolume = 0.16, musicDropouts = [], tensionAt}) => {
  const total = TIMELINE.durationInFrames;
  return (
    <>
      {TIMELINE.lines.map((l) => (
        <Sequence key={l.id} from={l.from} durationInFrames={l.durationInFrames + 3} layout="none" name={`vo:${l.id}`}>
          <Html5Audio src={staticFile(l.file)} volume={1} />
        </Sequence>
      ))}
      <Html5Audio
        src={staticFile('audio/music_main.wav')}
        volume={(f) => {
          const duck = 1 - 0.45 * narrationEnvelope(f);
          let drop = 1;
          for (const [a, b] of musicDropouts) {
            drop = Math.min(drop, interpolate(f, [a - 4, a, b - 6, b + 6], [1, 0.0, 0.0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}));
          }
          const fadeOut = interpolate(f, [total - 30, total], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
          const fadeIn = interpolate(f, [0, 6], [0.3, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
          return musicVolume * duck * drop * fadeOut * fadeIn;
        }}
      />
      {tensionAt ? (
        <Sequence from={tensionAt[0]} durationInFrames={tensionAt[1] - tensionAt[0]} layout="none" name="music:tension">
          <Html5Audio
            src={staticFile('audio/music_tension.wav')}
            volume={(f) => interpolate(f, [0, 10, tensionAt[1] - tensionAt[0] - 12, tensionAt[1] - tensionAt[0]], [0, 0.32, 0.32, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}
          />
        </Sequence>
      ) : null}
    </>
  );
};
