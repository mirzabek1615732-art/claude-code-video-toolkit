import React, {useId} from 'react';
import {useCurrentFrame} from 'remotion';
import {COLORS} from '../theme';

/* ------------------------------------------------------------------ *
 * ALI — rigged SVG character.
 *
 * Coordinate system: origin = between Ali's feet, y grows downwards,
 * Ali is ~640 units tall at scale 1. Render inside an <svg>.
 *
 * Everything is numeric so poses and expressions can be blended
 * frame-by-frame with `mixPose()` / `mixExpression()`.
 * ------------------------------------------------------------------ */

export type ExpressionName =
  | 'neutral'
  | 'excited'
  | 'lazy'
  | 'distracted'
  | 'shocked'
  | 'disappointed'
  | 'motivated'
  | 'confident'
  | 'sheepish'
  | 'panic'
  | 'idea'
  | 'focused'
  | 'proud';

export type Expression = {
  /** brow height (-1 low … 1 high) */
  browRaise: number;
  /** + angry/determined (inner ends down), − worried (inner ends up) */
  browAngle: number;
  /** lifts the right brow only (sceptic / confident) */
  browAsym: number;
  /** 1 = fully open, 0 = closed */
  eyeOpen: number;
  eyeScale: number;
  pupilScale: number;
  /** −1 frown … 1 big smile */
  smile: number;
  /** 0 closed … 1 wide open */
  mouthOpen: number;
  mouthWidth: number;
  blush: number;
  sweat: number;
};

export const EXPRESSIONS: Record<ExpressionName, Expression> = {
  neutral: {browRaise: 0, browAngle: 0, browAsym: 0, eyeOpen: 0.92, eyeScale: 1, pupilScale: 1, smile: 0.25, mouthOpen: 0, mouthWidth: 1, blush: 0.2, sweat: 0},
  excited: {browRaise: 0.9, browAngle: -2, browAsym: 0, eyeOpen: 1, eyeScale: 1.12, pupilScale: 1.15, smile: 1, mouthOpen: 0.85, mouthWidth: 1.35, blush: 0.6, sweat: 0},
  lazy: {browRaise: -0.5, browAngle: -4, browAsym: 0.2, eyeOpen: 0.42, eyeScale: 0.95, pupilScale: 1, smile: 0.1, mouthOpen: 0.05, mouthWidth: 0.8, blush: 0, sweat: 0},
  distracted: {browRaise: 0.15, browAngle: -6, browAsym: 0, eyeOpen: 0.75, eyeScale: 1, pupilScale: 0.9, smile: 0.35, mouthOpen: 0.2, mouthWidth: 0.85, blush: 0.15, sweat: 0},
  shocked: {browRaise: 1.35, browAngle: -10, browAsym: 0, eyeOpen: 1, eyeScale: 1.32, pupilScale: 0.5, smile: -0.25, mouthOpen: 1, mouthWidth: 0.75, blush: 0, sweat: 1},
  disappointed: {browRaise: 0.2, browAngle: -22, browAsym: 0, eyeOpen: 0.7, eyeScale: 1, pupilScale: 1.05, smile: -0.85, mouthOpen: 0.08, mouthWidth: 0.95, blush: 0, sweat: 0.6},
  motivated: {browRaise: -0.25, browAngle: 20, browAsym: 0, eyeOpen: 0.95, eyeScale: 1.02, pupilScale: 1.05, smile: 0.55, mouthOpen: 0.25, mouthWidth: 1.15, blush: 0.25, sweat: 0},
  confident: {browRaise: 0.1, browAngle: 8, browAsym: 0.7, eyeOpen: 0.8, eyeScale: 1, pupilScale: 1, smile: 0.85, mouthOpen: 0.12, mouthWidth: 1.25, blush: 0.3, sweat: 0},
  sheepish: {browRaise: 0.35, browAngle: -16, browAsym: 0.2, eyeOpen: 0.85, eyeScale: 1, pupilScale: 1, smile: 0.6, mouthOpen: 0.1, mouthWidth: 1.25, blush: 0.75, sweat: 0.8},
  // Episode 3 additions
  panic: {browRaise: 1.5, browAngle: -18, browAsym: 0, eyeOpen: 1, eyeScale: 1.38, pupilScale: 0.42, smile: -0.55, mouthOpen: 0.95, mouthWidth: 0.95, blush: 0, sweat: 1},
  idea: {browRaise: 1.1, browAngle: -4, browAsym: 0, eyeOpen: 1, eyeScale: 1.18, pupilScale: 1.2, smile: 0.8, mouthOpen: 0.45, mouthWidth: 1.05, blush: 0.4, sweat: 0},
  focused: {browRaise: -0.4, browAngle: 14, browAsym: 0.15, eyeOpen: 0.72, eyeScale: 1, pupilScale: 1.05, smile: 0.2, mouthOpen: 0, mouthWidth: 0.85, blush: 0.1, sweat: 0},
  proud: {browRaise: 0.4, browAngle: 6, browAsym: 0.5, eyeOpen: 0.7, eyeScale: 1.02, pupilScale: 1, smile: 1, mouthOpen: 0.35, mouthWidth: 1.4, blush: 0.55, sweat: 0},
};

export type HandShape = 'fist' | 'point' | 'open' | 'pointFront' | 'thumbsUp';
export type HeldItem = 'none' | 'phone' | 'book' | 'bookOpen' | 'pen' | 'highlighter';

export type Pose = {
  bodyTilt: number;
  /** extra vertical offset of the upper body (breathing, crouch) */
  bodyY: number;
  headTilt: number;
  /** −1 … 1, slides the face to fake a 3/4 head turn */
  headTurn: number;
  lookX: number;
  lookY: number;
  /** [upper arm, forearm] degrees; 0 = hanging down, + = outwards / up */
  armL: [number, number];
  armR: [number, number];
  /** [thigh, shin] degrees; 0 = straight down, + = outwards */
  legL: [number, number];
  legR: [number, number];
  /** 1 = standing, ~0.35 = seated front view (foreshortened thigh) */
  thighScale: number;
  /** extra rotation of the held item in degrees */
  itemAngle: number;
};

export const BASE_POSE: Pose = {
  bodyTilt: 0,
  bodyY: 0,
  headTilt: 0,
  headTurn: 0,
  lookX: 0,
  lookY: 0,
  armL: [8, 4],
  armR: [8, 4],
  legL: [3, -2],
  legR: [3, -2],
  thighScale: 1,
  itemAngle: 0,
};

export const POSES = {
  stand: BASE_POSE,
  pointUpRight: {...BASE_POSE, armR: [140, 8], armL: [14, 20], headTilt: 6, headTurn: 0.35, lookX: 0.8, lookY: -0.6} as Pose,
  pointViewer: {...BASE_POSE, armR: [72, 12], armL: [-10, 60], headTilt: -3, bodyTilt: -2} as Pose,
  fistUp: {...BASE_POSE, armR: [150, 25], armL: [10, 30], bodyTilt: -3, headTilt: -4} as Pose,
  shrug: {...BASE_POSE, armR: [60, 75], armL: [60, 75], headTilt: 8} as Pose,
  armsUpShock: {...BASE_POSE, armR: [148, 14], armL: [148, 14], bodyTilt: 0, headTilt: 0} as Pose,
  fistsChest: {...BASE_POSE, armR: [-10, -150], armL: [-10, -150]} as Pose,
  holdPhone: {...BASE_POSE, armR: [-5, -120], armL: [6, 6], headTilt: 8, lookX: -0.25, lookY: 0.95, itemAngle: -8} as Pose,
  seatedLazy: {
    ...BASE_POSE,
    bodyTilt: -14,
    headTilt: -12,
    armL: [42, 30],
    armR: [22, 12],
    legL: [40, -40],
    legR: [52, -52],
    thighScale: 0.35,
  } as Pose,
  seated: {...BASE_POSE, legL: [8, -8], legR: [8, -8], thighScale: 0.32} as Pose,
  pointAtViewer: {...BASE_POSE, armR: [-18, -112], armL: [12, 28], bodyTilt: 3, headTilt: -4} as Pose,
  thumbsUp: {...BASE_POSE, armR: [40, -110], armL: [10, 20], headTilt: 6} as Pose,
  writing: {...BASE_POSE, armR: [-8, -95], armL: [-14, -100], headTilt: 6, lookY: 0.9, thighScale: 0.32, legL: [8, -8], legR: [8, -8]} as Pose,
} satisfies Record<string, Pose>;

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export const mixExpression = (a: Expression, b: Expression, t: number): Expression => {
  const out = {...a};
  (Object.keys(a) as Array<keyof Expression>).forEach((k) => {
    out[k] = lerp(a[k], b[k], t);
  });
  return out;
};

export const mixPose = (a: Pose, b: Pose, t: number): Pose => ({
  bodyTilt: lerp(a.bodyTilt, b.bodyTilt, t),
  bodyY: lerp(a.bodyY, b.bodyY, t),
  headTilt: lerp(a.headTilt, b.headTilt, t),
  headTurn: lerp(a.headTurn, b.headTurn, t),
  lookX: lerp(a.lookX, b.lookX, t),
  lookY: lerp(a.lookY, b.lookY, t),
  armL: [lerp(a.armL[0], b.armL[0], t), lerp(a.armL[1], b.armL[1], t)],
  armR: [lerp(a.armR[0], b.armR[0], t), lerp(a.armR[1], b.armR[1], t)],
  legL: [lerp(a.legL[0], b.legL[0], t), lerp(a.legL[1], b.legL[1], t)],
  legR: [lerp(a.legR[0], b.legR[0], t), lerp(a.legR[1], b.legR[1], t)],
  thighScale: lerp(a.thighScale, b.thighScale, t),
  itemAngle: lerp(a.itemAngle, b.itemAngle, t),
});

/** Walk-cycle overlay. phase in cycles (1 = one full stride). */
export const walkPose = (pose: Pose, phase: number, amount = 1): Pose => {
  const s = Math.sin(phase * Math.PI * 2);
  const c = Math.cos(phase * Math.PI * 2);
  return {
    ...pose,
    bodyY: pose.bodyY - Math.abs(c) * 10 * amount,
    legL: [pose.legL[0] + s * 18 * amount, pose.legL[1] - Math.max(0, -s) * 30 * amount],
    legR: [pose.legR[0] - s * 18 * amount, pose.legR[1] - Math.max(0, s) * 30 * amount],
    armL: [pose.armL[0] - s * 14 * amount, pose.armL[1] + 10 * amount],
    armR: [pose.armR[0] + s * 14 * amount, pose.armR[1] + 10 * amount],
  };
};

type Props = {
  x: number;
  y: number;
  scale?: number;
  /** squash (+) / stretch (−) around the feet */
  squash?: number;
  /** whole-body rotation around the feet */
  rotate?: number;
  pose?: Pose;
  expression?: ExpressionName | Expression;
  handL?: HandShape;
  handR?: HandShape;
  itemR?: HeldItem;
  itemL?: HeldItem;
  /** 0…1 glow on the phone screen (lights up Ali's face too) */
  phoneGlow?: number;
  headphones?: boolean;
  /** 0…1 extra mouth flap (talking) */
  talk?: number;
  /** override automatic blinking (0 open … 1 closed). */
  blink?: number;
  /** disable idle breathing / blinking (freeze-frames) */
  frozen?: boolean;
  shadow?: number;
  /** body lighting tint, e.g. a spotlight colour */
  tint?: string;
  tintOpacity?: number;
};

const rad = (d: number) => (d * Math.PI) / 180;

/** 2-bone limb: returns joint + end positions. side = −1 (screen-left) / 1 (screen-right) */
const limb = (ox: number, oy: number, a1: number, a2: number, l1: number, l2: number, side: number) => {
  const A = rad(a1 * side);
  const B = rad((a1 + a2) * side);
  const jx = ox + Math.sin(A) * l1;
  const jy = oy + Math.cos(A) * l1;
  const ex = jx + Math.sin(B) * l2;
  const ey = jy + Math.cos(B) * l2;
  return {jx, jy, ex, ey, endAngle: (a1 + a2) * side};
};

const autoBlink = (raw: number) => {
  // deterministic irregular blinking: every 70–110 frames, 6 frames long.
  // Phase-shifted so Ali never blinks on the first frames after a cut.
  const frame = raw + 48;
  const period = 97;
  const local = (frame + Math.floor(frame / period) * 23) % period;
  if (local < 3) return local / 3;
  if (local < 6) return 1 - (local - 3) / 3;
  return 0;
};

const Hand: React.FC<{x: number; y: number; angle: number; shape: HandShape; side: number}> = ({x, y, angle, shape, side}) => (
  <g transform={`translate(${x} ${y}) rotate(${-angle})`}>
    {shape === 'point' ? (
      <rect x={-7} y={6} width={14} height={38} rx={7} fill={COLORS.skin} stroke={COLORS.skinShade} strokeWidth={3} />
    ) : null}
    {shape === 'open' ? (
      <g fill={COLORS.skin} stroke={COLORS.skinShade} strokeWidth={3}>
        {[-14, -5, 4, 13].map((fx) => (
          <rect key={fx} x={fx - 4} y={4} width={9} height={30} rx={4.5} />
        ))}
        <rect x={side * 14} y={-8} width={9} height={24} rx={4.5} transform={`rotate(${side * -40} ${side * 14} -8)`} />
      </g>
    ) : null}
    <circle r={21} fill={COLORS.skin} stroke={COLORS.skinShade} strokeWidth={3} />
    {shape === 'fist' ? <path d="M -12 2 Q -2 12 12 4" stroke={COLORS.skinShade} strokeWidth={3} fill="none" /> : null}
    {shape === 'thumbsUp' ? (
      <rect x={side * 4 - 7} y={-46} width={15} height={36} rx={7.5} fill={COLORS.skin} stroke={COLORS.skinShade} strokeWidth={3} transform={`rotate(${angle} 0 0)`} />
    ) : null}
  </g>
);

const Item: React.FC<{item: HeldItem; x: number; y: number; angle: number; glow: number; uid: string}> = ({item, x, y, angle, glow, uid}) => {
  if (item === 'none') return null;
  if (item === 'phone') {
    return (
      <g transform={`translate(${x} ${y}) rotate(${angle})`}>
        {glow > 0 ? <circle r={150} fill={`url(#${uid}-phoneglow)`} opacity={glow} /> : null}
        <rect x={-36} y={-70} width={72} height={130} rx={14} fill={COLORS.ink} />
        <rect x={-30} y={-62} width={60} height={112} rx={9} fill={glow > 0 ? COLORS.blueLight : '#1F2937'} />
        {glow > 0 ? (
          <g opacity={glow}>
            <rect x={-24} y={-52} width={48} height={30} rx={5} fill={COLORS.white} opacity={0.9} />
            <rect x={-24} y={-16} width={48} height={8} rx={4} fill={COLORS.yellow} />
            <rect x={-24} y={-2} width={34} height={8} rx={4} fill={COLORS.white} opacity={0.8} />
            <circle cx={16} cy={28} r={9} fill={COLORS.red} />
          </g>
        ) : null}
      </g>
    );
  }
  if (item === 'book' || item === 'bookOpen') {
    return (
      <g transform={`translate(${x} ${y - 30}) rotate(${angle})`}>
        {item === 'book' ? (
          <IeltsBookShape width={120} />
        ) : (
          <g>
            <path d="M 0 -60 Q -60 -74 -120 -62 L -120 62 Q -60 50 0 64 Z" fill="#F8FAFC" stroke="#94A3B8" strokeWidth={4} />
            <path d="M 0 -60 Q 60 -74 120 -62 L 120 62 Q 60 50 0 64 Z" fill="#F1F5F9" stroke="#94A3B8" strokeWidth={4} />
            {[-36, -16, 4, 24, 44].map((ly) => (
              <g key={ly}>
                <rect x={-104} y={ly} width={86} height={6} rx={3} fill="#94A3B8" />
                <rect x={18} y={ly} width={86} height={6} rx={3} fill="#94A3B8" />
              </g>
            ))}
          </g>
        )}
      </g>
    );
  }
  if (item === 'pen' || item === 'highlighter') {
    const c = item === 'pen' ? COLORS.navy : COLORS.yellow;
    return (
      <g transform={`translate(${x} ${y}) rotate(${angle})`}>
        <rect x={-8} y={-50} width={16} height={84} rx={6} fill={c} stroke={COLORS.ink} strokeWidth={3} />
        <path d="M -8 34 L 0 52 L 8 34 Z" fill={item === 'pen' ? '#E5E7EB' : '#EAB308'} stroke={COLORS.ink} strokeWidth={3} />
      </g>
    );
  }
  return null;
};

/** Cover of the IELTS study book; reused as a stand-alone prop. */
export const IeltsBookShape: React.FC<{width: number; dusty?: number}> = ({width, dusty = 0}) => {
  const h = width * 1.32;
  const w = width;
  return (
    <g>
      <rect x={-w / 2 + 8} y={-h / 2 + 8} width={w} height={h} rx={8} fill="#E2E8F0" />
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={8} fill={COLORS.blue} stroke={COLORS.ink} strokeWidth={4} />
      <rect x={-w / 2} y={-h / 2} width={w * 0.14} height={h} rx={6} fill={COLORS.blueDark} />
      <rect x={-w / 2 + w * 0.2} y={-h * 0.26} width={w * 0.7} height={h * 0.22} rx={6} fill={COLORS.yellow} />
      <text
        x={w * 0.05}
        y={-h * 0.1}
        textAnchor="middle"
        fontFamily="Montserrat"
        fontWeight={900}
        fontSize={w * 0.2}
        fill={COLORS.navy}
      >
        IELTS
      </text>
      <rect x={-w / 2 + w * 0.2} y={h * 0.08} width={w * 0.6} height={h * 0.04} rx={3} fill="#BFDBFE" />
      <rect x={-w / 2 + w * 0.2} y={h * 0.16} width={w * 0.45} height={h * 0.04} rx={3} fill="#BFDBFE" />
      {dusty > 0 ? <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={8} fill="#D6C7A1" opacity={dusty * 0.55} /> : null}
    </g>
  );
};

const mouthPath = (e: Expression, talk: number) => {
  const w = 30 * e.mouthWidth;
  const open = Math.min(1.1, e.mouthOpen + talk);
  const cy = -e.smile * 12;
  const top = -e.smile * 2 - open * 6;
  const bottom = e.smile * 22 + open * 62;
  return `M ${-w} ${cy} Q 0 ${top * 2 - cy} ${w} ${cy} Q 0 ${bottom * 2 - cy} ${-w} ${cy} Z`;
};

export const AliCharacter: React.FC<Props> = ({
  x,
  y,
  scale = 1,
  squash = 0,
  rotate = 0,
  pose = BASE_POSE,
  expression = 'neutral',
  handL = 'fist',
  handR = 'fist',
  itemR = 'none',
  itemL = 'none',
  phoneGlow = 0,
  headphones = false,
  talk = 0,
  blink,
  frozen = false,
  shadow = 1,
  tint,
  tintOpacity = 0,
}) => {
  const frame = useCurrentFrame();
  const uid = `ali${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const e = typeof expression === 'string' ? EXPRESSIONS[expression] : expression;

  const breath = frozen ? 0 : Math.sin(frame / 14) * 2.2;
  const blinkAmt = blink ?? (frozen ? 0 : autoBlink(frame));
  const lid = 1 - e.eyeOpen * (1 - blinkAmt);

  const sx = 1 + squash * 0.55;
  const sy = 1 - squash;

  // ----- legs
  const ts = pose.thighScale;
  const legLeft = limb(-40, -205, pose.legL[0], pose.legL[1], 105 * ts, 100, -1);
  const legRight = limb(40, -205, pose.legR[0], pose.legR[1], 105 * ts, 100, 1);
  const hipLift = (1 - ts) * 70; // seated: body sits lower

  // ----- arms (in torso space)
  const armLeft = limb(-84, -380, pose.armL[0], pose.armL[1], 100, 92, -1);
  const armRight = limb(84, -380, pose.armR[0], pose.armR[1], 100, 92, 1);

  const faceX = pose.headTurn * 16;
  const eyeRx = 25 * e.eyeScale;
  const eyeRy = 30 * e.eyeScale;
  const glowFace = phoneGlow * 0.12;

  const brow = (side: number) => {
    const bx = side * 38 + faceX;
    const by = -553 - e.browRaise * 15 - (side === 1 ? e.browAsym * 12 : 0) + (1 - e.eyeScale) * 10;
    const inner = e.browAngle * 0.55;
    // outer end → inner end
    return `M ${bx + side * 24} ${by - inner * 0.4} Q ${bx} ${by - 9 - inner * 0.2} ${bx - side * 22} ${by + inner}`;
  };

  const Eye = ({side}: {side: number}) => {
    const cx = side * 38 + faceX;
    const cy = -505;
    return (
      <g>
        <clipPath id={`${uid}-eye${side}`}>
          <ellipse cx={cx} cy={cy} rx={eyeRx} ry={eyeRy} />
        </clipPath>
        <ellipse cx={cx} cy={cy} rx={eyeRx} ry={eyeRy} fill={COLORS.white} />
        <g clipPath={`url(#${uid}-eye${side})`}>
          <circle cx={cx + pose.lookX * 10} cy={cy + pose.lookY * 10 + 3} r={14 * e.pupilScale} fill={COLORS.ink} />
          <circle cx={cx + pose.lookX * 10 + 5} cy={cy + pose.lookY * 10 - 3} r={4.5 * Math.max(0.6, e.pupilScale)} fill={COLORS.white} />
          <rect x={cx - eyeRx - 2} y={cy - eyeRy - 2} width={eyeRx * 2 + 4} height={(eyeRy * 2 + 4) * lid} fill={COLORS.skin} />
        </g>
        <ellipse cx={cx} cy={cy} rx={eyeRx} ry={eyeRy} fill="none" stroke={COLORS.ink} strokeWidth={4} />
        {lid > 0.06 ? (
          <line
            x1={cx - eyeRx + 2}
            x2={cx + eyeRx - 2}
            y1={cy - eyeRy + (eyeRy * 2) * lid}
            y2={cy - eyeRy + (eyeRy * 2) * lid}
            stroke={COLORS.ink}
            strokeWidth={5}
            strokeLinecap="round"
          />
        ) : null}
      </g>
    );
  };

  return (
    <g transform={`translate(${x} ${y}) rotate(${rotate}) scale(${scale * sx} ${scale * sy})`}>
      <defs>
        <radialGradient id={`${uid}-phoneglow`}>
          <stop offset="0%" stopColor={COLORS.blueLight} stopOpacity={0.75} />
          <stop offset="100%" stopColor={COLORS.blueLight} stopOpacity={0} />
        </radialGradient>
      </defs>
      {shadow > 0 ? <ellipse cx={0} cy={6} rx={115 * shadow} ry={20 * shadow} fill="#000" opacity={0.22} /> : null}

      {/* ---------------- legs */}
      <g transform={`translate(0 ${hipLift})`}>
        {[legLeft, legRight].map((lg, i) => {
          const side = i === 0 ? -1 : 1;
          const hipX = side * 40;
          return (
            <g key={i}>
              <path
                d={`M ${hipX} -205 L ${lg.jx} ${lg.jy} L ${lg.ex} ${lg.ey}`}
                stroke={COLORS.trousers}
                strokeWidth={46}
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
              {/* sneaker */}
              <g transform={`translate(${lg.ex} ${lg.ey - 4}) scale(${side} 1)`}>
                <path d="M -26 -16 Q -26 -30 -8 -30 L 14 -28 Q 30 -26 44 -10 Q 52 0 44 8 L -26 8 Q -32 0 -26 -16 Z" fill={COLORS.sneaker} stroke={COLORS.ink} strokeWidth={4} />
                <rect x={-28} y={2} width={74} height={9} rx={4.5} fill={COLORS.sneakerSole} stroke={COLORS.ink} strokeWidth={3} />
                <path d="M 0 -26 L 10 -14 M 10 -27 L 18 -15" stroke={COLORS.blue} strokeWidth={4} strokeLinecap="round" />
              </g>
            </g>
          );
        })}
      </g>

      {/* ---------------- upper body (rotates around hips) */}
      <g transform={`translate(0 ${hipLift + pose.bodyY}) rotate(${pose.bodyTilt} 0 -205)`}>
        {/* torso */}
        <g transform={`translate(0 ${-breath * 0.5})`}>
          <ellipse cx={0} cy={-397} rx={74} ry={26} fill={COLORS.hoodieShade} />
          <path
            d="M -80 -396 Q 0 -418 80 -396 Q 100 -388 96 -330 L 86 -218 Q 84 -196 62 -196 L -62 -196 Q -84 -196 -86 -218 L -96 -330 Q -100 -388 -80 -396 Z"
            fill={COLORS.hoodie}
            stroke={COLORS.ink}
            strokeWidth={5}
          />
          <path d="M 40 -392 Q 70 -380 74 -330 L 70 -230" stroke={COLORS.hoodieLight} strokeWidth={10} fill="none" strokeLinecap="round" opacity={0.6} />
          <rect x={-84} y={-226} width={168} height={28} rx={12} fill={COLORS.hoodieShade} stroke={COLORS.ink} strokeWidth={4} />
          <path d="M -52 -292 L 52 -292 L 62 -236 L -62 -236 Z" fill={COLORS.hoodieShade} stroke={COLORS.ink} strokeWidth={4} strokeLinejoin="round" />
          {/* drawstrings */}
          <path d="M -18 -398 L -22 -340" stroke={COLORS.white} strokeWidth={5} strokeLinecap="round" />
          <path d="M 18 -398 L 22 -344" stroke={COLORS.white} strokeWidth={5} strokeLinecap="round" />
          {/* chest logo */}
          <circle cx={-44} cy={-350} r={13} fill={COLORS.yellow} stroke={COLORS.ink} strokeWidth={3} />
        </g>

        {/* ---------------- head (rotates around neck) */}
        <g transform={`translate(0 ${-breath}) rotate(${pose.headTilt} 0 -415)`}>
          <rect x={-20} y={-430} width={40} height={36} fill={COLORS.skinShade} />
          {/* ears */}
          <circle cx={-96 + faceX * 0.3} cy={-498} r={21} fill={COLORS.skin} stroke={COLORS.ink} strokeWidth={4} />
          <circle cx={96 + faceX * 0.3} cy={-498} r={21} fill={COLORS.skin} stroke={COLORS.ink} strokeWidth={4} />
          {/* head */}
          <path
            d="M -98 -510 Q -100 -612 0 -616 Q 100 -612 98 -510 Q 96 -440 52 -410 Q 0 -390 -52 -410 Q -96 -440 -98 -510 Z"
            fill={COLORS.skin}
            stroke={COLORS.ink}
            strokeWidth={5}
          />
          {glowFace > 0 ? (
            <path d="M -98 -510 Q -100 -612 0 -616 Q 100 -612 98 -510 Q 96 -440 52 -410 Q 0 -390 -52 -410 Q -96 -440 -98 -510 Z" fill={COLORS.blueLight} opacity={glowFace} />
          ) : null}
          {/* hair */}
          <path
            d="M -102 -500 C -114 -590 -62 -640 0 -638 C 64 -640 116 -592 102 -500 L 95 -530 Q 88 -566 60 -572 L 52 -552 L 32 -576 L 16 -554 L -4 -580 L -18 -556 L -40 -578 L -50 -555 L -68 -570 Q -92 -562 -95 -530 Z"
            fill={COLORS.hair}
            stroke={COLORS.ink}
            strokeWidth={4}
            strokeLinejoin="round"
            transform={`translate(${faceX * 0.25} 0)`}
          />
          <path d="M -40 -618 Q 0 -630 40 -616" stroke="#3F3F46" strokeWidth={6} fill="none" strokeLinecap="round" />
          {/* blush */}
          <ellipse cx={-62 + faceX} cy={-462} rx={17} ry={9} fill="#F87171" opacity={e.blush * 0.55} />
          <ellipse cx={62 + faceX} cy={-462} rx={17} ry={9} fill="#F87171" opacity={e.blush * 0.55} />
          {/* eyes + brows */}
          <Eye side={-1} />
          <Eye side={1} />
          <path d={brow(-1)} stroke={COLORS.hair} strokeWidth={10} strokeLinecap="round" fill="none" />
          <path d={brow(1)} stroke={COLORS.hair} strokeWidth={10} strokeLinecap="round" fill="none" />
          {/* nose */}
          <path d={`M ${faceX - 3} -486 Q ${faceX + 9} -472 ${faceX - 6} -467`} stroke={COLORS.skinShade} strokeWidth={5} fill="none" strokeLinecap="round" />
          {/* mouth */}
          <g transform={`translate(${faceX * 0.9} -440)`}>
            <path d={mouthPath(e, talk)} fill="#7F1D1D" stroke={COLORS.ink} strokeWidth={5} strokeLinejoin="round" />
            {e.mouthOpen + talk > 0.35 ? (
              <ellipse cx={0} cy={e.smile * 14 + (e.mouthOpen + talk) * 34} rx={14 * e.mouthWidth} ry={8} fill="#F87171" />
            ) : null}
          </g>
          {/* sweat drop */}
          {e.sweat > 0.05 ? (
            <path
              d="M 100 -560 Q 112 -536 100 -526 Q 88 -536 100 -560 Z"
              fill="#93C5FD"
              stroke={COLORS.ink}
              strokeWidth={3}
              opacity={Math.min(1, e.sweat)}
              transform={`translate(0 ${(frame % 30) * 0.6 * e.sweat})`}
            />
          ) : null}
          {headphones ? (
            <g>
              <path d="M -104 -500 Q -110 -650 0 -652 Q 110 -650 104 -500" stroke={COLORS.ink} strokeWidth={16} fill="none" strokeLinecap="round" />
              <path d="M -104 -500 Q -110 -650 0 -652 Q 110 -650 104 -500" stroke={COLORS.orange} strokeWidth={8} fill="none" strokeLinecap="round" />
              <rect x={-128} y={-540} width={40} height={78} rx={18} fill={COLORS.orange} stroke={COLORS.ink} strokeWidth={5} />
              <rect x={88} y={-540} width={40} height={78} rx={18} fill={COLORS.orange} stroke={COLORS.ink} strokeWidth={5} />
            </g>
          ) : null}
          {tint && tintOpacity > 0 ? (
            <path d="M -98 -510 Q -100 -612 0 -616 Q 100 -612 98 -510 Q 96 -440 52 -410 Q 0 -390 -52 -410 Q -96 -440 -98 -510 Z" fill={tint} opacity={tintOpacity} />
          ) : null}
        </g>

        {/* ---------------- arms */}
        {[
          {a: armLeft, side: -1, hand: handL, item: itemL},
          {a: armRight, side: 1, hand: handR, item: itemR},
        ].map(({a, side, hand, item}) => (
          <g key={side}>
            <path
              d={`M ${side * 84} -380 L ${a.jx} ${a.jy} L ${a.ex} ${a.ey}`}
              stroke={COLORS.ink}
              strokeWidth={46}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
            <path
              d={`M ${side * 84} -380 L ${a.jx} ${a.jy} L ${a.ex} ${a.ey}`}
              stroke={COLORS.hoodie}
              strokeWidth={37}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
            {hand === 'pointFront' ? (
              <g transform={`translate(${a.ex} ${a.ey})`}>
                <circle r={36} fill={COLORS.skin} stroke={COLORS.ink} strokeWidth={4} />
                <path d="M -22 -6 Q -6 6 -22 18 M -26 10 Q -8 20 -18 30" stroke={COLORS.skinShade} strokeWidth={4} fill="none" strokeLinecap="round" />
                <circle cx={4} cy={-6} r={22} fill={COLORS.skin} stroke={COLORS.ink} strokeWidth={4} />
                <circle cx={4} cy={-6} r={10} fill="#F4C3A1" />
              </g>
            ) : (
              <Hand x={a.ex + Math.sin(rad(a.endAngle)) * 10} y={a.ey + Math.cos(rad(a.endAngle)) * 10} angle={a.endAngle} shape={hand} side={side} />
            )}
            <Item
              item={item}
              x={a.ex + Math.sin(rad(a.endAngle)) * 18}
              y={a.ey + Math.cos(rad(a.endAngle)) * 18}
              angle={pose.itemAngle * side}
              glow={phoneGlow}
              uid={uid}
            />
            {item === 'phone' ? (
              <circle cx={a.ex + Math.sin(rad(a.endAngle)) * 10 - side * 22} cy={a.ey + Math.cos(rad(a.endAngle)) * 10 + 8} r={11} fill={COLORS.skin} stroke={COLORS.skinShade} strokeWidth={3} />
            ) : null}
          </g>
        ))}
      </g>
    </g>
  );
};
