import React from 'react';
import {AbsoluteFill, spring, useCurrentFrame} from 'remotion';
import type {TLLine, TLWord} from '../episodes/buildTimeline';
import {COLORS, FONT_FAMILY} from '../theme';

const MAX_CHARS_PER_LINE = 17;

/** Split a narration line into caption pages of at most two short lines. */
const paginate = (words: TLWord[]) => {
  const pages: TLWord[][] = [];
  let cur: TLWord[] = [];
  const len = (ws: TLWord[]) => ws.reduce((n, w) => n + w.text.length + 1, 0);
  for (const w of words) {
    if (cur.length && (len(cur) + w.text.length > MAX_CHARS_PER_LINE * 2 || cur.length >= 5)) {
      pages.push(cur);
      cur = [];
    }
    cur.push(w);
    if (/[.!?:]$/.test(w.text) && !/\.\.\.$/.test(w.text) && cur.length >= 2) {
      pages.push(cur);
      cur = [];
    }
  }
  if (cur.length) pages.push(cur);
  return pages;
};

/** Break a page into ≤ 2 balanced lines. */
const twoLines = (ws: TLWord[]) => {
  const len = (a: TLWord[]) => a.reduce((n, w) => n + w.text.length, 0) + Math.max(0, a.length - 1);
  if (len(ws) <= MAX_CHARS_PER_LINE || ws.length < 2) return [ws];
  let best = 1;
  for (let i = 1; i < ws.length; i++) {
    if (Math.max(len(ws.slice(0, i)), len(ws.slice(i))) < Math.max(len(ws.slice(0, best)), len(ws.slice(best)))) best = i;
  }
  return [ws.slice(0, best), ws.slice(best)];
};

/** Solid outer outline (outside the glyphs, unlike text-stroke) plus a drop shadow. */
const outline = (w: number) => {
  const out: string[] = [];
  for (let k = 0; k < 16; k++) {
    const a = (k / 16) * Math.PI * 2;
    out.push(`${(Math.cos(a) * w).toFixed(1)}px ${(Math.sin(a) * w).toFixed(1)}px 0 ${COLORS.navy}`);
  }
  out.push(`0 ${w + 4}px 0 ${COLORS.navy}`);
  return out.join(', ');
};

/** Shrink the font so the longest row fits the 920px safe width. */
const fitSize = (rows: TLWord[][]) => {
  const chars = Math.max(...rows.map((r) => r.reduce((n, w) => n + w.text.length, 0) + (r.length - 1) * 0.35));
  return Math.min(72, Math.floor(920 / (chars * 0.74)));
};

/**
 * Word-synced captions: bold white, scripted highlight words in yellow,
 * the word being spoken pops slightly. Sits in the safe band above
 * Instagram's bottom UI. `hideIds` skips lines that are already big on screen.
 */
export const EpisodeSubtitles: React.FC<{lines: TLLine[]; hideIds?: string[]; top?: number | ((frame: number) => number)}> = ({lines, hideIds = [], top: topProp = 1290}) => {
  const f = useCurrentFrame();
  const top = typeof topProp === 'function' ? topProp(f) : topProp;
  const line = lines.find((l) => f >= l.from - 3 && f < l.from + l.durationInFrames + 8);
  if (!line || hideIds.includes(line.id)) return null;
  const pages = paginate(line.words);
  let page = pages[0];
  for (const p of pages) if (f >= p[0].from - 3) page = p;
  const enter = spring({frame: f - (page[0].from - 3), fps: 30, config: {damping: 14, stiffness: 240, mass: 0.6}});
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <div style={{position: 'absolute', left: 80, right: 80, top, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, transform: `translateY(${(1 - enter) * 30}px) scale(${0.9 + 0.1 * enter})`, opacity: Math.min(1, enter * 1.8)}}>
        {twoLines(page).map((row, r, rows) => (
          <div key={r} style={{display: 'flex', gap: Math.round(fitSize(rows) * 0.34), justifyContent: 'center', whiteSpace: 'nowrap'}}>
            {row.map((w, i) => {
              const active = f >= w.from && f < w.to + 2;
              const said = f >= w.from - 1;
              return (
                <span
                  key={i}
                  style={{
                    fontFamily: FONT_FAMILY,
                    fontWeight: 900,
                    fontSize: fitSize(rows),
                    lineHeight: 1.15,
                    textTransform: 'uppercase',
                    color: w.highlight ? COLORS.yellow : COLORS.white,
                    opacity: 1,
                    filter: said ? undefined : 'brightness(0.82)',
                    WebkitTextStroke: `0px ${COLORS.navy}`,
                    paintOrder: 'stroke fill',
                    textShadow: outline(Math.max(4, Math.round(fitSize(rows) * 0.07))),
                    display: 'inline-block',
                    transform: `scale(${active ? 1.06 : 1}) translateY(${active ? -3 : 0}px)`,
                  }}
                >
                  {w.text}
                </span>
              );
            })}
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};
