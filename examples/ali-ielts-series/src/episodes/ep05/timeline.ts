import {buildTimeline, type ScriptJson, type TimingJson} from '../buildTimeline';
import script from './script.json';
import timing from './timing.json';

export const EP05 = buildTimeline(script as ScriptJson, timing as TimingJson, 0);
