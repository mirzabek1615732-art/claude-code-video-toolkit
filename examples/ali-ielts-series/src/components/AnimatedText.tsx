import React from 'react';
import {useCurrentFrame} from 'remotion';
import {COLORS, FONT_FAMILY} from '../theme';
import {pop, tween, EASE} from './anim';

export type TextEntrance = 'pop' | 'slam' | 'rise' | 'drop';

type Props = {
  /** words separated by spaces; `|` forces a line break */
  text: string;
  from: number;
  stagger?: number;
  size?: number;
  color?: string;
  /** words (exact tokens) painted in the accent colour */
  accentWords?: string[];
  accent?: string;
  entrance?: TextEntrance;
  stroke?: number;
  strokeColor?: string;
  /** frame at which the text exits (scales down + fades) */
  exitAt?: number;
  rotate?: number;
  lineHeight?: number;
  shadow?: boolean;
  style?: React.CSSProperties;
};

/**
 * Kinetic headline: each word springs in on its own beat. Thick outline via
 * paint-order so it reads over any background.
 */
export const AnimatedText: React.FC<Props> = ({
  text,
  from,
  stagger = 4,
  size = 120,
  color = COLORS.white,
  accentWords = [],
  accent = COLORS.yellow,
  entrance = 'pop',
  stroke = 14,
  strokeColor = COLORS.navy,
  exitAt,
  rotate = 0,
  lineHeight = 1.02,
  shadow = true,
  style,
}) => {
  const frame = useCurrentFrame();
  const lines = text.split('|').map((l) => l.trim().split(/\s+/));
  let index = 0;
  const exit = exitAt === undefined ? 0 : tween(frame, [exitAt, exitAt + 7], [0, 1], EASE.in);
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        transform: `rotate(${rotate}deg) scale(${1 - exit * 0.35})`,
        opacity: 1 - exit,
        ...style,
      }}
    >
      {lines.map((words, li) => (
        <div key={li} style={{display: 'flex', gap: size * 0.24, justifyContent: 'center', flexWrap: 'nowrap'}}>
          {words.map((w) => {
            const i = index++;
            const start = from + i * stagger;
            const p = pop(frame, start, 30, entrance === 'slam' ? {damping: 9, stiffness: 260, mass: 0.6} : {});
            const visible = frame >= start;
            let transform = '';
            if (entrance === 'pop') transform = `scale(${p}) rotate(${(1 - p) * -12}deg)`;
            if (entrance === 'slam') transform = `scale(${1.4 - 0.4 * Math.min(1, p) + (p > 1 ? (p - 1) * 0.6 : 0)})`;
            if (entrance === 'rise') transform = `translateY(${(1 - p) * size * 0.9}px)`;
            if (entrance === 'drop') transform = `translateY(${(1 - p) * -size * 1.4}px) rotate(${(1 - p) * 8}deg)`;
            const isAccent = accentWords.includes(w);
            return (
              <span
                key={`${w}-${i}`}
                style={{
                  display: 'inline-block',
                  fontFamily: FONT_FAMILY,
                  fontWeight: 900,
                  fontSize: size,
                  lineHeight,
                  letterSpacing: -size * 0.02,
                  color: isAccent ? accent : color,
                  WebkitTextStroke: `${stroke}px ${strokeColor}`,
                  paintOrder: 'stroke fill',
                  textShadow: shadow ? `0 ${size * 0.08}px 0 ${strokeColor}` : undefined,
                  opacity: visible ? Math.min(1, p * 2) : 0,
                  transform,
                  whiteSpace: 'nowrap',
                }}
              >
                {w}
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
};
