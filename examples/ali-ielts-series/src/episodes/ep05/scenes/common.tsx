import React from 'react';
import {random} from 'remotion';
import {COLORS} from '../../../theme';

export const F = 'Montserrat';
export const SERIF = 'Georgia, serif';

/** Lip-flap amount for a character while one of its lines plays (frames are scene-local). */
export const talkAmount = (f: number, spans: Array<{localFrom: number; localTo: number}>) => {
  for (const s of spans) if (f >= s.localFrom && f < s.localTo) return 0.25 + 0.35 * Math.abs(Math.sin((f - s.localFrom) * 0.9));
  return 0;
};

/** Smoke puff for the costume change. Origin = centre; t = frames since puff. */
export const Puff: React.FC<{t: number; r?: number}> = ({t, r = 260}) => {
  if (t < 0 || t > 18) return null;
  const p = t / 18;
  return (
    <g opacity={1 - p * p}>
      {Array.from({length: 9}).map((_, i) => {
        const a = (i / 9) * Math.PI * 2 + random(`pf${i}`) * 0.6;
        const d = r * (0.25 + p * 0.8);
        return <circle key={i} cx={Math.cos(a) * d} cy={Math.sin(a) * d * 0.8} r={r * (0.32 + 0.2 * random(`pr${i}`)) * (0.6 + p)} fill="#F1F5F9" stroke={COLORS.ink} strokeWidth={5} />;
      })}
      <circle r={r * 0.55 * (1 - p * 0.5)} fill="#FFFFFF" />
    </g>
  );
};

/** Big phone mock-up with a fictional influencer post. Origin = centre. */
export const PhoneFeed: React.FC<{t: number; banner: number; talk: number; scroll: number}> = ({t, banner, talk, scroll}) => (
  <g>
    <rect x={-290} y={-520} width={580} height={1040} rx={70} fill={COLORS.ink} opacity={0.35} transform="translate(14 18)" />
    <rect x={-290} y={-520} width={580} height={1040} rx={70} fill="#0F172A" stroke={COLORS.ink} strokeWidth={8} />
    <rect x={-262} y={-490} width={524} height={980} rx={50} fill="#FFFFFF" />
    <clipPath id="ph-screen">
      <rect x={-262} y={-490} width={524} height={980} rx={50} />
    </clipPath>
    <g clipPath="url(#ph-screen)">
      <g transform={`translate(0 ${scroll})`}>
        {/* other posts scrolling by */}
        {[-1500, -1050].map((y, i) => (
          <g key={y} transform={`translate(0 ${y})`}>
            <rect x={-240} y={-160} width={480} height={330} rx={20} fill={['#FDE68A', '#BFDBFE'][i]} />
            <circle cx={-190} cy={-200} r={26} fill="#CBD5E1" />
            <rect x={-150} y={-212} width={160} height={22} rx={11} fill="#CBD5E1" />
          </g>
        ))}
        {/* the post: header */}
        <circle cx={-200} cy={-420} r={32} fill="url(#ph-ring)" />
        <defs>
          <linearGradient id="ph-ring" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#DB2777" />
          </linearGradient>
        </defs>
        <circle cx={-200} cy={-420} r={25} fill="#7C3AED" />
        <text x={-155} y={-428} fontFamily={F} fontWeight={800} fontSize={28} fill={COLORS.navy}>
          band8.guru
        </text>
        <text x={-155} y={-396} fontFamily={F} fontWeight={600} fontSize={20} fill="#64748B">
          Sponsored · 2.1M views
        </text>
        {/* video area with the guru */}
        <rect x={-262} y={-370} width={524} height={640} fill="#1E1B4B" />
        <g transform="translate(0 -40)">
          <rect x={-220} y={-300} width={440} height={600} fill="url(#ph-bg)" />
          <defs>
            <radialGradient id="ph-bg">
              <stop offset="0%" stopColor="#A855F7" />
              <stop offset="100%" stopColor="#3B0764" />
            </radialGradient>
          </defs>
          {/* fictional guru: big grin, shades, gold chain, pointing */}
          <path d="M -150 300 Q -150 120 0 110 Q 150 120 150 300 Z" fill="#F43F5E" stroke={COLORS.ink} strokeWidth={6} />
          <path d="M -60 140 Q 0 210 60 140" stroke={COLORS.yellow} strokeWidth={10} fill="none" />
          <circle cx={0} cy={0} r={110} fill="#E0AC7E" stroke={COLORS.ink} strokeWidth={6} />
          <path d="M -110 -20 Q -120 -120 0 -126 Q 120 -120 110 -20 Q 90 -80 0 -84 Q -90 -80 -110 -20 Z" fill="#111827" stroke={COLORS.ink} strokeWidth={5} />
          <rect x={-86} y={-22} width={74} height={40} rx={12} fill="#111827" />
          <rect x={12} y={-22} width={74} height={40} rx={12} fill="#111827" />
          <rect x={-14} y={-10} width={28} height={8} fill="#111827" />
          <path d={`M -50 48 Q 0 ${88 + talk * 30} 50 48 Z`} fill="#7F1D1D" stroke={COLORS.ink} strokeWidth={5} />
          <rect x={-38} y={48} width={76} height={12} fill={COLORS.white} />
          <g transform={`translate(150 ${60 + Math.sin(t / 3) * 10}) rotate(-30)`}>
            <rect x={-18} y={-80} width={36} height={110} rx={18} fill="#E0AC7E" stroke={COLORS.ink} strokeWidth={5} />
          </g>
        </g>
        {banner > 0 ? (
          <g transform={`translate(0 -300) scale(${banner}) rotate(-4)`}>
            <rect x={-235} y={-48} width={470} height={96} rx={18} fill={COLORS.yellow} stroke={COLORS.ink} strokeWidth={6} />
            <text y={-2} textAnchor="middle" fontFamily={F} fontWeight={900} fontSize={42} fill={COLORS.navy}>
              BAND 8
            </text>
            <text y={34} textAnchor="middle" fontFamily={F} fontWeight={900} fontSize={32} fill={COLORS.red}>
              VOCABULARY!
            </text>
          </g>
        ) : null}
        {/* like / comment bar */}
        <g transform="translate(-220 320)">
          <path d="M 0 10 C -14 -6 6 -22 14 -8 C 22 -22 42 -6 28 10 L 14 24 Z" fill={COLORS.red} stroke={COLORS.ink} strokeWidth={3} />
          <text x={50} y={22} fontFamily={F} fontWeight={800} fontSize={26} fill={COLORS.navy}>
            {(312 + Math.floor(t * 3.7)).toLocaleString('en-US')}K
          </text>
        </g>
      </g>
    </g>
    <rect x={-60} y={-500} width={120} height={22} rx={11} fill="#0F172A" />
  </g>
);

/** Flying vocabulary chip. Origin = centre. */
export const VocabChip: React.FC<{word: string; color?: string; size?: number}> = ({word, color = COLORS.white, size = 40}) => {
  const w = word.length * size * 0.62 + 50;
  return (
    <g>
      <rect x={-w / 2} y={-size * 0.85} width={w} height={size * 1.7} rx={size * 0.85} fill={color} stroke={COLORS.ink} strokeWidth={5} />
      <text y={size * 0.34} textAnchor="middle" fontFamily={F} fontWeight={900} fontSize={size} fill={COLORS.navy}>
        {word}
      </text>
    </g>
  );
};

/** Capsule "vocabulary pill". Origin = centre. */
export const Pill: React.FC<{word: string; color: string}> = ({word, color}) => {
  const w = word.length * 24 + 60;
  return (
    <g>
      <rect x={-w / 2} y={-34} width={w} height={68} rx={34} fill={COLORS.white} stroke={COLORS.ink} strokeWidth={6} />
      <path d={`M 0 -31 L ${w / 2 - 34} -31 A 31 31 0 0 1 ${w / 2 - 34} 31 L 0 31 Z`} fill={color} />
      <rect x={-w / 2} y={-34} width={w} height={68} rx={34} fill="none" stroke={COLORS.ink} strokeWidth={6} />
      <text y={12} textAnchor="middle" fontFamily={F} fontWeight={900} fontSize={34} fill={COLORS.navy}>
        {word}
      </text>
    </g>
  );
};

/** Cartoon brain. Origin = centre. */
export const Brain: React.FC<{glow?: number}> = ({glow = 0}) => (
  <g>
    {glow > 0 ? <circle r={170} fill={COLORS.yellow} opacity={0.25 * glow} /> : null}
    <path d="M -130 20 Q -150 -60 -90 -90 Q -70 -140 -10 -126 Q 40 -150 90 -110 Q 150 -96 140 -30 Q 170 30 120 70 Q 100 120 30 110 Q -10 140 -60 110 Q -130 110 -130 20 Z" fill="#F9A8D4" stroke={COLORS.ink} strokeWidth={7} strokeLinejoin="round" />
    <path d="M 0 -120 Q -20 -40 6 20 Q 24 70 0 108" stroke="#BE185D" strokeWidth={6} fill="none" strokeLinecap="round" />
    <path d="M -96 -50 Q -60 -40 -70 0 Q -80 40 -40 50" stroke="#BE185D" strokeWidth={6} fill="none" strokeLinecap="round" />
    <path d="M 90 -66 Q 60 -40 76 -6 Q 96 34 56 56" stroke="#BE185D" strokeWidth={6} fill="none" strokeLinecap="round" />
  </g>
);

/** Vertical confidence meter. Origin = bottom centre. value in %, shown up to 999. */
export const ConfidenceMeter: React.FC<{value: number; h?: number}> = ({value, h = 620}) => {
  const fill = Math.min(1, value / 100);
  const over = value > 100;
  const color = value < 30 ? COLORS.red : value < 100 ? COLORS.yellow : COLORS.green;
  return (
    <g>
      <text y={-h - 70} textAnchor="middle" fontFamily={F} fontWeight={900} fontSize={30} fill={COLORS.white} stroke={COLORS.ink} strokeWidth={8} paintOrder="stroke">
        ISHONCH
      </text>
      <rect x={-46} y={-h} width={92} height={h} rx={46} fill="#1F2937" stroke={COLORS.ink} strokeWidth={7} />
      <rect x={-34} y={-h * fill + 12} width={68} height={Math.max(0, h * fill - 24)} rx={34} fill={color} />
      {over ? <rect x={-34} y={-h + 12} width={68} height={h - 24} rx={34} fill={COLORS.green} opacity={0.5 + 0.5 * Math.abs(Math.sin(value / 37))} /> : null}
      <g transform={`translate(0 ${-h - 20})`}>
        <rect x={-96} y={-40} width={192} height={72} rx={20} fill={over ? COLORS.green : value < 30 ? COLORS.red : COLORS.white} stroke={COLORS.ink} strokeWidth={6} />
        <text y={14} textAnchor="middle" fontFamily={F} fontWeight={900} fontSize={44} fill={over || value < 30 ? COLORS.white : COLORS.navy}>
          {Math.round(value)}%
        </text>
      </g>
    </g>
  );
};

/** Laptop seen from behind-ish, on the desk. Origin = bottom centre of the base. */
export const Laptop: React.FC<{screen?: number}> = ({screen = 1}) => (
  <g>
    <path d="M -230 0 L 230 0 L 200 -30 L -200 -30 Z" fill="#94A3B8" stroke={COLORS.ink} strokeWidth={6} strokeLinejoin="round" />
    <rect x={-190} y={-290} width={380} height={262} rx={18} fill="#334155" stroke={COLORS.ink} strokeWidth={6} />
    <rect x={-170} y={-272} width={340} height={226} rx={10} fill="#E0F2FE" opacity={screen} />
    <circle cx={0} cy={-160} r={26} fill="#94A3B8" />
  </g>
);

/** Cartoon flames along a line (on the keyboard). Origin = centre bottom. */
export const Flames: React.FC<{t: number; w?: number; k?: number}> = ({t, w = 380, k = 1}) => (
  <g>
    {Array.from({length: 7}).map((_, i) => {
      const x = -w / 2 + (i + 0.5) * (w / 7);
      const h = (70 + 50 * Math.abs(Math.sin(t / 2.2 + i * 1.7))) * k;
      return (
        <g key={i} transform={`translate(${x} 0)`}>
          <path d={`M -26 0 Q -34 ${-h * 0.5} 0 ${-h} Q 34 ${-h * 0.5} 26 0 Z`} fill="#F97316" stroke={COLORS.ink} strokeWidth={4} strokeLinejoin="round" />
          <path d={`M -12 0 Q -16 ${-h * 0.32} 0 ${-h * 0.6} Q 16 ${-h * 0.32} 12 0 Z`} fill={COLORS.yellow} />
        </g>
      );
    })}
  </g>
);

/** Gold museum frame around a w×h box. Origin = centre. */
export const MuseumFrame: React.FC<{w: number; h: number}> = ({w, h}) => (
  <g>
    <rect x={-w / 2 - 46} y={-h / 2 - 46} width={w + 92} height={h + 92} rx={14} fill="#B45309" stroke={COLORS.ink} strokeWidth={7} />
    <rect x={-w / 2 - 34} y={-h / 2 - 34} width={w + 68} height={h + 68} rx={10} fill="#FBBF24" stroke={COLORS.ink} strokeWidth={4} />
    <rect x={-w / 2 - 12} y={-h / 2 - 12} width={w + 24} height={h + 24} rx={6} fill="#92400E" stroke={COLORS.ink} strokeWidth={4} />
    {[
      [-1, -1],
      [1, -1],
      [-1, 1],
      [1, 1],
    ].map(([sx, sy], i) => (
      <circle key={i} cx={sx * (w / 2 + 28)} cy={sy * (h / 2 + 28)} r={22} fill="#FDE68A" stroke={COLORS.ink} strokeWidth={4} />
    ))}
  </g>
);

/** Loading spinner above a head. Origin = centre. */
export const Loading: React.FC<{t: number}> = ({t}) => (
  <g>
    <rect x={-150} y={-60} width={300} height={120} rx={30} fill={COLORS.white} stroke={COLORS.ink} strokeWidth={6} />
    {Array.from({length: 8}).map((_, i) => {
      const a = (i / 8) * Math.PI * 2;
      const on = (Math.floor(t / 3) % 8) === i;
      return <circle key={i} cx={-80 + Math.cos(a) * 28} cy={Math.sin(a) * 28} r={8} fill={on ? COLORS.blue : '#CBD5E1'} />;
    })}
    <text x={30} y={14} textAnchor="middle" fontFamily={F} fontWeight={900} fontSize={34} fill={COLORS.navy}>
      {'...'.slice(0, 1 + (Math.floor(t / 8) % 3))}
    </text>
    <text x={-10} y={14} fontFamily={F} fontWeight={900} fontSize={30} fill={COLORS.navy} />
  </g>
);

/** Classroom wall with a chalkboard. */
export const Classroom: React.FC<{pan?: number}> = ({pan = 0}) => (
  <g>
    <rect width={1080} height={1920} fill="#C7D2B5" />
    <rect y={1380} width={1080} height={540} fill="#8B6B4A" />
    <rect y={1372} width={1080} height={16} fill="#5B4430" />
    <g transform={`translate(${pan} 0)`}>
      <rect x={70} y={420} width={940} height={560} rx={14} fill="#1F3B2D" stroke="#5B4430" strokeWidth={22} />
      <text x={130} y={540} fontFamily="'Comic Sans MS', cursive" fontSize={50} fill="#E5E7EB" opacity={0.85}>
        IELTS Writing Task 2
      </text>
      <path d="M 130 580 L 640 580" stroke="#E5E7EB" strokeWidth={4} opacity={0.6} />
      <text x={130} y={660} fontFamily="'Comic Sans MS', cursive" fontSize={40} fill="#E5E7EB" opacity={0.7}>
        • Clear position
      </text>
      <text x={130} y={730} fontFamily="'Comic Sans MS', cursive" fontSize={40} fill="#E5E7EB" opacity={0.7}>
        • Relevant ideas
      </text>
      <rect x={60} y={990} width={960} height={18} rx={6} fill="#5B4430" />
    </g>
  </g>
);
