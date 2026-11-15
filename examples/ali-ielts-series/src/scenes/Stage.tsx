import React from 'react';
import type {SceneTiming} from '../episode/timeline';

/** Full-frame SVG layer used by every scene (1080×1920 user units). */
export const Stage: React.FC<{children: React.ReactNode; style?: React.CSSProperties}> = ({children, style}) => (
  <svg viewBox="0 0 1080 1920" width={1080} height={1920} style={{position: 'absolute', inset: 0, overflow: 'visible', ...style}}>
    {children}
  </svg>
);

export type SceneProps = {scene: SceneTiming};

/** Absolute-positioned HTML slot centred on (x, y). */
export const At: React.FC<{x: number; y: number; children: React.ReactNode; width?: number}> = ({x, y, children, width = 1000}) => (
  <div style={{position: 'absolute', left: x - width / 2, top: y, width, display: 'flex', justifyContent: 'center'}}>{children}</div>
);
