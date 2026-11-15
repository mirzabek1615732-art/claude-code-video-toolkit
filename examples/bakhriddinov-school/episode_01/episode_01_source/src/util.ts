import T from "./timeline.json";

export const EV = T.ev as Record<string, number>;
export const SC = T.scenes as Record<string, number>;
export const BEAT = T.beat as number;
export type Word = { w: string; s: number; e: number; seg: string };
export const WORDS = T.words as Word[];

export const c01 = (x: number) => Math.min(1, Math.max(0, x));
export const seg = (t: number, a: number, b: number) => c01((t - a) / (b - a));
export const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
export const smooth = (x: number) => x * x * (3 - 2 * x);
export const outCubic = (x: number) => 1 - Math.pow(1 - x, 3);
export const inCubic = (x: number) => x * x * x;
export const outBack = (x: number) => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); };
export const outElastic = (x: number) => (x <= 0 ? 0 : x >= 1 ? 1 : Math.pow(2, -10 * x) * Math.sin((x * 10 - 0.75) * ((2 * Math.PI) / 3)) + 1);

/** keyframes [[time, value], ...] with smooth easing between them */
export const kf = (t: number, pts: [number, number][], e: (x: number) => number = smooth) => {
  if (t <= pts[0][0]) return pts[0][1];
  for (let i = 1; i < pts.length; i++) {
    if (t <= pts[i][0]) return lerp(pts[i - 1][1], pts[i][1], e(seg(t, pts[i - 1][0], pts[i][0])));
  }
  return pts[pts.length - 1][1];
};

/** heartbeat on the music grid: a strong "lub" on every beat and a softer "dub" 0.2 s later (0 to ~1) */
export const beat = (t: number, phase = 0) => {
  const x = ((t - phase) % BEAT + BEAT) % BEAT;
  const g = (c: number, w: number) => Math.exp(-Math.pow((x - c) / w, 2));
  return g(0.04, 0.05) + 0.6 * g(0.24, 0.05);
};

export const hash = (n: number) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };

export const mixHex = (a: string, b: string, k: number) => {
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16)), pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
  return "#" + pa.map((v, i) => Math.round(lerp(v, pb[i], k)).toString(16).padStart(2, "0")).join("");
};

/** start time of the nth word of a narration clip that contains `sub` */
export const W = (segName: string, sub: string, nth = 0) => {
  const hits = WORDS.filter((w) => w.seg === segName && w.w.toLowerCase().includes(sub));
  return hits[Math.min(nth, hits.length - 1)].s;
};
