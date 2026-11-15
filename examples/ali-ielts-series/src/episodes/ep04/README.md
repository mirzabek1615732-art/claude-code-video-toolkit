# Episode 4 — "Ali va IELTS Listening: thirteenmi yoki thirty?!"

1080×1920 · 30 fps · composition `Ep04AliListening`, thumbnail still `Ep04Thumbnail`.

## Status: animation finished, Uzbek narration NOT yet recorded
VoiceLab ran out of credits. Only `l01` (reused from Ep3) and `l03` ("Test boshlandi.") have real audio.
The other 16 Uzbek lines are **placeholders**: captions and animation run on estimated timing, with no voice.
The English listening lines (`e01`–`e03`) are real audio: free local voice Piper `en_GB-alan-medium`
(checked by speech-to-text: it hears "13" and "30"; not checked by ear).

## Finish the narration (about 620 VoiceLab credits)
1. Generate each placeholder line of `script.json` with Javohir (voice id in `script.json`), one clip per line.
2. Save as `public/ep04/vo_raw/<line id>.wav` (e.g. `l02.wav`), note the IDs in `voicelab_generations.json`.
3. `python3 scripts/episode_voice.py ep04` — trims, normalises to −17 LUFS, aligns words, rewrites `timing.json`.
   Every scene, caption and ducking span re-times itself from the real audio.
4. Render and master (below). Expect about 55–60 s once real clips replace the estimates (now 68 s).

One script change from the brief: l16 says "Sen ham bu ikki raqamni adashtirganmisan?" so the Uzbek voice
does not have to pronounce "thirteen/thirty"; the lesson's English words are spoken by the English voice.

## Render
```bash
npx remotion render src/index.ts Ep04AliListening out/ep04_raw.mp4 --codec=h264 --crf=18 --audio-bitrate=320k
# with full narration: 2-pass linear loudnorm to −16 LUFS / −1.5 dBTP (same commands as ep03/README.md)
npx remotion still src/index.ts Ep04Thumbnail output/ep04_thumbnail.png
```
The current `output/ep04_ali_listening.mp4` has a fixed +2 dB gain instead (speech sits at about −16 LUFS;
the whole file reads −23 LUFS only because most lines are silent). Do not normalise the silent version to −16:
it would lift music and effects 7 dB.

## Mix check (stems, `scripts/measure_mix.py`)
Speech −17.8 LUFS; music median 23 dB under speech; SFX median 26 dB under (min 15 dB). Numbers only.
