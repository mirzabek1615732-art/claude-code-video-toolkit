import {Easing, interpolate, spring} from 'remotion';

export const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

/** Clamped interpolation with an optional easing curve. */
export const tween = (
  frame: number,
  input: [number, number],
  output: [number, number],
  easing: (t: number) => number = Easing.bezier(0.33, 0, 0.2, 1),
) => interpolate(frame, input, output, {...clamp, easing});

/** Spring that starts at `from` (0 → 1). */
export const pop = (frame: number, from: number, fps = 30, config: Partial<{damping: number; stiffness: number; mass: number}> = {}) =>
  spring({frame: frame - from, fps, config: {damping: 11, stiffness: 170, mass: 0.7, ...config}});

/** Snappy spring with no overshoot. */
export const snap = (frame: number, from: number, fps = 30) =>
  spring({frame: frame - from, fps, config: {damping: 200, stiffness: 260}});

export const EASE = {
  out: Easing.bezier(0.16, 1, 0.3, 1),
  in: Easing.bezier(0.7, 0, 0.84, 0),
  inOut: Easing.bezier(0.65, 0, 0.35, 1),
  back: Easing.bezier(0.34, 1.56, 0.64, 1),
  power4Out: Easing.bezier(0.165, 0.84, 0.44, 1),
};

/** Deterministic pseudo-noise in −1…1 */
export const noise1 = (t: number, seed = 0) =>
  (Math.sin(t * 1.7 + seed * 12.9898) * 0.5 + Math.sin(t * 3.1 + seed * 78.233) * 0.3 + Math.sin(t * 5.3 + seed * 3.7) * 0.2);

/** Squash/stretch envelope after an impact at `at`: returns −stretch…+squash */
export const impactSquash = (frame: number, at: number, strength = 0.28) => {
  const t = frame - at;
  if (t < 0) return 0;
  return strength * Math.exp(-t / 5) * Math.cos(t / 2.2);
};

export type Key<T> = {at: number; v: T; dur?: number};

/**
 * Step through keyed values, blending from the previous value into each new
 * key over `dur` frames. Works for poses, expressions or numbers.
 */
export const track = <T,>(frame: number, keys: Array<Key<T>>, mix: (a: T, b: T, t: number) => T, defaultDur = 6): T => {
  let idx = 0;
  for (let i = 0; i < keys.length; i++) {
    if (frame >= keys[i].at) idx = i;
  }
  const cur = keys[idx];
  if (idx === 0 || frame < cur.at) return cur.v;
  const dur = cur.dur ?? defaultDur;
  const t = Math.min(1, (frame - cur.at) / dur);
  const prev = keys[idx - 1];
  // if previous blend was still in progress, approximate from its target
  return mix(prev.v, cur.v, EASE.inOut(t));
};

export const mixNumber = (a: number, b: number, t: number) => a + (b - a) * t;
