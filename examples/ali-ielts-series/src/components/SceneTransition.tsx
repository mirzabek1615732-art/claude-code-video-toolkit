import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {COLORS} from '../theme';
import {EASE, tween} from './anim';

export type TransitionKind = 'shutter' | 'flash' | 'circle' | 'zoomBlur';

/**
 * Overlay that fully covers the frame at `at` (the hard cut between two
 * scenes), so the cut itself is never visible.
 */
export const SceneTransition: React.FC<{at: number; kind?: TransitionKind; color?: string; color2?: string; half?: number}> = ({
  at,
  kind = 'shutter',
  color = COLORS.yellow,
  color2 = COLORS.blue,
  half = 7,
}) => {
  const frame = useCurrentFrame();
  const t = frame - at;
  if (t < -half || t > half) return null;
  if (kind === 'flash') {
    const o = t < 0 ? tween(t, [-half, 0], [0, 1], EASE.in) : tween(t, [0, half], [1, 0], EASE.out);
    return <AbsoluteFill style={{background: color, opacity: o}} />;
  }
  if (kind === 'circle') {
    const r = t < 0 ? tween(t, [-half, 0], [0, 1300], EASE.in) : 1300;
    const hole = t < 0 ? 0 : tween(t, [0, half], [0, 1300], EASE.out);
    return (
      <AbsoluteFill>
        <svg width={1080} height={1920}>
          <defs>
            <mask id={`tmask-${at}`}>
              <rect width={1080} height={1920} fill="black" />
              <circle cx={540} cy={960} r={r} fill="white" />
              <circle cx={540} cy={960} r={hole} fill="black" />
            </mask>
          </defs>
          <rect width={1080} height={1920} fill={color} mask={`url(#tmask-${at})`} />
          <circle cx={540} cy={960} r={Math.max(0, hole - 40)} fill="none" stroke={color2} strokeWidth={t > 0 ? 50 : 0} />
        </svg>
      </AbsoluteFill>
    );
  }
  // shutter: two diagonal bands sweep across, covering the cut
  const p = tween(t, [-half, half], [0, 1], EASE.inOut);
  const x1 = -2600 + p * 4400;
  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <div
        style={{
          position: 'absolute',
          top: -800,
          left: x1,
          width: 1500,
          height: 3600,
          background: color,
          transform: 'rotate(18deg)',
          boxShadow: `-120px 0 0 ${color2}`,
        }}
      />
    </AbsoluteFill>
  );
};
