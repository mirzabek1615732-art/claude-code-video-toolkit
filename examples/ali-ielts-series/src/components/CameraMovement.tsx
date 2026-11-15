import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {EASE, noise1, tween} from './anim';

export type CameraKey = {
  f: number;
  zoom?: number;
  x?: number;
  y?: number;
  rot?: number;
  /** easing used to arrive at this key */
  ease?: (t: number) => number;
};

export type Shake = {from: number; duration: number; amplitude: number};

const sample = (keys: CameraKey[], frame: number, prop: 'zoom' | 'x' | 'y' | 'rot', fallback: number) => {
  const ks = keys.filter((k) => k[prop] !== undefined);
  if (ks.length === 0) return fallback;
  if (frame <= ks[0].f) return ks[0][prop] as number;
  for (let i = 1; i < ks.length; i++) {
    if (frame <= ks[i].f) {
      return tween(frame, [ks[i - 1].f, ks[i].f], [ks[i - 1][prop] as number, ks[i][prop] as number], ks[i].ease ?? EASE.inOut);
    }
  }
  return ks[ks.length - 1][prop] as number;
};

/**
 * Virtual camera: keyframed zoom / pan / roll plus decaying impact shakes.
 * `focus` is the point (in px) the zoom is centred on.
 */
export const CameraMovement: React.FC<{
  keys: CameraKey[];
  shakes?: Shake[];
  focus?: [number, number];
  children: React.ReactNode;
}> = ({keys, shakes = [], focus = [540, 960], children}) => {
  const frame = useCurrentFrame();
  const zoom = sample(keys, frame, 'zoom', 1);
  const x = sample(keys, frame, 'x', 0);
  const y = sample(keys, frame, 'y', 0);
  const rot = sample(keys, frame, 'rot', 0);
  let sx = 0;
  let sy = 0;
  let sr = 0;
  for (const s of shakes) {
    const t = frame - s.from;
    if (t >= 0 && t < s.duration) {
      const decay = (1 - t / s.duration) ** 2;
      sx += noise1(t * 2.3, 1) * s.amplitude * decay;
      sy += noise1(t * 2.9, 2) * s.amplitude * decay;
      sr += noise1(t * 1.9, 3) * s.amplitude * 0.04 * decay;
    }
  }
  return (
    <AbsoluteFill
      style={{
        transformOrigin: `${focus[0]}px ${focus[1]}px`,
        transform: `translate(${x + sx}px, ${y + sy}px) scale(${zoom}) rotate(${rot + sr}deg)`,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};
