import React from "react";
import { EV, WORDS, Word, c01, seg, outBack } from "./util";
import { UZ } from "./uz";

// word groups of up to 3 words (break at punctuation); the group stays on screen while its words are spoken
type Group = { words: Word[]; s: number; e: number };
const groups: Group[] = (() => {
  const out: Group[] = []; let cur: Word[] = [];
  const flush = () => { if (cur.length) { out.push({ words: cur, s: cur[0].s, e: cur[cur.length - 1].e }); cur = []; } };
  WORDS.forEach((w, i) => {
    if (cur.length && cur[0].seg !== w.seg) flush();
    cur.push(w);
    if (cur.length >= 3 || /[.?!,…]$/.test(w.w)) flush();
  });
  flush();
  return out;
})();

const VOCAB = ["mind-blowing", "mind-blowing!", "mind-blowing?"];
const isVocab = (w: string) => VOCAB.includes(w.toLowerCase().replace(/[.,]/g, ""));

export const Captions: React.FC<{ t: number }> = ({ t }) => {
  const gi = groups.findIndex((g, i) => t >= g.s - 0.04 && t < (groups[i + 1] && groups[i + 1].words[0].seg === g.words[0].seg ? groups[i + 1].s - 0.04 : g.e + 0.28));
  if (gi < 0) return null;
  const g = groups[gi];
  const pop = outBack(seg(t, g.s - 0.04, g.s + 0.16));
  const fadeOut = 1 - c01((t - (g.e + 0.12)) / 0.16);
  return (
    <div style={{ position: "absolute", left: 60, right: 60, top: 1300, height: 170, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${0.9 + 0.1 * pop})`, opacity: Math.min(1, pop) * fadeOut }}>
      <div style={{ display: "flex", gap: 30, flexWrap: "nowrap", justifyContent: "center", alignItems: "baseline", fontFamily: "SGrotesk", fontWeight: 700, fontSize: 82, lineHeight: 1.05, letterSpacing: -1 }}>
        {g.words.map((w, i) => {
          const active = t >= w.s - 0.02 && t < w.e + 0.05;
          const spoken = t >= w.s - 0.02;
          const vocab = isVocab(w.w);
          const color = vocab ? "#FFD84D" : active ? "#FFE766" : "#FFFFFF";
          return (
            <span key={i} style={{ color, opacity: spoken ? 1 : 0.42, transform: `translateY(${active ? -6 : 0}px) scale(${active ? 1.06 : 1})`, display: "inline-block", WebkitTextStroke: "11px #06143A", paintOrder: "stroke fill", textShadow: "0 6px 0 rgba(3,10,40,0.55), 0 0 24px rgba(0,0,0,0.35)", ...(vocab ? { background: "none" } : {}) }}>{w.w}</span>
          );
        })}
      </div>
    </div>
  );
};
export { EV };

/** Uzbek translation under the English captions: a whole sentence at a time, highlights in gold */
export const UzCaption: React.FC<{ t: number }> = ({ t }) => {
  const line = UZ.find((u) => t >= u.s - 0.05 && t < u.e);
  if (!line) return null;
  const a = c01((t - (line.s - 0.05)) / 0.18) * (1 - c01((t - (line.e - 0.12)) / 0.12));
  const parts = line.text.split("*");
  return (
    <div style={{ position: "absolute", left: 50, right: 50, top: 1474, display: "flex", justifyContent: "center", opacity: a, transform: `translateY(${(1 - a) * 10}px)` }}>
      <div style={{ maxWidth: 960, padding: "10px 30px 14px", borderRadius: 30, background: "rgba(3, 12, 38, 0.62)", border: "2px solid rgba(160, 230, 255, 0.35)", textAlign: "center", fontFamily: "SGrotesk", fontWeight: 700, fontSize: 46, lineHeight: 1.22, color: "#D9F6FF", textShadow: "0 2px 6px rgba(0,0,0,0.5)" }}>
        {parts.map((p, i) => <span key={i} style={i % 2 ? { color: "#FFD84D" } : undefined}>{p}</span>)}
      </div>
    </div>
  );
};
