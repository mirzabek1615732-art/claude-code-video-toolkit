"""Episode 5 audio: narration timeline, original mystery-lab music, synthesized SFX, ducked mix (-16 LUFS),
Uzbek SRT, voice-only WAV and src/timeline.json.  Run from episode_05_source/:  python3 tools/build_audio.py"""
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

# ------------------------------------------------------------------ narration (English) and its Uzbek translation; s1/s2 are the student's voice
SCRIPT = {
    "n1": "Wait...",
    "n2": "Your brain is hiding something from you.",
    "n3": "Your NOSE!",
    "n4": "It's in your field of vision... but your brain usually ignores it.",
    "n5": "Seriously, try noticing it right now.",
    "n6": "See that blurry shape?",
    "n7": "Yep, that's your nose!",
    "n8": "And now... you can't unsee it!",
    "s1": "I can't unsee it!",
    "n9": "We say that when we notice something, and we can't stop noticing it.",
    "n10": "Your brain was trying to help.",
    "s2": "Too late. Thanks, brain!",
}
START = {"n1": 0.25, "n2": 0.95, "n3": 3.75, "n4": 5.2, "n5": 10.2, "n6": 13.2, "n7": 14.9, "n8": 17.2, "s1": 19.55, "n9": 21.0, "n10": 25.15, "s2": 27.1}
UZ = [
    ("n1", 0, "To‘xtang..."),
    ("n2", 0, "Miyangiz sizdan nimanidir yashiryapti."),
    ("n3", 0, "Burningizni!"),
    ("n4", 0, "U ko‘rish maydoningizda turadi..."),
    ("n4", 6, "lekin miyangiz odatda unga e’tibor bermaydi."),
    ("n5", 0, "Rostdan, hozir unga e’tibor berib ko‘ring."),
    ("n6", 0, "Ana u xira shaklni ko‘ryapsizmi?"),
    ("n7", 0, "Ha, bu sizning burningiz!"),
    ("n8", 0, "Endi esa... uni ko‘rmaganga ololmaysiz!"),
    ("s1", 0, "“Endi buni ko‘rmaganga ololmayman!”"),
    ("n9", 0, "Biror narsani payqab, keyin uni payqamay"),
    ("n9", 7, "qololmaganimizda shunday deymiz."),
    ("n10", 0, "Miyangiz sizga yordam bermoqchi edi."),
    ("s2", 0, "Endi kech! Rahmat, miyajon!"),
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
    "wait": wt("n1", "wait"), "brain2": wt("n2", "brain"), "hiding": wt("n2", "hiding"), "n2end": clips["n2"]["end"],
    "nose3": wt("n3", "nose"), "n3end": clips["n3"]["end"],
    "field": wt("n4", "field"), "vision": wt("n4", "vision"), "but4": wt("n4", "but"), "ignores": wt("n4", "ignores"), "n4end": clips["n4"]["end"],
    "seriously": wt("n5", "seriously"), "try": wt("n5", "try"), "now": wt("n5", "now"), "n5end": clips["n5"]["end"],
    "see": wt("n6", "see"), "blurry": wt("n6", "blurry"), "n6end": clips["n6"]["end"], "yep": wt("n7", "yep"), "nose7": wt("n7", "nose"), "n7end": clips["n7"]["end"],
    "and8": wt("n8", "and"), "cant8": wt("n8", "can't"), "unsee8": wt("n8", "unsee"), "n8end": clips["n8"]["end"],
    "i1": wt("s1", "i"), "cant1": wt("s1", "can't"), "unsee1": wt("s1", "unsee"), "it1": wt("s1", "it!"), "s1end": clips["s1"]["end"],
    "say9": wt("n9", "say"), "notice9": wt("n9", "notice"), "stop9": wt("n9", "stop"), "n9end": clips["n9"]["end"],
    "help": wt("n10", "help"), "n10end": clips["n10"]["end"], "too": wt("s2", "too"), "thanks": wt("s2", "thanks"), "brainS": wt("s2", "brain"), "end": clips["s2"]["end"],
}
EV = {k: round(v, 3) for k, v in EV.items()}
SCENES = {"hook": 0.0, "reveal": 3.45, "pov": 5.05, "try": 9.95, "phrase": 16.95, "lab": 24.85}
json.dump({"fps": 30, "dur": DUR, "clips": clips, "words": words, "uz": uz, "ev": EV, "scenes": SCENES}, open(f"{ROOT}/src/timeline.json", "w"), indent=1)

def ts(x):
    h, r = divmod(max(0, x), 3600); m, s = divmod(r, 60)
    return f"{int(h):02d}:{int(m):02d}:{int(s):02d},{int(round((s - int(s)) * 1000)) % 1000:03d}"
open(f"{OUT}/episode_05_uzbek_subtitles.srt", "w").write("\n".join(f"{i + 1}\n{ts(u['s'])} --> {ts(u['e'])}\n{u['text']}\n" for i, u in enumerate(uz)))
with open(f"{OUT}/episode_05_script_translation.txt", "w") as fh:
    fh.write("EPISODE 5: YOUR BRAIN IS HIDING SOMETHING!  (Bakhriddinov School)\n\nTarget expression: I CAN'T UNSEE IT!\n  Meaning: once you have noticed something (strange, funny or awkward), you can't stop noticing it.\n  Uzbek: Endi buni ko‘rmaganga ololmayman!\n  When to say it: a friend points out something odd in a picture, a logo or a face you can't stop seeing, and you say \"I can't unsee it!\"\n\nNARRATION (English) with Uzbek translation and timing. s1 and s2 are the student's own voice.\n")
    for name, text in SCRIPT.items():
        c = clips[name]
        fh.write(f"\n[{c['start']:05.2f}-{c['end']:05.2f}] {'STUDENT: ' if name.startswith('s') else ''}{text}\n")
        for u in [x for x, (seg, _, _) in zip(uz, UZ) if seg == name]:
            fh.write(f"    UZ {u['s']:05.2f}-{u['e']:05.2f}  {u['text']}\n")
    fh.write("\nFact check: your nose sits inside your field of view, but you normally don't notice it. Your eyes still see it; the brain treats this constant, unchanging detail as unimportant (selective attention and adaptation to unchanging input), so it rarely reaches awareness. Paying attention to it makes it noticeable again, and how much of it you see differs from person to person. The video shows the brain 'hiding' it only as a metaphor.\n")

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

# ------------------------------------------------------------------ music (original): mysterious electric piano + vibraphone + soft pulse, 100 bpm
BPM = 100; B = 60 / BPM
def epiano(f, d=0.9):
    t = tt(d); return (np.sin(2 * np.pi * f * t + 0.8 * np.sin(2 * np.pi * f * 2 * t) * np.exp(-t / 0.4))) * np.exp(-t / 0.5) * np.minimum(t / 0.004, 1)
def vibe(f, d=0.8):
    t = tt(d); return (np.sin(2 * np.pi * f * t) + 0.2 * np.sin(2 * np.pi * f * 4 * t) * np.exp(-t / 0.1)) * np.exp(-t / 0.35) * (1 + 0.25 * np.sin(2 * np.pi * 5 * t))
prog = [[50, 53, 57, 60], [46, 50, 53, 57], [43, 46, 50, 53], [45, 49, 52, 55]]   # Dm7, Bbmaj7, Gm7, A7
music = np.zeros((2, len(T)), dtype=np.float32)
for c in range(int(DUR / (4 * B)) + 1):
    ch = prog[c % 4]; t0 = c * 4 * B
    for k, off in enumerate([0, 1.5, 2.5]):
        chord = sum(epiano(midi(m + 12), 1.2) for m in ch) * (0.05 if k == 0 else 0.035)
        place(music[0], chord, t0 + off * B); place(music[1], chord, t0 + off * B + 0.01)
    b = pluck_bass(midi(ch[0] - 12), 0.8) * 0.3
    for off in (0, 2):
        place(music[0], b, t0 + off * B); place(music[1], b, t0 + off * B)
mel = [74, 77, 76, 72, 74, 69, 72, 74]
for k in range(int(DUR / B)):
    if k % 2 == 1:
        sig = vibe(midi(mel[(k // 2) % len(mel)])) * 0.07
        place(music[0], sig, k * B + 0.02, 0.9); place(music[1], sig, k * B + 0.2, 0.6)
    h = noise(0.03) * np.exp(-tt(0.03) / 0.006) * 0.035
    place(music[k % 2], h, k * B + B / 2)
gate = np.ones(len(T))
for a, b in [(EV["nose3"] - 0.4, EV["n3end"] + 0.35), (EV["unsee1"] - 0.6, EV["s1end"] + 0.2), (EV["end"] + 0.1, DUR)]:
    gate[(T > a) & (T < b)] = 0.15
gate = np.convolve(gate, np.ones(int(0.08 * SR)) / int(0.08 * SR), mode="same")
music *= gate[None, :] * np.minimum(1, T / 0.3)[None, :]

# ------------------------------------------------------------------ SFX, in the gaps between words
sfx = np.zeros((2, len(T)), dtype=np.float32)
def S(sig, at, gain, pan=0.0):
    place(sfx[0], sig, at, gain * (1 - max(pan, 0))); place(sfx[1], sig, at, gain * (1 + min(pan, 0)))
def bleep(f=1320, d=0.12):
    t = tt(d); return np.sign(np.sin(2 * np.pi * f * t)) * 0.3 * np.exp(-t / 0.05) + np.sin(2 * np.pi * f * t) * 0.4 * np.exp(-t / 0.06)
def click():
    t = tt(0.05); x = noise(0.05); return (x - lp(x, 4)) * np.exp(-t / 0.006) + np.sin(2 * np.pi * 900 * t) * np.exp(-t / 0.01) * 0.5
def curtain():
    d = 0.8; t = tt(d); return lp(noise(d), 25) * 5 * np.sin(np.pi * t / d) ** 1.5
def tada():
    return np.concatenate([steel(midi(72), 0.14) * 0.8, steel(midi(76), 0.14) * 0.8, steel(midi(79), 0.8)])
def facepalm():
    t = tt(0.18); x = noise(0.18); return (x - lp(x, 3)) * np.exp(-t / 0.025) + np.sin(2 * np.pi * 160 * t) * np.exp(-t / 0.04) * 0.6
def womp():
    out = []
    for f0, f1, d in ((330, 311, 0.3), (294, 220, 0.8)):
        t = tt(d); f = np.linspace(f0, f1, len(t)); ph = 2 * np.pi * np.cumsum(f) / SR
        out.append(sum((0.5 / k) * np.sin(k * ph) for k in range(1, 5)) * np.minimum(t / 0.02, 1) * np.minimum((d - t) / 0.05, 1))
    return np.concatenate(out)
for k in range(3): S(bleep(1100 + 220 * k), 0.02 + k * 0.09, 0.3, (-0.4, 0, 0.4)[k])
S(bleep(880, 0.25), 0.72, 0.28)
S(click(), EV["n2end"] + 0.08, 0.5); S(click(), EV["n2end"] + 0.22, 0.4)
S(curtain(), SCENES["reveal"] - 0.25, 0.4); S(tada(), EV["nose3"] - 0.35, 0.35)
S(whoosh(0.5), SCENES["pov"] - 0.2, 0.35)
S(bleep(660, 0.2), EV["n4end"] + 0.1, 0.25); S(shimmer(0.8, 1319), EV["n4end"] + 0.4, 0.2)
S(whoosh(0.5), SCENES["try"] - 0.2, 0.3)
S(boing(), EV["n6end"] + 0.05, 0.4)
S(pop(), EV["n7end"] + 0.1, 0.35)
S(whoosh(0.4), EV["n8end"] + 0.05, 0.3)
S(stamp(), EV["s1end"] + 0.05, 0.45); S(shimmer(1.0, 1760), EV["s1end"] + 0.1, 0.22)
S(bleep(1760, 0.1), EV["n9end"] + 0.05, 0.3)
S(whoosh(0.5), SCENES["lab"] - 0.25, 0.35)
for k in range(5): S(click(), EV["n10end"] + 0.05 + k * 0.1, 0.45, (-0.2, 0.2, -0.2, 0.2, 0)[k])
S(facepalm(), EV["end"] + 0.25, 0.5); S(womp(), EV["end"] + 0.35, 0.4)

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
write(f"{A}/voice_raw.wav", voice[None, :] / np.max(np.abs(voice)) * 0.89); loudnorm(f"{A}/voice_raw.wav", f"{OUT}/episode_05_english_voiceover.wav")
os.remove(f"{A}/mix_raw.wav"); os.remove(f"{A}/voice_raw.wav")
print("done", json.dumps(EV))
