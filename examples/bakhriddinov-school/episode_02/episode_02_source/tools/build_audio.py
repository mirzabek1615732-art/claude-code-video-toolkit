"""Episode 2 audio: narration timeline, original tropical music, synthesized SFX, ducked mix (-16 LUFS),
Uzbek SRT, voice-only WAV and src/timeline.json.  Run from episode_02_source/:  python3 tools/build_audio.py"""
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
    "d1": "Wait! Flamingos aren't born pink.",
    "d2": "They're born gray!",
    "d3": "So, who painted them?",
    "d4": "Nobody. Their food did!",
    "d5": "Tiny shrimp and algae contain special pigments.",
    "d6": "Over time, these help turn flamingos pink.",
    "d7": "That's why we say...",
    "d7b": "You are what you eat!",
    "d8": "It means your diet affects your body.",
    "d9": "So... that friend who drinks pink smoothies every day?",
    "d10": "Maybe keep an eye on them!",
}
START = {"d1": 0.35, "d2": 3.35, "d3": 5.0, "d4": 7.2, "d5": 9.6, "d6": 13.0, "d7": 16.55, "d7b": 18.15, "d8": 20.6, "d9": 24.9, "d10": 27.95}
# Uzbek subtitles, phrase level: (clip, index of the English word the phrase starts on, text)
UZ = [
    ("d1", 0, "Shoshma!"),
    ("d1", 1, "Flamingolar pushti rangda tug‘ilmaydi."),
    ("d2", 0, "Ular kulrang bo‘lib tug‘iladi!"),
    ("d3", 0, "Unda ularni kim bo‘yagan?"),
    ("d4", 0, "Hech kim."),
    ("d4", 1, "Ularni o‘z ovqati bo‘yagan!"),
    ("d5", 0, "Mitti krevetkalar va suvo‘tlarda"),
    ("d5", 4, "maxsus pigmentlar bor."),
    ("d6", 0, "Vaqt o‘tishi bilan"),
    ("d6", 2, "ular flamingolarni asta-sekin pushti rangga bo‘yaydi."),
    ("d7", 0, "Shuning uchun shunday deymiz:"),
    ("d7b", 0, "“Nima yesang, o‘sha bo‘lasan!”"),
    ("d8", 0, "Ya’ni yegan ovqating tanangga ta’sir qiladi."),
    ("d9", 0, "Xo‘sh... har kuni pushti smuzi ichadigan"),
    ("d9", 6, "o‘sha do‘sting-chi?"),
    ("d10", 0, "Unga ko‘z-quloq bo‘lib tur!"),
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
def wi(seg, i, edge="s"):
    return [w for w in words if w["seg"] == seg][i][edge]

uz = []
for i, (seg, at, text) in enumerate(UZ):
    s = wi(seg, at)
    nxt = UZ[i + 1] if i + 1 < len(UZ) else None
    e = wi(nxt[0], nxt[1]) - 0.09 if nxt and nxt[0] == seg else min(wi(seg, -1, "e") + 0.45, (wi(nxt[0], nxt[1]) - 0.06) if nxt else DUR)
    uz.append({"s": round(s - 0.06, 3), "e": round(e, 3), "text": text})

EV = {
    "wait": wt("d1", "wait"), "born1": wt("d1", "born"), "pink1": wt("d1", "pink"), "pink1e": wt("d1", "pink", 0, "e"),
    "gray": wt("d2", "gray"), "painted": wt("d3", "painted"), "nobody": wt("d4", "nobody"), "food": wt("d4", "food"),
    "dive": 8.75, "shrimp": wt("d5", "shrimp"), "algae": wt("d5", "algae"), "pigments": wt("d5", "pigments"),
    "overtime": wt("d6", "over"), "turn": wt("d6", "turn"), "pink6": wt("d6", "pink"),
    "say": wt("d7", "say"), "you1": wt("d7b", "you", 0), "are": wt("d7b", "are"), "what": wt("d7b", "what"), "you2": wt("d7b", "you", 1), "eat": wt("d7b", "eat"),
    "means": wt("d8", "means"), "diet": wt("d8", "diet"), "body": wt("d8", "body"),
    "friend": wt("d9", "friend"), "smoothies": wt("d9", "smoothies"), "maybe": wt("d10", "maybe"), "eye": wt("d10", "eye"), "end": clips["d10"]["end"],
}
EV = {k: round(v, 3) for k, v in EV.items()}
SCENES = {"hook": 0.0, "mirror": 3.2, "water": 8.75, "lapse": 15.85, "compare": 20.45, "friend": 24.75}
json.dump({"fps": 30, "dur": DUR, "clips": clips, "words": words, "uz": uz, "ev": EV, "scenes": SCENES}, open(f"{ROOT}/src/timeline.json", "w"), indent=1)

def ts(x):
    h, r = divmod(max(0, x), 3600); m, s = divmod(r, 60)
    return f"{int(h):02d}:{int(m):02d}:{int(s):02d},{int(round((s - int(s)) * 1000)) % 1000:03d}"
open(f"{OUT}/episode_02_uzbek_subtitles.srt", "w").write("\n".join(f"{i + 1}\n{ts(u['s'])} --> {ts(u['e'])}\n{u['text']}\n" for i, u in enumerate(uz)))
with open(f"{OUT}/episode_02_script_and_translation.txt", "w") as fh:
    fh.write("EPISODE 2: WHY ARE FLAMINGOS PINK?  (Bakhriddinov School)\n\nTarget expression: YOU ARE WHAT YOU EAT\n  Meaning: the food you eat affects your body and health.\n  Uzbek: Yegan ovqating tanang va sog‘lig‘ingga ta’sir qiladi.\nSecondary word: PIGMENT\n  Uzbek: Rang beruvchi modda.\n\nNARRATION (English) with Uzbek translation and timing\n")
    for name, text in SCRIPT.items():
        c = clips[name]
        fh.write(f"\n[{c['start']:05.2f}-{c['end']:05.2f}] {text}\n")
        for u in [x for x, (seg, _, _) in zip(uz, UZ) if seg == name]:
            fh.write(f"    UZ {u['s']:05.2f}-{u['e']:05.2f}  {u['text']}\n")
    fh.write("\nFact check: flamingo chicks hatch grayish-white; carotenoid pigments from algae and small crustaceans in their diet give adults their pink colour over months to years. The smoothie line is a joke: drinks do not turn people pink.\n")

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

# ------------------------------------------------------------------ music: tropical marimba + steel drum, 112 bpm (original)
BPM = 112; B = 60 / BPM
prog = [[60, 64, 67], [57, 60, 64], [53, 57, 60], [55, 59, 62]]   # C, Am, F, G
music = np.zeros((2, len(T)), dtype=np.float32)
pattern = [0, 2, 1, 2, 0, 1, 2, 1]                                 # index into chord tones, eighth notes
for k in range(int(DUR / (B / 2))):
    at = k * B / 2; ch = prog[int(at // (4 * B)) % 4]
    n = ch[pattern[k % 8]] + 12
    if k % 8 in (0, 3, 6) or k % 2 == 0:
        sig = marimba(midi(n)) * (0.16 if k % 2 == 0 else 0.11)
        place(music[0], sig, at, 1.0 if k % 2 else 0.6); place(music[1], sig, at + 0.01, 0.6 if k % 2 else 1.0)
    if k % 2 == 0:
        bass = pluck_bass(midi(ch[0] - 24)) * 0.32 if (k // 2) % 2 == 0 else pluck_bass(midi(ch[2] - 24)) * 0.22
        place(music[0], bass, at); place(music[1], bass, at)
    h = noise(0.035) * np.exp(-tt(0.035) / 0.008) * (0.05 if k % 2 else 0.03)
    place(music[k % 2], h, at)
melody = [72, 74, 76, 79, 76, 74, 72, 69, 72, 74, 76, 74, 72, 67, 69, 72]
for k in range(int(DUR / (2 * B))):
    at = k * 2 * B + B * 0.5
    sig = steel(midi(melody[k % len(melody)])) * 0.10
    place(music[0], sig, at, 0.8); place(music[1], sig, at + 0.015, 0.8)
# record-scratch stop: the bed cuts out for a beat, then comes back
cut = EV["wait"]
g = np.ones(len(T)); g[(T > cut + 0.02) & (T < cut + 0.75)] = 0.0
ramp = (T >= cut + 0.75) & (T < cut + 1.1); g[ramp] = (T[ramp] - cut - 0.75) / 0.35
music *= g[None, :]
music *= np.minimum(1, (DUR - T) / 0.9)[None, :] * np.minimum(1, T / 0.08)[None, :]

# ------------------------------------------------------------------ SFX at story beats
sfx = np.zeros((2, len(T)), dtype=np.float32)
def S(sig, at, gain, pan=0.0):
    place(sfx[0], sig, at, gain * (1 - max(pan, 0))); place(sfx[1], sig, at, gain * (1 + min(pan, 0)))
for k, at in enumerate([0.05, 0.22, 0.31]): S(click(), at, 0.5, (-0.5, 0.4, -0.1)[k])     # paparazzi flashes
S(scratch(), cut, 0.7)
S(pop(), EV["born1"], 0.4); S(stamp(), EV["pink1e"] - 0.05, 0.6)
S(whoosh(0.45), SCENES["mirror"] - 0.2, 0.45)
S(boing(), EV["gray"] + 0.12, 0.45)
S(pop(), EV["painted"], 0.35); S(stamp(), EV["nobody"], 0.4); S(shimmer(0.9, 1760), EV["food"], 0.25)
S(splash(), EV["dive"] - 0.05, 0.55); S(whoosh(0.6), EV["dive"] - 0.3, 0.3)
for k in range(5): S(bloop(), EV["shrimp"] + 0.3 * k, 0.22, (-0.5, 0.3, -0.2, 0.5, 0)[k])
S(shimmer(1.3, 1319), EV["pigments"], 0.28); S(pop(), EV["pigments"] + 0.05, 0.35)
S(riser(1.3), EV["overtime"], 0.18); S(shimmer(1.0, 1568), EV["pink6"], 0.22)
S(riser(0.9), SCENES["lapse"] - 0.2, 0.15)
for k in ("you1", "are", "what", "you2"): S(pop(), EV[k], 0.3)
S(stamp(), EV["eat"], 0.55); S(shimmer(1.4, 2093), EV["eat"] + 0.05, 0.25)
S(whoosh(0.5), SCENES["compare"] - 0.15, 0.4)
S(pop(), EV["diet"], 0.3); S(pop(), EV["body"], 0.3)
S(boing(), 22.7, 0.45); S(shimmer(0.8, 1760), 23.4, 0.22); S(stamp(), 23.9, 0.4)
S(whoosh(0.6), SCENES["friend"] - 0.25, 0.4)
S(slurp(), EV["friend"] + 0.1, 0.4); S(slurp(), EV["smoothies"] + 0.25, 0.32)
S(whoosh(0.3), EV["eye"] - 0.1, 0.25)
S(dundun(), EV["end"] + 0.05, 0.6); S(boing(), EV["end"] + 0.55, 0.4)

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
write(f"{A}/voice_raw.wav", voice[None, :] / np.max(np.abs(voice)) * 0.89); loudnorm(f"{A}/voice_raw.wav", f"{OUT}/episode_02_voiceover.wav")
os.remove(f"{A}/mix_raw.wav"); os.remove(f"{A}/voice_raw.wav")
print("done", json.dumps(EV))
