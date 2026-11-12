---
name: instagram-analysis
description: Analyze the videos and Reels on the user's own Instagram account. Two modes. Manual mode needs no Meta token, so use it when API access is blocked or not set up. The user supplies their original reel files plus numbers from Instagram Insights screenshots or a CSV export. API mode fetches insights with an Instagram Login token. Both modes measure the files with ffmpeg (length, cuts, first cut, when sound starts, loudness), save hook frames and contact sheets, rank the videos and compare the best third with the worst. Use when asked how their Instagram videos or Reels are doing, why one did better than another, what to post more of, or to analyze reels from screenshots or a CSV.
---

# Instagram video analysis

The script is `scripts/ig.py` beside this file. It uses only Python's standard library, and `analyze` also needs
ffmpeg. Run it from the folder the user works in. Data lands in `./instagram-data/`, which writes its own
`.gitignore`. Global options such as `--data DIR` go before the subcommand.

## Pick the mode

- **Manual mode**: no token. Use it whenever the user has no working token, Meta blocks their app or business
  portfolio, or they would rather hand over files. It is the default unless `auth` succeeds.
- **API mode**: needs a token from **API setup with Instagram login** (it starts with `IG`). Facebook-issued tokens
  start with `EAA` and the script refuses them. Unified login is not supported or tested.

## Manual mode

```bash
IG="<this skill's directory>/scripts/ig.py"
python3 "$IG" manual init --videos "<reels folder>"        # instagram-data/metrics.csv, one row per video file
# fill metrics.csv (from screenshots: see below), or use the user's own CSV export instead
python3 "$IG" manual import --videos "<reels folder>" --metrics instagram-data/metrics.csv
python3 "$IG" analyze
python3 "$IG" report --by views
```

The template's columns are `file, posted, views, reach, likes, comments, saves, shares, avg_watch_s, caption,
permalink, source, notes`. `manual import` also reads Meta's own CSV exports from Meta Business Suite or the
professional dashboard. It maps their headers (Views, Reach, Saves, Publish time, Permalink, Description...) and
keeps any other numeric column under its own name (`x_<name>`, usable with `report --by`). Rows link to video files
by the `file` column (name with or without extension), or else by the reel code from the link when a file name
contains it (`DAbc123XyZ.mp4`). Rows are never matched by order.

**The import never guesses.** If a value can't be read, it lists every problem and imports nothing:
- text in a number column;
- a date it can't read;
- a watch time written as a bare number under a header that doesn't say seconds;
- two rows pointing at the same video.

Rounded values such as `1.2K` are accepted and shown with ≈. Blank cells stay missing. Slash dates are read
month first, as in Meta's exports, unless you pass `--date-order dmy`.

### Reading Insights screenshots

You transcribe; the script can't read images. Rules, because a made-up number would poison the whole report:

1. **Match each screenshot to a video from what it shows**: thumbnail, caption, posting date. If the match isn't
   certain, ask the user. Never pair them by file order.
2. **Copy only numbers that are visible**, exactly as shown (`1.2K` stays `1.2K`; the import marks it as rounded).
   Leave a cell blank if that number isn't on the screenshot. Never estimate, average or carry a value over from
   another video.
3. **Put each number under the column its label names.** Views go in `views` and Accounts reached in `reach`.
   Saves, Shares, Likes and Comments go in their own columns. Average watch time goes in `avg_watch_s` with its
   unit (`7 sec`). Plays, Follows or Skip rate are different metrics: add a column with that label instead of
   folding them into views.
4. **Write the screenshot's file name in `source`** for every row you fill, and note anything cut off or unclear
   in `notes`.
5. **Show the user the filled table and ask them to confirm** before running `manual import`.

## API mode

```bash
python3 "$IG" auth                  # token works? which account?
python3 "$IG" fetch --limit 30      # newest 30 videos + insights -> instagram-data/media.json, plus a snapshot
python3 "$IG" download              # files -> instagram-data/videos/<id>.mp4
python3 "$IG" analyze
python3 "$IG" report --by views
```

`fetch --since 30d` limits by date. `auth --refresh` extends the token by 60 days. The token belongs in `.env` as
`INSTAGRAM_ACCESS_TOKEN=...`. Never ask the user to paste it into the chat, and never print or commit it. If the
user can't get a token, see the README section "If Meta blocks your app" and switch to manual mode. Don't keep
pushing them through Meta's dashboard.

## Report

`report --by` takes any number in the data: `views`, `reach`, `likes`, `saved`, `shares`, `avg_watch_s`,
`watch_ratio`, `engagement_rate`, `save_rate`, `share_rate`, or an `x_` extra column. `--tz-offset` shifts API
times from UTC (manual times are taken as the user's local time). `report.md` has these sections:

- **Data supplied:** per metric, how many videos have it and which don't.
- **Ranking:** gaps read `missing`, `no video` or `can't compute`.
- **Not ranked:** videos without the ranking metric.
- **Top third against bottom third:** medians and rank correlations.
- **Source:** in manual mode, where each video's numbers came from.

Computed rates exist only when every input was supplied: no reach, no rates. Engagement uses the interactions
count, or likes + comments + saves + shares only when all four are there.

## How to analyze

1. **Numbers first.** Read `report.md`, starting with "Data supplied". Pick the ranking metric with the user:
   - `views` for reach;
   - `avg_watch_s` or `watch_ratio` for whether people stay;
   - `save_rate` or `share_rate` for whether the video was worth something to them.

   Rank by a metric most videos have.
2. **Then look.** Read the `hook.jpg` strips (frames at 0, 0.5, 1, 2 and 3 s) and the `sheet.jpg` contact sheets
   for the top and bottom videos. Ask of each:
   - Is there a face, text on screen, movement, or a clear subject in the first frame?
   - Does the first second promise something the rest delivers?
3. **Report patterns, with their numbers and their gaps.** Say what the top videos share, then give two or three
   things to try next. Every number you quote must come from the report. When a comparison rests on few videos
   or a metric is missing for many, say so ("reach was supplied for 4 of 9 videos").

## Reading the numbers honestly

- **Small samples lie.** With under ~15 videos, a rank correlation under 0.5 is noise. Topic and trends move views
  far more than editing does.
- **Young posts aren't finished.** Leave anything under 3 days old out, or mention it.
- **Screenshots are a moment in time.** Numbers taken on different days aren't strictly comparable. Note the
  capture date in `source` when it differs.
- **`watch_ratio`** is average watch time divided by length; over 1.0 means people rewatch. Compare it among videos
  of similar length.

## When something fails

- **Import refused:** fix the listed cells in the CSV and run it again.
- **Ranking refused** ("No video has a value for 'X'"): that metric wasn't supplied. Rank by one the message lists.
- **`OAuthException 190`** (API mode): the token expired or was revoked.
- **API token starts with `EAA`:** Facebook issued it, and API mode can't use it. Use manual mode.
- **No cuts on a video that clearly has them:** lower `analyze --scene-threshold` (default 0.3) and pass `--force`.
