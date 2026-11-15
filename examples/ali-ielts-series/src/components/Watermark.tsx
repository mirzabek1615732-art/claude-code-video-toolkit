import React from 'react';
import {Img, staticFile, useCurrentFrame} from 'remotion';
import {COLORS, FONT_FAMILY} from '../theme';
import {tween} from './anim';

export const BRAND_NAME = 'Bakhriddinov School';

/**
 * OFFICIAL school watermark — use this in every Ali episode from Episode 4 on
 * (Ep3 shipped with the legacy text pill below). Spec from the school's brand rules
 * (claude-code-video-toolkit/brands/bakhriddinov-school): the official logo file, white on
 * transparent, top-right, 1080x1920 → top 104, right 44, width 252; opacity 0.85 + soft drop
 * shadow, no box/pill; every frame, never animated; render it as the LAST layer, outside the
 * camera. Titles must keep their top edge below y≈210 so they never touch it.
 * Scale the numbers with the canvas for other sizes.
 */
export const SchoolWatermark: React.FC = () => (
  <Img
    src={staticFile('brand/logo-watermark.png')}
    style={{position: 'absolute', top: 104, right: 44, width: 252, opacity: 0.85, filter: 'drop-shadow(0 2px 6px rgba(0,8,30,0.7))', pointerEvents: 'none'}}
  />
);

/** @deprecated Legacy text-pill watermark, used only by Episode 3. New episodes use SchoolWatermark. */

/**
 * Brand watermark for every Ali episode: small pill, top-centre (y≈70), between
 * Instagram's back-arrow/"Reels" label (left) and camera icon (right), above the
 * headline band (which starts at y≥150). `hideFrom` hands over to the end card.
 */
export const Watermark: React.FC<{hideFrom?: number}> = ({hideFrom}) => {
  const f = useCurrentFrame();
  const out = hideFrom === undefined ? 1 : tween(f, [hideFrom, hideFrom + 8], [1, 0]);
  if (out <= 0) return null;
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 62, display: 'flex', justifyContent: 'center', opacity: 0.88 * out, pointerEvents: 'none'}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(17,24,39,0.55)', border: '2px solid rgba(255,255,255,0.35)', borderRadius: 999, padding: '6px 18px 6px 8px'}}>
        <div style={{width: 30, height: 30, borderRadius: 15, background: COLORS.yellow, color: COLORS.navy, fontFamily: FONT_FAMILY, fontWeight: 900, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>BS</div>
        <div style={{fontFamily: FONT_FAMILY, fontWeight: 800, fontSize: 24, letterSpacing: 2, color: COLORS.white, textTransform: 'uppercase'}}>{BRAND_NAME}</div>
      </div>
    </div>
  );
};

/** Larger brand line for the end card. */
export const BrandSignoff: React.FC<{from: number}> = ({from}) => {
  const f = useCurrentFrame();
  const p = tween(f, [from, from + 10], [0, 1]);
  if (p <= 0) return null;
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 470, display: 'flex', justifyContent: 'center', opacity: p, transform: `translateY(${(1 - p) * 20}px)`}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 16, background: COLORS.white, border: `5px solid ${COLORS.navy}`, borderRadius: 999, padding: '10px 34px 10px 12px', boxShadow: '6px 8px 0 rgba(0,0,0,0.3)'}}>
        <div style={{width: 60, height: 60, borderRadius: 30, background: COLORS.yellow, color: COLORS.navy, fontFamily: FONT_FAMILY, fontWeight: 900, fontSize: 26, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `3px solid ${COLORS.navy}`}}>BS</div>
        <div style={{fontFamily: FONT_FAMILY, fontWeight: 900, fontSize: 44, letterSpacing: 1, color: COLORS.navy}}>{BRAND_NAME}</div>
      </div>
    </div>
  );
};
