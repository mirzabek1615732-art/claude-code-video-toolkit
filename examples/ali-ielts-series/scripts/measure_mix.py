"""Measure an episode mix from its stems. Usage: python3 scripts/measure_mix.py <stemdir> <timing.json>
Stems: voice.wav, fx.wav (sfx+music), music.wav, all.wav rendered with the `stem` prop."""
import json, sys
import numpy as np, soundfile as sf, pyloudnorm as pyln

d, timing = sys.argv[1], json.load(open(sys.argv[2]))
S = {k: sf.read(f'{d}/{k}.wav')[0] for k in ['voice', 'fx', 'music', 'all']}
sr = sf.info(f'{d}/all.wav').samplerate
S['sfx'] = S['fx'] - S['music']
meter = pyln.Meter(sr)
for k, x in S.items():
    try:
        L = meter.integrated_loudness(x)
    except Exception:
        L = float('nan')
    tp = 20 * np.log10(np.max(np.abs(x)) + 1e-12)
    print(f'{k:6s} integrated {L:6.1f} LUFS  sample peak {tp:6.1f} dBFS')

def st(x, a, b):  # RMS dB of a window
    seg = x[int(a * sr):int(b * sr)]
    return 10 * np.log10(np.mean(seg ** 2) + 1e-12)

# speech spans (real narration only)
spans = [(l['start'], l['start'] + l['duration']) for l in timing['lines'] if not l.get('placeholder')]
win = 0.4
rows = []
for a, b in spans:
    t = a
    while t + win <= b:
        v = st(S['voice'], t, t + win)
        if v > -45:
            rows.append((t, v, st(S['music'], t, t + win), st(S['sfx'], t, t + win)))
        t += win
r = np.array(rows)
dm = r[:, 1] - r[:, 2]
ds = r[:, 1] - r[:, 3]
print(f'speech windows: {len(r)}')
print(f'voice-over-music: median {np.median(dm):.1f} dB, min {dm.min():.1f} dB')
act = r[:, 3] > -60
print(f'voice-over-sfx (windows with sfx): median {np.median(ds[act]):.1f} dB, min {ds[act].min():.1f} dB at t={r[act][np.argmin(ds[act]), 0]:.2f}s')
