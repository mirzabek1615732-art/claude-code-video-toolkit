# "ALI va IELTS" animated series — saved copy

Full Remotion project of the series (episodes 1 and 3 sources, Episode 2 reference render and caption, shared audio
system, watermark, QA and mix-measure scripts). Start with `SERIES.md` (series bible) and `BRAND_NOTES.md`.

- Episode 3 (Reading): `src/episodes/ep03/`, finished video `output/ep03_ali_reading.mp4`, thumbnail
  `output/ep03_thumbnail.png`, caption `src/episodes/ep03/CAPTION.md`. Two narration lines (l15b, l17) still need
  their VoiceLab audio — steps in `src/episodes/ep03/README.md`.
- Episode 2 (Speaking, made outside the project): `reference/ep02_ali_speaking.mp4`, caption `reference/ep02_CAPTION.md`.
- Watermark: official school logo, `<SchoolWatermark />` — rule in `SERIES.md` and `BRAND_NOTES.md`.
- Mirror of the working repo `mirzabek1615732-art/remotion`, branch `claude/uzbek-ielts-animated-reel-v4tg68`,
  folder `projects/ali-ielts-reel/`.

Run: `npm install && npx remotion studio` (composition `Ep03AliReading`).
