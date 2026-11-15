"""Builds narration timeline, original music + synthesized SFX, the ducked mix, captions SRT and src/timeline.ts.
Run from episode_01_source/: python3 tools/build_audio.py   (needs numpy + ffmpeg; narration clips come from tts_words.py)"""
import json, re, subprocess, wave, os
import numpy as np

SR = 48000
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
A = f"{ROOT}/public/audio"
DUR = 30.0
BPM = 100.0
BEAT = 60.0 / BPM          # 0.6 s: hearts pulse on this grid, music sub-bass too

def ffload(path):
    raw = subprocess.check_output(["ffmpeg", "-loglevel", "error", "-i", path, "-f", "f32le", "-ac", "1", "-ar", str(SR), "-"])
    return np.frombuffer(raw, dtype=np.float32).copy()

# ---------------------------------------------------------------- narration
SCRIPT = {
    "c1": "Imagine having three hearts... and still getting your heart broken!",
    "c2": "Octopuses don't really get heartbroken, but they do have three hearts!",
    "c3": "Two hearts push blood through the gills. The third sends it around the body.",
    "c4": "And the blood? Blue! It uses copper, not iron, to carry oxygen.",
    "c5": "Three hearts, blue blood? That's mind-blowing! It means extremely surprising.",
    "c6": "A mind-blowing fact!",
    "c7": "So when an octopus says, you have my heart... which one?",
}
START = {"c1": 0.20, "c2": 4.00, "c3": 8.20, "c4": 13.04, "c5": 18.15, "c6": 23.45, "c7": 25.10}

voice = np.zeros(int(DUR * SR) + SR, dtype=np.float32)
words, clips = [], {}
for name, text in SCRIPT.items():
    orig = ffload(f"{A}/{name}.mp3")
    idx = int(np.argmax(np.abs(orig) > 0.004))
    lead = idx / SR
    clip = ffload(f"{A}/{name}.t.wav")
    # even out loudness between clips (RMS of the voiced part)
    rms = np.sqrt(np.mean(clip[np.abs(clip) > 0.01] ** 2))
    clip = clip * (10 ** (-19 / 20) / rms)
    clip = np.clip(clip, -0.95, 0.95)
    fade = int(0.008 * SR); clip[:fade] *= np.linspace(0, 1, fade); clip[-fade:] *= np.linspace(1, 0, fade)
    s = int(START[name] * SR); voice[s:s + len(clip)] += clip
    clips[name] = {"start": START[name], "end": START[name] + len(clip) / SR}
    raw = json.load(open(f"{A}/{name}.words.json"))
    toks = text.split()
    k = 0
    for tok in toks:
        norm = re.sub(r"[^a-z0-9]", "", tok.lower())
        acc, grp = "", []
        while k < len(raw) and len(acc) < len(norm):
            acc += re.sub(r"[^a-z0-9]", "", raw[k]["text"].lower()); grp.append(raw[k]); k += 1
        if not grp: continue
        st = START[name] + grp[0]["start"] - lead
        en = START[name] + grp[-1]["start"] + grp[-1]["dur"] - lead
        words.append({"w": tok, "s": round(st, 3), "e": round(en, 3), "seg": name})
voice = voice[: int(DUR * SR)]
print("voice ends at", max(c["end"] for c in clips.values()))

def wt(seg, sub, nth=0, edge="s"):
    hits = [w for w in words if w["seg"] == seg and sub in w["w"].lower()]
    return hits[nth][edge]

# ---------------------------------------------------------------- key events (shared by sound and picture)
EV = {
    "boom": 0.10, "h1": 0.35, "h2": 0.62, "h3": 0.89,
    "broken": wt("c1", "broken"),
    "pullback": 3.92,
    "have": wt("c2", "have"), "three2": wt("c2", "three"), "hearts2": wt("c2", "hearts"),
    "dont": wt("c2", "don't"),
    "scan": 7.95,
    "two": wt("c3", "two"), "third": wt("c3", "third"), "body": wt("c3", "body"),
    "blood": wt("c4", "blood"), "blue": wt("c4", "blue"), "copper": wt("c4", "copper"),
    "iron": wt("c4", "iron"), "oxygen": wt("c4", "oxygen"),
    "recap": 18.15, "mind": wt("c5", "mind"), "extremely": wt("c5", "extremely"),
    "mind2": wt("c6", "mind"),
    "when": wt("c7", "when"), "myheart": wt("c7", "heart"), "which": wt("c7", "which"),
}
EV = {k: round(v, 3) for k, v in EV.items()}
SCENES = {"hook": 0.0, "setup": 3.9, "heart": 7.95, "blood": 12.95, "vocab": 18.0, "twist": 25.0}

json.dump({"fps": 30, "dur": DUR, "beat": BEAT, "clips": clips, "words": words, "ev": EV, "scenes": SCENES},
          open(f"{ROOT}/src/timeline.json", "w"), indent=1)

# ---------------------------------------------------------------- SRT (short phrases)
def srt_time(t):
    h, r = divmod(t, 3600); m, s = divmod(r, 60)
    return f"{int(h):02d}:{int(m):02d}:{int(s):02d},{int(round((s - int(s)) * 1000)):03d}"
chunks, cur = [], []
for w in words:
    cur.append(w)
    if len(cur) >= 3 or re.search(r"[.?!,…]$|\.\.\.$", w["w"]) or (len(cur) >= 2 and w["w"].endswith(",")):
        chunks.append(cur); cur = []
if cur: chunks.append(cur)
lines = []
for i, c in enumerate(chunks):
    st = c[0]["s"]; en = chunks[i + 1][0]["s"] - 0.04 if i + 1 < len(chunks) and chunks[i + 1][0]["seg"] == c[0]["seg"] else c[-1]["e"] + 0.2
    lines.append(f"{i + 1}\n{srt_time(st)} --> {srt_time(min(en, DUR))}\n{' '.join(x['w'] for x in c)}\n")
open(f"{ROOT}/../episode_01_subtitles.srt", "w").write("\n".join(lines))

# ---------------------------------------------------------------- synthesis helpers
t_all = np.arange(int(DUR * SR)) / SR
def place(buf, sig, at, gain=1.0):
    i = int(at * SR)
    if i >= len(buf): return
    sig = sig[: len(buf) - i]
    buf[i:i + len(sig)] += gain * sig
def env_ad(n, a, d):
    t = np.arange(n) / SR
    return np.minimum(t / max(a, 1e-4), 1.0) * np.exp(-t / d)
def sine(f, dur, a=0.004, d=0.2, harm=(1.0,)):
    n = int(dur * SR); t = np.arange(n) / SR
    return sum(h * np.sin(2 * np.pi * f * (k + 1) * t) for k, h in enumerate(harm)) * env_ad(n, a, d)
rng = np.random.default_rng(11)
def lp(x, k):  # moving-average low pass
    return np.convolve(x, np.ones(k) / k, mode="same")
def noise(dur): return rng.standard_normal(int(dur * SR)).astype(np.float32)

def thump(f0=62, dur=0.28):
    n = int(dur * SR); t = np.arange(n) / SR
    return np.sin(2 * np.pi * (f0 + 40 * np.exp(-t * 30)) * t) * np.exp(-t / 0.07)
def whoosh(dur=0.55, up=True):
    n = int(dur * SR); t = np.arange(n) / SR
    x = lp(noise(dur), 48) * 6
    sweep = np.sin(np.pi * t / dur) ** 2
    return x * sweep * (np.linspace(0.4, 1, n) if up else np.linspace(1, 0.4, n))
def shimmer(dur=1.2, base=1318):
    n = int(dur * SR); t = np.arange(n) / SR
    out = np.zeros(n, dtype=np.float32)
    for k, ratio in enumerate([1, 1.5, 2, 2.52, 3]):
        out += 0.5 / (k + 1) * np.sin(2 * np.pi * base * ratio * t + k) * np.exp(-t / (0.5 + 0.1 * k)) * (1 + 0.3 * np.sin(2 * np.pi * (5 + k) * t))
    return out * np.minimum(t / 0.01, 1)
def ding(f=1568): return sine(f, 0.7, 0.002, 0.2, (1, 0.45, 0.2)) + 0.4 * np.pad(sine(f * 1.5, 0.5, 0.002, 0.12), (0, int(0.2 * SR)))
def pop(): 
    n = int(0.12 * SR); t = np.arange(n) / SR
    return np.sin(2 * np.pi * (700 * np.exp(-t * 20) + 180) * t) * np.exp(-t / 0.035)
def bloop():
    n = int(0.3 * SR); t = np.arange(n) / SR
    return np.sin(2 * np.pi * (260 + 500 * (1 - np.exp(-t * 25))) * t) * np.exp(-t / 0.08)
def crack():
    n = int(0.25 * SR); t = np.arange(n) / SR
    x = noise(0.25); x = x - lp(x, 12)
    return x * np.exp(-t / 0.03) * 1.4 + 0.5 * sine(190, 0.25, 0.001, 0.04)
def clink(f=2200): return sine(f, 0.35, 0.001, 0.08, (1, 0.6, 0.3))
def boom():
    n = int(1.1 * SR); t = np.arange(n) / SR
    return np.sin(2 * np.pi * (46 + 110 * np.exp(-t * 7)) * t) * np.exp(-t / 0.35) + 0.25 * lp(noise(1.1), 30) * 6 * np.exp(-t / 0.15)
def riser(dur=0.7):
    n = int(dur * SR); t = np.arange(n) / SR
    return lp(noise(dur), 20) * 7 * (t / dur) ** 2

# ---------------------------------------------------------------- music (original): warm underwater pad + bubble arp + heartbeat sub
def midi(m): return 440.0 * 2 ** ((m - 69) / 12)
chords = [[50, 54, 57, 61, 64], [47, 50, 54, 57, 61], [43, 47, 50, 54, 57], [45, 49, 52, 59]]   # Dmaj9, Bm9, Gmaj9, A add9
music = np.zeros((2, len(t_all)), dtype=np.float32)
bar = BEAT * 4
for c in range(int(DUR / (2 * bar)) + 2):
    chord = chords[c % 4]; t0 = c * 2 * bar; L = 2 * bar + 1.0
    n = int(L * SR); t = np.arange(n) / SR
    e = np.minimum(t / 0.9, 1) * np.minimum((L - t) / 0.9, 1).clip(0, 1)
    pad = np.zeros(n, dtype=np.float32)
    for m in chord:
        for det in (-0.0018, 0.0018):
            pad += np.sin(2 * np.pi * midi(m) * (1 + det) * t) + 0.25 * np.sin(2 * np.pi * midi(m) * 2 * (1 + det) * t)
    pad *= e * (1 + 0.15 * np.sin(2 * np.pi * 0.25 * t)) * 0.05
    place(music[0], pad, t0); place(music[1], pad, t0)
arp_notes = [74, 78, 81, 78, 76, 81, 85, 81]            # D pentatonic sparkles
for k in range(int(DUR / (BEAT / 2))):
    at = k * BEAT / 2
    chord = chords[int(at // (2 * bar)) % 4]
    note = arp_notes[k % 8] + (chord[0] - 50)
    pl = sine(midi(note), 0.5, 0.002, 0.16, (1, 0.3, 0.1)) * (0.10 if k % 2 == 0 else 0.07)
    place(music[k % 2], pl, at); place(music[(k + 1) % 2], pl, at + 0.012, 0.4)
for k in range(int(DUR / BEAT)):                         # heartbeat on the beat grid
    at = k * BEAT
    place(music[0], thump(55, 0.3), at, 0.30); place(music[1], thump(55, 0.3), at, 0.30)
    place(music[0], thump(48, 0.25), at + 0.2, 0.17); place(music[1], thump(48, 0.25), at + 0.2, 0.17)
    h = noise(0.04) * np.exp(-np.arange(int(0.04 * SR)) / SR / 0.01) * 0.035
    place(music[0], h, at + BEAT / 2); place(music[1], h, at + BEAT / 2 + 0.01)
# gentle swell into the vocabulary reveal, soft "ta-da" shimmer after it
place(music[0], riser(0.55), EV["mind"] - 0.55, 0.12); place(music[1], riser(0.55), EV["mind"] - 0.55, 0.12)
music *= np.minimum(1, (DUR - t_all) / 1.2)               # fade the bed out at the end
music *= np.minimum(1, t_all / 0.05)

# ---------------------------------------------------------------- SFX (kept far below the voice)
sfx = np.zeros((2, len(t_all)), dtype=np.float32)
def S(sig, at, gain, pan=0.0):
    place(sfx[0], sig, at, gain * (1 - max(pan, 0))); place(sfx[1], sig, at, gain * (1 + min(pan, 0)))
S(boom(), EV["boom"], 0.55); S(riser(0.1), 0.0, 0.1)
for k in ("h1", "h2", "h3"): S(pop(), EV[k], 0.45, {"h1": -0.4, "h2": 0.0, "h3": 0.4}[k])
S(crack(), EV["broken"], 0.55)
S(whoosh(0.5), EV["pullback"] - 0.1, 0.35)
for k, f in (("have", 1175), ("three2", 1397), ("hearts2", 1760)): S(ding(f), EV[k], 0.30)
S(whoosh(0.7), EV["scan"] - 0.2, 0.30); S(shimmer(1.0, 880), EV["scan"], 0.12)
for k in range(2): S(thump(70, 0.22), EV["two"] + k * 0.21, 0.5)
S(thump(60, 0.3), EV["third"], 0.6); S(ding(1046), EV["third"], 0.25)
S(pop(), EV["blood"], 0.4)
S(shimmer(1.6, 1175), EV["blue"], 0.30); S(bloop(), EV["blue"], 0.5); S(whoosh(0.35), EV["blue"] - 0.1, 0.25)
S(clink(2349), EV["copper"], 0.3, -0.3); S(clink(2093), EV["copper"] + 0.12, 0.26, 0.3)
S(thump(90, 0.2), EV["iron"] + 0.12, 0.35)
for k in range(3): S(bloop(), EV["oxygen"] + 0.1 + 0.16 * k, 0.28, (-0.4, 0, 0.4)[k])
S(boom(), EV["mind"], 0.5); S(shimmer(1.4, 1568), EV["mind"] + 0.03, 0.26)
S(ding(1568), EV["extremely"], 0.30)
S(shimmer(0.8, 1760), EV["mind2"], 0.2)
S(pop(), EV["when"], 0.35); S(ding(1319), EV["myheart"], 0.30)
for k in range(3): S(thump(68, 0.25), EV["which"] + 0.25 * k, 0.55)
S(shimmer(1.0, 1568), EV["which"] + 0.8, 0.18)

# ---------------------------------------------------------------- ducked mix
def rms_db(x): return 20 * np.log10(np.sqrt(np.mean(x ** 2)) + 1e-9)
active = (np.abs(voice) > 0.02).astype(np.float32)
blk = int(0.01 * SR)
act = active[: len(active) // blk * blk].reshape(-1, blk).max(axis=1)
gate = np.zeros_like(act); g = 0.0
for i, a in enumerate(act):                                # attack 60 ms, release 450 ms
    coef = 1 - np.exp(-0.01 / (0.06 if a > g else 0.45)); g += (a - g) * coef; gate[i] = g
gate = np.repeat(gate, blk)[: len(voice)]
gate = np.pad(gate, (0, len(voice) - len(gate)))
voiced = voice[np.abs(voice) > 0.02]
v_rms = np.sqrt(np.mean(voiced ** 2))
m_rms = np.sqrt(np.mean(music[:, : int(DUR * SR)] ** 2))
music *= v_rms * 10 ** (-14 / 20) / m_rms                   # bed is 14 dB under the voice in the gaps
music *= (1 - gate * (1 - 10 ** (-6 / 20)))[None, :]      # a further 6 dB under speech: about 20 dB below the narration
sfx_peak = np.max(np.abs(sfx)); sfx *= (np.max(np.abs(voice)) * 10 ** (-15 / 20)) / sfx_peak   # loudest effect 15 dB under the voice peak
sfx *= (1 - gate * 0.35)[None, :]
mix = np.stack([voice, voice]) * 1.0 + music + sfx
peak = np.max(np.abs(mix)); mix = mix / peak * 0.89
print(f"voice rms {rms_db(voiced):.1f} dBFS | music-in-speech vs voice ~{20*np.log10(np.sqrt(np.mean((music*gate[None,:])[:, gate>0.9]**2))/v_rms):.1f} dB")
pcm = (np.clip(mix, -1, 1).T * 32767).astype(np.int16)
with wave.open(f"{ROOT}/public/audio/mix_raw.wav", "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
# loudness: two-pass loudnorm to -16 LUFS, true peak below -1 dBTP
meas = subprocess.run(["ffmpeg", "-hide_banner", "-i", f"{ROOT}/public/audio/mix_raw.wav", "-af", "loudnorm=I=-16:TP=-1.5:LRA=7:print_format=json", "-f", "null", "-"], capture_output=True, text=True).stderr
j = json.loads(meas[meas.rindex("{"):])
af = f"loudnorm=I=-16:TP=-1.5:LRA=7:measured_I={j['input_i']}:measured_TP={j['input_tp']}:measured_LRA={j['input_lra']}:measured_thresh={j['input_thresh']}:offset={j['target_offset']}:linear=true"
subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", f"{ROOT}/public/audio/mix_raw.wav", "-af", af + ",apad=whole_dur=30,atrim=0:30", "-ar", "48000", f"{ROOT}/public/audio/mix.wav"], check=True)
print("mix written")
