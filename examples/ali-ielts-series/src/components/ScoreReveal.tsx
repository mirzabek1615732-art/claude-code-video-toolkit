import React from 'react';
import {COLORS} from '../theme';
import {pop} from './anim';

type Row = {label: string; score: string; at: number; color?: string};

/** Mock-test result sheet with scores that slam in on their beats. */
export const ScoreReveal: React.FC<{frame: number; rows: Row[]; title?: string}> = ({frame, rows, title = 'MOCK TEST NATIJASI'}) => (
  <g>
    <rect x={-380} y={-300} width={760} height={600} rx={26} fill="#FFFDF5" stroke={COLORS.ink} strokeWidth={8} />
    <rect x={-380} y={-300} width={760} height={110} rx={26} fill={COLORS.navy} />
    <rect x={-380} y={-220} width={760} height={30} fill={COLORS.navy} />
    <text y={-228} textAnchor="middle" fontFamily="Montserrat" fontWeight={900} fontSize={46} fill={COLORS.white}>
      {title}
    </text>
    {rows.map((r, i) => {
      const p = pop(frame, r.at, 30, {damping: 9, stiffness: 300, mass: 0.6});
      const y = -90 + i * 180;
      const visible = frame >= r.at;
      return (
        <g key={r.label} transform={`translate(0 ${y})`}>
          <text x={-330} y={20} fontFamily="Montserrat" fontWeight={900} fontSize={56} fill={COLORS.navy}>
            {r.label}
          </text>
          <line x1={-330} x2={330} y1={70} y2={70} stroke="#CBD5E1" strokeWidth={5} strokeDasharray="14 10" />
          {visible ? (
            <g transform={`translate(240 0) scale(${Math.max(0, 2.6 - 1.6 * p)}) rotate(${(1 - p) * -20})`} opacity={Math.min(1, p * 2)}>
              <circle r={78} fill="none" stroke={r.color ?? COLORS.red} strokeWidth={9} />
              <text y={30} textAnchor="middle" fontFamily="Montserrat" fontWeight={900} fontSize={88} fill={r.color ?? COLORS.red}>
                {r.score}
              </text>
            </g>
          ) : null}
        </g>
      );
    })}
  </g>
);
