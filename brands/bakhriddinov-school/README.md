# Bakhriddinov School brand

English-learning animated shorts for Uzbek students (Multilevel & IELTS).

## Logo watermark: the rule for every video from Episode 3 on

Use the official logo exactly as it appears in Episode 1 (octopus). Episode 2 keeps its own text watermark and is not
changed; every later episode uses this one.

- **File:** `assets/logo-watermark.png`. It is the official logo (`assets/logo.jpg`) cut to the "BS | BAKHRIDDINOV
  SCHOOL / MULTILEVEL & IELTS" block, white on a transparent background. Never redraw or retype it.
- **Place:** top-right corner. On a 1080x1920 canvas: `top: 104px`, `right: 44px`, `width: 252px` (height follows the
  image). Scale these numbers with the canvas for other sizes.
- **Look:** `opacity: 0.85`, `filter: drop-shadow(0 2px 6px rgba(0,8,30,0.7))`. No box, pill or background behind it.
- **Time:** every frame, from the first to the last. Same position and size all the way through; it never animates.
- **Layout:** it sits above the scene and outside the camera, so camera moves and shakes don't touch it. Titles and
  graphics make room for it, not the other way round (in Episode 1 the title's top edge had to stay below y 210).

Remotion, copy `assets/logo-watermark.png` into the project's `public/` and render this as the last layer:

```tsx
import { Img, staticFile } from "remotion";

export const SchoolWatermark: React.FC = () => (
  <Img
    src={staticFile("logo-watermark.png")}
    style={{ position: "absolute", top: 104, right: 44, width: 252, opacity: 0.85, filter: "drop-shadow(0 2px 6px rgba(0,8,30,0.7))" }}
  />
);
```

To cut the watermark again from the original logo (1254x1254 JPG, white on black):

```bash
ffmpeg -i assets/logo.jpg -vf "crop=940:340:158:455,format=rgba,geq=r=255:g=255:b=255:a='clip((r(X,Y)-18)*1.15,0,255)'" assets/logo-watermark.png
```

## Series defaults (Episodes 1 and 2)

- 1080x1920, 30 fps, exactly 30 s, H.264 and AAC, mixed to -16 LUFS with peaks under -1.5 dBTP.
- English narration (Edge neural TTS `en-US-AvaMultilingualNeural`), Uzbek Latin subtitles burned in, plus an Uzbek SRT.
- Music about 20 dB under the voice and ducked while it speaks; effects at least 14 dB under the voice peak.
- No spoken or written request to share, tag or send the video.
