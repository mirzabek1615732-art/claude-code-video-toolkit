#!/usr/bin/env python3
"""Minimal, warm music bed for teacher talking-head reels (original, numpy DSP).

Soft electric-piano chords (Am9 - Fmaj7 - C - G6), sub bass, felt kick and
quiet hats at 96 BPM. Sits under a voice without fighting it.
Usage: python3 scripts/brand_music.py [seconds] [out.wav]
"""
import sys
import wave

import numpy as np

SR = 48000
rng = np.random.default_rng(11)


def env(n, a, d):
    t = np.arange(n) / SR
    return np.clip(t / a, 0, 1) * np.exp(-t / d)


def epiano(f, dur):
    t = np.arange(int(dur * SR)) / SR
    x = np.zeros_like(t)
    for k, amp in ((1, 1.0), (2, 0.28), (3, 0.08), (4, 0.05)):
        x += amp * np.sin(2 * np.pi * f * k * t + 0.6 * np.sin(2 * np.pi * f * t) * np.exp(-t * 6))
    trem = 1 + 0.12 * np.sin(2 * np.pi * 4.2 * t)
    return x * env(len(t), 0.006, 1.6) * trem


def lowpass(x, cutoff):
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / SR)
    return np.fft.irfft(X / (1 + (f / cutoff) ** 4), n=len(x))


def main():
    seconds = float(sys.argv[1]) if len(sys.argv) > 1 else 45
    out = sys.argv[2] if len(sys.argv) > 2 else "public/audio/music_brand.wav"
    bpm = 96
    beat = 60 / bpm
    n = int(seconds * SR)
    L = np.zeros(n)
    R = np.zeros(n)
    midi = lambda m: 440 * 2 ** ((m - 69) / 12)
    chords = [[57, 60, 64, 67, 71], [53, 57, 60, 64], [48, 55, 60, 64], [55, 59, 62, 64]]
    roots = [45, 41, 48, 43]

    def add(buf, t0, sig, g):
        s = int(t0 * SR)
        if s >= n:
            return
        e = min(n, s + len(sig))
        buf[s:e] += sig[: e - s] * g

    kick_t = np.arange(int(0.4 * SR)) / SR
    kick = np.sin(2 * np.pi * np.cumsum(110 * (42 / 110) ** np.clip(kick_t / 0.12, 0, 1)) / SR) * env(len(kick_t), 0.002, 0.18)
    hat = lowpass(rng.standard_normal(int(0.05 * SR)), 9000) * env(int(0.05 * SR), 0.0005, 0.012)
    hat = hat - lowpass(hat, 6000)
    bar = 4 * beat
    for b in range(int(seconds / bar) + 1):
        t0 = b * bar
        ch = chords[b % 4]
        for j, m in enumerate(ch):
            sig = epiano(midi(m), bar * 1.1)
            pan = (j / (len(ch) - 1) - 0.5) * 0.6
            add(L, t0 + j * 0.012, sig, 0.055 * (1 - pan))
            add(R, t0 + j * 0.012, sig, 0.055 * (1 + pan))
        # gentle re-strike on beat 3
        for j, m in enumerate(ch[1:4]):
            sig = epiano(midi(m + 12), beat * 1.5)
            add(L, t0 + 2 * beat, sig, 0.025)
            add(R, t0 + 2 * beat, sig, 0.025)
        t = np.arange(int(bar * SR)) / SR
        sub = np.sin(2 * np.pi * midi(roots[b % 4] - 12) * t) * np.clip(t / 0.02, 0, 1) * np.exp(-t / 2.5)
        add(L, t0, sub, 0.16)
        add(R, t0, sub, 0.16)
        for k in range(4):
            if k in (0, 2):
                add(L, t0 + k * beat, kick, 0.22)
                add(R, t0 + k * beat, kick, 0.22)
        for k in range(8):
            g = 0.035 if k % 2 else 0.02
            add(L, t0 + k * beat / 2 + 0.01, hat, g)
            add(R, t0 + k * beat / 2, hat, g * 1.2)
    st = np.stack([L, R], 1)
    fade = int(1.5 * SR)
    st[-fade:] *= np.linspace(1, 0, fade)[:, None]
    st = np.tanh(st * 1.4)
    st = st / np.max(np.abs(st)) * 0.7
    with wave.open(out, "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes((st * 32767).astype(np.int16).tobytes())
    print("wrote", out, seconds, "s")


if __name__ == "__main__":
    main()
