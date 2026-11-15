import React from 'react';
import {COLORS} from '../theme';
import {EASE, tween} from './anim';

type Page = {day: string; date: string; note?: string};

/**
 * Tear-off wall calendar. Each page in `pages[i]` (i ≥ 1) flips over its top
 * binding starting at `flipAt[i-1]` (frames, scene-local).
 */
export const CalendarFlip: React.FC<{frame: number; pages: Page[]; flipAt: number[]; flipDuration?: number}> = ({
  frame,
  pages,
  flipAt,
  flipDuration = 9,
}) => {
  const W = 360;
  const H = 400;
  let current = 0;
  flipAt.forEach((f, i) => {
    if (frame >= f + flipDuration) current = i + 1;
  });
  const flipping = flipAt.findIndex((f) => frame >= f && frame < f + flipDuration);
  const PageFace = ({p, shade = 0}: {p: Page; shade?: number}) => (
    <g>
      <rect x={-W / 2} y={0} width={W} height={H} rx={18} fill={COLORS.white} stroke={COLORS.ink} strokeWidth={7} />
      <rect x={-W / 2} y={0} width={W} height={100} rx={18} fill={COLORS.red} stroke={COLORS.ink} strokeWidth={7} />
      <rect x={-W / 2 + 4} y={70} width={W - 8} height={30} fill={COLORS.red} />
      <text y={70} textAnchor="middle" fontFamily="Montserrat" fontWeight={900} fontSize={p.day.length > 9 ? 44 : 52} fill={COLORS.white}>
        {p.day}
      </text>
      <text y={270} textAnchor="middle" fontFamily="Montserrat" fontWeight={900} fontSize={170} fill={COLORS.navy}>
        {p.date}
      </text>
      {p.note ? (
        <text y={350} textAnchor="middle" fontFamily="Montserrat" fontWeight={800} fontSize={36} fill={COLORS.orange}>
          {p.note}
        </text>
      ) : null}
      {shade > 0 ? <rect x={-W / 2} y={0} width={W} height={H} rx={18} fill="#000" opacity={shade} /> : null}
    </g>
  );
  const next = pages[Math.min(pages.length - 1, flipping >= 0 ? flipping + 1 : current)];
  const top = pages[flipping >= 0 ? flipping : current];
  const p = flipping >= 0 ? tween(frame, [flipAt[flipping], flipAt[flipping] + flipDuration], [0, 1], EASE.in) : 0;
  const cos = Math.cos(p * Math.PI);
  return (
    <g>
      {/* page stack thickness */}
      <rect x={-W / 2 + 10} y={14} width={W} height={H} rx={18} fill="#CBD5E1" stroke={COLORS.ink} strokeWidth={6} />
      {flipping >= 0 ? <PageFace p={next} /> : null}
      {flipping >= 0 ? (
        <g transform={`scale(1 ${cos})`}>{cos > 0 ? <PageFace p={top} shade={p * 0.4} /> : <rect x={-W / 2} y={0} width={W} height={H} rx={18} fill="#E2E8F0" stroke={COLORS.ink} strokeWidth={7} />}</g>
      ) : (
        <PageFace p={top} />
      )}
      {/* rings */}
      {[-110, -40, 40, 110].map((rx) => (
        <rect key={rx} x={rx - 8} y={-22} width={16} height={44} rx={8} fill="#64748B" stroke={COLORS.ink} strokeWidth={4} />
      ))}
    </g>
  );
};

/** Week strip with animated daily check marks (consistent practice). */
export const StreakCalendar: React.FC<{frame: number; from: number; stagger?: number; days?: string[]}> = ({
  frame,
  from,
  stagger = 5,
  days = ['Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sh', 'Ya'],
}) => (
  <g>
    <rect x={-470} y={-90} width={940} height={180} rx={34} fill={COLORS.white} stroke={COLORS.ink} strokeWidth={7} />
    {days.map((d, i) => {
      const x = -390 + i * 130;
      const p = tween(frame, [from + i * stagger, from + i * stagger + 8], [0, 1], EASE.back);
      return (
        <g key={d} transform={`translate(${x} 0)`}>
          <text y={-36} textAnchor="middle" fontFamily="Montserrat" fontWeight={800} fontSize={32} fill={COLORS.navy}>
            {d}
          </text>
          <circle cy={26} r={38} fill={p > 0 ? COLORS.green : '#E2E8F0'} stroke={COLORS.ink} strokeWidth={5} transform={`scale(${0.6 + 0.4 * p})`} />
          {p > 0 ? <path d="M -16 26 L -4 40 L 18 10" stroke={COLORS.white} strokeWidth={9} fill="none" strokeLinecap="round" strokeLinejoin="round" opacity={p} /> : null}
        </g>
      );
    })}
  </g>
);
