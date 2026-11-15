import script from './script.json';
import timing from './timing.json';

/**
 * Turns script.json (what is said, by which scene, with which pauses) and
 * timing.json (how long each generated voice clip really is) into frame-exact
 * timings. Every scene, caption and SFX derives from this, so changing the
 * script and re-running `npm run voice` re-times the whole video.
 */
export const FPS = script.fps;
export const sec = (s: number) => Math.round(s * FPS);

export type SceneId =
  | 'hook'
  | 'problem'
  | 'procrastination'
  | 'social'
  | 'reality'
  | 'wakeup'
  | 'transformation'
  | 'cta';

export type WordTiming = {text: string; from: number; to: number; highlight: boolean};

export type LineTiming = {
  id: string;
  scene: SceneId;
  text: string;
  file: string;
  /** absolute frame */
  from: number;
  durationInFrames: number;
  words: WordTiming[];
};

export type SceneTiming = {
  id: SceneId;
  from: number;
  durationInFrames: number;
  /** line start frames relative to the scene start, keyed by line id */
  beats: Record<string, {from: number; to: number}>;
};

type ScriptLine = {
  id: string;
  scene: string;
  text: string;
  highlight?: string[];
  gapAfter?: number;
};

const isSceneId = (s: string): s is SceneId =>
  ['hook', 'problem', 'procrastination', 'social', 'reality', 'wakeup', 'transformation', 'cta'].includes(s);

const timingById = new Map(timing.lines.map((l) => [l.id, l]));

const build = () => {
  const lines: LineTiming[] = [];
  const scenes: SceneTiming[] = [];
  let cursor = 0; // seconds
  for (const scene of script.scenes) {
    if (!isSceneId(scene.id)) {
      throw new Error(`Unknown scene ${scene.id}`);
    }
    const sceneStartSec = cursor;
    cursor += scene.pre ?? 0;
    const sceneLines = (script.lines as ScriptLine[]).filter((l) => l.scene === scene.id);
    const beats: SceneTiming['beats'] = {};
    for (const line of sceneLines) {
      const t = timingById.get(line.id);
      if (!t) {
        throw new Error(`No voice timing for ${line.id}. Run \`npm run voice\`.`);
      }
      const from = sec(cursor);
      const highlights = new Set(line.highlight ?? []);
      lines.push({
        id: line.id,
        scene: scene.id,
        text: line.text,
        file: t.file,
        from,
        durationInFrames: Math.max(1, sec(t.duration)),
        words: t.words.map((w) => ({
          text: w.text,
          from: from + sec(w.start),
          to: from + Math.max(sec(w.end), sec(w.start) + 2),
          highlight: highlights.has(w.text),
        })),
      });
      cursor += t.duration + (line.gapAfter ?? 0);
    }
    const sceneFrom = sec(sceneStartSec);
    for (const l of lines.filter((x) => x.scene === scene.id)) {
      beats[l.id] = {from: l.from - sceneFrom, to: l.from - sceneFrom + l.durationInFrames};
    }
    scenes.push({id: scene.id, from: sceneFrom, durationInFrames: sec(cursor) - sceneFrom, beats});
  }
  return {lines, scenes, durationInFrames: sec(cursor)};
};

export const TIMELINE = build();

export const sceneTiming = (id: SceneId): SceneTiming => {
  const s = TIMELINE.scenes.find((x) => x.id === id);
  if (!s) {
    throw new Error(`scene ${id} missing`);
  }
  return s;
};
