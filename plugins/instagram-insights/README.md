# instagram-insights

A Claude Code plugin that measures your Instagram videos and Reels and tells you what your best posts have in
common.

- **Measured from the video file:** length, aspect, number of cuts, when the first cut lands, average shot length,
  when the sound starts, loudness.
- **Frames Claude looks at:** a hook strip (0, 0.5, 1, 2 and 3 s) and a 12-frame contact sheet per video.
- **Performance numbers:** views, reach, likes, comments, saves, shares, average watch time. These come from your
  own Insights (manual mode) or from Instagram's API (API mode).
- **Report:** ranking by any metric, the best third against the worst third, rank correlations, weekdays. Every
  gap is labelled. Nothing is estimated.

## Install

```bash
/plugin marketplace add mirzabek1615732-art/claude-code-video-toolkit
```

```bash
/plugin install instagram-insights@claude-code-video-toolkit
```

Restart Claude Code after installing. Needs Python 3.10+ and FFmpeg.

## Two ways to use it

| | Manual mode | API mode |
|---|---|---|
| Needs a Meta app or token | **No** | Yes, from "API setup with Instagram login" |
| Videos come from | Your original reel files | Downloaded from Instagram |
| Numbers come from | Your Insights screenshots or a CSV export | Instagram's API |
| Works when Meta blocks your business | **Yes** | No |

Start with manual mode unless you already have a working Instagram Login token.

## Manual mode (no token)

You need:
1. **Your original reel files** (the MP4 or MOV files you uploaded) in one folder.
2. **The numbers**, in either form:
   - **screenshots** of each reel's Insights page (in the Instagram app, open the reel, then tap **View insights**);
   - **a CSV export** of your content's performance, from Meta Business Suite or the professional dashboard, if
     you can open those.

Then ask Claude, or run the command:

```
/instagram-insights:manual ~/Reels ~/Reels/screenshots
```

What happens:
- Claude makes a table with one row per video file.
- With screenshots, Claude copies only the numbers it can see, notes which screenshot each came from, and shows
  you the table to check before going on.
- Blank values stay blank. The report shows them as **missing** and never guesses them.
- Rounded numbers like `1.2K` are marked ≈ in the report.
- If any value can't be read (a date it doesn't understand, text where a number should be), nothing is imported.
  You get a list of the cells to fix.

If you'd rather fill the table yourself, run `ig.py manual init --videos ~/Reels`. Open
`instagram-data/metrics.csv` in any spreadsheet app, fill in what you have and save it as CSV. The columns are
`file, posted, views, reach, likes, comments, saves, shares, avg_watch_s, caption, permalink, source, notes`.
Write watch time with its unit (`7 sec`) and dates as `2026-10-03` or `2026-10-03 18:30`.

## API mode (Instagram Login token)

### Which login method works

In your Meta app, under the Instagram use case, the dashboard offers one or more API setups. Only one works with
this plugin:

| Setup in the Meta dashboard | Token starts with | Works with this plugin |
|---|---|---|
| **API setup with Instagram login** (also called Business Login for Instagram) | `IG` | **Yes** |
| API setup with Facebook login | `EAA` | No |
| API setup with Unified login | not confirmed | Not supported or tested |

If you give the plugin an `EAA` token (one issued by Facebook), it says so and points you to manual mode.

### Setup

1. **Make the account professional.** In the Instagram app: Settings → Account type and tools → Switch to
   professional account (Creator or Business).
2. **Create a Meta app** at [developers.facebook.com/apps](https://developers.facebook.com/apps) with the
   Instagram use case. If Meta lets you skip connecting a business portfolio, skip it.
3. **Choose "API setup with Instagram login"**, add your Instagram account, and generate a token with
   `instagram_business_basic` and `instagram_business_manage_insights`.
4. **Put the token in `.env`** in the folder you run Claude Code from: `INSTAGRAM_ACCESS_TOKEN=IGAA...`. Keep it out
   of git and out of the chat.
5. Check it with `ig.py auth`. Refresh it before 60 days with `ig.py auth --refresh`.

Then: `/instagram-insights:analyze 30 --by views`.

### If Meta blocks your app

**"Unified login" only appears for apps that belong to a business portfolio.** If your dashboard offers only that
setup, the app is attached to a portfolio.

**"Your business is prohibited from advertising, including app sharing"** is a restriction Meta places on the
business portfolio or the account. The restriction is on Meta's side, so this plugin can't work around it. If the
portfolio is restricted, connecting it to an app or creating a new portfolio fails as well.

What you can do:
- **Use manual mode now.** It needs nothing from Meta.
- **Check the restriction and ask for a review.** Open Business Support Home (Account Quality) in Meta Business
  Suite. It shows which asset is restricted: your profile, the Page, the ad account or the portfolio. Only an
  admin of the business can request a review.
- **Try an app with no business portfolio.** Create a new Meta app, don't connect a portfolio, and look for "API
  setup with Instagram login". We haven't been able to test whether Meta allows this while your business is
  restricted.

## Files and options

Everything lands in `./instagram-data/` (or `--data DIR` / `INSTAGRAM_DATA_DIR`), which ignores itself in git.
Manual mode reads your video files where they are and doesn't copy them.

| Variable | Default | Meaning |
|---|---|---|
| `INSTAGRAM_ACCESS_TOKEN` | (API mode only) | Instagram Login token, in the environment or `.env` |
| `INSTAGRAM_DATA_DIR` | `./instagram-data` | Where data and reports go |
| `INSTAGRAM_API_VERSION` | `v23.0` | Graph API version (API mode) |

## Limits

- Manual mode is only as complete as the numbers you supply. The report shows exactly which are missing.
- API mode reads only Reels and feed videos, and only from posts made after the account became professional.
  Instagram withholds the file of some Reels with licensed music; their numbers still count.
- About 200 API calls an hour; a fetch costs about two calls per video.
