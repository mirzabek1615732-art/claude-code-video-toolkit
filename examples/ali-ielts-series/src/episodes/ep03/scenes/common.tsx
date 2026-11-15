import React from 'react';
import {random} from 'remotion';
import {COLORS} from '../../../theme';

export const F = 'Montserrat';

/** Thick red/blue dictionary standing on its spine. Origin = bottom centre. */
export const Dictionary: React.FC<{w?: number; h?: number; open?: number; flip?: number}> = ({w = 220, h = 300, open = 0, flip = 0}) => {
  if (open > 0) {
    // open dictionary seen from the front, pages flicking
    const pw = w * 0.95;
    return (
      <g>
        <path d={`M 0 ${-h * 0.62} Q ${-pw / 2} ${-h * 0.7} ${-pw} ${-h * 0.62} L ${-pw} 0 Q ${-pw / 2} ${-h * 0.08} 0 0 Z`} fill="#F8FAFC" stroke={COLORS.ink} strokeWidth={6} />
        <path d={`M 0 ${-h * 0.62} Q ${pw / 2} ${-h * 0.7} ${pw} ${-h * 0.62} L ${pw} 0 Q ${pw / 2} ${-h * 0.08} 0 0 Z`} fill="#F1F5F9" stroke={COLORS.ink} strokeWidth={6} />
        {[0.15, 0.28, 0.41, 0.54].map((k) => (
          <g key={k}>
            <rect x={-pw + 26} y={-h * (0.62 - k)} width={pw - 52} height={8} rx={4} fill="#94A3B8" />
            <rect x={26} y={-h * (0.62 - k)} width={pw - 52} height={8} rx={4} fill="#94A3B8" />
          </g>
        ))}
        {/* flicking page */}
        <g transform={`scale(${Math.cos(flip * Math.PI)} 1)`}>
          <path d={`M 0 ${-h * 0.62} Q ${pw / 2} ${-h * 0.72} ${pw} ${-h * 0.64} L ${pw} -4 Q ${pw / 2} ${-h * 0.1} 0 0 Z`} fill="#FFFFFF" stroke={COLORS.ink} strokeWidth={5} opacity={0.95} />
        </g>
      </g>
    );
  }
  return (
    <g>
      <rect x={-w / 2 + 10} y={-h + 10} width={w} height={h} rx={14} fill="#7F1D1D" />
      <rect x={-w / 2} y={-h} width={w} height={h} rx={14} fill={COLORS.red} stroke={COLORS.ink} strokeWidth={7} />
      <rect x={-w / 2} y={-h} width={w * 0.16} height={h} rx={10} fill={COLORS.redDark} />
      <rect x={-w / 2 + w * 0.24} y={-h * 0.78} width={w * 0.66} height={h * 0.24} rx={8} fill={COLORS.yellow} stroke={COLORS.ink} strokeWidth={4} />
      <text x={w * 0.07} y={-h * 0.62} textAnchor="middle" fontFamily={F} fontWeight={900} fontSize={w * 0.13} fill={COLORS.navy}>
        LUG‘AT
      </text>
      <text x={w * 0.07} y={-h * 0.33} textAnchor="middle" fontFamily={F} fontWeight={800} fontSize={w * 0.09} fill="#FDE68A">
        EN → UZ
      </text>
    </g>
  );
};

/** A sheet of English reading text. `lines` are rendered as real words. */
export const ReadingPage: React.FC<{w: number; h: number; lines: string[]; title?: string; size?: number; highlights?: Array<{line: number; from: number; to: number; color: string; p: number}>}> = ({
  w,
  h,
  lines,
  title = 'READING PASSAGE 1',
  size = 34,
  highlights = [],
}) => (
  <g>
    <rect x={-w / 2 + 12} y={-h / 2 + 12} width={w} height={h} rx={18} fill="#CBD5E1" />
    <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={18} fill="#FFFDF7" stroke={COLORS.ink} strokeWidth={6} />
    <text x={-w / 2 + 40} y={-h / 2 + 70} fontFamily={F} fontWeight={900} fontSize={size * 0.95} fill={COLORS.navy}>
      {title}
    </text>
    <rect x={-w / 2 + 40} y={-h / 2 + 90} width={w - 80} height={5} fill={COLORS.blue} />
    {highlights.map((hl, i) => (
      <rect
        key={i}
        x={-w / 2 + 34 + hl.from * size * 0.56}
        y={-h / 2 + 118 + hl.line * size * 1.55}
        width={(hl.to - hl.from) * size * 0.56 * hl.p}
        height={size * 1.25}
        rx={6}
        fill={hl.color}
        opacity={0.75}
      />
    ))}
    {lines.map((l, i) => (
      <text key={i} x={-w / 2 + 40} y={-h / 2 + 150 + i * size * 1.55} fontFamily="Georgia, serif" fontSize={size} fill={COLORS.ink}>
        {l}
      </text>
    ))}
  </g>
);

/** Vocabulary card: English word + Uzbek meaning. Origin = centre. */
export const WordCard: React.FC<{en: string; uz?: string; color?: string; scale?: number}> = ({en, uz, color = COLORS.white, scale = 1}) => {
  const w = Math.max(260, en.length * 30 + 70);
  return (
    <g transform={`scale(${scale})`}>
      <rect x={-w / 2 + 8} y={-62} width={w} height={uz ? 132 : 110} rx={22} fill={COLORS.navy} opacity={0.35} />
      <rect x={-w / 2} y={-70} width={w} height={uz ? 132 : 110} rx={22} fill={color} stroke={COLORS.ink} strokeWidth={6} />
      <text y={uz ? -8 : 2} textAnchor="middle" fontFamily={F} fontWeight={900} fontSize={50} fill={COLORS.navy}>
        {en}
      </text>
      {uz ? (
        <text y={44} textAnchor="middle" fontFamily={F} fontWeight={700} fontSize={32} fill={COLORS.blue}>
          {uz}
        </text>
      ) : null}
    </g>
  );
};

export const Lightbulb: React.FC<{glow: number; colorful?: boolean}> = ({glow, colorful}) => (
  <g>
    {glow > 0 ? (
      <g opacity={glow}>
        <circle r={150} fill={COLORS.yellow} opacity={0.25} />
        {Array.from({length: 10}).map((_, i) => {
          const a = (i / 10) * Math.PI * 2;
          return <line key={i} x1={Math.cos(a) * 92} y1={Math.sin(a) * 92 - 10} x2={Math.cos(a) * 128} y2={Math.sin(a) * 128 - 10} stroke={colorful ? [COLORS.yellow, COLORS.orange, COLORS.green, COLORS.blueLight][i % 4] : COLORS.yellow} strokeWidth={12} strokeLinecap="round" />;
        })}
      </g>
    ) : null}
    <path d="M 0 -78 C 46 -78 70 -44 70 -10 C 70 18 50 34 40 52 L -40 52 L -50 34 C -62 18 -70 2 -70 -10 C -70 -44 -46 -78 0 -78 Z" fill={glow > 0.2 ? COLORS.yellow : '#E2E8F0'} stroke={COLORS.ink} strokeWidth={7} />
    <rect x={-34} y={56} width={68} height={16} rx={6} fill="#94A3B8" stroke={COLORS.ink} strokeWidth={5} />
    <rect x={-28} y={74} width={56} height={14} rx={6} fill="#94A3B8" stroke={COLORS.ink} strokeWidth={5} />
    <path d="M -18 20 L -8 -10 L 0 14 L 8 -10 L 18 20" fill="none" stroke={COLORS.orange} strokeWidth={6} strokeLinejoin="round" />
  </g>
);

/** Sweat droplets flying off a head at (x, y). */
export const SweatBurst: React.FC<{x: number; y: number; t: number; seed: string; count?: number}> = ({x, y, t, seed, count = 6}) => (
  <g>
    {Array.from({length: count}).map((_, i) => {
      const life = 22;
      const tt = (t + i * 7) % life;
      const side = i % 2 ? 1 : -1;
      const vx = side * (6 + random(`${seed}-vx-${i}`) * 6);
      const vy = -10 - random(`${seed}-vy-${i}`) * 6;
      const px = x + side * 90 + vx * tt;
      const py = y + vy * tt + 0.9 * tt * tt;
      return (
        <path
          key={i}
          d="M 0 -18 Q 12 0 0 10 Q -12 0 0 -18 Z"
          transform={`translate(${px} ${py}) rotate(${side * (20 + tt * 3)})`}
          fill="#93C5FD"
          stroke={COLORS.ink}
          strokeWidth={3}
          opacity={1 - tt / life}
        />
      );
    })}
  </g>
);

/** Exam countdown ring. `remaining` 0…1, label e.g. "47:12". */
export const Countdown: React.FC<{r: number; remaining: number; label: string; pulse?: number; danger?: boolean}> = ({r, remaining, label, pulse = 0, danger}) => {
  const C = 2 * Math.PI * r;
  const col = danger ? COLORS.red : COLORS.yellow;
  return (
    <g transform={`scale(${1 + pulse * 0.06})`}>
      <circle r={r + 30} fill={COLORS.navy} stroke={COLORS.ink} strokeWidth={8} />
      <circle r={r} fill="none" stroke="#334155" strokeWidth={34} />
      <circle r={r} fill="none" stroke={col} strokeWidth={34} strokeDasharray={C} strokeDashoffset={C * (1 - remaining)} transform="rotate(-90)" strokeLinecap="round" />
      {Array.from({length: 60}).map((_, i) => (
        <rect key={i} x={-2} y={-r + 26} width={4} height={i % 5 === 0 ? 22 : 10} fill="#64748B" transform={`rotate(${i * 6})`} />
      ))}
      <text y={r * 0.12} textAnchor="middle" fontFamily={F} fontWeight={900} fontSize={r * 0.42} fill={col}>
        {label}
      </text>
      <text y={r * 0.42} textAnchor="middle" fontFamily={F} fontWeight={800} fontSize={r * 0.12} fill="#CBD5E1" letterSpacing={6}>
        READING
      </text>
    </g>
  );
};

export const ClockIcon: React.FC<{size: number; t?: number}> = ({size, t = 0}) => (
  <g>
    <circle r={size} fill={COLORS.white} stroke={COLORS.ink} strokeWidth={size * 0.14} />
    <line x1={0} y1={0} x2={0} y2={-size * 0.62} stroke={COLORS.ink} strokeWidth={size * 0.13} strokeLinecap="round" transform={`rotate(${t * 6})`} />
    <line x1={0} y1={0} x2={size * 0.42} y2={0} stroke={COLORS.red} strokeWidth={size * 0.13} strokeLinecap="round" transform={`rotate(${t * 0.5})`} />
    <circle r={size * 0.1} fill={COLORS.ink} />
  </g>
);

export const BookIcon: React.FC<{size: number}> = ({size}) => (
  <g>
    <path d={`M 0 ${-size * 0.7} Q ${-size * 0.6} ${-size * 0.9} ${-size * 1.1} ${-size * 0.7} L ${-size * 1.1} ${size * 0.7} Q ${-size * 0.6} ${size * 0.5} 0 ${size * 0.7} Z`} fill={COLORS.white} stroke={COLORS.ink} strokeWidth={size * 0.12} strokeLinejoin="round" />
    <path d={`M 0 ${-size * 0.7} Q ${size * 0.6} ${-size * 0.9} ${size * 1.1} ${-size * 0.7} L ${size * 1.1} ${size * 0.7} Q ${size * 0.6} ${size * 0.5} 0 ${size * 0.7} Z`} fill={COLORS.white} stroke={COLORS.ink} strokeWidth={size * 0.12} strokeLinejoin="round" />
    <text x={-size * 0.55} y={size * 0.15} textAnchor="middle" fontFamily={F} fontWeight={900} fontSize={size * 0.6} fill={COLORS.red}>
      ?
    </text>
    <text x={size * 0.55} y={size * 0.15} textAnchor="middle" fontFamily={F} fontWeight={900} fontSize={size * 0.6} fill={COLORS.red}>
      ?
    </text>
  </g>
);

/** Rounded label pill (SVG). Origin = centre. */
export const Pill: React.FC<{text: string; bg: string; fg: string; size?: number; pad?: number}> = ({text, bg, fg, size = 40, pad = 26}) => {
  const w = text.length * size * 0.66 + pad * 2;
  const h = size * 1.6;
  return (
    <g>
      <rect x={-w / 2 + 6} y={-h / 2 + 8} width={w} height={h} rx={h / 2} fill={COLORS.ink} opacity={0.35} />
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={h / 2} fill={bg} stroke={COLORS.ink} strokeWidth={5} />
      <text y={size * 0.36} textAnchor="middle" fontFamily={F} fontWeight={900} fontSize={size} fill={fg}>
        {text}
      </text>
    </g>
  );
};
