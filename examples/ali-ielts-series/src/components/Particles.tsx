import React from 'react';
import {random, useCurrentFrame} from 'remotion';
import {COLORS} from '../theme';

/** Comic dust puffs bursting sideways from an impact point (SVG). */
export const DustBurst: React.FC<{x: number; y: number; at: number; count?: number; spread?: number; color?: string}> = ({
  x,
  y,
  at,
  count = 14,
  spread = 420,
  color = '#F1F5F9',
}) => {
  const frame = useCurrentFrame();
  const t = frame - at;
  if (t < 0 || t > 32) return null;
  return (
    <g>
      {Array.from({length: count}).map((_, i) => {
        const dir = i % 2 === 0 ? -1 : 1;
        const speed = 0.4 + random(`dust-s-${i}`) * 0.6;
        const k = 1 - Math.exp(-t / 7);
        const px = x + dir * k * spread * speed;
        const py = y - k * (40 + random(`dust-y-${i}`) * 130) + t * t * 0.08;
        const r = (28 + random(`dust-r-${i}`) * 34) * (0.5 + k) * (1 - t / 34);
        return <circle key={i} cx={px} cy={py} r={Math.max(0, r)} fill={color} stroke={COLORS.navy} strokeWidth={5} opacity={1 - t / 34} />;
      })}
      {/* impact lines */}
      {t < 10
        ? Array.from({length: 8}).map((_, i) => {
            const a = Math.PI + (i / 7) * Math.PI;
            const r1 = 60 + t * 22;
            const r2 = r1 + 60;
            return (
              <line
                key={`l${i}`}
                x1={x + Math.cos(a) * r1 * 1.6}
                y1={y + Math.sin(a) * r1 * 0.7}
                x2={x + Math.cos(a) * r2 * 1.6}
                y2={y + Math.sin(a) * r2 * 0.7}
                stroke={COLORS.yellow}
                strokeWidth={12 - t}
                strokeLinecap="round"
              />
            );
          })
        : null}
    </g>
  );
};

/** Confetti rain (SVG), deterministic. */
export const Confetti: React.FC<{at: number; count?: number}> = ({at, count = 70}) => {
  const frame = useCurrentFrame();
  const t = frame - at;
  if (t < 0) return null;
  const palette = [COLORS.yellow, COLORS.orange, COLORS.green, COLORS.white, COLORS.blueLight, '#F472B6'];
  return (
    <g>
      {Array.from({length: count}).map((_, i) => {
        const x0 = random(`cx-${i}`) * 1080;
        const vx = (random(`cvx-${i}`) - 0.5) * 14;
        const vy = -20 - random(`cvy-${i}`) * 26;
        const px = x0 + vx * t + Math.sin(t / 6 + i) * 20;
        const py = 1500 + vy * t + 0.9 * t * t;
        const rot = t * (8 + random(`cr-${i}`) * 14);
        return (
          <rect
            key={i}
            x={-11}
            y={-6}
            width={22}
            height={12}
            rx={3}
            fill={palette[i % palette.length]}
            transform={`translate(${px} ${py}) rotate(${rot}) scale(1 ${Math.cos(t / 3 + i)})`}
          />
        );
      })}
    </g>
  );
};

/** SVG heart icon centred at 0,0 (size ~ 100). */
export const HeartIcon: React.FC<{fill?: string; stroke?: string}> = ({fill = COLORS.red, stroke = COLORS.navy}) => (
  <path d="M 0 38 C -60 0 -58 -40 -28 -44 C -12 -46 -2 -34 0 -24 C 2 -34 12 -46 28 -44 C 58 -40 60 0 0 38 Z" fill={fill} stroke={stroke} strokeWidth={6} strokeLinejoin="round" />
);

/** Simple smiley "emoji" drawn in SVG (no emoji font dependency). */
export const SmileyIcon: React.FC<{variant?: 'laugh' | 'wow' | 'love'}> = ({variant = 'laugh'}) => (
  <g>
    <circle r={44} fill={COLORS.yellow} stroke={COLORS.navy} strokeWidth={6} />
    {variant === 'love' ? (
      <>
        <g transform="translate(-16 -8) scale(0.28)">
          <HeartIcon />
        </g>
        <g transform="translate(16 -8) scale(0.28)">
          <HeartIcon />
        </g>
      </>
    ) : (
      <>
        <ellipse cx={-15} cy={-10} rx={5} ry={variant === 'wow' ? 9 : 7} fill={COLORS.navy} />
        <ellipse cx={15} cy={-10} rx={5} ry={variant === 'wow' ? 9 : 7} fill={COLORS.navy} />
      </>
    )}
    {variant === 'wow' ? <ellipse cx={0} cy={18} rx={9} ry={12} fill={COLORS.navy} /> : <path d="M -22 8 Q 0 34 22 8 Z" fill={COLORS.navy} />}
  </g>
);

/** Floating icons rising + fading (hearts, smileys, likes). */
export const FloatingIcons: React.FC<{from: number; to: number; rate?: number; area: [number, number, number, number]}> = ({from, to, rate = 3, area}) => {
  const frame = useCurrentFrame();
  const [ax, ay, aw, ah] = area;
  const items: React.ReactNode[] = [];
  for (let s = from; s < to; s += rate) {
    const t = frame - s;
    if (t < 0 || t > 40) continue;
    const i = s;
    const x = ax + random(`fi-x-${i}`) * aw + Math.sin(t / 5 + i) * 24;
    const y = ay + ah - t * (9 + random(`fi-v-${i}`) * 6);
    const sc = (0.45 + random(`fi-s-${i}`) * 0.5) * Math.min(1, t / 6);
    const kind = Math.floor(random(`fi-k-${i}`) * 4);
    items.push(
      <g key={i} transform={`translate(${x} ${y}) scale(${sc}) rotate(${Math.sin(t / 7 + i) * 15})`} opacity={1 - Math.max(0, (t - 28) / 12)}>
        {kind === 0 ? <HeartIcon /> : kind === 1 ? <SmileyIcon variant="laugh" /> : kind === 2 ? <SmileyIcon variant="love" /> : <SmileyIcon variant="wow" />}
      </g>,
    );
  }
  return <g>{items}</g>;
};
