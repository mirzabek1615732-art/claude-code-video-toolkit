import React from 'react';

export type LogoText = {monogram: string; line1: string; line2: string; tagline: string};

/** Animation state of every logo part, 0 = hidden, 1 = final. */
export type LogoState = {
  frame: number; // box outline draw-on
  divider: number;
  monogram: number;
  line1: number;
  line2: number;
  tagline: number;
  sheen: number; // −1…2 position of the light sweep (outside 0…1 = off-screen)
};

export const LOGO_FINAL: LogoState = {frame: 1, divider: 1, monogram: 1, line1: 1, line2: 1, tagline: 1, sheen: -1};

// Geometry measured from the original 1254×1254 logo file.
const G = {
  box: {x: 173.5, y: 472.5, w: 906.5, h: 234, stroke: 6},
  divX: 442.5,
  mono: {cx: 309, base: 648, size: 164, w: 173},
  l1: {x: 482, base: 574, size: 87, w: 566},
  l2: {x: 483, base: 655, size: 88, w: 329},
  tag: {cx: 626.5, base: 775, size: 43, w: 595},
};

/**
 * Vector rebuild of the school logo in its native 1254×1254 coordinate space.
 * Render inside an <svg viewBox="0 0 1254 1254">.
 */
export const LogoMark: React.FC<{text: LogoText; state?: LogoState; color?: string; id: string}> = ({text, state = LOGO_FINAL, color = '#FFFFFF', id}) => {
  const {box} = G;
  const perim = 2 * (box.w + box.h);
  const ease = (t: number) => 1 - (1 - Math.min(1, Math.max(0, t))) ** 3;
  const m = ease(state.monogram);
  const l1 = ease(state.line1);
  const l2 = ease(state.line2);
  const tg = ease(state.tagline);
  return (
    <g>
      <defs>
        <clipPath id={`${id}-right`}>
          <rect x={G.divX + 4} y={box.y + 4} width={box.x + box.w - G.divX - 8} height={box.h - 8} />
        </clipPath>
        <clipPath id={`${id}-box`}>
          <rect x={box.x} y={box.y} width={box.w} height={box.h} />
        </clipPath>
        <clipPath id={`${id}-left`}>
          <rect x={box.x + 4} y={box.y + 4} width={G.divX - box.x - 8} height={box.h - 8} />
        </clipPath>
        <linearGradient id={`${id}-sheen`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#FFFFFF" stopOpacity={0} />
          <stop offset="0.5" stopColor="#FFFFFF" stopOpacity={0.2} />
          <stop offset="1" stopColor="#FFFFFF" stopOpacity={0} />
        </linearGradient>
      </defs>
      {/* outline box draws on clockwise from the top-left corner */}
      <rect
        x={box.x}
        y={box.y}
        width={box.w}
        height={box.h}
        fill="none"
        stroke={color}
        strokeWidth={box.stroke}
        strokeDasharray={perim}
        strokeDashoffset={perim * (1 - ease(state.frame))}
        strokeLinecap="square"
      />
      {/* divider grows from the middle */}
      <line
        x1={G.divX}
        x2={G.divX}
        y1={box.y + box.h / 2 - (box.h / 2) * ease(state.divider)}
        y2={box.y + box.h / 2 + (box.h / 2) * ease(state.divider)}
        stroke={color}
        strokeWidth={box.stroke}
      />
      {/* monogram rises out of its cell */}
      <g clipPath={`url(#${id}-left)`}>
        <text
          x={G.mono.cx}
          y={G.mono.base + (1 - m) * 190}
          textAnchor="middle"
          fontFamily="Archivo Black"
          fontSize={G.mono.size}
          textLength={G.mono.w}
          lengthAdjust="spacingAndGlyphs"
          fill={color}
        >
          {text.monogram}
        </text>
      </g>
      {/* name lines slide out from behind the divider */}
      <g clipPath={`url(#${id}-right)`}>
        <text x={G.l1.x - (1 - l1) * 620} y={G.l1.base} fontFamily="Archivo Black" fontSize={G.l1.size} textLength={G.l1.w} lengthAdjust="spacingAndGlyphs" fill={color}>
          {text.line1}
        </text>
        <text x={G.l2.x - (1 - l2) * 620} y={G.l2.base} fontFamily="Archivo Black" fontSize={G.l2.size} textLength={G.l2.w} lengthAdjust="spacingAndGlyphs" fill={color}>
          {text.line2}
        </text>
      </g>
      {/* tagline tracks in from wide letter-spacing */}
      <text
        x={G.tag.cx}
        y={G.tag.base}
        textAnchor="middle"
        fontFamily="Archivo"
        fontWeight={600}
        fontSize={G.tag.size}
        textLength={G.tag.w + (1 - tg) * 260}
        lengthAdjust="spacing"
        fill={color}
        opacity={tg}
      >
        {text.tagline}
      </text>
      {/* light sweep across the lettering */}
      {state.sheen > -0.3 && state.sheen < 1.3 ? (
        <g clipPath={`url(#${id}-box)`}>
          <rect
            x={box.x - 300 + state.sheen * (box.w + 600)}
            y={box.y - 200}
            width={260}
            height={box.h + 400}
            fill={`url(#${id}-sheen)`}
            transform={`rotate(18 ${box.x + box.w / 2} ${box.y + box.h / 2})`}
            style={{mixBlendMode: 'normal'}}
          />
        </g>
      ) : null}
    </g>
  );
};
