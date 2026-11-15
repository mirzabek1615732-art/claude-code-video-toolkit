import React from 'react';
import {random} from 'remotion';
import {COLORS} from '../../../theme';

export const F = 'Montserrat';
export const GOLD = '#FBBF24';
export const GOLD_DARK = '#B45309';

/** Golden cup. Origin = centre of the base bottom. `label` sits on the cup; `crack` 0…1 draws a growing crack. */
export const Trophy: React.FC<{label: string; size?: number; crack?: number; dull?: number}> = ({label, size = 1, crack = 0, dull = 0}) => (
  <g transform={`scale(${size})`} opacity={1 - dull * 0.25}>
    <rect x={-70} y={-36} width={140} height={36} rx={8} fill={GOLD_DARK} stroke={COLORS.ink} strokeWidth={6} />
    <rect x={-22} y={-90} width={44} height={58} fill={GOLD} stroke={COLORS.ink} strokeWidth={6} />
    <path d="M -110 -300 Q -190 -290 -170 -210 Q -150 -150 -84 -160" fill="none" stroke={GOLD} strokeWidth={22} strokeLinecap="round" />
    <path d="M 110 -300 Q 190 -290 170 -210 Q 150 -150 84 -160" fill="none" stroke={GOLD} strokeWidth={22} strokeLinecap="round" />
    <path d="M -120 -330 L 120 -330 Q 124 -150 0 -86 Q -124 -150 -120 -330 Z" fill={dull > 0.5 ? '#D6B45A' : GOLD} stroke={COLORS.ink} strokeWidth={7} strokeLinejoin="round" />
    <path d="M -92 -310 Q -92 -200 -40 -140" fill="none" stroke="#FEF3C7" strokeWidth={12} strokeLinecap="round" opacity={0.8} />
    <text y={-190} textAnchor="middle" fontFamily={F} fontWeight={900} fontSize={label.length > 2 ? 78 : 110} fill={COLORS.navy}>
      {label}
    </text>
    {crack > 0 ? (
      <path d="M -30 -330 L 4 -270 L -26 -230 L 18 -180 L -8 -130 L 10 -96" fill="none" stroke={COLORS.ink} strokeWidth={9} strokeLinejoin="round" strokeLinecap="round" strokeDasharray={320} strokeDashoffset={320 * (1 - crack)} />
    ) : null}
  </g>
);

/** Winner's podium, origin = centre of the top surface. */
export const Podium: React.FC = () => (
  <g>
    <rect x={-380} y={90} width={220} height={400} fill="#94A3B8" stroke={COLORS.ink} strokeWidth={7} />
    <rect x={160} y={150} width={220} height={400} fill="#B45309" stroke={COLORS.ink} strokeWidth={7} />
    <rect x={-170} y={0} width={340} height={600} fill={GOLD} stroke={COLORS.ink} strokeWidth={7} />
    <rect x={-190} y={-20} width={380} height={40} rx={10} fill="#FDE68A" stroke={COLORS.ink} strokeWidth={7} />
    <text y={150} textAnchor="middle" fontFamily={F} fontWeight={900} fontSize={130} fill={COLORS.navy}>
      1
    </text>
    <text x={-270} y={230} textAnchor="middle" fontFamily={F} fontWeight={900} fontSize={110} fill={COLORS.navy}>
      2
    </text>
    <text x={270} y={280} textAnchor="middle" fontFamily={F} fontWeight={900} fontSize={110} fill={COLORS.navy}>
      3
    </text>
  </g>
);

/** Cheering crowd silhouettes along the bottom; `t` drives the bounce. */
export const Crowd: React.FC<{t: number; y: number; frozen?: boolean}> = ({t, y, frozen}) => (
  <g>
    {Array.from({length: 9}).map((_, i) => {
      const x = 60 + i * 120;
      const b = frozen ? 0 : Math.abs(Math.sin(t / 4 + i * 1.3)) * 40;
      const c = ['#1E3A8A', '#7C3AED', '#BE185D', '#0F766E'][i % 4];
      return (
        <g key={i} transform={`translate(${x} ${y - b})`}>
          <path d="M -34 -60 L -62 -150" stroke={c} strokeWidth={20} strokeLinecap="round" />
          <path d="M 34 -60 L 62 -150" stroke={c} strokeWidth={20} strokeLinecap="round" />
          <circle cy={-110} r={44} fill={c} stroke={COLORS.ink} strokeWidth={5} />
          <rect x={-56} y={-70} width={112} height={300} rx={40} fill={c} stroke={COLORS.ink} strokeWidth={5} />
        </g>
      );
    })}
  </g>
);

/** Audio waveform bars. `level` 0…1 animates amplitude; deterministic per seed. */
export const Wave: React.FC<{w: number; h: number; t: number; level: number; color: string; bars?: number; seed?: string}> = ({w, h, t, level, color, bars = 28, seed = 'w'}) => (
  <g>
    {Array.from({length: bars}).map((_, i) => {
      const base = 0.18 + random(`${seed}${i}`) * 0.3;
      const a = base + level * (0.25 + 0.55 * Math.abs(Math.sin(t / 2.2 + i * 0.9 + random(`${seed}p${i}`) * 6)));
      const bh = Math.min(1, a) * h;
      return <rect key={i} x={-w / 2 + (i * w) / bars} y={-bh / 2} width={(w / bars) * 0.6} height={bh} rx={(w / bars) * 0.3} fill={color} />;
    })}
  </g>
);

/** Listening-practice player card (original design). Origin = centre. */
export const AudioPlayer: React.FC<{t: number; level: number; progress: number}> = ({t, level, progress}) => (
  <g>
    <rect x={-430} y={-150} width={860} height={300} rx={36} fill={COLORS.ink} opacity={0.35} transform="translate(10 14)" />
    <rect x={-430} y={-150} width={860} height={300} rx={36} fill="#0F172A" stroke={COLORS.ink} strokeWidth={7} />
    <text x={-390} y={-92} fontFamily={F} fontWeight={900} fontSize={34} letterSpacing={3} fill={COLORS.yellow}>
      LISTENING PRACTICE · SECTION 1
    </text>
    <circle cx={-340} cy={10} r={54} fill={COLORS.blue} stroke={COLORS.white} strokeWidth={6} />
    {level > 0.05 ? (
      <g>
        <rect x={-360} y={-16} width={14} height={52} rx={4} fill={COLORS.white} />
        <rect x={-334} y={-16} width={14} height={52} rx={4} fill={COLORS.white} />
      </g>
    ) : (
      <path d="M -356 -20 L -356 40 L -312 10 Z" fill={COLORS.white} />
    )}
    <g transform="translate(90 10)">
      <Wave w={620} h={120} t={t} level={level} color="#60A5FA" seed="ap" />
    </g>
    <rect x={-390} y={104} width={780} height={12} rx={6} fill="#334155" />
    <rect x={-390} y={104} width={780 * Math.max(0, Math.min(1, progress))} height={12} rx={6} fill={COLORS.yellow} />
  </g>
);

/** Question card: "Bus number: ____" with a handwritten answer. Origin = centre. */
export const QuestionCard: React.FC<{answer?: string; write?: number; wrong?: number; fixed?: string; fix?: number}> = ({answer, write = 0, wrong = 0, fixed, fix = 0}) => (
  <g>
    <rect x={-380} y={-100} width={760} height={200} rx={28} fill={COLORS.ink} opacity={0.3} transform="translate(8 12)" />
    <rect x={-380} y={-100} width={760} height={200} rx={28} fill="#FFFDF7" stroke={COLORS.ink} strokeWidth={7} />
    <text x={-340} y={-46} fontFamily={F} fontWeight={900} fontSize={28} letterSpacing={4} fill={COLORS.blue}>
      QUESTION 1
    </text>
    <text x={-340} y={46} fontFamily={F} fontWeight={800} fontSize={62} fill={COLORS.navy}>
      Bus number:
    </text>
    <line x1={110} y1={58} x2={330} y2={58} stroke={COLORS.navy} strokeWidth={6} strokeLinecap="round" />
    {answer && write > 0 ? (
      <g>
        <clipPath id={`qc-clip-${answer}`}>
          <rect x={110} y={-60} width={230 * write} height={130} />
        </clipPath>
        <text x={220} y={44} textAnchor="middle" fontFamily="Georgia, serif" fontStyle="italic" fontWeight={700} fontSize={96} fill={wrong > 0.5 ? COLORS.red : '#1D4ED8'} clipPath={`url(#qc-clip-${answer})`} opacity={1 - fix * 0.55}>
          {answer}
        </text>
        {wrong > 0 ? <line x1={130} y1={10} x2={130 + 180 * wrong} y2={10} stroke={COLORS.red} strokeWidth={10} strokeLinecap="round" /> : null}
      </g>
    ) : null}
    {fixed && fix > 0 ? (
      <text x={300} y={-20} textAnchor="middle" fontFamily="Georgia, serif" fontStyle="italic" fontWeight={700} fontSize={96 * fix} fill={COLORS.green} stroke="#FFFDF7" strokeWidth={8} paintOrder="stroke" transform="rotate(-8 300 -20)">
        {fixed}
      </text>
    ) : null}
  </g>
);

/** Thundercloud with rain; origin = centre. `flash` 0…1 lights a bolt. */
export const StormCloud: React.FC<{t: number; flash?: number}> = ({t, flash = 0}) => (
  <g>
    {Array.from({length: 7}).map((_, i) => {
      const p = ((t * 9 + i * 37) % 150) / 150;
      return <line key={i} x1={-110 + i * 36} y1={50 + p * 150} x2={-118 + i * 36} y2={80 + p * 150} stroke="#60A5FA" strokeWidth={7} strokeLinecap="round" opacity={1 - p} />;
    })}
    {flash > 0 ? <path d="M 10 40 L -30 120 L 6 120 L -24 210 L 60 96 L 22 96 L 50 40 Z" fill={COLORS.yellow} stroke={COLORS.ink} strokeWidth={5} strokeLinejoin="round" opacity={flash} /> : null}
    <path d="M -150 50 Q -200 50 -196 4 Q -190 -40 -140 -40 Q -130 -100 -60 -96 Q -20 -140 40 -104 Q 110 -120 130 -54 Q 196 -50 194 6 Q 192 50 140 50 Z" fill="#475569" stroke={COLORS.ink} strokeWidth={7} strokeLinejoin="round" />
  </g>
);

/** Big cartoon number tile. Origin = centre. */
export const NumberTile: React.FC<{n: string; color: string; size?: number; ring?: number}> = ({n, color, size = 1, ring = 0}) => (
  <g transform={`scale(${size})`}>
    <rect x={-170} y={-170} width={340} height={340} rx={50} fill={COLORS.ink} opacity={0.3} transform="translate(10 14)" />
    <rect x={-170} y={-170} width={340} height={340} rx={50} fill={color} stroke={ring > 0.5 ? COLORS.yellow : COLORS.ink} strokeWidth={ring > 0.5 ? 16 : 8} />
    <text y={72} textAnchor="middle" fontFamily={F} fontWeight={900} fontSize={210} fill={COLORS.white} stroke={COLORS.ink} strokeWidth={12} paintOrder="stroke">
      {n}
    </text>
  </g>
);

/** Red cross / green tick badges (no emoji fonts in the renderer). */
export const Cross: React.FC<{r?: number}> = ({r = 60}) => (
  <g>
    <circle r={r} fill={COLORS.red} stroke={COLORS.ink} strokeWidth={r * 0.12} />
    <path d={`M ${-r * 0.42} ${-r * 0.42} L ${r * 0.42} ${r * 0.42} M ${r * 0.42} ${-r * 0.42} L ${-r * 0.42} ${r * 0.42}`} stroke={COLORS.white} strokeWidth={r * 0.26} strokeLinecap="round" />
  </g>
);
export const Tick: React.FC<{r?: number}> = ({r = 60}) => (
  <g>
    <circle r={r} fill={COLORS.green} stroke={COLORS.ink} strokeWidth={r * 0.12} />
    <path d={`M ${-r * 0.46} ${r * 0.02} L ${-r * 0.12} ${r * 0.38} L ${r * 0.5} ${-r * 0.34}`} fill="none" stroke={COLORS.white} strokeWidth={r * 0.26} strokeLinecap="round" strokeLinejoin="round" />
  </g>
);

/** Pencil lying flat; origin = centre. */
export const Pencil: React.FC<{len?: number}> = ({len = 150}) => (
  <g>
    <rect x={-len / 2} y={-9} width={len - 30} height={18} fill={COLORS.yellow} stroke={COLORS.ink} strokeWidth={4} />
    <path d={`M ${len / 2 - 30} -9 L ${len / 2} 0 L ${len / 2 - 30} 9 Z`} fill="#FDE68A" stroke={COLORS.ink} strokeWidth={4} strokeLinejoin="round" />
    <rect x={-len / 2 - 14} y={-9} width={16} height={18} rx={4} fill="#F472B6" stroke={COLORS.ink} strokeWidth={4} />
  </g>
);
