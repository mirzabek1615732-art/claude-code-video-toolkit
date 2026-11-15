#!/usr/bin/env python3
"""Bring every SFX and music file to a known reference loudness so mixer gains
mean the same thing for every sound (shared by all episodes).

SFX:   loudest 400 ms RMS window -> -20 dBFS (short sounds have no reliable LUFS)
Music: integrated loudness       -> -17 LUFS (same as narration)
Writes public/audio/norm/<name>.wav (48 kHz). Re-run after adding sounds.
"""
import subprocess
import wave
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parent.parent
SRC_SFX = ROOT / "public/audio/sfx"
OUT = ROOT / "public/audio/norm"
SR = 48000


def read(path: Path) -> np.ndarray:
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", str(path), "-ac", "2", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype=np.float32).reshape(-1, 2).copy()


def write(path: Path, x: np.ndarray) -> None:
    pcm = (np.clip(x, -1, 1) * 32767).astype(np.int16)
    with wave.open(str(path), "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())


def lufs(path: Path) -> float:
    err = subprocess.run(["ffmpeg", "-i", str(path), "-af", "ebur128", "-f", "null", "-"], capture_output=True, text=True).stderr
    return float([l for l in err.splitlines() if l.strip().startswith("I:")][-1].split()[1])


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    for f in sorted(SRC_SFX.glob("*.wav")):
        x = read(f)
        mono = x.mean(1)
        win = int(0.4 * SR)
        if len(mono) <= win:
            peak_rms = np.sqrt(np.mean(mono**2))
        else:
            c = np.cumsum(np.concatenate([[0], mono**2]))
            peak_rms = np.sqrt((c[win:] - c[:-win]).max() / win)
        gain = 10 ** (-20 / 20) / max(peak_rms, 1e-6)
        y = x * gain
        y = y / max(1.0, np.abs(y).max() / 0.89)  # never clip
        write(OUT / f.name, y)
        print(f"sfx   {f.stem:16s} gain {20*np.log10(gain):+6.1f} dB")
    for name in ("music_main", "music_tension"):
        src = ROOT / f"public/audio/{name}.wav"
        x = read(src)
        write(OUT / f"{name}.wav", x)
        g = -17 - lufs(OUT / f"{name}.wav")
        write(OUT / f"{name}.wav", np.clip(x * 10 ** (g / 20), -0.89, 0.89))
        print(f"music {name:16s} gain {g:+6.1f} dB -> {lufs(OUT / f'{name}.wav'):.1f} LUFS")


if __name__ == "__main__":
    main()
