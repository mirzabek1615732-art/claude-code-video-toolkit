import React from 'react';
import {COLORS} from '../theme';

/**
 * Band-score progress bar. `value` is a band score (e.g. 5.0); the scale runs
 * from `min` to `max`. Shows honest, gradual progress — never a promise.
 */
export const ProgressBar: React.FC<{value: number; min?: number; max?: number; width?: number; label?: string; frame: number}> = ({
  value,
  min = 4,
  max = 7,
  width = 860,
  label = 'MOCK BALL',
  frame,
}) => {
  const k = Math.max(0, Math.min(1, (value - min) / (max - min)));
  const ticks: number[] = [];
  for (let v = min; v <= max + 0.001; v += 0.5) ticks.push(v);
  const shimmer = ((frame * 14) % (width + 300)) - 150;
  return (
    <g>
      <defs>
        <clipPath id="pb-clip">
          <rect x={-width / 2} y={-34} width={width * k} height={68} rx={34} />
        </clipPath>
        <linearGradient id="pb-fill" x1="0" x2="1">
          <stop offset="0%" stopColor="#16A34A" />
          <stop offset="100%" stopColor={COLORS.green} />
        </linearGradient>
      </defs>
      <text x={-width / 2} y={-62} fontFamily="Montserrat" fontWeight={900} fontSize={44} fill={COLORS.white} stroke={COLORS.navy} strokeWidth={10} paintOrder="stroke">
        {label}
      </text>
      <text x={width / 2} y={-62} textAnchor="end" fontFamily="Montserrat" fontWeight={900} fontSize={60} fill={COLORS.green} stroke={COLORS.navy} strokeWidth={10} paintOrder="stroke">
        {value.toFixed(1)}
      </text>
      <rect x={-width / 2} y={-34} width={width} height={68} rx={34} fill="#1E293B" stroke={COLORS.ink} strokeWidth={7} />
      <g clipPath="url(#pb-clip)">
        <rect x={-width / 2} y={-34} width={width} height={68} fill="url(#pb-fill)" />
        <rect x={-width / 2 + shimmer} y={-34} width={60} height={68} fill="#FFF" opacity={0.35} transform="skewX(-20)" />
      </g>
      {ticks.map((v) => {
        const x = -width / 2 + ((v - min) / (max - min)) * width;
        return (
          <g key={v}>
            <line x1={x} x2={x} y1={40} y2={58} stroke={COLORS.white} strokeWidth={4} />
            <text x={x} y={96} textAnchor="middle" fontFamily="Montserrat" fontWeight={800} fontSize={30} fill={COLORS.white}>
              {v.toFixed(1)}
            </text>
          </g>
        );
      })}
    </g>
  );
};
