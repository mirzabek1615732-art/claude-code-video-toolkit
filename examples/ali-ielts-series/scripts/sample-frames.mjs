// Render sampled frames of the reel to out/frames/ for visual QA, plus a
// contact sheet (requires ffmpeg).  Usage: node scripts/sample-frames.mjs [every=15] [from] [to]
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import {execFileSync} from 'node:child_process';
import {mkdirSync, rmSync} from 'node:fs';
import path from 'node:path';

const every = Number(process.argv[2] ?? 15);
const root = path.resolve(import.meta.dirname, '..');
const outDir = path.join(root, 'out', 'frames');
rmSync(outDir, {recursive: true, force: true});
mkdirSync(outDir, {recursive: true});

const serveUrl = await bundle({entryPoint: path.join(root, 'src/index.ts')});
const composition = await selectComposition({serveUrl, id: 'AliIeltsReel'});
const from = Number(process.argv[3] ?? 0);
const to = Number(process.argv[4] ?? composition.durationInFrames - 1);
const frames = [];
for (let f = from; f <= to; f += every) frames.push(f);
if (frames[frames.length - 1] !== to) frames.push(to);

for (const frame of frames) {
  const output = path.join(outDir, `f${String(frame).padStart(4, '0')}.jpg`);
  await renderStill({composition, serveUrl, frame, output, imageFormat: 'jpeg', jpegQuality: 80, scale: 0.4});
  process.stdout.write(`${frame} `);
}
console.log('\nrendered', frames.length, 'frames');
try {
  execFileSync('ffmpeg', ['-y', '-v', 'error', '-pattern_type', 'glob', '-i', path.join(outDir, '*.jpg'), '-vf', 'tile=8x4:padding=4', path.join(outDir, 'contact_%02d.jpg')]);
  console.log('contact sheets in', outDir);
} catch (e) {
  console.warn('ffmpeg contact sheet failed', e.message);
}
