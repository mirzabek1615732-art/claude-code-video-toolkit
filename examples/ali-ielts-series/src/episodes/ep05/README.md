# Episode 5 — "Ali va IELTS Writing: professor bo‘lib ketgan Ali!"

1080×1920 · 30 fps · composition `Ep05AliWriting`, thumbnail still `Ep05Thumbnail` (`output/ep05_thumbnail.png`).

## Status: animation, captions, thumbnail done — Uzbek voices NOT generated yet
- VoiceLab (Javohir) still has no credits (2026-11-18: `insufficient_credits`).
- The fallback, ElevenLabs, was in an outage while this was built (its status page: "Partial System Degradation";
  the API timed out / returned 500 for 40+ minutes). Nothing was generated, nothing was charged.
- Done: English example sentences e01, e02 (Piper `en_GB-alan-medium`, local, free).
- So the video has NOT been rendered: the scenes run on estimated timing until the real voices exist.

## Voices (script.json "voices")
| role | lines | voice |
|---|---|---|
| narrator | l01–l14 | ElevenLabs "Ali narrator (Javohir clone)" `N3JyoAxu35CZFiDzoIoZ` (VoiceLab Javohir if credits return) |
| ali | a01, a02, a03 | ElevenLabs library "Abror - Casual" (Uzbek) |
| teacher | t01 | ElevenLabs library "Mirjalol - Calm, Confident" (Uzbek) |
| influencer | i01 | ElevenLabs library "Asilbek - Ads" (Uzbek) |
| en | e01, e02 | Piper `en_GB-alan-medium` |
About 630 ElevenLabs characters in total.

## Finish
```bash
python3 scripts/elevenlabs_lines.py ep05      # all ElevenLabs lines (cached; --force to redo)
python3 scripts/piper_lines.py ep05           # English lines (already done)
python3 scripts/episode_voice.py ep05         # trim, normalise −17 LUFS, align words → timing.json
npx remotion render src/index.ts Ep05AliWriting out/ep05_raw.mp4 --codec=h264 --crf=18 --audio-bitrate=320k
# master: 2-pass linear loudnorm to −16 LUFS / −1.5 dBTP (same as ep03/ep04), then check stems with scripts/measure_mix.py
```

## Design notes
- The teacher scene has no music: the silence after "Ali, nima demoqchisan?" (1.9 s gap, quiet crickets) is the joke.
- Lesson stays honest: advanced words are fine when used accurately; the checklist is clear ideas, relevant vocabulary,
  accurate grammar, appropriate word choice. No band promises.
- New reusable pieces: `components/TeacherCharacter.tsx` (recurring "Ustoz"), Ali rig props `glasses`, `gradCap`,
  `starEyes`, expressions `professor` and `blank`, `GradCap`; `scripts/elevenlabs_lines.py` now takes per-line voices,
  `scripts/piper_lines.py` voices English lines.
