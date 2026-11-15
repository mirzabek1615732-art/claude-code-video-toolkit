#!/usr/bin/env python3
"""Synthesize every sound effect and the background music from scratch.

All audio produced here is original (pure numpy DSP, deterministic seed), so it
is safe to publish. Output goes to public/audio/sfx/*.wav and
public/audio/music_main.wav / music_tension.wav.

Usage:  python3 scripts/generate_audio_assets.py [--seconds 60]
"""
from __future__ import annotations

import argparse
import wave
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "public" / "audio"
SR = 48000
rng = np.random.default_rng(7)


# ---------------------------------------------------------------- helpers
def t_axis(dur: float) -> np.ndarray:
    return np.arange(int(dur * SR)) / SR


def env(n: int, a: float, d: float, curve: float = 4.0) -> np.ndarray:
    """Attack (seconds) + exponential decay (seconds) envelope of length n."""
    t = np.arange(n) / SR
    att = np.clip(t / max(a, 1e-4), 0, 1)
    dec = np.exp(-np.maximum(t - a, 0) * curve / max(d, 1e-4))
    return att * dec


def lowpass(x: np.ndarray, cutoff) -> np.ndarray:
    """One-pole low-pass; cutoff may be an array (time varying)."""
    cutoff = np.broadcast_to(np.asarray(cutoff, dtype=float), x.shape)
    alpha = 1 - np.exp(-2 * np.pi * cutoff / SR)
    y = np.empty_like(x)
    acc = 0.0
    for i in range(len(x)):
        acc += alpha[i] * (x[i] - acc)
        y[i] = acc
    return y


def lp_fast(x: np.ndarray, cutoff: float) -> np.ndarray:
    """Static low-pass via FFT brick-wall with soft knee (fast for long buffers)."""
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / SR)
    X *= 1 / (1 + (f / cutoff) ** 4)
    return np.fft.irfft(X, n=len(x))


def hp_fast(x: np.ndarray, cutoff: float) -> np.ndarray:
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / SR)
    X *= 1 - 1 / (1 + (f / cutoff) ** 4)
    return np.fft.irfft(X, n=len(x))


def bandpass(x: np.ndarray, center, q: float = 1.5) -> np.ndarray:
    """State-variable band-pass with (optionally) time-varying center."""
    center = np.broadcast_to(np.asarray(center, dtype=float), x.shape)
    y = np.empty_like(x)
    low = band = 0.0
    damp = 1 / q
    for i in range(len(x)):
        f = 2 * np.sin(np.pi * min(center[i], SR / 6) / SR)
        high = x[i] - low - damp * band
        band += f * high
        low += f * band
        y[i] = band
    return y


def reverb(x: np.ndarray, size: float = 0.35, mix: float = 0.25) -> np.ndarray:
    n = int(SR * size * 4)
    ir = rng.standard_normal(n) * np.exp(-np.arange(n) / (SR * size))
    ir = lp_fast(ir, 6000)
    wet = np.convolve(x, ir)
    wet = np.pad(wet, (0, max(0, len(x) + n - len(wet))))[: len(x) + n]
    wet /= np.max(np.abs(wet)) + 1e-9
    dry = np.concatenate([x, np.zeros(n)])
    return dry * (1 - mix) + wet * mix * np.max(np.abs(x))


def norm(x: np.ndarray, peak: float = 0.89) -> np.ndarray:
    return x / (np.max(np.abs(x)) + 1e-9) * peak


def save(name: str, x: np.ndarray, stereo: np.ndarray | None = None) -> None:
    path = OUT / name
    path.parent.mkdir(parents=True, exist_ok=True)
    if stereo is None:
        data = np.stack([x, x], axis=1)
    else:
        data = stereo
    pcm = (np.clip(data, -1, 1) * 32767).astype(np.int16)
    with wave.open(str(path), "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())
    print(f"  {name:28s} {len(data) / SR:6.2f}s")


def noise(dur: float) -> np.ndarray:
    return rng.standard_normal(int(dur * SR))


def sine_sweep(f0: float, f1: float, dur: float, curve: str = "exp") -> np.ndarray:
    n = int(dur * SR)
    if curve == "exp":
        f = f0 * (f1 / f0) ** (np.arange(n) / n)
    else:
        f = np.linspace(f0, f1, n)
    return np.sin(2 * np.pi * np.cumsum(f) / SR)


# ---------------------------------------------------------------- SFX
def whoosh(dur=0.55, f0=300, f1=3200):
    n = int(dur * SR)
    centre = f0 * (f1 / f0) ** np.sin(np.linspace(0, np.pi / 2, n))
    x = bandpass(noise(dur), centre, q=1.2)
    shape = np.sin(np.linspace(0, np.pi, n)) ** 1.6
    return norm(x * shape, 0.8)


def swish():
    return whoosh(0.28, 900, 5000) * 0.9


def boom():
    d = 1.6
    t = t_axis(d)
    body = np.sin(2 * np.pi * np.cumsum(110 * (35 / 110) ** np.clip(t / 0.35, 0, 1)) / SR)
    body *= env(len(t), 0.002, 1.1, 3)
    crack = lp_fast(noise(d), 1800) * env(len(t), 0.001, 0.18, 5)
    sub = np.sin(2 * np.pi * 42 * t) * env(len(t), 0.005, 1.4, 3)
    return norm(np.tanh(1.8 * (body + 0.6 * crack + 0.7 * sub)))


def impact():
    d = 0.7
    t = t_axis(d)
    thud = np.sin(2 * np.pi * np.cumsum(160 * (55 / 160) ** np.clip(t / 0.12, 0, 1)) / SR) * env(len(t), 0.001, 0.35, 4)
    click = hp_fast(noise(d), 2500) * env(len(t), 0.0005, 0.03, 5)
    return norm(np.tanh(2.2 * (thud + 0.5 * click)))


def pop():
    d = 0.18
    t = t_axis(d)
    x = np.sin(2 * np.pi * np.cumsum(np.linspace(380, 1300, len(t))) / SR) * env(len(t), 0.001, 0.09, 4)
    return norm(x, 0.75)


def bubble_pop():
    d = 0.25
    t = t_axis(d)
    x = np.sin(2 * np.pi * np.cumsum(np.linspace(900, 2600, len(t)) ** 1) / SR) * env(len(t), 0.0005, 0.06, 5)
    x += 0.4 * hp_fast(noise(d), 3000) * env(len(t), 0.0005, 0.02, 5)
    return norm(x, 0.7)


def notification():
    d = 0.75
    t = t_axis(d)
    out = np.zeros(len(t))
    for start, f in ((0.0, 1318.5), (0.11, 1975.5)):
        s = int(start * SR)
        seg = t[: len(t) - s]
        tone = (np.sin(2 * np.pi * f * seg) + 0.3 * np.sin(2 * np.pi * 2 * f * seg)) * env(len(seg), 0.002, 0.45, 5)
        out[s:] += tone
    return norm(reverb(out, 0.18, 0.18), 0.7)


def ding():
    d = 1.2
    t = t_axis(d)
    x = sum(a * np.sin(2 * np.pi * f * t) for f, a in ((1046.5, 1), (2093, 0.4), (3140, 0.2)))
    return norm(reverb(x * env(len(t), 0.002, 0.9, 4), 0.25, 0.2), 0.7)


def tick():
    d = 0.06
    x = hp_fast(noise(d), 3500) * env(int(d * SR), 0.0003, 0.012, 5)
    return norm(x, 0.6)


def clock_spin():
    d = 2.2
    out = np.zeros(int(d * SR))
    tk = tick()
    times = np.cumsum(np.linspace(0.12, 0.035, 40))
    for i, tm in enumerate(times):
        s = int(tm * SR)
        if s + len(tk) < len(out):
            out[s : s + len(tk)] += tk * (0.6 + 0.4 * (i % 2))
    return norm(out, 0.65)


def boing():
    d = 0.6
    t = t_axis(d)
    f = 180 + 260 * t / d + 60 * np.sin(2 * np.pi * 14 * t) * np.exp(-t * 3)
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * env(len(t), 0.003, 0.45, 3)
    return norm(x, 0.75)


def slide_whistle_down():
    d = 0.9
    x = sine_sweep(1600, 300, d, "exp")
    x += 0.15 * np.sin(2 * np.pi * np.cumsum(np.full(len(x), 6.0)) / SR) * x
    return norm(x * env(len(x), 0.04, 0.85, 1.5), 0.6)


def dramatic_hit():
    d = 2.6
    t = t_axis(d)
    chord = [65.4, 130.8, 155.6, 196.0, 261.6]  # C minor stab
    x = np.zeros(len(t))
    for f in chord:
        ph = rng.uniform(0, 2 * np.pi)
        saw = 2 * ((f * t + ph / (2 * np.pi)) % 1) - 1
        x += saw
    x = lp_fast(x, 1400) * env(len(t), 0.004, 1.8, 3)
    b = boom()
    x[: len(b)] += 0.9 * b[: len(x)]
    return norm(reverb(np.tanh(1.5 * x), 0.5, 0.35)[: int(3.0 * SR)])


def riser():
    d = 1.6
    n = int(d * SR)
    centre = np.geomspace(250, 6000, n)
    x = bandpass(noise(d), centre, q=2.5)
    x += 0.3 * sine_sweep(200, 1200, d)
    return norm(x * np.linspace(0, 1, n) ** 2, 0.7)


def record_scratch():
    d = 0.5
    t = t_axis(d)
    f = 600 + 900 * np.sin(2 * np.pi * 3.2 * t)
    x = bandpass(noise(d), f, q=3) + 0.3 * np.sin(2 * np.pi * np.cumsum(f * 0.5) / SR)
    return norm(x * env(len(t), 0.005, 0.4, 2), 0.7)


def crickets():
    d = 1.6
    t = t_axis(d)
    out = np.zeros(len(t))
    for k in range(4):
        s = int((0.12 + k * 0.38) * SR)
        n = int(0.16 * SR)
        tt = np.arange(n) / SR
        chirp = np.sin(2 * np.pi * 4300 * tt) * (0.5 + 0.5 * np.sin(2 * np.pi * 55 * tt)) * np.sin(np.pi * tt / tt[-1])
        out[s : s + n] += chirp
    return norm(out, 0.35)


def paper():
    d = 0.5
    x = bandpass(noise(d), np.linspace(2500, 800, int(d * SR)), q=0.8) * env(int(d * SR), 0.01, 0.3, 3)
    return norm(x, 0.6)


def stamp():
    return norm(np.tanh(1.5 * (impact() * 0.8 + np.pad(paper(), (0, len(impact()) - len(paper())))[: len(impact())] * 0.4)), 0.85)


def success():
    d = 1.4
    t = t_axis(d)
    out = np.zeros(len(t))
    for i, f in enumerate((523.3, 659.3, 784.0, 1046.5)):
        s = int(i * 0.08 * SR)
        seg = t[: len(t) - s]
        out[s:] += (np.sin(2 * np.pi * f * seg) + 0.25 * np.sin(4 * np.pi * f * seg)) * env(len(seg), 0.002, 0.6, 4)
    return norm(reverb(out, 0.3, 0.25), 0.7)


def card_flip():
    return norm(swish()[: int(0.2 * SR)] * 0.6 + np.pad(tick(), (0, int(0.2 * SR) - len(tick()))), 0.6)


def heartbeat():
    d = 0.9
    t = t_axis(d)
    out = np.zeros(len(t))
    for s0, a in ((0.0, 1.0), (0.22, 0.7)):
        s = int(s0 * SR)
        seg = t[: len(t) - s]
        out[s:] += a * np.sin(2 * np.pi * 55 * seg) * env(len(seg), 0.004, 0.18, 4)
    return norm(np.tanh(2 * out), 0.8)


def glass_burst():
    d = 0.8
    t = t_axis(d)
    x = hp_fast(noise(d), 4000) * env(len(t), 0.001, 0.4, 4)
    for f in (2900, 4100, 5300, 6200):
        x += 0.3 * np.sin(2 * np.pi * f * t) * env(len(t), 0.001, 0.3 * rng.uniform(0.5, 1), 4)
    return norm(x, 0.6)


def typing():
    d = 1.0
    out = np.zeros(int(d * SR))
    for i in range(9):
        s = int((i * 0.1 + rng.uniform(0, 0.03)) * SR)
        k = tick() * rng.uniform(0.5, 1)
        out[s : s + len(k)] += k
    return norm(out, 0.5)


# ---------------------------------------------------------------- music
def note_freq(midi: float) -> float:
    return 440 * 2 ** ((midi - 69) / 12)


def music_main(seconds: float) -> np.ndarray:
    """Upbeat 118 BPM loop: I–V–vi–IV pluck chords, bass, kick, clap, hats."""
    bpm = 118
    beat = 60 / bpm
    n = int(seconds * SR)
    L = np.zeros(n)
    R = np.zeros(n)
    prog = [(60, [0, 4, 7]), (55, [0, 4, 7]), (57, [0, 3, 7]), (53, [0, 4, 7])]  # C G Am F
    bars = int(seconds / (beat * 4)) + 1

    def add(buf, start, sig, gain=1.0):
        s = int(start * SR)
        if s >= n:
            return
        e = min(n, s + len(sig))
        buf[s:e] += sig[: e - s] * gain

    # instruments
    def pluck(freq, dur):
        t = t_axis(dur)
        saw = 2 * ((freq * t) % 1) - 1
        sq = np.sign(np.sin(2 * np.pi * freq * 1.004 * t))
        x = (0.6 * saw + 0.4 * sq) * env(len(t), 0.003, dur, 6)
        return lp_fast(x, 2600)

    def bass(freq, dur):
        t = t_axis(dur)
        x = np.sin(2 * np.pi * freq * t) + 0.35 * np.sin(4 * np.pi * freq * t)
        return np.tanh(1.5 * x) * env(len(t), 0.004, dur, 2.5)

    kick_t = t_axis(0.35)
    kick = np.sin(2 * np.pi * np.cumsum(150 * (45 / 150) ** np.clip(kick_t / 0.09, 0, 1)) / SR) * env(len(kick_t), 0.001, 0.3, 4)
    clap = bandpass(noise(0.2), 1500, q=0.9) * env(int(0.2 * SR), 0.001, 0.12, 5)
    hat = hp_fast(noise(0.05), 7000) * env(int(0.05 * SR), 0.0005, 0.03, 5)
    pluck_cache: dict = {}
    bass_cache: dict = {}

    for bar in range(bars):
        root, ivs = prog[bar % 4]
        t0 = bar * 4 * beat
        # chord stabs: off-beat rhythm
        for k, pos in enumerate((0, 0.75, 1.5, 2.5, 3.0, 3.5)):
            for j, iv in enumerate(ivs):
                midi = root + iv + 12
                key = (midi, round(beat * 0.6, 3))
                if key not in pluck_cache:
                    pluck_cache[key] = pluck(note_freq(midi), beat * 0.6)
                pan = (j - 1) * 0.35
                add(L, t0 + pos * beat, pluck_cache[key], 0.09 * (1 - pan))
                add(R, t0 + pos * beat, pluck_cache[key], 0.09 * (1 + pan))
        # arpeggio sparkle on odd bars
        if bar % 2 == 1:
            for k in range(8):
                midi = root + ivs[k % 3] + 24
                key = (midi, 0.18)
                if key not in pluck_cache:
                    pluck_cache[key] = pluck(note_freq(midi), 0.18)
                add(L if k % 2 else R, t0 + k * beat / 2, pluck_cache[key], 0.05)
        # bass on eighths with octave pop
        for k in range(8):
            midi = root - 24 + (12 if k % 4 == 3 else 0)
            key = (midi, beat / 2)
            if key not in bass_cache:
                bass_cache[key] = bass(note_freq(midi), beat / 2)
            add(L, t0 + k * beat / 2, bass_cache[key], 0.22)
            add(R, t0 + k * beat / 2, bass_cache[key], 0.22)
        # drums
        for k in range(4):
            add(L, t0 + k * beat, kick, 0.55)
            add(R, t0 + k * beat, kick, 0.55)
            if k in (1, 3):
                add(L, t0 + k * beat, clap, 0.25)
                add(R, t0 + k * beat, clap, 0.22)
        for k in range(8):
            add(L, t0 + k * beat / 2 + beat / 4, hat, 0.12)
            add(R, t0 + k * beat / 2 + beat / 4, hat, 0.16)

    st = np.stack([L, R], axis=1)
    st = np.tanh(st * 1.2)
    return st / np.max(np.abs(st)) * 0.8


def music_tension(seconds: float) -> np.ndarray:
    """Dark drone + heartbeat pulse for the reality-check / wake-up moments."""
    t = t_axis(seconds)
    x = np.zeros(len(t))
    for f, a in ((55, 1), (82.4, 0.5), (110, 0.4), (130.8, 0.25)):
        x += a * (2 * ((f * t) % 1) - 1)
    x = lp_fast(x, 500) * (0.7 + 0.3 * np.sin(2 * np.pi * 0.25 * t))
    hb = heartbeat()
    period = 0.95
    for k in range(int(seconds / period)):
        s = int(k * period * SR)
        e = min(len(x), s + len(hb))
        x[s:e] += hb[: e - s] * 0.9
    x = norm(x, 0.7)
    return np.stack([x, x * 0.97], axis=1)


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--seconds", type=float, default=60)
    args = ap.parse_args()
    print("SFX:")
    sfx = {
        "whoosh": whoosh(),
        "swish": swish(),
        "boom": boom(),
        "impact": impact(),
        "pop": pop(),
        "bubble_pop": bubble_pop(),
        "notification": notification(),
        "ding": ding(),
        "tick": tick(),
        "clock_spin": clock_spin(),
        "boing": boing(),
        "slide_down": slide_whistle_down(),
        "dramatic_hit": dramatic_hit(),
        "riser": riser(),
        "record_scratch": record_scratch(),
        "crickets": crickets(),
        "paper": paper(),
        "stamp": stamp(),
        "success": success(),
        "card_flip": card_flip(),
        "glass_burst": glass_burst(),
        "typing": typing(),
    }
    for name, sig in sfx.items():
        save(f"sfx/{name}.wav", sig)
    print("Music:")
    save("music_main.wav", None, music_main(args.seconds))  # type: ignore[arg-type]
    save("music_tension.wav", None, music_tension(14))  # type: ignore[arg-type]


if __name__ == "__main__":
    main()
