/**
 * Generic episode timeline: script.json (scenes, lines, pauses, highlights)
 * + timing.json (real narration durations and word timings) -> frames.
 * Every scene, caption and ducking span derives from the real audio.
 */
export type ScriptJson = {
  fps: number;
  scenes: Array<{id: string; pre?: number}>;
  lines: Array<{id: string; scene: string; text: string; highlight?: string[]; emphasis?: string; gapAfter?: number}>;
};
export type TimingJson = {
  lines: Array<{id: string; file: string | null; duration: number; placeholder: boolean; words: Array<{text: string; start: number; end: number}>}>;
};

export type TLWord = {text: string; from: number; to: number; highlight: boolean};
export type TLLine = {id: string; scene: string; text: string; from: number; durationInFrames: number; file: string | null; placeholder: boolean; words: TLWord[]; emphasis: string | null};
export type TLScene = {id: string; from: number; durationInFrames: number; lines: Record<string, TLLine & {localFrom: number; localTo: number}>};
export type Timeline = {fps: number; lines: TLLine[]; scenes: TLScene[]; durationInFrames: number};

export const buildTimeline = (script: ScriptJson, timing: TimingJson, tailSeconds = 0): Timeline => {
  const fps = script.fps;
  const sec = (s: number) => Math.round(s * fps);
  const byId = new Map(timing.lines.map((l) => [l.id, l]));
  const lines: TLLine[] = [];
  const scenes: TLScene[] = [];
  let t = 0;
  for (const sc of script.scenes) {
    const start = t;
    t += sc.pre ?? 0;
    const sl: TLScene['lines'] = {};
    for (const ln of script.lines.filter((l) => l.scene === sc.id)) {
      const tm = byId.get(ln.id);
      if (!tm) throw new Error(`no timing for ${ln.id}; run scripts/episode_voice.py`);
      const from = sec(t);
      const hl = new Set(ln.highlight ?? []);
      const line: TLLine = {
        id: ln.id,
        scene: sc.id,
        text: ln.text,
        from,
        durationInFrames: Math.max(1, sec(tm.duration)),
        file: tm.file,
        placeholder: tm.placeholder,
        emphasis: ln.emphasis ?? null,
        words: tm.words.map((w) => ({text: w.text, from: from + sec(w.start), to: from + Math.max(sec(w.end), sec(w.start) + 2), highlight: hl.has(w.text)})),
      };
      lines.push(line);
      t += tm.duration + (ln.gapAfter ?? 0);
    }
    const sceneFrom = sec(start);
    for (const l of lines.filter((x) => x.scene === sc.id)) {
      sl[l.id] = {...l, localFrom: l.from - sceneFrom, localTo: l.from - sceneFrom + l.durationInFrames};
    }
    scenes.push({id: sc.id, from: sceneFrom, durationInFrames: sec(t) - sceneFrom, lines: sl});
  }
  const total = sec(t + tailSeconds);
  const last = scenes[scenes.length - 1];
  last.durationInFrames = total - last.from;
  return {fps, lines, scenes, durationInFrames: total};
};

/** Local frame of word `i` of a line inside its scene. */
export const wordAt = (scene: TLScene, lineId: string, i: number) => {
  const l = scene.lines[lineId];
  if (!l) throw new Error(`line ${lineId} not in scene ${scene.id}`);
  const w = l.words[Math.min(i, l.words.length - 1)];
  return w.from - (l.from - l.localFrom);
};
