import React from 'react';
import {random, useCurrentFrame} from 'remotion';
import {COLORS} from '../theme';

/** Rotating comic sun-burst with radial gradient (SVG, full frame). */
export const BurstBackground: React.FC<{a?: string; b?: string; rays?: number; speed?: number; cx?: number; cy?: number; id: string}> = ({
  a = COLORS.blue,
  b = COLORS.blueDark,
  rays = 18,
  speed = 0.35,
  cx = 540,
  cy = 900,
  id,
}) => {
  const frame = useCurrentFrame();
  const rot = frame * speed;
  const R = 2400;
  return (
    <g>
      <defs>
        <radialGradient id={`${id}-g`} cx={cx / 1080} cy={cy / 1920} r="0.75">
          <stop offset="0%" stopColor={a} />
          <stop offset="100%" stopColor={b} />
        </radialGradient>
      </defs>
      <rect width={1080} height={1920} fill={`url(#${id}-g)`} />
      <g transform={`translate(${cx} ${cy}) rotate(${rot})`} opacity={0.18}>
        {Array.from({length: rays}).map((_, i) => {
          const a0 = (i / rays) * Math.PI * 2;
          const a1 = a0 + Math.PI / rays;
          return <path key={i} d={`M 0 0 L ${Math.cos(a0) * R} ${Math.sin(a0) * R} L ${Math.cos(a1) * R} ${Math.sin(a1) * R} Z`} fill={COLORS.white} />;
        })}
      </g>
    </g>
  );
};

/** Halftone dots drifting slowly — adds texture and constant motion. */
export const HalftoneDrift: React.FC<{color?: string; opacity?: number; speed?: number; size?: number}> = ({
  color = COLORS.white,
  opacity = 0.08,
  speed = 0.6,
  size = 60,
}) => {
  const frame = useCurrentFrame();
  const off = (frame * speed) % size;
  const dots: React.ReactNode[] = [];
  for (let y = -size; y < 1920 + size; y += size) {
    for (let x = -size; x < 1080 + size; x += size) {
      const row = Math.round(y / size);
      dots.push(<circle key={`${x}-${y}`} cx={x + off + (row % 2) * (size / 2)} cy={y + off} r={size * 0.12} fill={color} />);
    }
  }
  return <g opacity={opacity}>{dots}</g>;
};

/** Floating soft shapes for parallax depth. depth 0 (far) … 1 (near). */
export const FloatingShapes: React.FC<{count?: number; seed?: string; colors?: string[]; depth?: number; camX?: number}> = ({
  count = 10,
  seed = 'fs',
  colors = [COLORS.yellow, COLORS.orange, COLORS.white],
  depth = 0.5,
  camX = 0,
}) => {
  const frame = useCurrentFrame();
  return (
    <g>
      {Array.from({length: count}).map((_, i) => {
        const x = random(`${seed}-x-${i}`) * 1080 + camX * depth;
        const y = ((random(`${seed}-y-${i}`) * 2200 - frame * (0.6 + depth * 1.6)) % 2200 + 2200) % 2200 - 140;
        const r = 10 + random(`${seed}-r-${i}`) * 26 * (0.5 + depth);
        const kind = i % 3;
        const c = colors[i % colors.length];
        const rot = frame * (i % 2 ? 1 : -1) * 1.2;
        return (
          <g key={i} transform={`translate(${x} ${y}) rotate(${rot})`} opacity={0.35 + depth * 0.3}>
            {kind === 0 ? <circle r={r} fill="none" stroke={c} strokeWidth={6} /> : null}
            {kind === 1 ? <path d={`M ${-r} 0 L ${r} 0 M 0 ${-r} L 0 ${r}`} stroke={c} strokeWidth={8} strokeLinecap="round" /> : null}
            {kind === 2 ? <rect x={-r * 0.7} y={-r * 0.7} width={r * 1.4} height={r * 1.4} rx={4} fill={c} /> : null}
          </g>
        );
      })}
    </g>
  );
};

/**
 * Cartoon bedroom / living-room set with 3 parallax layers.
 * `pan` is a horizontal camera offset in px; far layers move less.
 */
export const RoomBackground: React.FC<{
  wall?: string;
  wall2?: string;
  floor?: string;
  horizon?: number;
  pan?: number;
  night?: number;
  showWindow?: boolean;
  shelf?: boolean;
}> = ({wall = '#334155', wall2 = '#1E293B', floor = '#7C5A3C', horizon = 1340, pan = 0, night = 0, showWindow = true, shelf = true}) => {
  const frame = useCurrentFrame();
  const sky = night > 0.5 ? '#1E1B4B' : '#7DD3FC';
  return (
    <g>
      <defs>
        <linearGradient id="room-wall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={wall2} />
          <stop offset="100%" stopColor={wall} />
        </linearGradient>
        <linearGradient id="room-floor" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={floor} />
          <stop offset="100%" stopColor="#4A3423" />
        </linearGradient>
      </defs>
      <rect width={1080} height={1920} fill="url(#room-wall)" />
      {/* wallpaper stripes (far layer) */}
      <g transform={`translate(${pan * 0.2} 0)`} opacity={0.08}>
        {Array.from({length: 16}).map((_, i) => (
          <rect key={i} x={-200 + i * 100} y={0} width={44} height={horizon} fill={COLORS.white} />
        ))}
      </g>
      {/* window (mid layer) */}
      {showWindow ? (
        <g transform={`translate(${720 + pan * 0.35} 300)`}>
          <rect x={-10} y={-10} width={300} height={380} rx={14} fill="#F8FAFC" stroke={COLORS.ink} strokeWidth={6} />
          <rect x={10} y={10} width={260} height={340} rx={6} fill={sky} />
          {night > 0.5 ? (
            <circle cx={200} cy={80} r={34} fill="#FEF3C7" />
          ) : (
            <g transform={`translate(${((frame * 0.8) % 400) - 80} 0)`}>
              <ellipse cx={60} cy={90} rx={50} ry={20} fill={COLORS.white} />
              <ellipse cx={90} cy={78} rx={34} ry={22} fill={COLORS.white} />
            </g>
          )}
          <rect x={136} y={10} width={8} height={340} fill="#F8FAFC" />
          <rect x={10} y={176} width={260} height={8} fill="#F8FAFC" />
          <path d="M -30 -20 Q 40 180 -20 400 L -50 400 L -50 -20 Z" fill={COLORS.orange} stroke={COLORS.ink} strokeWidth={5} />
          <path d="M 310 -20 Q 240 180 300 400 L 330 400 L 330 -20 Z" fill={COLORS.orange} stroke={COLORS.ink} strokeWidth={5} />
        </g>
      ) : null}
      {/* shelf + poster (mid layer) */}
      {shelf ? (
        <g transform={`translate(${90 + pan * 0.35} 340)`}>
          <rect x={0} y={0} width={230} height={290} rx={10} fill={COLORS.yellow} stroke={COLORS.ink} strokeWidth={6} transform="rotate(-4)" />
          <text x={115} y={170} textAnchor="middle" fontFamily="Montserrat" fontWeight={900} fontSize={96} fill={COLORS.navy} transform="rotate(-4)">
            7.0
          </text>
          <text x={115} y={70} textAnchor="middle" fontFamily="Montserrat" fontWeight={900} fontSize={40} fill={COLORS.navy} transform="rotate(-4)">
            ORZU
          </text>
          <rect x={-20} y={380} width={280} height={18} rx={6} fill="#92400E" stroke={COLORS.ink} strokeWidth={5} />
          {[0, 1, 2, 3, 4].map((i) => (
            <rect key={i} x={i * 46} y={380 - 70 - (i % 2) * 14} width={34} height={70 + (i % 2) * 14} rx={4} fill={[COLORS.orange, COLORS.green, COLORS.blueLight, COLORS.red, COLORS.white][i]} stroke={COLORS.ink} strokeWidth={4} />
          ))}
        </g>
      ) : null}
      {/* floor (near layer) */}
      <rect x={-200} y={horizon} width={1480} height={1920 - horizon} fill="url(#room-floor)" />
      <rect x={-200} y={horizon - 14} width={1480} height={22} fill="#0F172A" opacity={0.6} />
      <g transform={`translate(${pan * 0.8} 0)`} opacity={0.18}>
        {Array.from({length: 12}).map((_, i) => (
          <line key={i} x1={-300 + i * 160} y1={horizon} x2={-700 + i * 260} y2={1920} stroke="#000" strokeWidth={4} />
        ))}
      </g>
      {night > 0 ? <rect width={1080} height={1920} fill="#020617" opacity={night * 0.45} /> : null}
    </g>
  );
};

/** Radial speed lines for crash zooms. */
export const SpeedLines: React.FC<{cx?: number; cy?: number; opacity?: number; seed?: string}> = ({cx = 540, cy = 900, opacity = 1, seed = 'sl'}) => {
  const frame = useCurrentFrame();
  return (
    <g opacity={opacity}>
      {Array.from({length: 40}).map((_, i) => {
        const a = (i / 40) * Math.PI * 2 + random(`${seed}-${i}-${Math.floor(frame / 2)}`) * 0.1;
        const r1 = 520 + random(`${seed}-r-${i}-${Math.floor(frame / 2)}`) * 220;
        const r2 = 1500;
        const w = 6 + random(`${seed}-w-${i}`) * 16;
        return (
          <path
            key={i}
            d={`M ${cx + Math.cos(a) * r1} ${cy + Math.sin(a) * r1} L ${cx + Math.cos(a + 0.012 * w) * r2} ${cy + Math.sin(a + 0.012 * w) * r2} L ${cx + Math.cos(a - 0.012 * w) * r2} ${cy + Math.sin(a - 0.012 * w) * r2} Z`}
            fill={COLORS.white}
          />
        );
      })}
    </g>
  );
};
