#!/usr/bin/env python3
# /// script
# requires-python = ">=3.10"
# dependencies = []
# ///
"""Instagram video analysis: fetch your videos and their insights, download them, measure them, report.

Standard library only, plus ffmpeg/ffprobe on PATH for `analyze`.

    ig.py auth                       # check the token, show the account
    ig.py auth --refresh             # extend a long-lived token (rewrites it in .env)
    ig.py fetch --limit 30           # videos + insights -> instagram-data/media.json (+ snapshot)
    ig.py download                   # video files -> instagram-data/videos/
    ig.py analyze                    # cuts, hook, loudness, frames -> instagram-data/analysis/
    ig.py report --by views          # what the top videos do differently -> instagram-data/report.md

Needs an Instagram Business or Creator account and a token from the Instagram API with
Instagram Login (scopes instagram_business_basic + instagram_business_manage_insights).
Token: INSTAGRAM_ACCESS_TOKEN in the environment or in a .env file in this directory or a parent.
Data: ./instagram-data unless INSTAGRAM_DATA_DIR or --data says otherwise.
"""

from __future__ import annotations

import argparse
import datetime as dt
import http.client
import json
import math
import os
import re
import shutil
import statistics
import subprocess
import sys
import tempfile
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

API_VERSION = os.environ.get("INSTAGRAM_API_VERSION", "v23.0")
GRAPH = os.environ.get("INSTAGRAM_GRAPH_URL", "https://graph.instagram.com").rstrip("/")

MEDIA_FIELDS = ",".join([
    "id", "caption", "media_type", "media_product_type", "media_url", "thumbnail_url",
    "permalink", "timestamp", "like_count", "comments_count",
])
# Asked for together, then one by one if Instagram refuses the set (availability varies by
# media type, account and API version; `plays`/`video_views` were replaced by `views` in 2025).
REEL_METRICS = ["views", "reach", "saved", "shares", "total_interactions",
                "ig_reels_avg_watch_time", "ig_reels_video_view_total_time"]
VIDEO_METRICS = ["views", "reach", "saved", "shares", "total_interactions"]


class ApiError(RuntimeError):
    pass


# --------------------------------------------------------------------------- token / .env

def find_env_file() -> Path | None:
    here = Path.cwd().resolve()
    for d in [here, *here.parents]:
        f = d / ".env"
        if f.is_file():
            return f
    return None


def read_env_value(path: Path, key: str) -> str | None:
    for line in path.read_text().splitlines():
        m = re.match(rf"\s*(?:export\s+)?{key}\s*=\s*(.*)\s*$", line)
        if m:
            return m.group(1).strip().strip("'\"") or None
    return None


def get_token() -> tuple[str, Path | None]:
    tok = os.environ.get("INSTAGRAM_ACCESS_TOKEN")
    if tok:
        return tok, None
    env = find_env_file()
    if env:
        tok = read_env_value(env, "INSTAGRAM_ACCESS_TOKEN")
        if tok:
            return tok, env
    sys.exit("No INSTAGRAM_ACCESS_TOKEN. Set it in the environment or in .env "
             "(see the plugin README: Setup).")


def write_env_value(path: Path, key: str, value: str) -> None:
    lines = path.read_text().splitlines()
    out, done = [], False
    for line in lines:
        if re.match(rf"\s*(?:export\s+)?{key}\s*=", line):
            out.append(f"{key}={value}")
            done = True
        else:
            out.append(line)
    if not done:
        out.append(f"{key}={value}")
    tmp = path.with_suffix(".tmp")
    tmp.write_text("\n".join(out) + "\n")
    os.chmod(tmp, 0o600)
    os.replace(tmp, path)


# --------------------------------------------------------------------------- HTTP

def _redact(text: str, token: str) -> str:
    return text.replace(token, "<token>") if token and len(token) >= 20 else text


def api_get(path_or_url: str, token: str, params: dict | None = None) -> dict:
    if path_or_url.startswith("http"):
        url = path_or_url  # paging.next already carries the token
    else:
        q = dict(params or {}, access_token=token)
        url = f"{GRAPH}/{API_VERSION}/{path_or_url.lstrip('/')}?{urllib.parse.urlencode(q)}"
    req = urllib.request.Request(url, headers={"User-Agent": "instagram-insights-plugin"})
    try:
        with urllib.request.urlopen(req, timeout=60) as r:
            return json.loads(r.read())
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8", "replace")
        try:
            err = json.loads(body).get("error", {})
            msg = f"{err.get('type', 'Error')} {err.get('code', e.code)}: {err.get('message', body)}"
        except ValueError:
            msg = f"HTTP {e.code}: {body[:300]}"
        raise ApiError(_redact(msg, token)) from None
    except urllib.error.URLError as e:
        raise ApiError(_redact(f"Network error: {e.reason}", token)) from None


def download_file(url: str, dest: Path) -> None:
    req = urllib.request.Request(url, headers={"User-Agent": "instagram-insights-plugin"})
    tmp = dest.with_suffix(dest.suffix + ".part")
    with urllib.request.urlopen(req, timeout=300) as r, open(tmp, "wb") as f:
        shutil.copyfileobj(r, f)
    os.replace(tmp, dest)


# --------------------------------------------------------------------------- data dir

def data_dir(args) -> Path:
    d = Path(args.data or os.environ.get("INSTAGRAM_DATA_DIR") or "instagram-data")
    d.mkdir(parents=True, exist_ok=True)
    gi = d / ".gitignore"
    if not gi.exists():  # videos and account data stay out of git
        gi.write_text("*\n")
    return d


def load_media(d: Path) -> list[dict]:
    f = d / "media.json"
    if not f.exists():
        sys.exit(f"No {f}. Run `fetch` first.")
    return json.loads(f.read_text())["media"]


def select(media: list[dict], ids: list[str] | None) -> list[dict]:
    if not ids:
        return media
    want = set(ids)
    picked = [m for m in media if m["id"] in want or m.get("shortcode") in want]
    missing = want - {m["id"] for m in picked} - {m.get("shortcode") for m in picked}
    if missing:
        print(f"Not in media.json: {', '.join(sorted(missing))}", file=sys.stderr)
    return picked


# --------------------------------------------------------------------------- auth

def cmd_auth(args) -> int:
    token, env = get_token()
    if args.refresh:
        url = (f"{GRAPH}/refresh_access_token?"
               + urllib.parse.urlencode({"grant_type": "ig_refresh_token", "access_token": token}))
        r = api_get(url, token)
        new, days = r["access_token"], round(r.get("expires_in", 0) / 86400)
        if env:
            write_env_value(env, "INSTAGRAM_ACCESS_TOKEN", new)
            print(f"Token refreshed, valid ~{days} days, saved to {env}.")
        else:
            print(f"Token refreshed (valid ~{days} days), but it came from the environment, not a "
                  ".env file, so it was not saved. Put INSTAGRAM_ACCESS_TOKEN in .env and refresh again.")
        token = new
    me = api_get("me", token, {"fields": "user_id,username,account_type,media_count,followers_count"})
    if args.json:
        print(json.dumps(me, indent=2))
    else:
        print(f"@{me.get('username')}  {me.get('account_type')}  "
              f"{me.get('followers_count', '?')} followers  {me.get('media_count', '?')} posts")
    return 0


# --------------------------------------------------------------------------- fetch

def _metric_value(item: dict):
    if "total_value" in item:
        return item["total_value"].get("value")
    vals = item.get("values") or []
    return vals[-1].get("value") if vals else None


def fetch_insights(media_id: str, metrics: list[str], token: str) -> tuple[dict, list[str]]:
    def ask(ms):
        r = api_get(f"{media_id}/insights", token, {"metric": ",".join(ms)})
        return {it["name"]: _metric_value(it) for it in r.get("data", [])}
    try:
        return ask(metrics), []
    except ApiError:
        out, refused = {}, []
        for m in metrics:
            try:
                out.update(ask([m]))
            except ApiError:
                refused.append(m)
        return out, refused


def caption_features(caption: str | None) -> dict:
    c = caption or ""
    first = c.strip().splitlines()[0] if c.strip() else ""
    return {
        "caption_chars": len(c),
        "caption_words": len(re.findall(r"\w+", c)),
        "hashtags": len(re.findall(r"#\w+", c)),
        "mentions": len(re.findall(r"@\w+", c)),
        "caption_has_question": "?" in c,
        "caption_first_line": first[:150],
    }


def cmd_fetch(args) -> int:
    token, _ = get_token()
    d = data_dir(args)
    me = api_get("me", token, {"fields": "user_id,username,followers_count,media_count"})
    since = None
    if args.since:
        m = re.fullmatch(r"(\d+)d", args.since)
        since = (dt.datetime.now(dt.timezone.utc) - dt.timedelta(days=int(m.group(1)))) if m \
            else dt.datetime.fromisoformat(args.since).replace(tzinfo=dt.timezone.utc)

    videos, page = [], api_get("me/media", token, {"fields": MEDIA_FIELDS, "limit": 50})
    while page:
        stop = False
        for m in page.get("data", []):
            ts = dt.datetime.strptime(m["timestamp"], "%Y-%m-%dT%H:%M:%S%z")
            if since and ts < since:
                stop = True
                break
            if m.get("media_type") == "VIDEO":
                videos.append(m)
                if len(videos) >= args.limit:
                    stop = True
                    break
        nxt = page.get("paging", {}).get("next")
        page = api_get(nxt, token) if (nxt and not stop) else None

    refused_all: set[str] = set()
    for i, m in enumerate(videos, 1):
        print(f"[{i}/{len(videos)}] insights {m['id']}", file=sys.stderr)
        metrics = REEL_METRICS if m.get("media_product_type") == "REELS" else VIDEO_METRICS
        ins, refused = fetch_insights(m["id"], metrics, token)
        refused_all.update(refused)
        if "ig_reels_avg_watch_time" in ins and ins["ig_reels_avg_watch_time"] is not None:
            ins["avg_watch_s"] = round(ins["ig_reels_avg_watch_time"] / 1000, 2)  # API gives ms
        m["insights"] = ins
        m["likes"] = m.pop("like_count", None)
        m["comments"] = m.pop("comments_count", None)
        m["shortcode"] = (m.get("permalink") or "").rstrip("/").split("/")[-1] or None
        m.update(caption_features(m.get("caption")))

    now = dt.datetime.now(dt.timezone.utc)
    snap = {"fetched_at": now.isoformat(timespec="seconds"), "account": {
        k: me.get(k) for k in ("username", "followers_count", "media_count")}, "media": videos}
    # media_url is a signed CDN link that expires: keep it for `download`, leave it out of snapshots.
    (d / "media.json").write_text(json.dumps(snap, indent=2, ensure_ascii=False))
    snaps = d / "snapshots"
    snaps.mkdir(exist_ok=True)
    light = dict(snap, media=[{k: v for k, v in m.items() if k not in ("media_url", "thumbnail_url")}
                              for m in videos])
    (snaps / f"{now:%Y%m%dT%H%M%S}.json").write_text(json.dumps(light, indent=2, ensure_ascii=False))

    if refused_all:
        print(f"Instagram refused these metrics for some videos: {', '.join(sorted(refused_all))}",
              file=sys.stderr)
    if args.json:
        print(json.dumps(light, indent=2, ensure_ascii=False))
        return 0
    print(f"@{me.get('username')}: {len(videos)} videos -> {d / 'media.json'}\n")
    print(f"{'posted':<11} {'type':<6} {'views':>8} {'reach':>8} {'likes':>6} {'cmts':>5} "
          f"{'saves':>6} {'shares':>6} {'watch s':>7}  caption")
    for m in videos:
        ins = m["insights"]
        print(f"{m['timestamp'][:10]:<11} {(m.get('media_product_type') or '')[:6]:<6} "
              f"{_fmt(ins.get('views')):>8} {_fmt(ins.get('reach')):>8} {_fmt(m['likes']):>6} "
              f"{_fmt(m['comments']):>5} {_fmt(ins.get('saved')):>6} {_fmt(ins.get('shares')):>6} "
              f"{_fmt(ins.get('avg_watch_s')):>7}  {m['caption_first_line'][:40]}")
    return 0


def _fmt(v) -> str:
    if v is None:
        return "-"
    if isinstance(v, float):
        return f"{v:.3g}" if abs(v) < 1 else f"{v:.1f}"
    return str(v)


# --------------------------------------------------------------------------- download

def cmd_download(args) -> int:
    token, _ = get_token()
    d = data_dir(args)
    vids = d / "videos"
    vids.mkdir(exist_ok=True)
    for m in select(load_media(d), args.ids):
        dest = vids / f"{m['id']}.mp4"
        if dest.exists() and not args.force:
            print(f"have {dest.name}")
            continue
        url = m.get("media_url")
        try:
            if not url:
                raise urllib.error.URLError("no media_url")
            download_file(url, dest)
        except (OSError, http.client.HTTPException):
            # CDN links expire; ask for a fresh one.
            try:
                fresh = api_get(m["id"], token, {"fields": "media_url"}).get("media_url")
                if not fresh:
                    raise ApiError("Instagram returned no media_url (copyrighted audio can hide it)")
                download_file(fresh, dest)
            except (ApiError, OSError, http.client.HTTPException) as e:
                print(f"skip {m['id']}: {e}", file=sys.stderr)
                continue
        print(f"got  {dest.name}  {dest.stat().st_size / 1e6:.1f} MB")
    return 0


# --------------------------------------------------------------------------- analyze

def run(cmd: list[str]) -> subprocess.CompletedProcess:
    return subprocess.run(cmd, capture_output=True, text=True)


def probe(path: Path) -> dict:
    r = run(["ffprobe", "-v", "error", "-print_format", "json", "-show_format", "-show_streams", str(path)])
    info = json.loads(r.stdout or "{}")
    v = next((s for s in info.get("streams", []) if s.get("codec_type") == "video"), {})
    a = next((s for s in info.get("streams", []) if s.get("codec_type") == "audio"), None)
    num, _, den = (v.get("avg_frame_rate") or "0/1").partition("/")
    fps = float(num) / float(den or 1) if float(den or 1) else 0.0
    w, h = int(v.get("width", 0)), int(v.get("height", 0))
    rot = int((v.get("tags") or {}).get("rotate", 0) or 0)
    for sd in v.get("side_data_list") or []:
        rot = int(sd.get("rotation", rot) or rot)
    if abs(rot) in (90, 270):
        w, h = h, w
    return {"duration_s": round(float(info.get("format", {}).get("duration", 0)), 2),
            "width": w, "height": h, "fps": round(fps, 2),
            "aspect": f"{w}:{h}" if not (w and h) else _aspect(w, h), "has_audio": a is not None}


def _aspect(w: int, h: int) -> str:
    g = math.gcd(w, h)
    r = f"{w // g}:{h // g}"
    for name, val in (("9:16", 9 / 16), ("4:5", 4 / 5), ("1:1", 1.0), ("16:9", 16 / 9)):
        if abs(w / h - val) < 0.02:
            return name
    return r


def scene_cuts(path: Path, threshold: float) -> list[float]:
    r = run(["ffmpeg", "-hide_banner", "-nostats", "-i", str(path), "-an", "-vf",
             f"scale=320:-2,select='gt(scene,{threshold})',showinfo", "-f", "null", "-"])
    return [round(float(t), 2) for t in re.findall(r"pts_time:([\d.]+)", r.stderr)]


def loudness(path: Path) -> float | None:
    r = run(["ffmpeg", "-hide_banner", "-nostats", "-i", str(path), "-vn",
             "-af", "ebur128=framelog=quiet", "-f", "null", "-"])
    m = re.findall(r"I:\s+(-?[\d.]+) LUFS", r.stderr)
    return float(m[-1]) if m else None


def audio_start(path: Path) -> float:
    """Seconds of near-silence at the start (0 = sound from the first frame)."""
    r = run(["ffmpeg", "-hide_banner", "-nostats", "-i", str(path), "-vn",
             "-af", "silencedetect=noise=-35dB:d=0.25", "-f", "null", "-"])
    starts = re.findall(r"silence_start: (-?[\d.]+)", r.stderr)
    ends = re.findall(r"silence_end: ([\d.]+)", r.stderr)
    if starts and float(starts[0]) <= 0.05:
        return round(float(ends[0]), 2) if ends else -1.0  # -1: silent throughout
    return 0.0


def frames(path: Path, dur: float, out_dir: Path, vid: str) -> dict:
    out = {}
    # Hook strip: what a scroller sees in the first three seconds.
    times = [t for t in (0.0, 0.5, 1.0, 2.0, 3.0) if t < max(dur - 0.05, 0.1)]
    with tempfile.TemporaryDirectory() as tmp:
        parts = []
        for i, t in enumerate(times):
            p = Path(tmp) / f"{i}.jpg"
            run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-ss", f"{t}", "-i", str(path),
                 "-frames:v", "1", "-vf", "scale=-2:480", "-y", str(p)])
            if p.exists():
                parts.append(p)
        if parts:
            hook = out_dir / f"{vid}.hook.jpg"
            inputs = sum((["-i", str(p)] for p in parts), [])
            filt = f"hstack=inputs={len(parts)}" if len(parts) > 1 else "null"
            run(["ffmpeg", "-hide_banner", "-loglevel", "error", *inputs, "-filter_complex", filt,
                 "-frames:v", "1", "-y", str(hook)])
            if hook.exists():
                out["hook_strip"] = str(hook)
    sheet = out_dir / f"{vid}.sheet.jpg"
    rate = 12 / max(dur, 1.0)
    run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-i", str(path), "-vf",
         f"fps={rate:.5f},scale=-2:360,tile=6x2", "-frames:v", "1", "-y", str(sheet)])
    if sheet.exists():
        out["contact_sheet"] = str(sheet)
    return out


def cmd_analyze(args) -> int:
    for tool in ("ffmpeg", "ffprobe"):
        if not shutil.which(tool):
            sys.exit(f"{tool} not found on PATH; install FFmpeg first.")
    d = data_dir(args)
    out_dir = d / "analysis"
    out_dir.mkdir(exist_ok=True)
    media = select(load_media(d), args.ids)
    for m in media:
        vid = m["id"]
        src = d / "videos" / f"{vid}.mp4"
        dest = out_dir / f"{vid}.json"
        if not src.exists():
            print(f"skip {vid}: not downloaded", file=sys.stderr)
            continue
        if dest.exists() and not args.force:
            print(f"have {dest.name}")
            continue
        p = probe(src)
        dur = p["duration_s"] or 0.0
        cuts = [t for t in scene_cuts(src, args.scene_threshold) if t > 0.1]
        a = {"id": vid, **p,
             "cuts": len(cuts), "cut_times": cuts,
             "first_cut_s": cuts[0] if cuts else None,
             "cuts_per_10s": round(len(cuts) / dur * 10, 2) if dur else None,
             "avg_shot_s": round(dur / (len(cuts) + 1), 2) if dur else None,
             "loudness_lufs": loudness(src) if p["has_audio"] else None,
             "audio_starts_s": audio_start(src) if p["has_audio"] else None,
             **frames(src, dur, out_dir, vid)}
        dest.write_text(json.dumps(a, indent=2))
        print(f"done {vid}: {dur:.1f}s {a['aspect']}, {a['cuts']} cuts, "
              f"first at {_fmt(a['first_cut_s'])}s, {_fmt(a['loudness_lufs'])} LUFS")
    return 0


# --------------------------------------------------------------------------- report

def spearman(xs: list[float], ys: list[float]) -> float | None:
    if len(xs) < 5:
        return None

    def ranks(v):
        order = sorted(range(len(v)), key=lambda i: v[i])
        r = [0.0] * len(v)
        i = 0
        while i < len(order):
            j = i
            while j + 1 < len(order) and v[order[j + 1]] == v[order[i]]:
                j += 1
            for k in range(i, j + 1):
                r[order[k]] = (i + j) / 2
            i = j + 1
        return r
    rx, ry = ranks(xs), ranks(ys)
    mx, my = statistics.fmean(rx), statistics.fmean(ry)
    num = sum((a - mx) * (b - my) for a, b in zip(rx, ry))
    den = math.sqrt(sum((a - mx) ** 2 for a in rx) * sum((b - my) ** 2 for b in ry))
    return round(num / den, 2) if den else None


FEATURES = [
    ("duration_s", "length (s)"), ("cuts_per_10s", "cuts per 10 s"), ("first_cut_s", "first cut at (s)"),
    ("avg_shot_s", "average shot (s)"), ("audio_starts_s", "sound starts at (s)"),
    ("loudness_lufs", "loudness (LUFS)"), ("caption_words", "caption words"), ("hashtags", "hashtags"),
    ("hour_local", "posted hour"), ("watch_ratio", "watched share of length"),
    ("engagement_rate", "interactions / reach"), ("save_rate", "saves / reach"), ("share_rate", "shares / reach"),
]


def build_rows(d: Path, tz_offset: float) -> list[dict]:
    rows = []
    for m in load_media(d):
        ins = m.get("insights", {})
        r = {"id": m["id"], "permalink": m.get("permalink"), "posted": m["timestamp"][:10],
             "type": m.get("media_product_type"), "caption": m.get("caption_first_line", ""),
             "likes": m.get("likes"), "comments": m.get("comments"),
             "caption_words": m.get("caption_words"), "hashtags": m.get("hashtags"), **ins}
        ts = dt.datetime.strptime(m["timestamp"], "%Y-%m-%dT%H:%M:%S%z") + dt.timedelta(hours=tz_offset)
        r["hour_local"], r["weekday"] = ts.hour, ts.strftime("%a")
        af = d / "analysis" / f"{m['id']}.json"
        if af.exists():
            r.update({k: v for k, v in json.loads(af.read_text()).items() if k not in ("id", "cut_times")})
        reach = ins.get("reach") or 0
        if reach:
            inter = ins.get("total_interactions")
            if inter is None:
                inter = sum(x or 0 for x in (r["likes"], r["comments"], ins.get("saved"), ins.get("shares")))
            r["engagement_rate"] = round(inter / reach, 4)
            if ins.get("saved") is not None:
                r["save_rate"] = round(ins["saved"] / reach, 4)
            if ins.get("shares") is not None:
                r["share_rate"] = round(ins["shares"] / reach, 4)
        if r.get("avg_watch_s") and r.get("duration_s"):
            r["watch_ratio"] = round(r["avg_watch_s"] / r["duration_s"], 3)
        rows.append(r)
    return rows


def cmd_report(args) -> int:
    d = data_dir(args)
    rows = build_rows(d, args.tz_offset)
    by = args.by
    scored = [r for r in rows if isinstance(r.get(by), (int, float))]
    if not scored:
        sys.exit(f"No video has a value for '{by}'. Try --by views, reach, likes or engagement_rate.")
    scored.sort(key=lambda r: r[by], reverse=True)
    n = len(scored)
    third = max(1, n // 3)
    top, bottom = scored[:third], scored[-third:]

    def med(group, key):
        vals = [r[key] for r in group if isinstance(r.get(key), (int, float))]
        return round(statistics.median(vals), 2) if vals else None

    comparison = []
    for key, label in FEATURES:
        if key == by:
            continue
        xs = [(r[key], r[by]) for r in scored if isinstance(r.get(key), (int, float))]
        comparison.append({"feature": key, "label": label, "top": med(top, key), "bottom": med(bottom, key),
                           "spearman": spearman([x for x, _ in xs], [y for _, y in xs]), "n": len(xs)})
    days: dict[str, list] = {}
    for r in scored:
        days.setdefault(r["weekday"], []).append(r[by])

    result = {"by": by, "videos": n, "analyzed": sum(1 for r in scored if "duration_s" in r),
              "median": med(scored, by), "ranking": scored, "comparison": comparison,
              "weekday_median": {k: round(statistics.median(v), 1) for k, v in days.items()}}
    (d / "report.json").write_text(json.dumps(result, indent=2, ensure_ascii=False))

    L = [f"# Instagram video report, ranked by {by}", "",
         f"{n} videos, {result['analyzed']} analyzed. Median {by}: {_fmt(result['median'])}. "
         f"Top and bottom groups are the best and worst {third}.", "",
         "## Ranking", "",
         ]
    cols = [by] + [c for c in ("views", "reach", "avg_watch_s", "duration_s", "cuts_per_10s", "first_cut_s")
                   if c != by]
    L += ["| # | posted | " + " | ".join(cols) + " | caption |", "|---" * (len(cols) + 3) + "|"]
    for i, r in enumerate(scored, 1):
        cap = (r.get("caption") or "").replace("|", "/")[:50]
        L.append(f"| {i} | [{r['posted']}]({r.get('permalink')}) | "
                 + " | ".join(_fmt(r.get(c)) for c in cols) + f" | {cap} |")
    L += ["", "## What the top third does differently", "",
          "Medians. Rank correlation needs 5+ videos; |r| under 0.3 is noise at this sample size.", "",
          "| feature | top | bottom | rank corr. with " + by + " | n |", "|---|---|---|---|---|"]
    for c in comparison:
        if c["n"]:
            L.append(f"| {c['label']} | {_fmt(c['top'])} | {_fmt(c['bottom'])} | {_fmt(c['spearman'])} | {c['n']} |")
    L += ["", "## By weekday (median " + by + ")", "",
          " · ".join(f"{k} {v}" for k, v in sorted(result["weekday_median"].items(), key=lambda kv: -kv[1])), "",
          "## Frames to look at", ""]
    for r in top + [x for x in bottom if x not in top]:
        if r.get("hook_strip"):
            L.append(f"- {r['posted']} ({by} {_fmt(r.get(by))}): hook `{r['hook_strip']}`, "
                     f"sheet `{r.get('contact_sheet')}`")
    md = "\n".join(L) + "\n"
    (d / "report.md").write_text(md)
    print(json.dumps(result, indent=2, ensure_ascii=False) if args.json else md)
    return 0


# --------------------------------------------------------------------------- main

def main() -> int:
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("--data", help="data folder (default ./instagram-data or $INSTAGRAM_DATA_DIR)")
    sub = p.add_subparsers(dest="cmd", required=True)

    a = sub.add_parser("auth", help="check the token and show the account")
    a.add_argument("--refresh", action="store_true", help="extend a long-lived token by 60 days")
    a.add_argument("--json", action="store_true")
    a.set_defaults(fn=cmd_auth)

    f = sub.add_parser("fetch", help="list videos with insights into media.json")
    f.add_argument("--limit", type=int, default=30, help="most recent N videos (default 30)")
    f.add_argument("--since", help="only posts after this: 30d or 2026-09-01")
    f.add_argument("--json", action="store_true")
    f.set_defaults(fn=cmd_fetch)

    g = sub.add_parser("download", help="download video files")
    g.add_argument("ids", nargs="*", help="media ids or shortcodes (default: all fetched)")
    g.add_argument("--force", action="store_true")
    g.set_defaults(fn=cmd_download)

    z = sub.add_parser("analyze", help="measure downloaded videos with ffmpeg")
    z.add_argument("ids", nargs="*")
    z.add_argument("--scene-threshold", type=float, default=0.3, help="cut sensitivity, lower finds more")
    z.add_argument("--force", action="store_true")
    z.set_defaults(fn=cmd_analyze)

    r = sub.add_parser("report", help="rank videos and compare the top and bottom thirds")
    r.add_argument("--by", default="views",
                   help="views, reach, likes, saved, shares, avg_watch_s, watch_ratio, engagement_rate ...")
    r.add_argument("--tz-offset", type=float, default=0.0, help="hours from UTC for posting times")
    r.add_argument("--json", action="store_true")
    r.set_defaults(fn=cmd_report)

    args = p.parse_args()
    try:
        return args.fn(args)
    except ApiError as e:
        print(f"Instagram API: {e}", file=sys.stderr)
        if "190" in str(e) or "OAuth" in str(e):
            print("The token is invalid or expired. Generate a new one (README: Setup).", file=sys.stderr)
        return 1


if __name__ == "__main__":
    sys.exit(main())
