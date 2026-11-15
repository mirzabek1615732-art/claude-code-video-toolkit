import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {TIMELINE, type SceneId, type WordTiming} from '../episode/timeline';
import {COLORS, FONT_FAMILY, SAFE} from '../theme';
import {pop} from './anim';

const MAX_CHARS = 20;
const MAX_WORDS = 4;

/** Split a line's words into readable caption pages. */
const paginate = (words: WordTiming[]) => {
  const pages: WordTiming[][] = [];
  let cur: WordTiming[] = [];
  let chars = 0;
  for (const w of words) {
    const len = w.text.length + (cur.length ? 1 : 0);
    if (cur.length && (chars + len > MAX_CHARS || cur.length >= MAX_WORDS)) {
      pages.push(cur);
      cur = [];
      chars = 0;
    }
    cur.push(w);
    chars += len;
    // break after sentence punctuation
    if (/[:!?.]$/.test(w.text) && !/\.\.\.$/.test(w.text) && cur.length >= 2) {
      pages.push(cur);
      cur = [];
      chars = 0;
    }
  }
  if (cur.length) pages.push(cur);
  return pages;
};

/**
 * Word-synchronised Uzbek captions. The active word scales up; scripted
 * highlight words are yellow, the spoken word glows orange.
 */
export const SubtitleRenderer: React.FC<{hideIn?: SceneId[]; hideLines?: string[]}> = ({hideIn = [], hideLines = []}) => {
  const frame = useCurrentFrame();
  const line = TIMELINE.lines.find((l) => frame >= l.from - 2 && frame < l.from + l.durationInFrames + 10);
  if (!line || hideIn.includes(line.scene) || hideLines.includes(line.id)) return null;
  const pages = paginate(line.words);
  let page = pages[0];
  for (const p of pages) {
    if (frame >= p[0].from - 2) page = p;
  }
  const pageStart = page[0].from - 2;
  const enter = pop(frame, pageStart, 30, {damping: 14, stiffness: 220});
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <div
        style={{
          position: 'absolute',
          left: (1080 - SAFE.captionWidth) / 2,
          width: SAFE.captionWidth,
          top: SAFE.captionY,
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: '6px 22px',
          transform: `translateY(${(1 - enter) * 40}px) scale(${0.85 + enter * 0.15})`,
          opacity: Math.min(1, enter * 1.5),
        }}
      >
        {page.map((w, i) => {
          const active = frame >= w.from && frame < w.to + 3;
          const spoken = frame >= w.from;
          const wp = pop(frame, w.from, 30, {damping: 10, stiffness: 250, mass: 0.5});
          const color = w.highlight ? COLORS.yellow : active ? COLORS.orange : COLORS.white;
          return (
            <span
              key={`${w.text}-${i}`}
              style={{
                fontFamily: FONT_FAMILY,
                fontWeight: 900,
                fontSize: 78,
                lineHeight: 1.12,
                color,
                opacity: spoken ? 1 : 0.55,
                WebkitTextStroke: `12px ${COLORS.navy}`,
                paintOrder: 'stroke fill',
                textShadow: `0 7px 0 ${COLORS.navy}`,
                transform: `scale(${active ? 1 + 0.12 * Math.min(1, wp) : 1}) translateY(${active ? -6 : 0}px)`,
                display: 'inline-block',
                textTransform: 'uppercase',
              }}
            >
              {w.text}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
