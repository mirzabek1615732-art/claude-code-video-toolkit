---
description: Analyze your reels without a Meta token, from your own video files plus Insights screenshots or a CSV
argument-hint: "<folder with your reel files> [screenshots folder or metrics CSV] [--by views|reach|save_rate|...]"
---

Analyze the user's Instagram reels in manual mode with the `instagram-analysis` skill. Load the skill first and
follow its "Manual mode" and "Reading Insights screenshots" sections exactly.

The script is `${CLAUDE_PLUGIN_ROOT}/skills/instagram-analysis/scripts/ig.py`.

Arguments: $ARGUMENTS
- The first path is the folder with the original reel files. If it is missing, ask for it.
- A second path is either a CSV of metrics or a folder of Insights screenshots.
- `--by METRIC` is the ranking metric (default views).

Steps:
1. `manual init --videos <folder>`.
2. With a CSV, pass it straight to `manual import --metrics`. With screenshots, read each one, fill
   `instagram-data/metrics.csv` by the skill's rules, show the table to the user and wait for their confirmation.
3. `manual import`, then `analyze`, then `report --by METRIC`. If the import lists problems, show them and ask
   the user; never fill a value yourself.
4. Read the report and the frames of the top and bottom videos. Give the patterns with their numbers, say which
   data was missing, and suggest two or three things to try next.
