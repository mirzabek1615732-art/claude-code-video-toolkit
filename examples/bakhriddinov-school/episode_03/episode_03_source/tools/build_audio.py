"""Episode 3 audio: narration timeline, original space music, synthesized SFX, ducked mix (-16 LUFS),
Uzbek SRT, voice-only WAV and src/timeline.json.  Run from episode_03_source/:  python3 tools/build_audio.py"""
import json, re, subprocess, wave, os
import numpy as np

SR = 48000
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
A = f"{ROOT}/public/audio"
OUT = os.path.dirname(ROOT)
DUR = 30.0

def ffload(path):
    raw = subprocess.check_output(["ffmpeg", "-loglevel", "error", "-i", path, "-f", "f32le", "-ac", "1", "-ar", str(SR), "-"])
    return np.frombuffer(raw, dtype=np.float32).copy()

# ------------------------------------------------------------------ narration (English) and its Uzbek translation
SCRIPT = {
    "v1": "Think you're slow... in the morning?",
    "v2": "Meet Venus!",
    "v3": "It takes 243 Earth days to spin just once,",
    "v4": "but only 225 to go around the Sun!",
    "v5": "Yes, one full rotation takes longer than its entire year!",
    "v6": "That's moving at a snail's pace,",
    "v7": "which means extremely slowly.",
    "v8": "Next time your friend says, I'm almost there,",
    "v9": "ask: on Earth... or on Venus?",
}
START = {"v1": 0.35, "v2": 2.30, "v3": 3.75, "v4": 8.0, "v5": 11.6, "v6": 16.2, "v7": 18.8, "v8": 23.1, "v9": 26.0}
UZ = [
    ("v1", 0, "Ertalab juda sekin harakat qilaman deb o‘ylaysizmi?"),
    ("v2", 0, "Unda Venera bilan tanishing!"),
    ("v3", 0, "U o‘z o‘qi atrofida bir marta aylanishi uchun 243 Yer kuni kerak!"),
    ("v4", 0, "Quyosh atrofida aylanib chiqishiga esa bor-yo‘g‘i 225 kun ketadi!"),
    ("v5", 0, "Ha, uning bir marta to‘liq aylanishi"),
    ("v5", 4, "butun bir yilidan ham uzoqroq davom etadi!"),
    ("v6", 0, "Bu “at a snail’s pace”, ya’ni shilliqqurt tezligida!"),
    ("v7", 0, "Ma’nosi: juda sekin, imillab."),
    ("v8", 0, "Keyingi safar do‘stingiz “Deyarli yetib keldim!” desa,"),
    ("v9", 0, "so‘rang: “Yer vaqti bilanmi... yoki Venera vaqti bilanmi?”"),
]

voice = np.zeros(int(DUR * SR) + SR, dtype=np.float32)
words, clips = [], {}
for name, text in SCRIPT.items():
    orig = ffload(f"{A}/{name}.mp3")
    lead = int(np.argmax(np.abs(orig) > 0.004)) / SR
    clip = ffload(f"{A}/{name}.t.wav")
    rms = np.sqrt(np.mean(clip[np.abs(clip) > 0.01] ** 2))
    clip = np.clip(clip * (10 ** (-19 / 20) / rms), -0.95, 0.95)
    f = int(0.008 * SR); clip[:f] *= np.linspace(0, 1, f); clip[-f:] *= np.linspace(1, 0, f)
    s = int(START[name] * SR); voice[s:s + len(clip)] += clip
    clips[name] = {"start": START[name], "end": round(START[name] + len(clip) / SR, 3)}
    raw = json.load(open(f"{A}/{name}.words.json")); k = 0
    for tok in text.split():
        norm = re.sub(r"[^a-z0-9]", "", tok.lower()); acc, grp = "", []
        while k < len(raw) and len(acc) < len(norm):
            acc += re.sub(r"[^a-z0-9]", "", raw[k]["text"].lower()); grp.append(raw[k]); k += 1
        if grp:
            words.append({"w": tok, "s": round(START[name] + grp[0]["start"] - lead, 3), "e": round(START[name] + grp[-1]["start"] + grp[-1]["dur"] - lead, 3), "seg": name})
voice = voice[: int(DUR * SR)]
assert max(c["end"] for c in clips.values()) < DUR - 0.3, clips
def wt(seg, sub, nth=0, edge="s"):
    return [w for w in words if w["seg"] == seg and sub in w["w"].lower()][nth][edge]
def wx(seg, word, edge="s"):
    return [w for w in words if w["seg"] == seg and re.sub(r"[^a-z']", "", w["w"].lower()) == word][0][edge]
def wi(seg, i, edge="s"):
    return [w for w in words if w["seg"] == seg][i][edge]

uz = []
for i, (seg, at, text) in enumerate(UZ):
    s = wi(seg, at)
    nxt = UZ[i + 1] if i + 1 < len(UZ) else None
    e = wi(nxt[0], nxt[1]) - 0.09 if nxt and nxt[0] == seg else min(wi(seg, -1, "e") + 0.45, (wi(nxt[0], nxt[1]) - 0.06) if nxt else DUR)
    uz.append({"s": round(s - 0.06, 3), "e": round(e, 3), "text": text})

EV = {
    "think": wt("v1", "think"), "morning": wt("v1", "morning"), "meet": wt("v2", "meet"), "venus2": wt("v2", "venus"),
    "n243": wt("v3", "243"), "spin": wt("v3", "spin"), "once": wt("v3", "once"), "v3end": clips["v3"]["end"],
    "but": wt("v4", "but"), "n225": wt("v4", "225"), "sun": wt("v4", "sun"), "v4end": clips["v4"]["end"],
    "yes": wt("v5", "yes"), "rotation": wt("v5", "rotation"), "longer": wt("v5", "longer"), "year": wt("v5", "year"), "v5end": clips["v5"]["end"],
    "moving": wt("v6", "moving"), "at": wx("v6", "at"), "a": wx("v6", "a"), "snails": wt("v6", "snail"), "pace": wt("v6", "pace"),
    "means": wt("v7", "means"), "extremely": wt("v7", "extremely"), "slowly": wt("v7", "slowly"), "v7end": clips["v7"]["end"],
    "friend": wt("v8", "friend"), "almost": wt("v8", "almost"), "there": wt("v8", "there"), "v8end": clips["v8"]["end"],
    "ask": wt("v9", "ask"), "earth": wt("v9", "earth"), "or": wt("v9", "or"), "venus9": wt("v9", "venus"), "end": clips["v9"]["end"],
}
EV = {k: round(v, 3) for k, v in EV.items()}
SCENES = {"hook": 0.0, "space": 3.45, "orbit": 7.75, "snail": 15.55, "chat": 21.4}
json.dump({"fps": 30, "dur": DUR, "clips": clips, "words": words, "uz": uz, "ev": EV, "scenes": SCENES}, open(f"{ROOT}/src/timeline.json", "w"), indent=1)

def ts(x):
    h, r = divmod(max(0, x), 3600); m, s = divmod(r, 60)
    return f"{int(h):02d}:{int(m):02d}:{int(s):02d},{int(round((s - int(s)) * 1000)) % 1000:03d}"
open(f"{OUT}/episode_03_uzbek.srt", "w").write("\n".join(f"{i + 1}\n{ts(u['s'])} --> {ts(u['e'])}\n{u['text']}\n" for i, u in enumerate(uz)))
with open(f"{OUT}/episode_03_script.txt", "w") as fh:
    fh.write("EPISODE 3: THE PLANET THAT TAKES FOREVER!  (Bakhriddinov School)\n\nTarget idiom: AT A SNAIL'S PACE\n  Meaning: extremely slowly.\n  Uzbek: Juda sekin, imillab.\n\nNARRATION (English) with Uzbek translation and timing\n")
    for name, text in SCRIPT.items():
        c = clips[name]
        fh.write(f"\n[{c['start']:05.2f}-{c['end']:05.2f}] {text}\n")
        for u in [x for x, (seg, _, _) in zip(uz, UZ) if seg == name]:
            fh.write(f"    UZ {u['s']:05.2f}-{u['e']:05.2f}  {u['text']}\n")
    fh.write("\nFact check: Venus turns once relative to the distant stars (a sidereal rotation) in about 243 Earth days, and it spins backwards (retrograde). It orbits the Sun in about 225 Earth days. Its solar day, sunrise to sunrise, is shorter: about 117 Earth days. So one full rotation is longer than its year, but its day (sunrise to sunrise) is not. The video says 'rotation' throughout and shows the 117-day note on screen.\n")

# ------------------------------------------------------------------ synthesis helpers
T = np.arange(int(DUR * SR)) / SR
rng = np.random.default_rng(23)
def place(buf, sig, at, gain=1.0):
    i = int(at * SR)
    if 0 <= i < len(buf):
        sig = sig[: len(buf) - i]; buf[i:i + len(sig)] += gain * sig
def tt(d): return np.arange(int(d * SR)) / SR
def env(d, a, dec):
    t = tt(d); return np.minimum(t / max(a, 1e-4), 1) * np.exp(-t / dec)
def noise(d): return rng.standard_normal(int(d * SR)).astype(np.float32)
def lp(x, k): return np.convolve(x, np.ones(k) / k, mode="same")
def midi(m): return 440 * 2 ** ((m - 69) / 12)
def marimba(f, d=0.45):
    t = tt(d); return (np.sin(2 * np.pi * f * t) + 0.35 * np.sin(2 * np.pi * f * 4 * t) * np.exp(-t / 0.03)) * env(d, 0.002, 0.16)
def steel(f, d=0.6):
    t = tt(d); return (np.sin(2 * np.pi * f * t) + 0.5 * np.sin(2 * np.pi * f * 2.02 * t) + 0.25 * np.sin(2 * np.pi * f * 3.1 * t)) * env(d, 0.004, 0.22)
def pluck_bass(f, d=0.4):
    t = tt(d); return (np.sin(2 * np.pi * f * t) + 0.3 * np.sin(4 * np.pi * f * t)) * env(d, 0.003, 0.18)
def whoosh(d=0.45):
    t = tt(d); return lp(noise(d), 40) * 6 * np.sin(np.pi * t / d) ** 2
def pop():
    t = tt(0.12); return np.sin(2 * np.pi * (750 * np.exp(-t * 22) + 200) * t) * np.exp(-t / 0.035)
def click():
    t = tt(0.06); x = noise(0.06); return (x - lp(x, 6)) * np.exp(-t / 0.008)
def scratch():
    d = 0.42; t = tt(d)
    f = 300 + 900 * np.sin(np.pi * np.minimum(t / 0.2, 1)) ** 2 * (t < 0.2) + 250 * (t >= 0.2) * np.exp(-(t - 0.2) * 8)
    ph = 2 * np.pi * np.cumsum(f) / SR
    saw = 2 * ((ph / (2 * np.pi)) % 1) - 1
    return (0.5 * saw + 0.6 * lp(noise(d), 4)) * np.minimum(t / 0.01, 1) * np.exp(-t / 0.2)
def boing():
    t = tt(0.5); return np.sin(2 * np.pi * (220 + 180 * np.sin(2 * np.pi * 9 * t) * np.exp(-t * 5)) * t) * np.exp(-t / 0.22)
def stamp():
    t = tt(0.35); return np.sin(2 * np.pi * (60 + 90 * np.exp(-t * 25)) * t) * np.exp(-t / 0.09) + 0.3 * lp(noise(0.35), 10) * 4 * np.exp(-t / 0.03)
def shimmer(d=1.2, base=1568):
    t = tt(d); return sum((0.5 / (k + 1)) * np.sin(2 * np.pi * base * r * t + k) * np.exp(-t / (0.45 + 0.1 * k)) for k, r in enumerate([1, 1.5, 2, 2.5, 3])) * np.minimum(t / 0.01, 1)
def bloop():
    t = tt(0.25); return np.sin(2 * np.pi * (300 + 600 * (1 - np.exp(-t * 30))) * t) * np.exp(-t / 0.06)
def splash():
    t = tt(0.9); x = lp(noise(0.9), 8) * 3; return x * np.minimum(t / 0.01, 1) * np.exp(-t / 0.25) + 0.5 * np.sin(2 * np.pi * 90 * t) * np.exp(-t / 0.12)
def riser(d=1.2):
    t = tt(d); return lp(noise(d), 18) * 6 * (t / d) ** 2 + 0.25 * np.sin(2 * np.pi * (300 + 900 * (t / d) ** 2) * t) * (t / d)
def slurp():
    d = 0.9; t = tt(d); x = lp(noise(d), 14) * 5
    return x * (0.5 + 0.5 * np.sin(2 * np.pi * (9 + 6 * t) * t)) ** 2 * np.minimum(t / 0.05, 1) * np.minimum((d - t) / 0.1, 1)
def dundun():
    return np.concatenate([pluck_bass(midi(43), 0.28) * 1.2, pluck_bass(midi(38), 0.6) * 1.2])

# ------------------------------------------------------------------ music (original): dreamy space pads + soft plucks, 96 bpm, tape-stop payoff at the end
BPM = 96; B = 60 / BPM
prog = [[50, 57, 62, 65], [46, 53, 58, 62], [43, 50, 55, 58], [45, 52, 57, 61]]   # Dm, Bb, Gm, A
music = np.zeros((2, len(T)), dtype=np.float32)
for c in range(int(DUR / (4 * B)) + 2):
    ch = prog[c % 4]; t0 = c * 4 * B; L = 4 * B + 0.8; tt0 = tt(L)
    e = np.minimum(tt0 / 0.6, 1) * np.clip((L - tt0) / 0.6, 0, 1)
    pad = sum(np.sin(2 * np.pi * midi(m) * (1 + d) * tt0) + 0.2 * np.sin(2 * np.pi * midi(m) * 2 * tt0) for m in ch for d in (-0.002, 0.002)) * e * 0.035
    place(music[0], pad, t0); place(music[1], pad, t0)
arp = [0, 2, 3, 1, 2, 3, 1, 2]
for k in range(int(DUR / (B / 2))):
    at = k * B / 2; ch = prog[int(at // (4 * B)) % 4]
    n = ch[arp[k % 8]] + 12
    sig = steel(midi(n), 0.5) * (0.07 if k % 2 == 0 else 0.05)
    place(music[k % 2], sig, at); place(music[(k + 1) % 2], sig, at + 0.18, 0.35)   # echo across the stereo field
    if k % 4 == 0:
        b = pluck_bass(midi(ch[0] - 12), 0.6) * 0.30
        place(music[0], b, at); place(music[1], b, at)
# tape-stop payoff: the bed slows down and drops in pitch after the last line
stop0 = EV["end"] + 0.15
for ch in range(2):
    x = music[ch]; i0 = int(stop0 * SR); n = len(x) - i0
    if n > 0:
        rate = np.clip(1 - (np.arange(n) / SR) / 0.9, 0, 1)
        pos = i0 + np.cumsum(rate)
        x[i0:] = np.interp(pos, np.arange(len(x)), x) * np.clip(rate * 1.4, 0, 1)
music *= np.minimum(1, T / 0.08)[None, :]

# ------------------------------------------------------------------ SFX, placed in the gaps between words where they can be loud
sfx = np.zeros((2, len(T)), dtype=np.float32)
def S(sig, at, gain, pan=0.0):
    place(sfx[0], sig, at, gain * (1 - max(pan, 0))); place(sfx[1], sig, at, gain * (1 + min(pan, 0)))
def ring(d=0.3):
    t = tt(d); return (np.sign(np.sin(2 * np.pi * 1800 * t)) * 0.25 + np.sin(2 * np.pi * 2400 * t) * 0.3) * (0.5 + 0.5 * np.sign(np.sin(2 * np.pi * 16 * t))) * np.minimum((d - t) / 0.02, 1)
def tick():
    t = tt(0.04); x = noise(0.04); return (x - lp(x, 5)) * np.exp(-t / 0.006) * 0.8 + np.sin(2 * np.pi * 2600 * t) * np.exp(-t / 0.01) * 0.4
def chime(f=1568): return steel(f, 0.9) + 0.5 * steel(f * 1.5, 0.9)
def notif(): return np.concatenate([steel(1760, 0.12), steel(2349, 0.5)])
def squish():
    t = tt(0.35); return lp(noise(0.35), 30) * 4 * np.sin(np.pi * t / 0.35) * (0.6 + 0.4 * np.sin(2 * np.pi * 14 * t))
def rimshot():
    a = np.sin(2 * np.pi * (180 + 80 * np.exp(-tt(0.15) * 30)) * tt(0.15)) * np.exp(-tt(0.15) / 0.05)
    s = lp(noise(0.2), 3) * np.exp(-tt(0.2) / 0.05); c = (noise(0.5) - lp(noise(0.5), 4)) * np.exp(-tt(0.5) / 0.15) * 0.6
    out = np.zeros(int(0.9 * SR)); out[:len(a)] += a; out[int(0.18 * SR):int(0.18 * SR) + len(s)] += s; out[int(0.36 * SR):int(0.36 * SR) + len(c)] += c
    return out
S(ring(0.32), 0.0, 0.35); S(ring(0.3), 1.95, 0.3)
S(whoosh(0.5), EV["meet"] - 0.35, 0.5); S(shimmer(1.2, 1175), EV["venus2"], 0.25)
S(whoosh(0.6), SCENES["space"] - 0.25, 0.35)
for k in range(int((EV["v3end"] - EV["n243"]) / 0.25)): S(tick(), EV["n243"] + k * 0.25, 0.22)
S(chime(1319), EV["v3end"] + 0.05, 0.4)
S(whoosh(0.8), SCENES["orbit"] - 0.2, 0.35)
S(chime(1568), EV["v4end"] + 0.05, 0.35)
S(stamp(), EV["v5end"] + 0.05, 0.6); S(shimmer(1.0, 1760), EV["v5end"] + 0.1, 0.25)
S(riser(0.6), SCENES["snail"] - 0.5, 0.2)
S(squish(), EV["v7end"] + 0.2, 0.45); S(squish(), EV["v7end"] + 0.9, 0.4); S(boing(), EV["v7end"] + 1.5, 0.4)
S(whoosh(0.5), SCENES["chat"] - 0.2, 0.4)
S(notif(), 22.45, 0.5)
for k in range(10): S(tick(), EV["v8end"] + 0.05 + k * 0.05, 0.25)
S(pop(), EV["ask"] - 0.25, 0.4)
S(rimshot(), EV["end"] + 0.2, 0.6)

# ------------------------------------------------------------------ ducked mix
blk = int(0.01 * SR)
act = (np.abs(voice) > 0.02)[: len(voice) // blk * blk].reshape(-1, blk).max(axis=1).astype(float)
gate = np.zeros_like(act); gv = 0.0
for i, a in enumerate(act):
    gv += (a - gv) * (1 - np.exp(-0.01 / (0.06 if a > gv else 0.45))); gate[i] = gv
gate = np.pad(np.repeat(gate, blk), (0, len(voice) - len(act) * blk))
voiced = voice[np.abs(voice) > 0.02]; v_rms = np.sqrt(np.mean(voiced ** 2))
music *= v_rms * 10 ** (-13 / 20) / np.sqrt(np.mean(music ** 2))   # about 13 dB under the voice in pauses
music *= (1 - gate * (1 - 10 ** (-7 / 20)))[None, :]              # 7 dB more under speech: ~20 dB below the narration
sfx *= (np.max(np.abs(voice)) * 10 ** (-14 / 20)) / np.max(np.abs(sfx))
sfx *= (1 - gate * 0.45)[None, :]
mix = np.stack([voice, voice]) + music + sfx
mix = mix / np.max(np.abs(mix)) * 0.89
m_sp = music[:, gate > 0.9]
print(f"music under speech: {20*np.log10(np.sqrt(np.mean(m_sp**2))/v_rms):.1f} dB re voice")
def write(path, x):
    pcm = (np.clip(x, -1, 1).T * 32767).astype(np.int16)
    with wave.open(path, "wb") as w:
        w.setnchannels(x.shape[0]); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
def loudnorm(src, dst, target=-16):
    meas = subprocess.run(["ffmpeg", "-hide_banner", "-i", src, "-af", f"loudnorm=I={target}:TP=-1.5:LRA=9:print_format=json", "-f", "null", "-"], capture_output=True, text=True).stderr
    j = json.loads(meas[meas.rindex("{"):])
    af = f"loudnorm=I={target}:TP=-1.5:LRA=9:measured_I={j['input_i']}:measured_TP={j['input_tp']}:measured_LRA={j['input_lra']}:measured_thresh={j['input_thresh']}:offset={j['target_offset']}:linear=true"
    subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", src, "-af", af + ",apad=whole_dur=30,atrim=0:30", "-ar", "48000", dst], check=True)
write(f"{A}/mix_raw.wav", mix); loudnorm(f"{A}/mix_raw.wav", f"{A}/mix.wav")
write(f"{A}/voice_raw.wav", voice[None, :] / np.max(np.abs(voice)) * 0.89); loudnorm(f"{A}/voice_raw.wav", f"{OUT}/episode_03_voiceover.wav")
os.remove(f"{A}/mix_raw.wav"); os.remove(f"{A}/voice_raw.wav")
print("done", json.dumps(EV))
