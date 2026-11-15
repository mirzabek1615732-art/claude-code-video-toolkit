import React from 'react';
import {COLORS} from '../theme';
import {HeartIcon, SmileyIcon} from './Particles';

const W = 760;
const H = 1480;

const PostArt: React.FC<{i: number; w: number; h: number}> = ({i, w, h}) => {
  const palettes = [
    ['#F472B6', '#FB923C'],
    ['#38BDF8', '#2563EB'],
    ['#A3E635', '#22C55E'],
    ['#FACC15', '#F97316'],
    ['#C084FC', '#6366F1'],
  ];
  const [a, b] = palettes[i % palettes.length];
  const kind = i % 4;
  return (
    <g>
      <defs>
        <linearGradient id={`post-${i}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={a} />
          <stop offset="100%" stopColor={b} />
        </linearGradient>
      </defs>
      <rect width={w} height={h} fill={`url(#post-${i})`} />
      {kind === 0 ? (
        <g>
          <circle cx={w * 0.72} cy={h * 0.3} r={w * 0.1} fill="#FEF3C7" />
          <path d={`M 0 ${h} L ${w * 0.35} ${h * 0.45} L ${w * 0.6} ${h * 0.75} L ${w * 0.78} ${h * 0.55} L ${w} ${h} Z`} fill="#0F172A" opacity={0.55} />
        </g>
      ) : null}
      {kind === 1 ? (
        <g transform={`translate(${w / 2} ${h / 2}) scale(${w / 260})`}>
          <SmileyIcon variant="laugh" />
        </g>
      ) : null}
      {kind === 2 ? (
        <g>
          <circle cx={w / 2} cy={h / 2} r={w * 0.28} fill="#FFFFFF" opacity={0.9} />
          <circle cx={w / 2} cy={h / 2} r={w * 0.18} fill="#F59E0B" />
          <circle cx={w * 0.44} cy={h * 0.46} r={w * 0.04} fill="#B91C1C" />
          <circle cx={w * 0.56} cy={h * 0.54} r={w * 0.04} fill="#15803D" />
        </g>
      ) : null}
      {kind === 3 ? (
        <g transform={`translate(${w / 2} ${h / 2})`}>
          <ellipse rx={w * 0.26} ry={w * 0.22} fill="#F5F5F4" />
          <path d={`M ${-w * 0.22} ${-w * 0.12} L ${-w * 0.16} ${-w * 0.3} L ${-w * 0.06} ${-w * 0.18} Z`} fill="#F5F5F4" />
          <path d={`M ${w * 0.22} ${-w * 0.12} L ${w * 0.16} ${-w * 0.3} L ${w * 0.06} ${-w * 0.18} Z`} fill="#F5F5F4" />
          <circle cx={-w * 0.08} cy={-w * 0.02} r={w * 0.025} fill="#111" />
          <circle cx={w * 0.08} cy={-w * 0.02} r={w * 0.025} fill="#111" />
          <path d={`M -12 ${w * 0.05} Q 0 ${w * 0.08} 12 ${w * 0.05}`} stroke="#111" strokeWidth={5} fill="none" />
        </g>
      ) : null}
    </g>
  );
};

type Notification = {at: number; text: string; color?: string};

/**
 * Giant generic social-media phone (no real brand UI). `mode` = 'feed' for a
 * photo feed, 'shorts' for vertical full-screen clips.
 */
export const PhoneScreen: React.FC<{
  frame: number;
  scroll: number;
  mode: 'feed' | 'shorts';
  time: string;
  notifications?: Notification[];
  appName?: string;
}> = ({frame, scroll, mode, time, notifications = [], appName = 'Lenta'}) => {
  const postH = 820;
  const shortH = H - 150;
  return (
    <g>
      <defs>
        <clipPath id="phone-screen">
          <rect x={-W / 2 + 22} y={-H / 2 + 22} width={W - 44} height={H - 44} rx={70} />
        </clipPath>
      </defs>
      <rect x={-W / 2 - 10} y={-H / 2 - 10} width={W + 20} height={H + 20} rx={104} fill="#020617" />
      <rect x={-W / 2} y={-H / 2} width={W} height={H} rx={96} fill="#111827" stroke="#334155" strokeWidth={6} />
      <g clipPath="url(#phone-screen)">
        <rect x={-W / 2} y={-H / 2} width={W} height={H} fill={mode === 'feed' ? '#F8FAFC' : '#000'} />
        {mode === 'feed' ? (
          <g transform={`translate(${-W / 2 + 22} ${-H / 2 + 170 - (scroll % (postH * 5))})`}>
            {Array.from({length: 8}).map((_, i) => {
              const y = i * postH;
              const liked = (frame + i * 7) % 40 > 20;
              return (
                <g key={i} transform={`translate(0 ${y})`}>
                  <circle cx={56} cy={44} r={30} fill={[COLORS.orange, COLORS.blue, COLORS.green, COLORS.yellow][i % 4]} />
                  <rect x={100} y={30} width={180 + (i % 3) * 40} height={24} rx={12} fill="#CBD5E1" />
                  <g transform="translate(0 96)">
                    <PostArt i={i} w={W - 44} h={560} />
                  </g>
                  <g transform="translate(60 715) scale(0.5)">
                    <HeartIcon fill={liked ? COLORS.red : '#FFFFFF'} />
                  </g>
                  <circle cx={140} cy={715} r={20} fill="none" stroke={COLORS.navy} strokeWidth={6} />
                  <rect x={30} y={760} width={300 + (i % 2) * 120} height={22} rx={11} fill="#CBD5E1" />
                </g>
              );
            })}
          </g>
        ) : (
          <g transform={`translate(${-W / 2 + 22} ${-H / 2 + 120 - scroll})`}>
            {Array.from({length: 10}).map((_, i) => (
              <g key={i} transform={`translate(0 ${i * shortH})`}>
                <PostArt i={i + 2} w={W - 44} h={shortH} />
                {/* right action rail */}
                <g transform={`translate(${W - 120} ${shortH * 0.55})`}>
                  {[0, 1, 2].map((k) => (
                    <g key={k} transform={`translate(0 ${k * 130})`}>
                      <circle r={42} fill="#000" opacity={0.35} />
                      {k === 0 ? (
                        <g transform="scale(0.5)">
                          <HeartIcon fill={COLORS.red} stroke="#FFF" />
                        </g>
                      ) : (
                        <circle r={18} fill="#FFF" />
                      )}
                      <rect x={-32} y={50} width={64} height={14} rx={7} fill="#FFF" opacity={0.8} />
                    </g>
                  ))}
                </g>
                <rect x={36} y={shortH - 240} width={340} height={26} rx={13} fill="#FFF" opacity={0.9} />
                <rect x={36} y={shortH - 196} width={460} height={20} rx={10} fill="#FFF" opacity={0.7} />
                {/* progress line */}
                <rect x={0} y={shortH - 140} width={(W - 44) * (((frame * 3 + i * 50) % 120) / 120)} height={8} fill="#FFF" />
              </g>
            ))}
          </g>
        )}
        {/* app header */}
        <rect x={-W / 2} y={-H / 2} width={W} height={mode === 'feed' ? 170 : 120} fill={mode === 'feed' ? '#FFFFFF' : 'rgba(0,0,0,0)'} />
        <text x={-W / 2 + 60} y={-H / 2 + 60} fontFamily="Montserrat" fontWeight={800} fontSize={30} fill={mode === 'feed' ? COLORS.navy : '#FFF'}>
          {time}
        </text>
        <g transform={`translate(${W / 2 - 150} ${-H / 2 + 50})`} fill={mode === 'feed' ? COLORS.navy : '#FFF'}>
          <rect x={0} y={0} width={10} height={14} rx={2} />
          <rect x={16} y={-6} width={10} height={20} rx={2} />
          <rect x={32} y={-12} width={10} height={26} rx={2} />
          <rect x={56} y={-12} width={52} height={26} rx={6} fill="none" stroke={mode === 'feed' ? COLORS.navy : '#FFF'} strokeWidth={4} />
          <rect x={61} y={-7} width={26} height={16} rx={3} />
        </g>
        {mode === 'feed' ? (
          <text x={-W / 2 + 50} y={-H / 2 + 140} fontFamily="Montserrat" fontWeight={900} fontSize={50} fill={COLORS.navy}>
            {appName}
          </text>
        ) : (
          <text x={0} y={-H / 2 + 110} textAnchor="middle" fontFamily="Montserrat" fontWeight={800} fontSize={34} fill="#FFF">
            Siz uchun
          </text>
        )}
        {/* notification banners */}
        {notifications.map((n, i) => {
          const t = frame - n.at;
          if (t < 0 || t > 40) return null;
          const yIn = t < 8 ? -200 + (t / 8) * 230 : t > 32 ? 30 - ((t - 32) / 8) * 230 : 30;
          return (
            <g key={i} transform={`translate(0 ${-H / 2 + 60 + yIn})`}>
              <rect x={-W / 2 + 40} y={0} width={W - 80} height={120} rx={32} fill="#FFFFFF" stroke="#E2E8F0" strokeWidth={4} />
              <circle cx={-W / 2 + 110} cy={60} r={34} fill={n.color ?? COLORS.red} />
              <g transform={`translate(${-W / 2 + 110} 62) scale(0.36)`}>
                <HeartIcon fill="#FFF" stroke="#FFF" />
              </g>
              <text x={-W / 2 + 170} y={72} fontFamily="Montserrat" fontWeight={800} fontSize={36} fill={COLORS.navy}>
                {n.text}
              </text>
            </g>
          );
        })}
      </g>
      {/* notch */}
      <rect x={-90} y={-H / 2 + 26} width={180} height={44} rx={22} fill="#020617" />
      {/* glare */}
      <path d={`M ${-W / 2 + 40} ${-H / 2 + 200} L ${-W / 2 + 160} ${-H / 2 + 40} L ${-W / 2 + 230} ${-H / 2 + 40} L ${-W / 2 + 40} ${-H / 2 + 300} Z`} fill="#FFF" opacity={0.08} />
    </g>
  );
};
