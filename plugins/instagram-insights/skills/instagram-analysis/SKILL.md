---
name: instagram-analysis
description: Analyze the videos and Reels on the user's own Instagram account. Fetches each video with its insights (views, reach, saves, shares, average watch time), downloads the files, measures them with ffmpeg (length, cuts, first cut, when sound starts, loudness) and saves hook frames and contact sheets, then ranks the videos and compares the best third with the worst. Use when asked how their Instagram videos or Reels are doing, why one did better than another, what to post more of, or to review their Instagram content.
---

# Instagram video analysis

The script is `scripts/ig.py` beside this file (standard library only; `analyze` needs ffmpeg). Run it from the
folder the user works in: data lands in `./instagram-data/` (it writes its own `.gitignore`, so videos and account
data stay out of git). Global options such as `--data DIR` go before the subcommand.

```bash
IG="<this skill's directory>/scripts/ig.py"
python3 "$IG" auth                  # token works? which account?
python3 "$IG" fetch --limit 30      # newest 30 videos + insights -> instagram-data/media.json, plus a snapshot
python3 "$IG" download              # files -> instagram-data/videos/<id>.mp4 (skips ones already there)
python3 "$IG" analyze               # per video: analysis/<id>.json, <id>.hook.jpg, <id>.sheet.jpg
python3 "$IG" report --by views     # report.md + report.json
```

`fetch --since 30d` limits by date. `download ID` and `analyze ID` take media ids or the shortcode from a reel
link (`instagram.com/reel/<shortcode>/`). `report --by` takes any number in the data: `views`, `reach`, `saved`,
`shares`, `avg_watch_s`, `watch_ratio`, `engagement_rate`, `save_rate`, `share_rate`. `--tz-offset 5` shifts
posting hours from UTC to the user's time zone. `auth --refresh` extends the token by 60 days (do it monthly).

## Setup (once)

If `auth` says there is no token, walk the user through the plugin README's **Setup** section: a Business or
Creator account, a Meta developer app with Instagram Login, and a long-lived token in `.env` as
`INSTAGRAM_ACCESS_TOKEN=...`. Never ask the user to paste the token into the chat; they put it in `.env`
themselves. Never print it, commit it, or put it in a file other than `.env`.

## How to analyze

1. **Numbers first.** Read `report.md`. Pick the ranking metric with the user: `views` for reach, `avg_watch_s`
   or `watch_ratio` for whether people stay, `save_rate`/`share_rate` for whether it was worth something to them.
   The best and worst thirds and the rank correlations show which measured traits go with the metric.
2. **Then look.** Read the `hook.jpg` strips (frames at 0, 0.5, 1, 2 and 3 s) for the top and bottom videos, then
   their `sheet.jpg` contact sheets (12 frames across the whole video). Compare what a scroller sees first:
   is there a face, text on screen, movement, a clear subject in the first frame? Does the first second promise
   something the rest delivers? Where do the frames go static?
3. **Report patterns, not one-offs.** Say what the top videos share and the bottom ones lack, with the numbers
   (for example "top third cuts within 1.2 s, bottom third holds 4 s on the first shot"). Then give two or three
   concrete things to try in the next posts, and suggest re-running `fetch` in a week to compare (each fetch saves
   a snapshot in `snapshots/`).

## Reading the numbers honestly

- **Small samples lie.** With under ~15 videos a rank correlation under 0.5 is noise; say so. Topic and trends
  move views far more than editing does, so a pattern in cuts or length is a hint, not a rule.
- **Young posts are not finished.** Reels keep gaining for days; leave anything under 3 days old out of the
  comparison or mention it.
- **`watch_ratio`** is average watch time over length. Over 1.0 means people rewatch; a short video wins this
  easily, so compare it among videos of similar length.
- **Refused metrics** are reported by `fetch`. Instagram changes which insights it gives by media type and API
  version (`plays` became `views` in 2025); a missing column is that, not a bug.
- Only Reels and feed videos are fetched. Carousels, photos and Stories are skipped, and posts made before the
  account became professional have no insights.

## When something fails

- `OAuthException 190`: the token expired or was revoked. Make a new one (README Setup, step 4).
- `(#10)` or permission errors: the token lacks `instagram_business_manage_insights`; generate it again with that
  permission ticked.
- `download` skips a video with no `media_url`: Instagram withholds the file for some Reels with licensed music.
  Its insights still count in the report; it just has no measurements.
- Rate limit (`code 4` or `32`): about 200 calls an hour. `fetch` makes about two per video; wait and rerun.
- No cuts on a video that clearly has them: lower `analyze --scene-threshold` (default 0.3) and pass `--force`.
