"""Episode 4 audio: narration timeline, original courtroom music, synthesized SFX, ducked mix (-16 LUFS),
Uzbek SRT, voice-only WAV and src/timeline.json.  Run from episode_04_source/:  python3 tools/build_audio.py"""
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
    "w1": "Quick quiz!",
    "w2": "Which one's a berry: the banana, or the strawberry?",
    "w3": "Plot twist!",
    "w4": "The banana is a berry, but the strawberry isn't!",
    "w5": "Botanically, a true berry develops from one flower's single ovary.",
    "w6": "Strawberries develop differently.",
    "w7": "Those tiny dots on the outside?",
    "w8": "They're actually little fruits!",
    "w9": "Plot twist means an unexpected surprise.",
    "w10": "Imagine telling a strawberry it's not a berry.",
    "w11": "Its reaction?",
    "w12": "But it's literally in my NAME!",
}
START = {"w1": 0.30, "w2": 1.40, "w3": 5.40, "w4": 6.55, "w5": 9.45, "w6": 13.95, "w7": 15.95, "w8": 17.95, "w9": 20.05, "w10": 23.40, "w11": 26.10, "w12": 27.25}
UZ = [
    ("w1", 0, "Tezkor savol!"),
    ("w2", 0, "Qaysi biri rezavor meva: banan yoki qulupnay?"),
    ("w3", 0, "Kutilmagan burilish!"),
    ("w4", 0, "Banan rezavor meva hisoblanadi, qulupnay esa yo‘q!"),
    ("w5", 0, "Botanikada haqiqiy rezavor meva"),
    ("w5", 4, "bitta gulning yagona tugunchasidan rivojlanadi."),
    ("w6", 0, "Qulupnay esa boshqacha rivojlanadi."),
    ("w7", 0, "Uning tashqi yuzasidagi mayda nuqtalar-chi?"),
    ("w8", 0, "Aslida ular mitti mevachalar!"),
    ("w9", 0, "“Plot twist” degani kutilmagan burilish."),
    ("w10", 0, "Tasavvur qiling: qulupnayga u rezavor emasligini aytdingiz."),
    ("w11", 0, "Uning javobi-chi?"),
    ("w12", 0, "Axir nomimda “BERRY” so‘zi turibdi-ku!"),
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
    "quiz": wt("w1", "quick"), "w1end": clips["w1"]["end"], "which": wt("w2", "which"), "banana2": wt("w2", "banana"), "straw2": wt("w2", "strawberry"), "w2end": clips["w2"]["end"],
    "plot": wt("w3", "plot"), "twist": wt("w3", "twist"), "w3end": clips["w3"]["end"],
    "banana4": wt("w4", "banana"), "but4": wt("w4", "but"), "straw4": wt("w4", "strawberry"), "w4end": clips["w4"]["end"],
    "botan": wt("w5", "botanically"), "flower": wt("w5", "flower"), "ovary": wt("w5", "ovary"), "w5end": clips["w5"]["end"],
    "straw6": wt("w6", "strawberries"), "w6end": clips["w6"]["end"], "dots": wt("w7", "dots"), "w7end": clips["w7"]["end"],
    "fruits": wt("w8", "fruits"), "w8end": clips["w8"]["end"],
    "plot9": wt("w9", "plot"), "means": wt("w9", "means"), "unexpected": wt("w9", "unexpected"), "w9end": clips["w9"]["end"],
    "imagine": wt("w10", "imagine"), "notberry": wt("w10", "not"), "w10end": clips["w10"]["end"],
    "reaction": wt("w11", "reaction"), "w11end": clips["w11"]["end"],
    "but12": wt("w12", "but"), "name": wt("w12", "name"), "end": clips["w12"]["end"],
}
EV = {k: round(v, 3) for k, v in EV.items()}
SCENES = {"court": 0.0, "science": 9.2, "verdict": 19.65, "reaction": 23.2}
json.dump({"fps": 30, "dur": DUR, "clips": clips, "words": words, "uz": uz, "ev": EV, "scenes": SCENES}, open(f"{ROOT}/src/timeline.json", "w"), indent=1)

def ts(x):
    h, r = divmod(max(0, x), 3600); m, s = divmod(r, 60)
    return f"{int(h):02d}:{int(m):02d}:{int(s):02d},{int(round((s - int(s)) * 1000)) % 1000:03d}"
open(f"{OUT}/episode_04_uzbek_subtitles.srt", "w").write("\n".join(f"{i + 1}\n{ts(u['s'])} --> {ts(u['e'])}\n{u['text']}\n" for i, u in enumerate(uz)))
with open(f"{OUT}/episode_04_script_and_translation.txt", "w") as fh:
    fh.write("EPISODE 4: THE GREAT BERRY TRIAL!  (Bakhriddinov School)\n\nTarget expression: PLOT TWIST!\n  Meaning: an unexpected change or surprising development in a story or situation.\n  Uzbek: Kutilmagan burilish!\n\nNARRATION (English) with Uzbek translation and timing. The last line is the strawberry's own voice.\n")
    for name, text in SCRIPT.items():
        c = clips[name]
        fh.write(f"\n[{c['start']:05.2f}-{c['end']:05.2f}] {text}\n")
        for u in [x for x, (seg, _, _) in zip(uz, UZ) if seg == name]:
            fh.write(f"    UZ {u['s']:05.2f}-{u['e']:05.2f}  {u['text']}\n")
    fh.write("\nFact check: a botanical berry develops from the single ovary of one flower and has fleshy walls with seeds inside. Bananas fit this (cultivated bananas have tiny undeveloped seeds). Strawberries are aggregate accessory fruits: the red flesh grows from the swollen flower base (the receptacle), and each 'seed' on the outside is an achene, a tiny dry fruit with one seed inside.\n")

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

# ------------------------------------------------------------------ music (original): sneaky courtroom pizzicato, 104 bpm; it stops for the big reveals
BPM = 104; B = 60 / BPM
def pizz(f, d=0.22):
    t = tt(d); return (np.sin(2 * np.pi * f * t) + 0.45 * np.sin(4 * np.pi * f * t) + 0.2 * np.sin(6 * np.pi * f * t)) * np.exp(-t / 0.07) * np.minimum(t / 0.003, 1)
def bassoon(f, d=0.35):
    t = tt(d); x = sum((0.6 / k) * np.sin(2 * np.pi * f * k * t) for k in range(1, 6)); return x * np.minimum(t / 0.02, 1) * np.exp(-t / 0.25)
prog = [[57, 60, 64], [53, 57, 60], [55, 59, 62], [52, 56, 59]]   # Am, F, G, E: mock-serious
music = np.zeros((2, len(T)), dtype=np.float32)
patt = [0, None, 2, 1, None, 2, 0, 1]
for k in range(int(DUR / (B / 2))):
    at = k * B / 2; ch = prog[int(at // (4 * B)) % 4]
    if patt[k % 8] is not None:
        sig = pizz(midi(ch[patt[k % 8]] + 12)) * 0.16
        place(music[k % 2], sig, at); place(music[(k + 1) % 2], sig, at + 0.01, 0.6)
    if k % 4 == 0: b = bassoon(midi(ch[0] - 12)) * 0.22; place(music[0], b, at); place(music[1], b, at)
    if k % 4 == 2: b = bassoon(midi(ch[2] - 12)) * 0.16; place(music[0], b, at); place(music[1], b, at)
gate = np.ones(len(T))
for a, b in [(EV["plot"] - 0.35, EV["w3end"] + 0.35), (EV["name"] + 0.4, DUR)]:
    gate[(T > a) & (T < b)] = 0
gate = np.convolve(gate, np.ones(int(0.06 * SR)) / int(0.06 * SR), mode="same")
music *= gate[None, :] * np.minimum(1, T / 0.08)[None, :]

# ------------------------------------------------------------------ SFX, in the gaps between words
sfx = np.zeros((2, len(T)), dtype=np.float32)
def S(sig, at, gain, pan=0.0):
    place(sfx[0], sig, at, gain * (1 - max(pan, 0))); place(sfx[1], sig, at, gain * (1 + min(pan, 0)))
def gavel():
    t = tt(0.4); return np.sin(2 * np.pi * (140 + 160 * np.exp(-t * 40)) * t) * np.exp(-t / 0.06) + (noise(0.4) - lp(noise(0.4), 4)) * np.exp(-t / 0.012) * 0.8
def gasp():
    d = 0.7; t = tt(d); return lp(noise(d), 6) * 3 * np.sin(np.pi * np.minimum(t / 0.5, 1)) ** 2 * np.exp(-np.maximum(t - 0.5, 0) * 10)
def stab():
    d = 0.9; t = tt(d); x = sum(np.sin(2 * np.pi * midi(m) * t) + 0.4 * np.sin(4 * np.pi * midi(m) * t) for m in (45, 52, 57, 60, 64)); return x * np.minimum(t / 0.01, 1) * np.exp(-t / 0.3) * 0.5
def clink(f=2600): t = tt(0.3); return (np.sin(2 * np.pi * f * t) + 0.5 * np.sin(2 * np.pi * f * 1.5 * t)) * np.exp(-t / 0.07)
def slurp():
    d = 0.6; t = tt(d); return lp(noise(d), 14) * 5 * (0.5 + 0.5 * np.sin(2 * np.pi * (10 + 8 * t) * t)) ** 2 * np.minimum(t / 0.05, 1) * np.minimum((d - t) / 0.08, 1)
def wahwah():
    out = []
    for f0, f1, d in ((392, 370, 0.35), (370, 349, 0.35), (349, 262, 0.9)):
        t = tt(d); f = np.linspace(f0, f1, len(t)); ph = 2 * np.pi * np.cumsum(f) / SR
        out.append(sum((0.5 / k) * np.sin(k * ph) for k in range(1, 6)) * (1 + 0.15 * np.sin(2 * np.pi * 6 * t)) * np.minimum(t / 0.03, 1) * np.minimum((d - t) / 0.05, 1))
    return np.concatenate(out)
def slap(): t = tt(0.15); x = noise(0.15); return (x - lp(x, 3)) * np.exp(-t / 0.02) * 0.9
for k in range(3): S(pop() * 0.6, 0.05 + k * 0.12, 0.25, (-0.3, 0.3, -0.3)[k])
S(gavel(), EV["w1end"] + 0.03, 0.6); S(whoosh(0.3), EV["w1end"] - 0.15, 0.3)
S(stab(), EV["plot"] - 0.3, 0.55)
S(gasp(), EV["w3end"] + 0.02, 0.45); S(clink(), EV["w3end"] + 0.15, 0.3)
S(whoosh(0.6), SCENES["science"] - 0.25, 0.4)
S(pop(), EV["flower"], 0.25); S(shimmer(0.8, 1568), EV["ovary"] + 0.2, 0.2)
S(whoosh(0.5), EV["w5end"] + 0.05, 0.3)
for k in range(6): S(pop(), EV["w7end"] + 0.02 + k * 0.03, 0.18, (-0.5, 0.5, -0.2, 0.2, 0, 0.3)[k])
S(shimmer(0.7, 1760), EV["fruits"], 0.18)
S(gavel(), SCENES["verdict"] - 0.05, 0.6); S(stamp(), SCENES["verdict"] + 0.25, 0.4)
S(slurp(), EV["w9end"] + 0.03, 0.4)
S(stamp() * 0.6, EV["w11end"] + 0.03, 0.4)
S(wahwah(), EV["end"] + 0.12, 0.45); S(slap(), EV["end"] + 0.55, 0.5)

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
write(f"{A}/voice_raw.wav", voice[None, :] / np.max(np.abs(voice)) * 0.89); loudnorm(f"{A}/voice_raw.wav", f"{OUT}/episode_04_english_voiceover.wav")
os.remove(f"{A}/mix_raw.wav"); os.remove(f"{A}/voice_raw.wav")
print("done", json.dumps(EV))
