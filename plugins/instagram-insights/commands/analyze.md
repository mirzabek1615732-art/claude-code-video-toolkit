---
description: Fetch, download and analyze the videos on your Instagram account, then report what the best ones do differently
argument-hint: "[number of videos, e.g. 30] [--by views|reach|avg_watch_s|save_rate|share_rate]"
---

Analyze the user's Instagram videos with the `instagram-analysis` skill. Load the skill first and follow it.

The script is `${CLAUDE_PLUGIN_ROOT}/skills/instagram-analysis/scripts/ig.py`.

Arguments: $ARGUMENTS
- A bare number is how many recent videos to fetch (default 30).
- `--by METRIC` is the ranking metric for the report (default views).

Steps:
1. `python3 "${CLAUDE_PLUGIN_ROOT}/skills/instagram-analysis/scripts/ig.py" auth`. If there is no token or it is
   rejected, stop and walk the user through Setup in `${CLAUDE_PLUGIN_ROOT}/README.md`.
2. `fetch --limit N`, then `download`, then `analyze`, then `report --by METRIC`.
3. Read the report, then the hook strips and contact sheets of the top and bottom videos, and give the user the
   patterns with numbers and two or three things to try next.
