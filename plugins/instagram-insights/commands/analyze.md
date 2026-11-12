---
description: Fetch, download and analyze the videos on your Instagram account through the API, then report what the best ones do differently
argument-hint: "[number of videos, e.g. 30] [--by views|reach|avg_watch_s|save_rate|share_rate]"
---

Analyze the user's Instagram videos with the `instagram-analysis` skill in API mode. Load the skill first and
follow it.

The script is `${CLAUDE_PLUGIN_ROOT}/skills/instagram-analysis/scripts/ig.py`.

Arguments: $ARGUMENTS
- A bare number is how many recent videos to fetch (default 30).
- `--by METRIC` is the ranking metric for the report (default views).

Steps:
1. `python3 "${CLAUDE_PLUGIN_ROOT}/skills/instagram-analysis/scripts/ig.py" auth`. If there is no token, the token
   is refused, or the user says Meta blocks their app, don't push them through Meta's setup. Offer manual mode
   (`/instagram-insights:manual`): their own reel files plus Insights screenshots or a CSV.
2. `fetch --limit N`, then `download`, then `analyze`, then `report --by METRIC`.
3. Read the report, then the hook strips and contact sheets of the top and bottom videos. Give the user the
   patterns with their numbers and two or three things to try next.
