# "ALI va IELTS" — animated series bible

Read this before making a new episode. Brand rules in `../CLAUDE.md` still apply (animations are a secondary format, ~1–2 a month; never promise a band score).

## Episodes
| # | Title (Uzbek) | Skill | Status | Files |
|---|---|---|---|---|
| 1 | Ali — IELTS (first episode) | General / motivation | Posted | `src/Reel.tsx`, `src/episode/`, `src/scenes/` |
| 2 | "Ali qaytdi!" — Speaking'dan 7.0 olmoqchi | Speaking (memorised answers vs real speaking practice) | Made outside this repo; reference copy only | `reference/ep02_ali_speaking.mp4` |
| 3 | "Ali va IELTS Reading: Vaqt qayerga ketdi?!" | Reading (don't translate every word → question → keywords → scan; paraphrase) | Rendered, fully narrated (last 2 lines use the ElevenLabs Javohir clone) | `src/episodes/ep03/`, `output/ep03_*` |
| 4 | "Ali va IELTS Listening: thirteenmi yoki thirty?!" | Listening (thirTEEN/THIRty stress; corrections — keep listening) | Rendered, fully narrated with the ElevenLabs Javohir clone; English lines via Piper en_GB | `src/episodes/ep04/`, `output/ep04_*` |

Next ideas: Listening 2 ("Ali va spelling tuzog‘i"), Writing Task 2 ("Ali 250 so‘zga yetolmadi"), Vocabulary ("Ali va 'very good' kasalligi").

## Character — never redesign
- Ali = rigged SVG in `src/components/AliCharacter.tsx`: navy hair, blue hoodie with yellow button, dark trousers, white sneakers. Extend with new poses/expressions/items; don't change the drawing.
- Expressions: neutral, excited, lazy, distracted, shocked, disappointed, motivated, confident, sheepish, panic, idea, focused, proud.
- Ep2 also used sunglasses ("ustasi farang" bravado), an examiner woman, headphones, a microphone — reuse that look if they come back.

## Episode formula (45–55 s, 1080×1920, 30 fps)
1. **Hook (0–3 s):** text on frame 0 + Ali bursts in ("MANA BU ALI!" / "ALI QAYTDI!"). Badge "N-QISM · SKILL".
2. **Problem:** Ali does the common wrong thing, confidently.
3. **Escalation / disaster:** time, examiner, chaos; a freeze-frame or "HMM…" beat.
4. **Reveal:** the fix as 2–3 numbered steps, with an original English example on screen (passage, answer, phrase).
5. **Trap / nuance:** one honest caveat (e.g. paraphrase), shown visually.
6. **Improvement:** Ali practises → measurable progress (correct answers, minutes spoken) — never a guaranteed band.
7. **Ending:** a two-choice question to the viewer ("VAQT yoki NOTANISH SO‘ZLAR?"), comment bubbles, follow-button tap, "ALI BILAN IELTS O‘RGAN!", "Keyingi qism: tez orada!".

## Look
- **Watermark on every episode (required) = the OFFICIAL school logo** (`public/brand/logo-watermark.png`, copied from the school brand rules in `claude-code-video-toolkit/brands/bakhriddinov-school`): `<SchoolWatermark />` from `src/components/Watermark.tsx`, rendered as the very last layer, outside the camera. Top-right, `top:104 right:44 width:252` on 1080×1920, opacity 0.85 + drop-shadow, no box, every frame, never animated. Keep titles' top edge below y≈210 so they clear it. Never redraw/retype it. (Ep3 shipped with an older text pill; Ep1/Ep2 predate the rule. From Ep4 on, always the logo.)
- Theme colours from `src/theme.ts` (navy #111827, blue #2563EB, yellow #FACC15, orange #FB923C, green #22C55E), Montserrat 900.
- Big kinetic headlines at the top (y≈150–400); captions in the 1290 band, or 1460 where Ali's face sits there (see `LOW_CAPTION_SCENES` in ep03 `composition.tsx`). Keep the right edge clear of Instagram's buttons.
- No emoji in renders (headless Chrome has no emoji font) — use SVG icons.

## Audio rules (shared system: `src/audio/EpisodeAudio.tsx`)
- Narrator is always loudest: narration −17 LUFS; music 20–25 dB under speech; SFX 10–18 dB under speech; auto-ducking from line spans.
- Master to ≈ −16 LUFS integrated, true peak ≤ −1 dBTP (linear 2-pass loudnorm). Verify with stems + `scripts/measure_mix.py`.
- English example lines: Piper `en_GB-alan-medium` (free, local; `pip install piper-tts`), one WAV per line in `vo_raw/` like any other line (`"lang": "en"` in script.json).
- Voice: VoiceLab "Javohir — Bright Presenter" (id in `src/episodes/ep03/script.json`). No Edge TTS, no Higgsfield credits. Budget ≈ 1 credit per character (~900–1000 per episode). If VoiceLab credits run out: ElevenLabs `eleven_v4` (supports Uzbek) with the cloned voice "Ali narrator (Javohir clone)", `scripts/elevenlabs_lines.py` (API key via the session credential form, never in files).

## Workflow for a new episode
1. Copy `src/episodes/ep03/` → `epNN/`; write `script.json` (lines, highlight words, scenes).
2. Generate VO in VoiceLab → `public/epNN/vo_raw/`, then `python3 scripts/episode_voice.py epNN`.
3. Build scenes against word timings (`wordAt`), register in `src/Root.tsx`.
4. QA: `node scripts/qa-frames.mjs <Comp> <dir> 0.25 <from:to:step>` for every scene and ±8 frames around every cut.
5. Stems → measure → render → master → thumbnail → caption (template below) → commit.

## Caption template
```
<hook question>? 😅
Ali <mistake>… <consequence>!

✅ <step 1>
✅ <step 2>
✅ <step 3>

Sen-chi? <two-choice question> — izohlarda yoz 👇
📌 Saqlab qo‘y, imtihondan oldin kerak bo‘ladi.
🔔 Ali bilan IELTS o‘rgan — keyingi qism tez orada!

#ielts #ieltsuzbekistan #ielts<skill> ...
```
