import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {loadBrandFonts} from './fonts';

loadBrandFonts();

export type CoverProps = {
  frame: string; // graded video frame (1080×1920)
  cutout: string; // RGBA cut-out of the person from the same frame
  big1: string;
  big2: string;
  name: string;
  facts: string[];
  /** show the 3:4 grid-crop guide (preview only) */
  guide: boolean;
};

const INK = '#0B0B0C';
const W = '#FFFFFF';

/** Reel cover: big type behind the subject, name + facts in logo-cell boxes. */
export const TeacherCover: React.FC<CoverProps> = ({frame, cutout, big1, big2, name, facts, guide}) => (
  <AbsoluteFill style={{background: '#000'}}>
    <Img src={staticFile(frame)} style={{position: 'absolute', inset: 0, width: 1080, height: 1920}} />
    <div style={{position: 'absolute', top: 262, width: 1080, textAlign: 'center', fontFamily: 'Archivo Black', fontSize: 128, lineHeight: 1, color: INK, letterSpacing: -2}}>{big1}</div>
    <div style={{position: 'absolute', top: 360, width: 1080, textAlign: 'center', fontFamily: 'Archivo Black', fontSize: 336, lineHeight: 1, color: INK, letterSpacing: -6}}>{big2}</div>
    <Img src={staticFile(cutout)} style={{position: 'absolute', inset: 0, width: 1080, height: 1920}} />
    {/* soft dark fade so the boxes sit on a calm base */}
    <div style={{position: 'absolute', left: 0, right: 0, top: 1180, height: 740, background: 'linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,0.55) 45%, rgba(0,0,0,0.7))'}} />
    <div style={{position: 'absolute', left: 0, right: 0, top: 1372, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18}}>
      <div style={{background: W, color: INK, border: `6px solid ${W}`, padding: '14px 30px 10px', fontFamily: 'Archivo Black', fontSize: 60, letterSpacing: 0.5}}>{name}</div>
      <div style={{display: 'flex', gap: 12}}>
        {facts.map((f) => (
          <div key={f} style={{background: 'rgba(11,11,12,0.92)', color: W, border: `5px solid ${W}`, padding: '12px 20px', fontFamily: 'Archivo', fontWeight: 700, fontSize: 30, letterSpacing: 3}}>
            {f}
          </div>
        ))}
      </div>
    </div>
    {guide ? (
      <>
        <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 240, background: 'rgba(255,0,0,0.35)'}} />
        <div style={{position: 'absolute', left: 0, right: 0, top: 1680, bottom: 0, background: 'rgba(255,0,0,0.35)'}} />
      </>
    ) : null}
  </AbsoluteFill>
);
