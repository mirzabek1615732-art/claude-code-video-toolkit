#!/usr/bin/env python3
"""English example lines with the free local Piper voice (en_GB-alan-medium).

usage: python3 scripts/piper_lines.py ep05 [--force]
Voices every line whose voice is "en" in script.json's "voices" map (engine piper) -> public/<ep>/vo_raw/<id>.wav.
The model is downloaded once to ~/.cache/piper (rhasspy/piper-voices on Hugging Face).
"""
import json, subprocess, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CACHE = Path.home() / ".cache" / "piper"
MODEL = "en_GB-alan-medium"
BASE = "https://huggingface.co/rhasspy/piper-voices/resolve/main/en/en_GB/alan/medium/"


def model() -> Path:
    CACHE.mkdir(parents=True, exist_ok=True)
    for f in (f"{MODEL}.onnx", f"{MODEL}.onnx.json"):
        if not (CACHE / f).exists():
            subprocess.run(["curl", "-sSL", "-o", str(CACHE / f), BASE + f], check=True)
    return CACHE / f"{MODEL}.onnx"


def main() -> None:
    ep = sys.argv[1]
    force = "--force" in sys.argv
    script = json.loads((ROOT / "src" / "episodes" / ep / "script.json").read_text())
    voices = script.get("voices", {})
    raw = ROOT / "public" / ep / "vo_raw"
    raw.mkdir(parents=True, exist_ok=True)
    m = model()
    for l in script["lines"]:
        if voices.get(l.get("voice", ""), {}).get("engine") != "piper":
            continue
        dst = raw / f"{l['id']}.wav"
        if dst.exists() and not force:
            print(l["id"], "cached"); continue
        text = l.get("tts") or l["text"]
        subprocess.run([sys.executable, "-m", "piper", "-m", str(m), "-f", str(dst), "--length-scale", "1.12"], input=text, text=True, check=True, capture_output=True)
        print(l["id"], "ok", text)


if __name__ == "__main__":
    main()
