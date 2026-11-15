#!/usr/bin/env python3
"""Generate the Uzbek narration for an episode and write subtitle timing.

Reads  src/episode/script.json
Writes public/audio/vo/<line-id>.wav   (trimmed narration clips, 48 kHz mono)
       src/episode/timing.json          (clip durations + per-word timings)

Voice: Microsoft Edge neural TTS (uz-UZ-SardorNeural, male) through the
`edge-tts` package. Requires network access. If you record a human voice
instead, drop WAV files with the same names into public/audio/vo/ and run
`python3 scripts/generate_voiceover.py --from-existing` to rebuild timing.json
from your recordings (word timings are then estimated proportionally).

Engines (--engine):
  edge        free Microsoft neural voice (default; script.json voice.name)
  elevenlabs  ElevenLabs eleven_v3 with language_code "uz". Needs
              ELEVENLABS_API_KEY and voice.elevenlabsVoiceId in script.json.
              Uses the /with-timestamps endpoint, so captions get exact
              character-level timing.

--enhance applies a speech clarity chain (rumble/mud cut, presence boost,
de-essing, gentle compression, per-line loudness -16 LUFS) to every clip.

Usage:
  pip install edge-tts numpy
  python3 scripts/generate_voiceover.py [--engine edge|elevenlabs] [--enhance] [--from-existing] [--only l01,l02]
"""
from __future__ import annotations

import argparse
import asyncio
import json
import os
import ssl
import subprocess
import sys
import wave
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parent.parent
SCRIPT = ROOT / "src" / "episode" / "script.json"
TIMING = ROOT / "src" / "episode" / "timing.json"
VO_DIR = ROOT / "public" / "audio" / "vo"
SR = 48000


def _ssl_context() -> ssl.SSLContext:
    """Honour a custom CA bundle (corporate / sandbox proxies)."""
    for var in ("SSL_CERT_FILE", "REQUESTS_CA_BUNDLE", "NODE_EXTRA_CA_CERTS"):
        path = os.environ.get(var)
        if path and Path(path).exists():
            return ssl.create_default_context(cafile=path)
    ccr = Path("/root/.ccr/ca-bundle.crt")
    if ccr.exists():
        return ssl.create_default_context(cafile=str(ccr))
    import certifi

    return ssl.create_default_context(cafile=certifi.where())


async def synth(text: str, voice: str, rate: str, pitch: str, mp3_path: Path) -> list[dict]:
    import edge_tts
    import edge_tts.communicate as comm

    comm._SSL_CTX = _ssl_context()  # noqa: SLF001 - library exposes no option
    proxy = os.environ.get("HTTPS_PROXY") or os.environ.get("https_proxy")
    kwargs = dict(rate=rate, pitch=pitch, proxy=proxy)
    try:
        c = edge_tts.Communicate(text, voice, boundary="WordBoundary", **kwargs)
    except TypeError:  # older edge-tts
        c = edge_tts.Communicate(text, voice, **kwargs)
    words: list[dict] = []
    with open(mp3_path, "wb") as f:
        async for chunk in c.stream():
            if chunk["type"] == "audio":
                f.write(chunk["data"])
            elif chunk["type"] == "WordBoundary":
                start = chunk["offset"] / 1e7
                words.append({"text": chunk["text"], "start": start, "end": start + chunk["duration"] / 1e7})
    return words


CLARITY_CHAIN = (
    "highpass=f=90,"
    "equalizer=f=280:t=q:w=1.2:g=-3,"  # remove boxy low-mids
    "equalizer=f=3200:t=q:w=1.0:g=4,"  # consonant presence / intelligibility
    "equalizer=f=9000:t=q:w=1.5:g=1.5,"  # air
    "deesser=i=0.4:m=0.5:f=0.5,"
    "acompressor=threshold=-20dB:ratio=3:attack=5:release=60:makeup=2,"
    "loudnorm=I=-16:TP=-1.5:LRA=7"
)


def synth_elevenlabs(text: str, voice_id: str, mp3_path: Path, stability: float = 0.5) -> list[dict]:
    """ElevenLabs eleven_v3 (supports Uzbek). Returns word timings built from
    the character alignment of the /with-timestamps endpoint."""
    import base64
    import urllib.request

    key = os.environ.get("ELEVENLABS_API_KEY")
    if not key:
        sys.exit("ELEVENLABS_API_KEY is not set")
    body = json.dumps(
        {
            "text": text,
            "model_id": "eleven_v3",
            "language_code": "uz",
            "voice_settings": {"stability": stability, "similarity_boost": 0.8},
        }
    ).encode()
    req = urllib.request.Request(
        f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}/with-timestamps?output_format=mp3_44100_192",
        data=body,
        headers={"xi-api-key": key, "Content-Type": "application/json"},
    )
    with urllib.request.urlopen(req, context=_ssl_context(), timeout=120) as res:
        data = json.loads(res.read())
    mp3_path.write_bytes(base64.b64decode(data["audio_base64"]))
    al = data.get("alignment") or {}
    chars, starts, ends = al.get("characters", []), al.get("character_start_times_seconds", []), al.get("character_end_times_seconds", [])
    words: list[dict] = []
    cur = None
    for ch, a, b in zip(chars, starts, ends):
        if ch.isspace():
            if cur:
                words.append(cur)
            cur = None
        elif cur is None:
            cur = {"text": ch, "start": a, "end": b}
        else:
            cur["text"] += ch
            cur["end"] = b
    if cur:
        words.append(cur)
    return words


def decode(path: Path, filters: str | None = None) -> np.ndarray:
    af = ["-af", filters] if filters else []
    raw = subprocess.run(
        ["ffmpeg", "-v", "error", "-i", str(path), *af, "-ac", "1", "-ar", str(SR), "-f", "s16le", "-"],
        check=True,
        capture_output=True,
    ).stdout
    return np.frombuffer(raw, dtype=np.int16).astype(np.float32) / 32768.0


def enhance(samples: np.ndarray) -> np.ndarray:
    """Run the clarity chain on already-trimmed audio (keeps length/timing)."""
    pcm = (np.clip(samples, -1, 1) * 32767).astype(np.int16).tobytes()
    pad = np.zeros(int(SR * 0.5), dtype=np.int16).tobytes()  # loudnorm look-ahead headroom
    out = subprocess.run(
        ["ffmpeg", "-v", "error", "-f", "s16le", "-ar", str(SR), "-ac", "1", "-i", "-", "-af", CLARITY_CHAIN, "-ar", str(SR), "-ac", "1", "-f", "s16le", "-"],
        input=pcm + pad,
        check=True,
        capture_output=True,
    ).stdout
    y = np.frombuffer(out, dtype=np.int16).astype(np.float32) / 32768.0
    return y[: len(samples)]


def write_wav(path: Path, samples: np.ndarray) -> None:
    pcm = (np.clip(samples, -1, 1) * 32767).astype(np.int16)
    with wave.open(str(path), "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())


def trim(samples: np.ndarray, pad: float = 0.04) -> tuple[np.ndarray, float]:
    """Remove leading/trailing silence. Returns (trimmed, seconds removed at start)."""
    win = int(SR * 0.01)
    n = len(samples) // win
    rms = np.sqrt(np.mean(samples[: n * win].reshape(n, win) ** 2, axis=1))
    loud = np.where(rms > 0.012)[0]
    if len(loud) == 0:
        return samples, 0.0
    start = max(0, loud[0] * win - int(pad * SR))
    end = min(len(samples), (loud[-1] + 1) * win + int(pad * 2 * SR))
    out = samples[start:end].copy()
    fade = int(SR * 0.012)
    out[:fade] *= np.linspace(0, 1, fade)
    out[-fade:] *= np.linspace(1, 0, fade)
    return out, start / SR


def caption_words(text: str, spoken_words: list[dict], duration: float) -> list[dict]:
    """Map caption tokens onto time. Uses TTS word boundaries when the token
    counts line up, otherwise distributes time by syllable-ish weight."""
    tokens = [t for t in text.split() if t not in {"—", "-"}]
    if spoken_words and len(spoken_words) == len(tokens):
        out = []
        for tok, w in zip(tokens, spoken_words):
            out.append({"text": tok, "start": round(max(0.0, w["start"]), 3), "end": round(min(duration, w["end"]), 3)})
        return out
    if spoken_words:
        t0 = max(0.0, spoken_words[0]["start"])
        t1 = min(duration, spoken_words[-1]["end"])
    else:
        t0, t1 = 0.0, duration
    weights = np.array([max(2, len(t.strip(".,!?:…"))) for t in tokens], dtype=float)
    edges = t0 + np.concatenate([[0], np.cumsum(weights)]) / weights.sum() * (t1 - t0)
    return [
        {"text": tok, "start": round(float(edges[i]), 3), "end": round(float(edges[i + 1]), 3)}
        for i, tok in enumerate(tokens)
    ]


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--from-existing", action="store_true", help="use WAVs already in public/audio/vo")
    ap.add_argument("--only", default="", help="comma separated line ids to regenerate")
    ap.add_argument("--engine", choices=["edge", "elevenlabs"], default=None, help="TTS engine (default: script.json voice.engine)")
    ap.add_argument("--enhance", action="store_true", help="apply the speech clarity chain")
    args = ap.parse_args()

    script = json.loads(SCRIPT.read_text())
    voice = script["voice"]
    VO_DIR.mkdir(parents=True, exist_ok=True)
    previous = json.loads(TIMING.read_text()) if TIMING.exists() else {"lines": []}
    prev_by_id = {l["id"]: l for l in previous.get("lines", [])}
    only = {s for s in args.only.split(",") if s}

    lines_out = []
    for line in script["lines"]:
        lid = line["id"]
        wav_path = VO_DIR / f"{lid}.wav"
        if args.from_existing or (only and lid not in only):
            if not wav_path.exists():
                sys.exit(f"missing {wav_path}")
            samples = decode(wav_path)
            dur = len(samples) / SR
            prev = prev_by_id.get(lid)
            if prev and prev.get("text") == line["text"] and abs(prev["duration"] - dur) < 0.02:
                lines_out.append(prev)
                continue
            words = caption_words(line["text"], [], dur)
        else:
            mp3 = VO_DIR / f"{lid}.mp3"
            engine = args.engine or voice.get("engine", "edge")
            if engine == "elevenlabs":
                vid = voice.get("elevenlabsVoiceId")
                if not vid:
                    sys.exit("set voice.elevenlabsVoiceId in script.json")
                spoken = synth_elevenlabs(line.get("spoken", line["text"]), vid, mp3)
            else:
                spoken = asyncio.run(
                    synth(line.get("spoken", line["text"]), voice["name"], line.get("rate", voice["rate"]), line.get("pitch", voice["pitch"]), mp3)
                )
            samples, lead = trim(decode(mp3))
            if args.enhance or voice.get("enhance", False):
                samples = enhance(samples)
            mp3.unlink()
            write_wav(wav_path, samples)
            dur = len(samples) / SR
            for w in spoken:
                w["start"] -= lead
                w["end"] -= lead
            words = caption_words(line["text"], spoken, dur)
        lines_out.append({"id": lid, "text": line["text"], "file": f"audio/vo/{lid}.wav", "duration": round(dur, 3), "words": words})
        print(f"{lid}  {dur:5.2f}s  {line['text']}")

    total = sum(l["duration"] for l in lines_out) + sum(l.get("gapAfter", 0) for l in script["lines"])
    TIMING.write_text(json.dumps({"voice": voice["name"], "generatedBy": "scripts/generate_voiceover.py", "lines": lines_out}, ensure_ascii=False, indent=1))
    print(f"\nnarration + gaps ≈ {total:.2f}s  →  {TIMING.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
