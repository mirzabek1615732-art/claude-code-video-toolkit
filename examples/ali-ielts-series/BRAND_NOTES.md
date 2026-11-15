# Brand context: read before any content work in `projects/`

The owner of this repository is an **IELTS instructor and English teacher in Uzbekistan** who is building a **personal brand on Instagram**. The goal is to get students for paid **online** lessons and **offline** classes in their city.

## Priorities (in this order)
1. **The teacher's face and voice.** Most content is real video of the teacher. Being recognised as a person is the goal.
2. **Converting viewers into students.** Followers → Telegram/DM → free mock test or trial lesson → paid online or offline course.
3. **Animations (the "Ali" series in `ali-ielts-reel/`) are a secondary format.** Post them occasionally (about 1–2 a month) as a recurring series. They were a test, not the brand.

## How Claude should help
- Edit the teacher's raw talking-head clips into reels: hook in the first 1–2 s with text on frame 0, burned-in animated captions, punch-in zooms, light SFX, a branded end card with one call to action. Animated inserts (Ali cameos, score cards, charts) support the teacher on screen; they never replace them.
- Keep the visual identity from `ali-ielts-reel/src/theme.ts` (navy #111827, blue #2563EB, yellow #FACC15, orange #FB923C, green #22C55E, Montserrat) so animations and teacher videos look like one brand.
- Language: Uzbek captions and voice by default; English for the example phrases being taught.
- Honesty rules: never promise a guaranteed band score. Show student results only if they are real and the student agreed. No fake reviews or testimonials.
- Measure each reel by: share still watching at 3s and 7s, average watch time, follows per 1,000 views, saves and shares, DMs or keyword comments, Telegram joins, trial lessons booked.

## Files
- `personal-brand/BRAND_PLAN.md`: the full strategy, profile copy, content pillars, 30-day plan, recording guide.
- `personal-brand/PROFILE.md`: brand facts (name, city, credentials, prices, links). Fill in the TODOs; don't invent them.
- `ali-ielts-reel/`: the Remotion animation project ("ALI va IELTS" series: Ep1 posted, Ep2 Speaking made outside the repo, Ep3 Reading rendered — voice for 2 lines pending). Read `ali-ielts-reel/SERIES.md` before any new episode.

## Watermark (every video)
- Use the school's **official logo watermark** (the octopus "BS | BAKHRIDDINOV SCHOOL" block), never a retyped name. Spec: file `ali-ielts-reel/public/brand/logo-watermark.png` (source: `claude-code-video-toolkit/brands/bakhriddinov-school/assets/`), top-right, on 1080×1920 `top:104px; right:44px; width:252px`, opacity 0.85 + soft drop-shadow, no box, every frame, never animated, last layer outside the camera. Titles keep their top edge below y≈210.
- Ali episodes: `<SchoolWatermark />` in `ali-ielts-reel/src/components/Watermark.tsx`. Check it is in the render before delivering.

## Editing lessons (from the posted intro reel — apply to every new video)
- **Text behind the subject:** curly/light-catching hair over solid black text reads as grey haze. Place behind-text so it ends *above* the head at its highest point, or overlaps only the shoulders/jacket — never the hairline. If hair must overlap, run matting at 0.5 scale (full res gives blocky patches), then `hair_lumakey.py` (keys out wall seen through hair gaps) before compositing, and check a full-size crop of the hairline at 3 points in time.
- **Back-to-back cutaways:** never fade a cutaway in over another cutaway — the clip underneath ghosts through. Only the first cutaway of a run fades in; the next ones hard-cut (`StudentCert fadeIn={false}`).
- **QA every transition:** before delivering, render a 15 fps contact strip of ±1 s around every cut and cutaway and inspect it frame by frame (this is how the 21–22 s ghost was found).
