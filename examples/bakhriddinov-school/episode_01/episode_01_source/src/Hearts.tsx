import React from "react";

export const HEART = "M0 38 C-56 -4 -52 -48 -24 -50 C-9 -51 0 -41 0 -30 C0 -41 9 -51 24 -50 C52 -48 56 -4 0 38Z";
const LEFT_CLIP = "M-90 -70 L0 -52 L9 -26 L-7 -4 L7 16 L-3 46 L-90 60Z";
const RIGHT_CLIP = "M90 -70 L0 -52 L9 -26 L-7 -4 L7 16 L-3 46 L90 60Z";

/** glossy heart; `crack` 0..1 splits it along a zig-zag; `glow` 0..1 */
export const Heart: React.FC<{ x?: number; y?: number; size?: number; glow?: number; pulse?: number; crack?: number; opacity?: number; rot?: number; id?: string }> = ({ x = 0, y = 0, size = 100, glow = 1, pulse = 0, crack = 0, opacity = 1, rot = 0, id = "h" }) => {
  const s = (size / 100) * (1 + 0.14 * pulse);
  const body = (
    <g>
      <path d={HEART} fill="url(#heartG)" stroke="#8E0F34" strokeOpacity="0.6" strokeWidth="3" strokeLinejoin="round" />
      <ellipse cx="-24" cy="-30" rx="15" ry="9" fill="#fff" opacity="0.7" transform="rotate(-30 -24 -30)" />
    </g>
  );
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`} opacity={opacity} style={{ filter: glow > 0.02 ? `drop-shadow(0 0 ${8 + 22 * glow}px rgba(255,70,120,${0.35 + 0.6 * glow})) drop-shadow(0 0 ${30 * glow}px rgba(255,120,160,${0.45 * glow}))` : undefined }}>
      {crack <= 0.001 ? body : (
        <>
          <clipPath id={`${id}L`}><path d={LEFT_CLIP} /></clipPath>
          <clipPath id={`${id}R`}><path d={RIGHT_CLIP} /></clipPath>
          <g clipPath={`url(#${id}L)`} transform={`translate(${-crack * 22} ${crack * 8}) rotate(${-crack * 14} -20 30)`}>{body}</g>
          <g clipPath={`url(#${id}R)`} transform={`translate(${crack * 22} ${crack * 14}) rotate(${crack * 18} 20 30)`}>{body}</g>
          <path d="M0 -52 L9 -26 L-7 -4 L7 16 L-3 46" stroke="#2a0b22" strokeWidth="4" fill="none" opacity={crack * 0.9} />
        </>
      )}
    </g>
  );
};
