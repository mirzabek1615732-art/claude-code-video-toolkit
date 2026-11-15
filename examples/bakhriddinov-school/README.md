# Bakhriddinov School: English-learning shorts

30-second animated shorts that teach Uzbek students one English expression through a surprising fact. English
narration, Uzbek (Latin) subtitles, 1080x1920 at 30 fps. Branding rules are in `brands/bakhriddinov-school/`.

| Episode | Topic | Expression taught | Look |
|---|---|---|---|
| `episode_01/` | Octopuses have three hearts and blue blood | mind-blowing | Underwater, x-ray cutaway, glowing hearts |
| `episode_02/` | Why flamingos are pink | you are what you eat, pigment | Tropical sunset, mirror gag, time-lapse |
| `episode_03/` | Venus turns once more slowly than it orbits the Sun | at a snail's pace | Midnight space, orbit rings, space snail |

Each folder holds the finished MP4, the subtitle files and `episode_0N_source/`, a Remotion project with every asset
it needs (narration clips with word timings, fonts, logo). To edit and render again:

```bash
cd examples/bakhriddinov-school/episode_02/episode_02_source
npm install
npm run studio          # preview and edit
python3 tools/build_audio.py   # only after changing the narration, subtitles, music or effects
npx remotion render Episode out/video.mp4 --muted --codec h264 --crf 16 --pixel-format yuv420p
ffmpeg -i out/video.mp4 -i public/audio/mix.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -t 30 ../episode_02_flamingos.mp4
```

Each source folder's README has the details. Episodes 1 and 3 use the logo watermark that every episode from 3 on must
use; Episode 2 keeps the text watermark it was made with.
