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

Manual mode, no token (your own reel files plus numbers from Insights screenshots or a CSV):

    ig.py manual init --videos ~/Reels            # metrics.csv to fill in, one row per video
    ig.py manual import --videos ~/Reels --metrics instagram-data/metrics.csv
    ig.py analyze && ig.py report --by views

API mode needs an Instagram Business or Creator account and a token from "API setup with Instagram
login" (scopes instagram_business_basic + instagram_business_manage_insights). Facebook-issued tokens
(they start with EAA) are not supported, and Unified login is untested.
Token: INSTAGRAM_ACCESS_TOKEN in the environment or in a .env file in this directory or a parent.
Data: ./instagram-data unless INSTAGRAM_DATA_DIR or --data says otherwise.
"""

from __future__ import annotations

import argparse
import csv
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
    tok, env = os.environ.get("INSTAGRAM_ACCESS_TOKEN"), None
    if not tok:
        env = find_env_file()
        tok = read_env_value(env, "INSTAGRAM_ACCESS_TOKEN") if env else None
    if not tok:
        sys.exit("No INSTAGRAM_ACCESS_TOKEN. Set it in the environment or in .env (README: API mode), "
                 "or use manual mode, which needs no token (README: Manual mode).")
    if tok.startswith("EAA"):
        sys.exit("This token starts with EAA, so it was issued by Facebook (Facebook Login, or Unified login "
                 "signed in through Facebook). "
                 "API mode only supports tokens from 'API setup with Instagram login' (they start with IG). "
                 "Use manual mode instead (README: Manual mode).")
    return tok, env


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


def load_doc(d: Path) -> dict:
    f = d / "media.json"
    if not f.exists():
        sys.exit(f"No {f}. Run `fetch` (API mode) or `manual import` (manual mode) first.")
    return json.loads(f.read_text())


def load_media(d: Path) -> list[dict]:
    return load_doc(d)["media"]


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
    d = data_dir(args)
    if load_doc(d).get("mode") == "manual":
        sys.exit("Manual mode uses your own video files; there is nothing to download. Run `analyze`.")
    token, _ = get_token()
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
        manual = "file" in m
        src = Path(m["file"]) if m.get("file") else d / "videos" / f"{vid}.mp4"
        dest = out_dir / f"{vid}.json"
        if not src.exists():
            why = "no video file linked to this row" if manual else "not downloaded"
            print(f"skip {vid}: {why}", file=sys.stderr)
            continue
        stamp = {"source_file": str(src.resolve()), "source_size": src.stat().st_size}
        if dest.exists() and not args.force:
            old = json.loads(dest.read_text())
            if all(old.get(k) == v for k, v in stamp.items()) or not manual:
                print(f"have {dest.name}")
                continue
        p = probe(src)
        dur = p["duration_s"] or 0.0
        cuts = [t for t in scene_cuts(src, args.scene_threshold) if t > 0.1]
        a = {"id": vid, **stamp, **p,
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


CORE_METRICS = ["views", "reach", "likes", "comments", "saved", "shares", "avg_watch_s"]
ANALYSIS_KEYS = {"duration_s", "cuts_per_10s", "first_cut_s", "avg_shot_s", "audio_starts_s", "loudness_lufs"}


def _num(v) -> bool:
    return isinstance(v, (int, float)) and not isinstance(v, bool)


def build_rows(d: Path, tz_offset: float) -> list[dict]:
    """One row per video. A value is only ever present if Instagram or the user supplied it, or it was
    measured from the file or computed from supplied values; nothing is filled in."""
    rows = []
    for m in load_media(d):
        ins = m.get("insights", {})
        manual = "file" in m
        r = {"id": m["id"], "permalink": m.get("permalink"), "type": m.get("media_product_type"),
             "file_name": m.get("file_name"), "has_video": bool(m.get("file")) if manual else None,
             "caption": m.get("caption_first_line", ""), "likes": m.get("likes"), "comments": m.get("comments"),
             "caption_words": m.get("caption_words"), "hashtags": m.get("hashtags"),
             "approx": m.get("approx", []), "metric_source": m.get("metric_source"), **ins}
        r["posted"], r["weekday"], r["hour_local"] = None, None, None
        if m.get("timestamp"):
            if m.get("time_is_local"):
                ts = dt.datetime.fromisoformat(m["timestamp"])
            else:
                ts = dt.datetime.strptime(m["timestamp"], "%Y-%m-%dT%H:%M:%S%z") + dt.timedelta(hours=tz_offset)
            r["posted"], r["weekday"] = ts.date().isoformat(), ts.strftime("%a")
            if m.get("has_time", True):
                r["hour_local"] = ts.hour
        af = d / "analysis" / f"{m['id']}.json"
        if af.exists() and (not manual or m.get("file")):
            r.update({k: v for k, v in json.loads(af.read_text()).items() if k not in ("id", "cut_times")})
        reach = ins.get("reach")
        if _num(reach) and reach > 0:
            inter = ins.get("total_interactions")
            parts = (r["likes"], r["comments"], ins.get("saved"), ins.get("shares"))
            if not _num(inter) and all(_num(x) for x in parts):
                inter = sum(parts)  # only when every part was supplied
            if _num(inter):
                r["engagement_rate"] = round(inter / reach, 4)
            if _num(ins.get("saved")):
                r["save_rate"] = round(ins["saved"] / reach, 4)
            if _num(ins.get("shares")):
                r["share_rate"] = round(ins["shares"] / reach, 4)
        if _num(r.get("avg_watch_s")) and _num(r.get("duration_s")) and r["duration_s"] > 0:
            r["watch_ratio"] = round(r["avg_watch_s"] / r["duration_s"], 3)
        rows.append(r)
    return rows


DERIVED = {"engagement_rate": ("reach", "likes, comments, saves and shares, or interactions"),
           "save_rate": ("reach", "saves"), "share_rate": ("reach", "shares"),
           "watch_ratio": ("avg_watch_s", "a video file")}


def _cell(r: dict, key: str, manual: bool) -> str:
    v = r.get(key)
    if v is not None:
        s = _fmt(v)
        return f"≈{s}" if key in r.get("approx", []) else s
    if key in ANALYSIS_KEYS:
        if manual and not r.get("has_video"):
            return "no video"
        if "duration_s" not in r:
            return "not analyzed"
        return "none" if key == "first_cut_s" else "n/a"
    if key in DERIVED:
        return "can't compute"
    return "missing" if manual else "-"


def cmd_report(args) -> int:
    d = data_dir(args)
    doc = load_doc(d)
    manual = doc.get("mode") == "manual"
    rows = build_rows(d, args.tz_offset)
    by = args.by
    scored = [r for r in rows if _num(r.get(by))]
    unranked = [r for r in rows if not _num(r.get(by))]
    if not scored:
        have = sorted({k for r in rows for k, v in r.items() if _num(v)} - ANALYSIS_KEYS
                      - {"hour_local", "caption_words", "hashtags", "width", "height", "fps", "cuts", "source_size"})
        sys.exit(f"No video has a value for '{by}', so nothing can be ranked by it. "
                 f"Metrics with data: {', '.join(have) or 'none'}.")
    scored.sort(key=lambda r: r[by], reverse=True)
    n = len(scored)
    third = max(1, n // 3)
    top, bottom = scored[:third], scored[-third:]

    def med(group, key):
        vals = [r[key] for r in group if _num(r.get(key))]
        return round(statistics.median(vals), 4) if vals else None

    comparison = []
    for key, label in FEATURES:
        if key == by:
            continue
        xs = [(r[key], r[by]) for r in scored if _num(r.get(key))]
        comparison.append({"feature": key, "label": label, "top": med(top, key), "bottom": med(bottom, key),
                           "spearman": spearman([x for x, _ in xs], [y for _, y in xs]), "n": len(xs)})
    days: dict[str, list] = {}
    for r in scored:
        if r["weekday"]:
            days.setdefault(r["weekday"], []).append(r[by])
    coverage = {k: [r["id"] for r in rows if _num(r.get(k))] for k in CORE_METRICS}

    result = {"mode": doc.get("mode", "api"), "by": by, "videos": len(rows), "ranked": n,
              "analyzed": sum(1 for r in rows if "duration_s" in r), "median": med(scored, by),
              "ranking": scored, "not_ranked": [r["id"] for r in unranked],
              "coverage": {k: len(v) for k, v in coverage.items()},
              "comparison": comparison, "weekday_median": {k: round(statistics.median(v), 1) for k, v in days.items()}}
    (d / "report.json").write_text(json.dumps(result, indent=2, ensure_ascii=False))

    L = [f"# Instagram video report, ranked by {by}", ""]
    if manual:
        L += ["Manual mode: every number below was supplied by you (screenshots or a CSV) or measured from "
              "your video files. Nothing was fetched from Instagram, and blank values are shown as "
              "**missing**, never estimated. Values marked ≈ were given rounded (for example 1.2K).", ""]
    L += [f"{len(rows)} videos, {n} ranked by {by}, {result['analyzed']} analyzed from video files. "
          f"Median {by}: {_fmt(result['median'])}. Top and bottom groups are the best and worst {third}.", ""]
    if n < 6:
        L += [f"Only {n} videos have {by}: treat any pattern below as a hint, not a finding.", ""]
    L += ["## Data supplied", "", "| metric | videos with a value | missing for |", "|---|---|---|"]
    for k in CORE_METRICS:
        miss = [r for r in rows if not _num(r.get(k))]
        names = ", ".join((r.get("file_name") or r["id"]) for r in miss[:8]) + (" ..." if len(miss) > 8 else "")
        L.append(f"| {k} | {len(coverage[k])} of {len(rows)} | {names or 'none'} |")
    L += ["", "## Ranking", ""]
    cols = [by] + [c for c in ("views", "reach", "likes", "saved", "shares", "avg_watch_s", "duration_s",
                               "cuts_per_10s", "first_cut_s") if c != by]
    label = "video" if manual else "post"
    L += [f"| # | {label} | posted | " + " | ".join(cols) + " | caption |", "|---" * (len(cols) + 4) + "|"]

    def name(r):
        base = r.get("file_name") or r["id"]
        return f"[{base}]({r['permalink']})" if r.get("permalink") else base

    for i, r in enumerate(scored, 1):
        cap = (r.get("caption") or "").replace("|", "/")[:50] or ("missing" if manual else "")
        L.append(f"| {i} | {name(r)} | {r['posted'] or 'missing'} | "
                 + " | ".join(_cell(r, c, manual) for c in cols) + f" | {cap} |")
    if unranked:
        why = (f"{by} can't be computed: it needs {DERIVED[by][0]} and {DERIVED[by][1]}" if by in DERIVED
               else f"no {by} supplied")
        L += ["", f"**Not ranked** ({why}): " + ", ".join(name(r) for r in unranked)]
    L += ["", "## What the top third does differently", "",
          "Medians. Rank correlation needs 5+ videos with both values; |r| under 0.3 is noise at this "
          "sample size. n is how many ranked videos have the feature.", "",
          "| feature | top | bottom | rank corr. with " + by + " | n |", "|---|---|---|---|---|"]
    for c in comparison:
        if c["n"]:
            gap = "missing" if manual else "-"
            L.append(f"| {c['label']} | {_fmt(c['top']) if c['top'] is not None else gap} | "
                     f"{_fmt(c['bottom']) if c['bottom'] is not None else gap} | "
                     f"{_fmt(c['spearman']) if c['spearman'] is not None else 'too few'} | {c['n']} |")
    skipped = [c["label"] for c in comparison if not c["n"]]
    if skipped:
        L += ["", "No data for: " + ", ".join(skipped) + "."]
    if result["weekday_median"]:
        L += ["", "## By weekday (median " + by + ")", "",
              " · ".join(f"{k} {v}" for k, v in sorted(result["weekday_median"].items(), key=lambda kv: -kv[1]))]
    if manual:
        L += ["", "## Where each video's numbers came from", ""]
        for r in rows:
            L.append(f"- {r.get('file_name') or r['id']}: {r.get('metric_source') or 'no metrics supplied'}")
    L += ["", "## Frames to look at", ""]
    for r in top + [x for x in bottom if x not in top]:
        if r.get("hook_strip"):
            L.append(f"- {r.get('file_name') or r['posted']} ({by} {_cell(r, by, manual)}): "
                     f"hook `{r['hook_strip']}`, sheet `{r.get('contact_sheet')}`")
    md = "\n".join(L) + "\n"
    (d / "report.md").write_text(md)
    print(json.dumps(result, indent=2, ensure_ascii=False) if args.json else md)
    return 0


# --------------------------------------------------------------------------- manual mode

VIDEO_EXTS = {".mp4", ".mov", ".m4v", ".webm", ".mkv", ".avi"}
TEMPLATE_COLS = ["file", "posted", "views", "reach", "likes", "comments", "saves", "shares",
                 "avg_watch_s", "caption", "permalink", "source", "notes"]
MISSING_TOKENS = {"", "-", "--", "—", "–", "n/a", "na", "none", "null", "missing", "?"}


def _norm(h: str) -> str:
    return re.sub(r"[^a-z0-9]+", " ", h.lower()).strip()


# Column header (normalized) -> field. Anything else numeric is kept under its own name.
COLUMN_MAP = {_norm(h): k for k, hs in {
    "file": ["file", "filename", "file name", "video", "video file"],
    "posted": ["posted", "publish time", "published", "publish date", "date posted", "post date", "posted at"],
    "caption": ["caption", "description", "title"],
    "permalink": ["permalink", "link", "url", "post link", "reel link"],
    "source": ["source", "metrics source"],
    "notes": ["notes", "note"],
    "post_type": ["post type", "type"],
    "reported_duration_s": ["duration sec", "duration (sec)", "duration s"],
    "views": ["views", "video views", "reel views"],
    "plays": ["plays", "initial plays"],
    "reach": ["reach", "accounts reached"],
    "likes": ["likes"],
    "comments": ["comments"],
    "saved": ["saves", "saved"],
    "shares": ["shares"],
    "total_interactions": ["interactions", "total interactions", "content interactions"],
    "follows": ["follows"],
    "avg_watch_s": ["avg_watch_s", "average watch time", "avg watch time", "average watch time sec",
                    "average watch time s", "avg watch time sec"],
}.items() for h in hs}
IGNORED_COLUMNS = {_norm(h) for h in ["post id", "account id", "account username", "account name",
                                      "data comment", "date"]}
TEXT_FIELDS = {"file", "posted", "caption", "permalink", "source", "notes", "post_type"}


def parse_count(raw: str) -> tuple[float | int | None, bool]:
    """'1,234' -> 1234; '1.2K' -> 1200 (approximate); '' -> None. Raises ValueError otherwise."""
    s = raw.strip()
    if s.lower() in MISSING_TOKENS:
        return None, False
    s = s.lstrip("≈~").replace(" ", "").replace(" ", "").replace(" ", "")
    if re.fullmatch(r"\d+,\d{1,2}[kKmM]", s):  # 1,2K written with a decimal comma
        s = s.replace(",", ".")
    s = s.replace(",", "")
    m = re.fullmatch(r"(\d+(?:\.\d+)?)([kKmM]?)", s)
    if not m:
        raise ValueError("not a number")
    val = float(m.group(1)) * {"": 1, "k": 1e3, "m": 1e6}[m.group(2).lower()]
    approx = bool(m.group(2))
    return (int(round(val)) if (approx or val.is_integer()) else val), approx


def parse_seconds(raw: str, plain_is_seconds: bool) -> float | None:
    """'7 sec', '7.4s', '1m 5s', '1:05' -> seconds. A bare number only when the column says seconds."""
    s = raw.strip().lower()
    if s in MISSING_TOKENS:
        return None
    if re.fullmatch(r"\d+:\d{2}(:\d{2})?", s):
        parts = [int(p) for p in s.split(":")]
        return float(sum(p * 60 ** i for i, p in enumerate(reversed(parts))))
    m = re.fullmatch(r"(?:(\d+(?:\.\d+)?)\s*(?:m|min|mins|minutes?))?\s*"
                     r"(?:(\d+(?:\.\d+)?)\s*(?:s|sec|secs|seconds?))?", s)
    if m and (m.group(1) or m.group(2)):
        return round(float(m.group(1) or 0) * 60 + float(m.group(2) or 0), 2)
    if re.fullmatch(r"\d+(?:\.\d+)?", s):
        if plain_is_seconds:
            return float(s)
        raise ValueError("a bare number with no unit; write it as '7 sec' or '0:07'")
    raise ValueError("not a duration")


def parse_posted(raw: str, order: str) -> tuple[str | None, bool]:
    """Returns (ISO local datetime, has_time). Slash dates follow --date-order (mdy or dmy)."""
    s = raw.strip()
    if s.lower() in MISSING_TOKENS:
        return None, False
    slash = "%m/%d/%Y" if order == "mdy" else "%d/%m/%Y"
    for fmt, has_time in (("%Y-%m-%d %H:%M:%S", True), ("%Y-%m-%dT%H:%M:%S", True), ("%Y-%m-%d %H:%M", True),
                          ("%Y-%m-%dT%H:%M", True), ("%Y-%m-%d", False), (slash + " %H:%M", True),
                          (slash + " %H:%M:%S", True), (slash, False), ("%b %d, %Y", False),
                          ("%B %d, %Y", False), ("%d %b %Y", False), ("%d %B %Y", False)):
        try:
            return dt.datetime.strptime(s, fmt).isoformat(), has_time
        except ValueError:
            pass
    raise ValueError("unrecognized date; use 2026-10-03 or 2026-10-03 18:30")


def _slug(stem: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", stem.lower()).strip("-") or "video"


def scan_videos(folder: Path) -> list[Path]:
    if not folder.is_dir():
        sys.exit(f"Video folder not found: {folder}")
    return sorted(p for p in folder.rglob("*") if p.is_file() and p.suffix.lower() in VIDEO_EXTS
                  and not any(part.startswith(".") for part in p.relative_to(folder).parts)
                  and "instagram-data" not in p.relative_to(folder).parts)


def cmd_manual_init(args) -> int:
    d = data_dir(args)
    out = Path(args.out) if args.out else d / "metrics.csv"
    vids = scan_videos(Path(args.videos))
    existing, header = [], TEMPLATE_COLS
    if out.exists():
        with open(out, newline="", encoding="utf-8-sig") as f:
            rd = csv.DictReader(f)
            header = rd.fieldnames or TEMPLATE_COLS
            existing = list(rd)
    have = {(row.get("file") or "").strip().lower() for row in existing}
    added = [{"file": v.name} for v in vids if v.name.lower() not in have]
    with open(out, "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=header, extrasaction="ignore")
        w.writeheader()
        w.writerows(existing + added)
    print(f"{out}: {len(existing) + len(added)} rows ({len(added)} new) for {len(vids)} videos in {args.videos}.")
    print("Fill in only numbers you can see in Instagram Insights; leave the rest blank. Then run "
          f"`manual import --videos {args.videos} --metrics {out}`.")
    return 0


def cmd_manual_import(args) -> int:
    d = data_dir(args)
    if (d / "media.json").exists() and load_doc(d).get("mode") != "manual" and not args.force:
        sys.exit(f"{d / 'media.json'} holds API data. Use another folder (--data instagram-manual) or --force.")
    folder = Path(args.videos) if args.videos else None
    vids = scan_videos(folder) if folder else []
    by_name = {v.name.lower(): v for v in vids}
    by_stem: dict[str, list[Path]] = {}
    for v in vids:
        by_stem.setdefault(v.stem.lower(), []).append(v)

    rows: list[tuple[int, dict]] = []
    if args.metrics:
        with open(args.metrics, newline="", encoding="utf-8-sig") as f:
            rd = csv.reader(f)
            try:
                head = next(rd)
            except StopIteration:
                sys.exit(f"{args.metrics} is empty.")
            body = list(rd)
        fields, extra_cols, ignored = [], [], []
        # a bare number is seconds only if the header says so ("avg_watch_s", "... (sec)")
        secs_ok = {}
        for h in head:
            key = COLUMN_MAP.get(_norm(h))
            if key in ("avg_watch_s", "reported_duration_s"):
                secs_ok[key] = bool(re.search(r"\b(s|sec|secs|seconds)\b", _norm(h).replace("_", " ")))
            if key is None and _norm(h) and _norm(h) not in IGNORED_COLUMNS:
                key = "x_" + _norm(h).replace(" ", "_")
                extra_cols.append(h)
            elif key is None:
                ignored.append(h)
            fields.append(key)
        dup = {k for k in fields if k and fields.count(k) > 1}
        if dup:
            sys.exit(f"Two columns map to the same field: {', '.join(sorted(dup))}. Rename or remove one.")
        for i, cells in enumerate(body, start=2):
            if not any(c.strip() for c in cells):
                continue
            rows.append((i, {k: (cells[j] if j < len(cells) else "") for j, k in enumerate(fields) if k}))
        if extra_cols:
            print(f"Kept as extra metrics under their own names, in the units written in the file: "
                  f"{', '.join(extra_cols)}", file=sys.stderr)

    errors, warnings, media, used = [], [], [], {}
    ids: set[str] = set()

    def new_id(base: str) -> str:
        i, cand = 1, base
        while cand in ids:
            i += 1
            cand = f"{base}-{i}"
        ids.add(cand)
        return cand

    for line, row in rows:
        rec: dict = {"insights": {}, "approx": [], "row": line, "time_is_local": True}
        where = f"row {line}"
        # link to a video file: by the file column, else by a shortcode from the link; never by row order
        video, fname = None, (row.get("file") or "").strip()
        if fname:
            video = by_name.get(Path(fname).name.lower())
            if video is None:
                cands = by_stem.get(Path(fname).stem.lower(), [])
                video = cands[0] if len(cands) == 1 else None
                if len(cands) > 1:
                    errors.append(f"{where}: '{fname}' matches several files: {', '.join(c.name for c in cands)}")
            if video is None and folder:
                warnings.append(f"{where}: file '{fname}' not found in {folder}; metrics kept, no video analysis")
        elif row.get("permalink"):
            code = row["permalink"].rstrip("/").split("/")[-1].split("?")[0]
            hits = [v for v in vids if code and code in v.stem]
            if len(hits) == 1:
                video = hits[0]
            else:
                warnings.append(f"{where}: no 'file' value and {'several' if hits else 'no'} video names contain "
                                f"'{code}'; metrics kept, not linked to a video")
        else:
            warnings.append(f"{where}: no 'file' or link column value; metrics kept, not linked to a video")
        if video is not None:
            if video in used:
                errors.append(f"{where}: {video.name} is already used by row {used[video]}")
            used[video] = line
        rec["file"] = str(video.resolve()) if video else None
        rec["file_name"] = video.name if video else (fname or None)
        rec["id"] = new_id(_slug(video.stem if video else (Path(fname).stem if fname else f"row{line}")))

        for key, raw in row.items():
            if key in TEXT_FIELDS:
                continue
            raw = raw or ""
            try:
                if key in ("avg_watch_s", "reported_duration_s"):
                    val, approx = parse_seconds(raw, secs_ok.get(key, False)), False
                else:
                    val, approx = parse_count(raw)
            except ValueError as e:
                errors.append(f"{where}, {key}: '{raw}' is {e}")
                continue
            if val is None:
                continue
            if key in ("likes", "comments"):
                rec[key] = val
            elif key == "reported_duration_s":
                rec[key] = val
            else:
                rec["insights"][key] = val
            if approx:
                rec["approx"].append(key)
        try:
            rec["timestamp"], rec["has_time"] = parse_posted(row.get("posted") or "", args.date_order)
        except ValueError as e:
            errors.append(f"{where}, posted: '{row.get('posted')}' is an {e}")
            rec["timestamp"], rec["has_time"] = None, False
        if row.get("permalink"):
            rec["permalink"] = row["permalink"].strip()
            rec["shortcode"] = rec["permalink"].rstrip("/").split("/")[-1]
        if row.get("post_type"):
            rec["media_product_type"] = row["post_type"].strip().upper()
        if (row.get("caption") or "").strip():
            rec["caption"] = row["caption"]
            rec.update(caption_features(row["caption"]))
        if row.get("notes"):
            rec["notes"] = row["notes"].strip()
        has_numbers = bool(rec["insights"]) or "likes" in rec or "comments" in rec
        src = (row.get("source") or "").strip() or args.source
        if has_numbers and not src:
            warnings.append(f"{where}: numbers but no 'source' (which screenshot or export they came from)")
        rec["metric_source"] = (src or "not recorded") if has_numbers else None
        if "likes" not in rec:
            rec["likes"] = None
        if "comments" not in rec:
            rec["comments"] = None
        rec["missing"] = [k for k in CORE_METRICS
                          if k not in rec["insights"] and not (k in ("likes", "comments") and rec[k] is not None)]
        media.append(rec)

    for v in vids:
        if v not in used:
            media.append({"id": new_id(_slug(v.stem)), "file": str(v.resolve()), "file_name": v.name,
                          "insights": {}, "likes": None, "comments": None, "approx": [], "timestamp": None,
                          "time_is_local": True, "metric_source": None, "missing": list(CORE_METRICS)})
            warnings.append(f"{v.name}: no metrics row; it will be measured but not ranked")

    for w in warnings:
        print(f"note: {w}", file=sys.stderr)
    if errors:
        print("\nNothing was imported. Fix these values (the import never guesses):", file=sys.stderr)
        for e in errors:
            print(f"  {e}", file=sys.stderr)
        return 1
    if not media:
        sys.exit("No videos and no metric rows found.")

    now = dt.datetime.now(dt.timezone.utc)
    doc = {"mode": "manual", "imported_at": now.isoformat(timespec="seconds"),
           "metrics_file": str(Path(args.metrics).resolve()) if args.metrics else None,
           "videos_folder": str(folder.resolve()) if folder else None, "media": media}
    (d / "media.json").write_text(json.dumps(doc, indent=2, ensure_ascii=False))
    snaps = d / "snapshots"
    snaps.mkdir(exist_ok=True)
    (snaps / f"{now:%Y%m%dT%H%M%S}-manual.json").write_text(json.dumps(doc, indent=2, ensure_ascii=False))

    linked = sum(1 for m in media if m.get("file"))
    print(f"Imported {len(media)} videos ({linked} with a video file, "
          f"{sum(1 for m in media if m['metric_source'])} with metrics) -> {d / 'media.json'}\n")
    print(f"{'video':<28} " + " ".join(f"{k:>11}" for k in CORE_METRICS) + "  source")
    for m in media:
        vals = []
        for k in CORE_METRICS:
            v = m.get(k) if k in ("likes", "comments") else m["insights"].get(k)
            vals.append("missing" if v is None else ("≈" if k in m["approx"] else "") + _fmt(v))
        print(f"{(m.get('file_name') or m['id'])[:28]:<28} " + " ".join(f"{v:>11}" for v in vals)
              + f"  {m['metric_source'] or '-'}")
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

    mp = sub.add_parser("manual", help="no token: your own video files plus metrics you supply")
    msub = mp.add_subparsers(dest="manual_cmd", required=True)
    mi = msub.add_parser("init", help="write a metrics.csv to fill in, one row per video file")
    mi.add_argument("--videos", required=True, help="folder with your original reel files")
    mi.add_argument("--out", help="where to write it (default <data>/metrics.csv); existing rows are kept")
    mi.set_defaults(fn=cmd_manual_init)
    mm = msub.add_parser("import", help="link supplied metrics to video files -> media.json")
    mm.add_argument("--videos", help="folder with your original reel files")
    mm.add_argument("--metrics", help="CSV of metrics: the filled-in template or an Insights export")
    mm.add_argument("--source", help="where the numbers came from, for rows with no 'source' value")
    mm.add_argument("--date-order", choices=["mdy", "dmy"], default="mdy",
                    help="how to read slash dates like 03/10/2026 (default mdy, as in Meta's exports)")
    mm.add_argument("--force", action="store_true", help="replace API data in this data folder")
    mm.set_defaults(fn=cmd_manual_import)

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
