# ALI va IELTS — animated Uzbek reel (Remotion)

A 44-second vertical (1080×1920, 30 fps) animated Instagram Reel / TikTok / YouTube Short in Uzbek. It stars **ALI**, a code-rigged 2D SVG character. Everything you see and hear is generated from code: the character, sets, motion, captions, sound effects and music. The narration is neural TTS (see below).

| Deliverable | Path |
| --- | --- |
| Final video (H.264 + AAC, mastered to −14 LUFS) | `final-video.mp4` |
| Poster / thumbnail | `thumbnail.png` |
| Episode script (single source of truth) | `src/episode/script.json` |
| Generated voice timing (per word) | `src/episode/timing.json` |
| Narration clips | `public/audio/vo/l01.wav … l19.wav` |
| SFX + music (synthesised, original) | `public/audio/sfx/*.wav`, `public/audio/music_*.wav` |

## Quick start

```bash
npm install                      # Node 18+; ffmpeg on PATH for mastering
pip install edge-tts numpy       # only needed to regenerate audio

npm run studio                   # live preview in Remotion Studio
npm run render                   # → final-video.mp4 + thumbnail.png
npm run qa                       # sample every 15th frame → out/frames/contact_*.jpg
npm run typecheck
```

`npm run render` renders `AliIeltsReel` at CRF 18, then runs an ffmpeg mastering pass (loudnorm −14 LUFS, −1.5 dBTP, faststart) and renders the `Thumbnail` still.

## How it is built

```
src/
  episode/script.json      lines, scene assignment, pauses, caption highlights, phonetic "spoken" text
  episode/timeline.ts      script + measured voice durations → frame-exact scene/line/word timings
  components/
    AliCharacter.tsx       rigged SVG character: 2-bone arms/legs, blendable poses + 9 expressions,
                           auto-blink, breathing, squash & stretch, walk cycle, held items, headphones
    AnimatedText.tsx       kinetic word-by-word headlines (pop / slam / rise / drop springs)
    SubtitleRenderer.tsx   word-synced Uzbek captions in the safe zone, active-word highlight
    CameraMovement.tsx     keyframed zoom/pan/roll + decaying impact shakes
    AnimatedBackground.tsx sunburst, halftone drift, parallax room set, floating shapes, speed lines
    SceneTransition.tsx    shutter / circle / flash overlays that hide every cut
    PhoneScreen.tsx        generic social feed + vertical-clip UI (no real brand assets)
    CalendarFlip.tsx       tear-off calendar flips + weekly streak calendar
    ScoreReveal.tsx        mock-test result sheet with slamming scores
    ProgressBar.tsx        band-score progress bar (4.0 → 5.5; honest progress, no promise)
    AudioManager.tsx       VO placement, music bed with ducking/drop-outs, tension bed, <Sfx/>
    Particles.tsx, Props.tsx, anim.ts (springs, easing, keyed pose/expression tracks)
  scenes/Scene1Hook.tsx … Scene8CTA.tsx   every beat is keyed to a word timing
  Reel.tsx                 master composition; Thumbnail.tsx; dev/CharacterSheet.tsx (model sheet)
scripts/
  generate_voiceover.py    edge-tts → trimmed WAV per line + word boundaries → timing.json
  generate_audio_assets.py numpy DSP: 22 SFX + upbeat music loop + tension drone
  render.sh, sample-frames.mjs
```

Scene beats are not hard-coded seconds. Each scene receives `scene.beats` (the line start frames) and the word timings, so editing the script and re-running `npm run voice` re-times the whole film. That includes SFX, camera hits and caption sync.

### Storyboard as built

| # | Time | Beat |
| --- | --- | --- |
| 1 | 0.0–3.2s | Ali crashes in (stretch → squash, BOOM, dust, shake), IELTS 7.0 target spins in, "MANA BU ALI!" slams, he points at the target |
| 2 | 3.2–5.9s | Lazy on the sofa, phone buzzes, he grabs it, red **0% MOTIVATION** meter drains |
| 3 | 5.9–10.3s | "ERTADAN!" bubble ×3 while the calendar flips DUSHANBA → SESHANBA → CHORSHANBA, the book gathers dust and cobwebs, crickets |
| 4 | 10.3–16.3s | Giant phone feed → vertical clips with swipes, hearts and emoji, pull-back reveal, clock 15:00 → 18:00, **3 SOAT?!** |
| 5 | 16.3–24.0s | Walks into the mock test, results drop, LISTENING 4.5 / READING 4.0 slam, crash zoom, 7.0 dream bubble bursts |
| 6 | 24.0–28.8s | Freeze frame, darkness, word-by-word punchline, spotlight on the book, Ali decides |
| 7 | 28.8–36.4s | Montage: phone into the "KEYIN" box, book opens, headphones, highlighter, vocab cards, progress 4.0 → 5.5, 7-day streak |
| 8 | 36.4–44.3s | Points at the viewer, **BUGUNDAN BOSHLA!**, IELTS · ENGLISH · MOTIVATION, follow-button tap, confetti |

## Audio and licensing

- **Narration:** Microsoft Edge neural TTS voice `uz-UZ-SardorNeural` (male, Uzbek), produced with the open-source `edge-tts` client. It is synthetic, not a human recording. Before commercial publishing, check that your use fits Microsoft's terms for that service. To use a professional voice instead, record one WAV per line with the same file names (`public/audio/vo/l01.wav` …) and run `python3 scripts/generate_voiceover.py --from-existing`. That rebuilds `timing.json` from your recordings; word timings are then estimated proportionally.
- **Voice clarity:** with `voice.enhance: true` in `script.json` (the default) or `--enhance`, every clip goes through a speech clarity chain after silence trimming: 90 Hz high-pass, −3 dB at 280 Hz, +4 dB presence at 3.2 kHz, de-esser, 3:1 compression and −16 LUFS per line. Timing is unchanged.
- **ElevenLabs engine (optional, paid):** set `voice.elevenlabsVoiceId` and `ELEVENLABS_API_KEY`, then run `python3 scripts/generate_voiceover.py --engine elevenlabs`. It uses `eleven_v3` with `language_code: "uz"`, and captions get exact timings from ElevenLabs' character alignment. In a blind Whisper test the Microsoft voice and ElevenLabs v4 were equally intelligible in Uzbek, so pick by ear.
- **Pronunciation:** each line has a `spoken` field that the TTS reads (for example `Ayelts` for IELTS, `mok test`), while `text` is what the captions show.
- **SFX and music** are synthesised from scratch by `scripts/generate_audio_assets.py`. They are original and free to use.
- **Font:** Montserrat (SIL OFL 1.1, see `public/fonts/OFL-Montserrat.txt`). It is bundled locally, so rendering needs no network access.

## Making the next episode

1. Copy this folder (or branch it) and edit `src/episode/script.json`:
   - `lines[]`: `id`, `scene`, `text` (caption), `spoken` (TTS spelling), `highlight` (yellow words), `gapAfter` (seconds of pause after the line).
   - `scenes[]`: scene order and `pre` (lead-in seconds before the first line).
   - `voice`: TTS voice and rate (`uz-UZ-MadinaNeural` is the female alternative).
2. `npm run voice`. This regenerates the narration and `timing.json`; every scene re-times automatically.
3. Re-use or adapt the scenes in `src/scenes/`. Ali's poses (`POSES`), expressions (`EXPRESSIONS`), props and backgrounds are building blocks; check them with the `CharacterSheet` still.
4. `npm run qa` to inspect frames, then `npm run render`.

## Rendering notes

- Rendering takes about 75 seconds on 4 CPU cores (`Config.setConcurrency(4)` in `remotion.config.ts`).
- Remotion fetches its headless Chrome on first run. If the network blocks that, pass `--browser-executable=/path/to/chrome-headless-shell`.
- Remotion is free for individuals and small companies; larger companies need a company license (see remotion.dev/license).
