# Episode 5 — "Ali va IELTS Writing: professor bo‘lib ketgan Ali!"

1080×1920 · 30 fps · composition `Ep05AliWriting`, thumbnail still `Ep05Thumbnail` (`output/ep05_thumbnail.png`).

## Status: finished
- Rendered `output/ep05_ali_writing.mp4` (64.5 s) and `output/ep05_thumbnail.png`.
- VoiceLab (Javohir) had no credits, so all Uzbek lines are ElevenLabs `eleven_v4` (628 characters, generated
  2026-11-18 after an ElevenLabs outage cleared). English examples e01/e02: Piper `en_GB-alan-medium`.
- Mix (stems, `scripts/measure_mix.py`): speech −17.4 LUFS; music median 23 dB under speech; effects median 32 dB
  under (min 20 dB). Master: −16.0 LUFS integrated, true peak −3.4 dBTP. Numbers only, not checked by listening.

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
