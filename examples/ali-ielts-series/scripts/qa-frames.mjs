// Render chosen frames of a composition for visual QA.
// Usage: node scripts/qa-frames.mjs <compId> <outDir> <scale> <frame,frame,...|from:to:step>
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import {mkdirSync} from 'node:fs';
import path from 'node:path';

const [id, outDir, scaleArg, spec] = process.argv.slice(2);
const root = path.resolve(import.meta.dirname, '..');
mkdirSync(outDir, {recursive: true});
const serveUrl = await bundle({entryPoint: path.join(root, 'src/index.ts')});
const composition = await selectComposition({serveUrl, id});
let frames = [];
for (const part of spec.split(',')) {
  if (part.includes(':')) {
    const [a, b, s] = part.split(':').map(Number);
    for (let f = a; f <= b; f += s) frames.push(f);
  } else frames.push(Number(part));
}
frames = frames.filter((f) => f < composition.durationInFrames);
for (const frame of frames) {
  await renderStill({composition, serveUrl, frame, output: path.join(outDir, `f${String(frame).padStart(4, '0')}.jpg`), imageFormat: 'jpeg', jpegQuality: 80, scale: Number(scaleArg)});
}
console.log('rendered', frames.length);
