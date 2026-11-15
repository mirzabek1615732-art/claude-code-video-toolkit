import {buildTimeline, type ScriptJson, type TimingJson} from '../buildTimeline';
import script from './script.json';
import timing from './timing.json';

export const EP03 = buildTimeline(script as ScriptJson, timing as TimingJson, 0);
export const scene = (id: string) => {
  const s = EP03.scenes.find((x) => x.id === id);
  if (!s) throw new Error(`scene ${id}`);
  return s;
};
