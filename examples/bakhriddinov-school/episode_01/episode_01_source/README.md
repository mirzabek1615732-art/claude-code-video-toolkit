# Episode 1: octopus (three hearts, blue blood, "mind-blowing")

Remotion project (React + SVG), 1080x1920, 30 fps, 30.0 s. All art is drawn in code; narration, music and effects are generated.

## Rebuild
```bash
npm install
# 1. narration clips with word timings (Edge neural TTS, voice en-US-AvaMultilingualNeural)
cd public/audio && python3 ../../tools/tts_words.py en-US-AvaMultilingualNeural "text" c1 "+6%" "+3Hz"   # see tools/ and script in build_audio.py
# 2. timeline, original music + synthesized SFX, ducked mix, -16 LUFS, SRT, src/timeline.json
python3 tools/build_audio.py        # needs numpy and ffmpeg; trimmed clips are public/audio/cN.t.wav
# 3. render picture (muted) then mux the mix
npx remotion render Episode out/video.mp4 --muted --codec h264 --crf 16 --pixel-format yuv420p
ffmpeg -i out/video.mp4 -i public/audio/mix.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -t 30 episode_01_octopus.mp4
```
- `src/Episode.tsx` scenes, camera and acting. `src/Octopus.tsx` procedural character. `src/Organs.tsx` simplified circulation.
- `src/timeline.json` word and event times generated from the real narration; picture and sound both read it.
- Fonts: Space Grotesk and Anton (OFL), bundled in `public/fonts`.
