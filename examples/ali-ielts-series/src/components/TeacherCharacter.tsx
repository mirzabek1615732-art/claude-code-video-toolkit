import React from 'react';
import {useCurrentFrame} from 'remotion';
import {COLORS} from '../theme';

/**
 * "Ustoz" — the recurring writing teacher (introduced in Episode 5). Calm, serious, original design.
 * Origin = feet centre. Same ink-outline style as Ali. Drives eyebrows, eyes, mouth and arms by props.
 */
export type TeacherFace = {
  /** -1 frown … 0 neutral … 1 raised (left brow) */
  browL: number;
  browR: number;
  /** 0 closed … 1 open */
  eyeOpen: number;
  /** -1 down-turned … 1 smile */
  smile: number;
  /** 0…1 mouth open (talk flap added on top) */
  mouthOpen: number;
};

export const TEACHER_FACES: Record<'neutral' | 'reading' | 'skeptical' | 'disappointed' | 'stern' | 'kind', TeacherFace> = {
  neutral: {browL: 0, browR: 0, eyeOpen: 0.85, smile: 0, mouthOpen: 0},
  reading: {browL: -0.2, browR: -0.2, eyeOpen: 0.55, smile: -0.1, mouthOpen: 0},
  skeptical: {browL: 1, browR: -0.4, eyeOpen: 0.8, smile: -0.25, mouthOpen: 0},
  disappointed: {browL: 0.5, browR: 0.5, eyeOpen: 0.38, smile: -0.7, mouthOpen: 0},
  stern: {browL: -0.7, browR: -0.7, eyeOpen: 0.75, smile: -0.4, mouthOpen: 0},
  kind: {browL: 0.3, browR: 0.3, eyeOpen: 0.75, smile: 0.6, mouthOpen: 0.05},
};

export const mixFace = (a: TeacherFace, b: TeacherFace, t: number): TeacherFace => ({
  browL: a.browL + (b.browL - a.browL) * t,
  browR: a.browR + (b.browR - a.browR) * t,
  eyeOpen: a.eyeOpen + (b.eyeOpen - a.eyeOpen) * t,
  smile: a.smile + (b.smile - a.smile) * t,
  mouthOpen: a.mouthOpen + (b.mouthOpen - a.mouthOpen) * t,
});

const SKIN = '#D9A27A';
const SKIN_SHADE = '#B8835D';
const HAIR = '#6B7280';
const JACKET = '#7C2D12';
const SHIRT = '#F8FAFC';

export const TeacherCharacter: React.FC<{
  x: number;
  y: number;
  scale?: number;
  face?: TeacherFace;
  /** look direction −1…1 */
  lookX?: number;
  lookY?: number;
  headTilt?: number;
  /** extra mouth flap while talking 0…1 */
  talk?: number;
  /** right arm (screen right): 'down' | 'paper' (holds a sheet in front) | 'reach' (reaches up and right) | 'point' */
  armR?: 'down' | 'paper' | 'reach' | 'point';
  armL?: 'down' | 'paper' | 'hip';
  /** 0…1 how far the reach goes */
  reach?: number;
  frozen?: boolean;
}> = ({x, y, scale = 1, face = TEACHER_FACES.neutral, lookX = 0, lookY = 0, headTilt = 0, talk = 0, armR = 'down', armL = 'down', reach = 1, frozen = false}) => {
  const frame = useCurrentFrame();
  const breath = frozen ? 0 : Math.sin(frame / 16) * 2;
  const blinkPhase = (frame + 31) % 113;
  const blink = frozen ? 0 : blinkPhase < 3 ? blinkPhase / 3 : blinkPhase < 6 ? 1 - (blinkPhase - 3) / 3 : 0;
  const lid = 1 - face.eyeOpen * (1 - blink);
  const mo = Math.min(1, face.mouthOpen + talk);

  const Eye = ({side}: {side: number}) => {
    const cx = side * 34;
    const cy = -520;
    return (
      <g>
        <ellipse cx={cx} cy={cy} rx={17} ry={19} fill={COLORS.white} stroke={COLORS.ink} strokeWidth={4} />
        <circle cx={cx + lookX * 7} cy={cy + lookY * 7 + 2} r={8} fill={COLORS.ink} />
        <rect x={cx - 19} y={cy - 21} width={38} height={42 * lid} fill={SKIN} />
        {lid > 0.08 ? <line x1={cx - 17} x2={cx + 17} y1={cy - 19 + 38 * lid} y2={cy - 19 + 38 * lid} stroke={COLORS.ink} strokeWidth={4} strokeLinecap="round" /> : null}
      </g>
    );
  };
  const brow = (side: number, v: number) => {
    const bx = side * 34;
    const by = -552 - v * 14;
    const tilt = v < 0 ? -v * 9 : -v * 3;
    return <path d={`M ${bx - side * 22} ${by + tilt} Q ${bx} ${by - 8} ${bx + side * 22} ${by - tilt * 0.4}`} stroke={HAIR} strokeWidth={9} fill="none" strokeLinecap="round" />;
  };
  // arms: shoulder at (±82, -380)
  const armPath = (side: number, kind: string) => {
    const sx = side * 82;
    if (kind === 'paper') return `M ${sx} -378 Q ${side * 112} -300 ${side * 60} -268 L ${side * 26} -300`;
    if (kind === 'hip') return `M ${sx} -378 Q ${side * 140} -310 ${side * 92} -246`;
    if (kind === 'reach') {
      const ex = side * (100 + 170 * reach);
      const ey = -380 - 160 * reach;
      return `M ${sx} -378 Q ${side * 140} ${-420 - 60 * reach} ${ex} ${ey}`;
    }
    if (kind === 'point') return `M ${sx} -378 Q ${side * 150} -360 ${side * 200} -400`;
    return `M ${sx} -378 Q ${side * 112} -300 ${side * 98} -210`;
  };
  const handPos = (side: number, kind: string): [number, number] => {
    if (kind === 'paper') return [side * 26, -300];
    if (kind === 'hip') return [side * 92, -246];
    if (kind === 'reach') return [side * (100 + 170 * reach), -380 - 160 * reach];
    if (kind === 'point') return [side * 200, -400];
    return [side * 98, -210];
  };
  const [hlx, hly] = handPos(-1, armL);
  const [hrx, hry] = handPos(1, armR);

  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      {/* legs */}
      <path d="M -40 -205 L -46 -12" stroke="#374151" strokeWidth={46} strokeLinecap="round" />
      <path d="M 40 -205 L 46 -12" stroke="#374151" strokeWidth={46} strokeLinecap="round" />
      <path d="M -78 -2 Q -78 -24 -46 -24 Q -20 -24 -14 -6 L -14 4 L -78 4 Z" fill="#1F2937" stroke={COLORS.ink} strokeWidth={4} />
      <path d="M 78 -2 Q 78 -24 46 -24 Q 20 -24 14 -6 L 14 4 L 78 4 Z" fill="#1F2937" stroke={COLORS.ink} strokeWidth={4} />
      <g transform={`translate(0 ${-breath * 0.5})`}>
        {/* torso: shirt, tie, jacket */}
        <path d="M -86 -392 Q 0 -414 86 -392 Q 104 -380 100 -320 L 92 -210 Q 90 -196 70 -196 L -70 -196 Q -90 -196 -92 -210 L -100 -320 Q -104 -380 -86 -392 Z" fill={JACKET} stroke={COLORS.ink} strokeWidth={5} />
        <path d="M -30 -400 L 0 -300 L 30 -400 Z" fill={SHIRT} stroke={COLORS.ink} strokeWidth={4} strokeLinejoin="round" />
        <path d="M -8 -392 L 8 -392 L 12 -330 L 0 -312 L -12 -330 Z" fill="#1E3A8A" stroke={COLORS.ink} strokeWidth={3} strokeLinejoin="round" />
        <path d="M -30 -400 L -12 -300" stroke={COLORS.ink} strokeWidth={4} />
        <path d="M 30 -400 L 12 -300" stroke={COLORS.ink} strokeWidth={4} />
        {/* arms */}
        {[
          [-1, armL],
          [1, armR],
        ].map(([side, kind]) => (
          <g key={String(side)}>
            <path d={armPath(side as number, kind as string)} stroke={COLORS.ink} strokeWidth={42} fill="none" strokeLinecap="round" />
            <path d={armPath(side as number, kind as string)} stroke={JACKET} strokeWidth={34} fill="none" strokeLinecap="round" />
          </g>
        ))}
        {armL === 'paper' || armR === 'paper' ? (
          <g transform="translate(0 -320) rotate(-4)">
            <rect x={-92} y={-90} width={184} height={230} rx={8} fill="#FFFDF7" stroke={COLORS.ink} strokeWidth={5} />
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <rect key={i} x={-70} y={-62 + i * 30} width={i === 5 ? 80 : 140} height={8} rx={4} fill="#94A3B8" />
            ))}
            <rect x={-74} y={-70} width={148} height={46} rx={6} fill="#FDE68A" opacity={0.55} />
          </g>
        ) : null}
        <circle cx={hlx} cy={hly} r={20} fill={SKIN} stroke={COLORS.ink} strokeWidth={4} />
        <circle cx={hrx} cy={hry} r={20} fill={SKIN} stroke={COLORS.ink} strokeWidth={4} />
        {armR === 'point' ? <rect x={hrx + 4} y={hry - 7} width={34} height={14} rx={7} fill={SKIN} stroke={COLORS.ink} strokeWidth={4} /> : null}
        {/* head */}
        <g transform={`translate(0 ${-breath}) rotate(${headTilt} 0 -420)`}>
          <rect x={-22} y={-430} width={44} height={40} fill={SKIN_SHADE} />
          <circle cx={-88} cy={-512} r={18} fill={SKIN} stroke={COLORS.ink} strokeWidth={4} />
          <circle cx={88} cy={-512} r={18} fill={SKIN} stroke={COLORS.ink} strokeWidth={4} />
          <path d="M -86 -540 Q -90 -440 -40 -424 Q 0 -414 40 -424 Q 90 -440 86 -540 Q 84 -610 0 -614 Q -84 -610 -86 -540 Z" fill={SKIN} stroke={COLORS.ink} strokeWidth={5} />
          {/* short grey hair, receding at the temples */}
          <path d="M -88 -536 Q -96 -620 -30 -632 Q 0 -640 34 -632 Q 96 -618 88 -536 Q 80 -580 52 -590 Q 20 -606 -6 -598 Q -46 -604 -70 -584 Q -84 -566 -88 -536 Z" fill={HAIR} stroke={COLORS.ink} strokeWidth={5} strokeLinejoin="round" />
          {brow(-1, face.browL)}
          {brow(1, face.browR)}
          <Eye side={-1} />
          <Eye side={1} />
          {/* rectangular reading glasses */}
          {[-1, 1].map((side) => (
            <rect key={side} x={side * 34 - 27} y={-542} width={54} height={42} rx={10} fill="none" stroke={COLORS.ink} strokeWidth={5} />
          ))}
          <path d="M -7 -524 Q 0 -530 7 -524" stroke={COLORS.ink} strokeWidth={5} fill="none" />
          <path d="M 0 -500 Q 12 -480 -2 -474" stroke={SKIN_SHADE} strokeWidth={5} fill="none" strokeLinecap="round" />
          {/* moustache */}
          <path d="M -40 -462 Q -20 -476 0 -466 Q 20 -476 40 -462 Q 22 -456 0 -460 Q -22 -456 -40 -462 Z" fill={HAIR} stroke={COLORS.ink} strokeWidth={3} />
          {/* mouth */}
          {mo > 0.05 ? (
            <ellipse cx={0} cy={-444} rx={16} ry={4 + mo * 12} fill="#7F1D1D" stroke={COLORS.ink} strokeWidth={4} />
          ) : (
            <path d={`M -18 ${-446 + face.smile * 3} Q 0 ${-446 + face.smile * 12} 18 ${-446 + face.smile * 3}`} stroke={COLORS.ink} strokeWidth={5} fill="none" strokeLinecap="round" />
          )}
        </g>
      </g>
    </g>
  );
};
