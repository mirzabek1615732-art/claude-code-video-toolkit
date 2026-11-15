#!/usr/bin/env python3
"""Episode narration pipeline (VoiceLab clips -> mixed-ready narration + word timing).

usage: python3 scripts/episode_voice.py ep03

Reads  src/episodes/<ep>/script.json
       public/<ep>/vo_raw/<line>.wav      (VoiceLab downloads, cached; never re-generated here)
Writes public/<ep>/vo/<line>.wav          (48 kHz mono, trimmed, normalised to -17 LUFS, peak <= -2 dBFS)
       src/episodes/<ep>/timing.json      (clip durations + per-word timings for subtitles)

Lines whose raw clip is missing become explicit placeholders: estimated length,
"placeholder": true, no audio. Drop the WAV into vo_raw/ and re-run to replace them.
Word timings come from the torchaudio MMS forced aligner (multilingual, CPU).
"""
from __future__ import annotations

import json
import subprocess
import sys
import wave
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parent.parent
SR = 48000
TARGET_LUFS = -17.0
SEC_PER_CHAR = 0.06  # measured on Javohir clips; used only for placeholders


def run(cmd: list[str]) -> str:
    return subprocess.run(cmd, check=True, capture_output=True, text=True).stderr


def loudness(path: Path) -> float:
    out = run(["ffmpeg", "-i", str(path), "-af", "ebur128", "-f", "null", "-"])
    vals = [l for l in out.splitlines() if l.strip().startswith("I:")]
    return float(vals[-1].split()[1])


def process(raw: Path, dst: Path) -> None:
    tmp = dst.with_suffix(".tmp.wav")
    # trim leading/trailing silence (keep a short natural tail), resample to 48 kHz
    run([
        "ffmpeg", "-y", "-v", "error", "-i", str(raw), "-af",
        "highpass=f=70,silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.03,"
        "areverse,silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.08,areverse",
        "-ar", str(SR), "-ac", "1", str(tmp),
    ])
    gain = TARGET_LUFS - loudness(tmp)
    run(["ffmpeg", "-y", "-v", "error", "-i", str(tmp), "-af", f"volume={gain:.2f}dB,alimiter=limit=0.79:level=false", "-ar", str(SR), str(dst)])
    tmp.unlink()


def wav_seconds(path: Path) -> float:
    with wave.open(str(path)) as w:
        return w.getnframes() / w.getframerate()


_aligner = None


def align(path: Path, words: list[str]) -> list[dict]:
    global _aligner
    import torch
    import torchaudio

    if _aligner is None:
        b = torchaudio.pipelines.MMS_FA
        m = b.get_model(with_star=False)
        m.eval()
        _aligner = (m, b.get_dict(star=None))
    model, d = _aligner
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", str(path), "-ac", "1", "-ar", "16000", "-f", "f32le", "-"], capture_output=True, check=True).stdout
    w = torch.from_numpy(np.frombuffer(raw, dtype=np.float32).copy()).unsqueeze(0)
    with torch.inference_mode():
        em, _ = model(w)
    norm = lambda s: "".join(c for c in s.lower().replace("‘", "'").replace("’", "'").replace("ʻ", "'") if c in d)
    toks = [[d[c] for c in norm(x)] for x in words]
    flat = torch.tensor([t for ws in toks for t in ws], dtype=torch.int32)
    ali, scores = torchaudio.functional.forced_align(em, flat.unsqueeze(0), blank=0)
    spans = torchaudio.functional.merge_tokens(ali[0], scores[0].exp())
    ratio = w.shape[1] / em.shape[1] / 16000
    out, i = [], 0
    for x, t in zip(words, toks):
        s = spans[i : i + len(t)]
        i += len(t)
        out.append({"start": round(s[0].start * ratio, 3), "end": round(s[-1].end * ratio, 3), "score": round(float(sum(p.score * len(p) for p in s) / sum(len(p) for p in s)), 3)})
    return out


def main() -> None:
    ep = sys.argv[1]
    script = json.loads((ROOT / "src/episodes" / ep / "script.json").read_text())
    raw_dir, out_dir = ROOT / "public" / ep / "vo_raw", ROOT / "public" / ep / "vo"
    out_dir.mkdir(parents=True, exist_ok=True)
    lines = []
    for line in script["lines"]:
        lid, display = line["id"], line["text"].split()
        raw = raw_dir / f"{lid}.wav"
        if raw.exists():
            dst = out_dir / f"{lid}.wav"
            process(raw, dst)
            dur = wav_seconds(dst)
            aw = line["align"].split()
            timings = align(dst, aw)
            # map display tokens onto aligner tokens: a hyphenated display word
            # ("ochdi-yu...", "TIK-TAK!") spans several aligner words; pure punctuation ("—") is dropped
            words, j = [], 0
            for tok in display:
                parts = [p for p in tok.replace("—", " ").split("-") if any(ch.isalnum() for ch in p)]
                if not parts:
                    continue
                a0, a1 = j, min(j + len(parts), len(timings)) - 1
                words.append({"text": tok, "start": timings[a0]["start"], "end": timings[a1]["end"]})
                j += len(parts)
            if j != len(aw):
                print(f"  WARNING {lid}: mapped {j} aligner words, expected {len(aw)}")
            score = sum(t["score"] for t in timings) / len(timings)
            lines.append({"id": lid, "file": f"{ep}/vo/{lid}.wav", "duration": round(dur, 3), "placeholder": False, "alignScore": round(score, 3), "words": words})
            print(f"{lid:5s} {dur:5.2f}s  align {score:.2f}  {line['text']}")
        else:
            dur = round(len(line["text"]) * SEC_PER_CHAR + 0.3, 2)
            weights = np.array([max(2, len(t)) for t in display], dtype=float)
            edges = np.concatenate([[0], np.cumsum(weights)]) / weights.sum() * (dur - 0.2) + 0.1
            words = [{"text": t, "start": round(float(edges[i]), 3), "end": round(float(edges[i + 1]), 3)} for i, t in enumerate(display)]
            lines.append({"id": lid, "file": None, "duration": dur, "placeholder": True, "words": words})
            print(f"{lid:5s} {dur:5.2f}s  PLACEHOLDER (no VoiceLab audio yet)  {line['text']}")
    (ROOT / "src/episodes" / ep / "timing.json").write_text(json.dumps({"lines": lines}, ensure_ascii=False, indent=1))
    total = sum(l["duration"] for l in lines) + sum(l.get("gapAfter", 0) for l in script["lines"]) + sum(s.get("pre", 0) for s in script["scenes"])
    print(f"\nnarration + pauses ≈ {total:.1f}s")


if __name__ == "__main__":
    main()
