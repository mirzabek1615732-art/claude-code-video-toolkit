# instagram-insights

A Claude Code plugin that reads the videos and Reels on your own Instagram account, measures them, and tells you
what your best posts have in common.

- **Insights per video:** views, reach, likes, comments, saves, shares, average watch time.
- **Measured from the file:** length, aspect, number of cuts, when the first cut lands, average shot length, when
  the sound starts, loudness.
- **Frames Claude looks at:** a hook strip (0, 0.5, 1, 2 and 3 s) and a 12-frame contact sheet per video.
- **Report:** ranking by any metric, the best third against the worst third, rank correlations, weekdays.
- **Snapshots:** every fetch is saved, so a weekly run shows the trend.

It uses Instagram's official API, so it only reads the account you log in with. No scraping, no password.

## Install

```bash
/plugin marketplace add mirzabek1615732-art/claude-code-video-toolkit
```

```bash
/plugin install instagram-insights@claude-code-video-toolkit
```

Or from a local clone: `/plugin marketplace add ./path/to/claude-code-video-toolkit`. Restart Claude Code after
installing. Needs Python 3.10+ and FFmpeg on your PATH.

## Setup (once, about 10 minutes)

1. **Make the account professional.** In the Instagram app: Settings → Account type and tools → Switch to
   professional account (Creator or Business). Personal accounts have no API access.
2. **Create a Meta app.** At [developers.facebook.com/apps](https://developers.facebook.com/apps), Create app →
   use case **Manage messaging and content on Instagram** → app type Business. It can stay in development mode;
   you don't need App Review to read your own account.
3. **Add your account.** In the app: Instagram → **API setup with Instagram business login** → *Generate access
   tokens* → Add account, and log in to Instagram. If it asks, accept the tester invite in Instagram (Settings →
   Website permissions → Apps and websites → Tester invites). Make sure the permissions include
   `instagram_business_basic` and `instagram_business_manage_insights`.
4. **Copy the token** it generates (long-lived, 60 days) into a `.env` file in the folder you run Claude Code from:

   ```
   INSTAGRAM_ACCESS_TOKEN=IGAA...
   ```

   Keep `.env` out of git. Don't paste the token into the chat.
5. Check it: ask Claude "check my Instagram connection", or run
   `python3 skills/instagram-analysis/scripts/ig.py auth`.

Refresh the token before it expires with `ig.py auth --refresh` (it rewrites `.env`); a token older than 24 hours
can be refreshed any time in its 60 days.

## Use

```
/instagram-insights:analyze 30 --by views
```

Or just ask: "how are my Reels doing?", "why did last week's video beat the others?", "what should I change in my
hooks?". The skill fetches, downloads, measures, then reads the frames of your best and worst videos.

The script also runs on its own:

```bash
python3 skills/instagram-analysis/scripts/ig.py fetch --since 60d
```

```bash
python3 skills/instagram-analysis/scripts/ig.py download
```

```bash
python3 skills/instagram-analysis/scripts/ig.py analyze
```

```bash
python3 skills/instagram-analysis/scripts/ig.py report --by save_rate --tz-offset 5
```

Everything lands in `./instagram-data/` (or `--data DIR` / `INSTAGRAM_DATA_DIR`), which ignores itself in git.

## Options

| Variable | Default | Meaning |
|---|---|---|
| `INSTAGRAM_ACCESS_TOKEN` | (required) | Token from step 4, in the environment or `.env` |
| `INSTAGRAM_DATA_DIR` | `./instagram-data` | Where data, videos and reports go |
| `INSTAGRAM_API_VERSION` | `v23.0` | Graph API version |

## Limits

- Only Reels and feed videos; carousels, photos and Stories are skipped.
- Instagram withholds the file of some Reels with licensed music. Their numbers are still in the report.
- About 200 API calls an hour; a fetch costs about two calls per video.
- Insights exist only for posts made after the account became professional.
