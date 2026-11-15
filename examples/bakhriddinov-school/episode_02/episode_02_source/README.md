# Episode 2: Why are flamingos pink?  (Bakhriddinov School)

Remotion (React + SVG), 1080x1920, 30 fps, exactly 30.0 s. Every character and background is drawn in code;
narration (Edge neural TTS, en-US-AvaMultilingualNeural), music and sound effects are generated.

## Rebuild
```bash
npm install
# narration clips with word timings, one per sentence (see SCRIPT in tools/build_audio.py for text, rate and pitch)
cd public/audio && python3 ../../tools/tts_words.py en-US-AvaMultilingualNeural "Wait! Flamingos aren't born pink." d1 "+6%" "+4Hz" && cd ../..
# trim silence to dN.t.wav (ffmpeg silenceremove), then build timeline, Uzbek SRT, music, SFX, ducked -16 LUFS mix, voice WAV
python3 tools/build_audio.py
npx remotion render Episode out/video.mp4 --muted --codec h264 --crf 16 --pixel-format yuv420p
ffmpeg -i out/video.mp4 -i public/audio/mix.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -t 30 ../episode_02_flamingos.mp4
```
- `src/Scenes.tsx`: the six scenes. `src/Characters.tsx`: flamingo, chick, shrimp, friend. `src/Episode.tsx`: transitions,
  the "YOU ARE WHAT YOU EAT" type and meaning card, Uzbek subtitles, watermark.
- Uzbek subtitle text lives in `tools/build_audio.py` (UZ list); timings come from the narration's word boundaries.
- `public/bs-mark.png` is cut from the official school logo.
