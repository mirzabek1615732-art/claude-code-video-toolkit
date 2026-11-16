# Mirzabek sound effects pack

Made with FFmpeg from sine waves and noise, so there is no license to worry about. Free to use in any video, commercial
or not, with no credit line. A preview video (21 s, each name shown while it plays) was sent in chat; video files are kept out of this repo.

| File | Use it when | Length |
|---|---|---|
| `whoosh_scene_change.mp3` | The scene changes: new location, B-roll cut in | 0.8 s |
| `swoosh_fast.mp3` | A quick cut or a label sliding in | 0.4 s |
| `pop_text.mp3` | A text box or caption label appears | 0.2 s |
| `bubble_pop.mp3` | An emoji or sticker appears (lighter than `pop_text`) | 0.3 s |
| `click.mp3` | A number card or score appears (9.0 / 8.5 ...) | 0.07 s |
| `ding.mp3` | The key point of the video | 1.4 s |
| `correct.mp3` | The right answer is shown ("I agree") | 0.9 s |
| `wrong_buzzer.mp3` | A mistake is shown ("I am agree") | 0.6 s |
| `camera_shutter.mp3` | A certificate or photo is shown | 0.2 s |
| `riser.mp3` | Just before a reveal: put its end exactly on the reveal | 1.6 s |
| `impact.mp3` | The big result lands ("5.5 → 7.5") | 0.9 s |

## Rules

- **Under the voice, not over it.** Mix effects 15 to 25 dB quieter than speech; never louder than your voice.
- **At most one effect every 2 to 3 seconds.** More feels like a cartoon and tires the viewer.
- **Same sound, same meaning.** Always `wrong_buzzer` for a mistake and `correct` for the fix, so viewers learn the
  pattern across the series.
- **Exactly on the frame.** The effect starts on the frame the text or cut appears (`addmusic.py --events`, or a
  Remotion `<Audio>` in a `<Sequence>`).
- **No effects on the first word of the hook** if they would cover it; the hook must be heard.

## Upgrades

These are simple synthesized sounds. For richer, recorded ones:
- `uv run tools/sfx.py` generates any sound from a description with ElevenLabs (uses your credits).
- `uv run tools/sfx_search.py` finds free Freesound recordings, but Freesound's download server refused this cloud
  machine in Nov 2026; it works from a computer.
