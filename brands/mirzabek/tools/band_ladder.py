#!/usr/bin/env python3
"""Band ladder overlay for Mirzabek's Reels.

Draws the question, five level cards, the answers filling in word by word and the end screen over a video (or over a
stand-in background for a layout preview), adds the sound effects, and masters the loudness.

  python3 band_ladder.py --config ../scripts/band_ladder_01.json --out out.mp4 --standin
  python3 band_ladder.py --config ../scripts/band_ladder_01.json --video graded.mp4 --out final.mp4 --master

House style (from the intro reel): black label boxes with white uppercase text; the active label flips to white with
black text. Times in the config are seconds from the start of the video. For a real recording, re-time `start` and
`end` of each level from the transcript's word times.
"""
import argparse
import json
import subprocess
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

W, H, FPS = 1080, 1920, 30
FONT = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
CARD_X, CARD_W, CARD_H, Y0, DY = 50, 480, 110, 310, 250  # ladder ends above y=1600 (Instagram's caption area)
TEXT_W, TEXT_SIZE, LINE_H = 920, 42, 52
SEMITONES = [0, 2, 4, 5, 7]  # rising major scale, one note per level
BLACK, WHITE = (0, 0, 0, 235), (255, 255, 255, 255)


def font(size):
    return ImageFont.truetype(FONT, size)


def clamp01(x):
    return max(0.0, min(1.0, x))


def ease_back(x):
    c1 = 1.70158
    c3 = c1 + 1
    return 1 + c3 * (x - 1) ** 3 + c1 * (x - 1) ** 2


def put(frame, im, x, y):
    """alpha_composite that tolerates negative or overflowing positions."""
    x0, y0 = max(0, x), max(0, y)
    x1, y1 = min(frame.width, x + im.width), min(frame.height, y + im.height)
    if x1 <= x0 or y1 <= y0:
        return
    frame.alpha_composite(im.crop((x0 - x, y0 - y, x1 - x, y1 - y)), (x0, y0))


def fade(im, a):
    if a >= 0.999:
        return im
    out = im.copy()
    out.putalpha(out.getchannel("A").point(lambda v: int(v * a)))
    return out


def box(text, size, fill, ink, pad=(30, 18), radius=26, min_w=0, max_w=1000):
    probe = ImageDraw.Draw(Image.new("RGBA", (1, 1)))
    lines = text.split("\n")  # "\n" makes a two-line box
    f = font(size)
    while size > 24 and max(probe.textlength(s, font=f) for s in lines) + pad[0] * 2 > max_w:  # never wider than the screen
        size -= 2
        f = font(size)
    tw = int(max(probe.textlength(s, font=f) for s in lines))
    step = size + 10
    w, h = max(tw + pad[0] * 2, min_w), step * len(lines) - 10 + pad[1] * 2
    im = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    d.rounded_rectangle((0, 0, w - 1, h - 1), radius=radius, fill=fill)
    for i, s in enumerate(lines):
        d.text((w // 2, pad[1] + size // 2 + i * step + 2), s, font=f, fill=ink, anchor="mm")
    return im


def scaled(im, s):
    return im.resize((max(1, int(im.width * s)), max(1, int(im.height * s))), Image.LANCZOS)


def layout(text):
    """Word positions (x, y, word) wrapped to TEXT_W, so the lines never reflow while words appear."""
    f = font(TEXT_SIZE)
    probe = ImageDraw.Draw(Image.new("RGBA", (1, 1)))
    space = probe.textlength(" ", font=f)
    out, x, y = [], 0.0, 0
    for word in text.split():
        wl = probe.textlength(word, font=f)
        if x > 0 and x + wl > TEXT_W:
            x, y = 0.0, y + LINE_H
        out.append((x, y, word))
        x += wl + space
    return out


class Ladder:
    def __init__(self, cfg, standin):
        self.cfg = cfg
        self.standin = standin
        self.q = box(cfg["question"], 40, BLACK, WHITE, min_w=0)
        self.cards = {}
        for lv in cfg["levels"]:
            label = "BAND " + lv["band"]
            self.cards[lv["band"]] = (box(label, 54, BLACK, WHITE, min_w=CARD_W), box(label, 54, WHITE, (0, 0, 0, 255), min_w=CARD_W))
        for lv in cfg["levels"]:
            lv["_words"] = layout(lv["text"])
        c = cfg["cta"]
        self.cta_title = box(c["title"], 60, BLACK, WHITE, radius=30)
        self.cta_nums = [box(n, 84, WHITE, (0, 0, 0, 255), pad=(0, 33), radius=75, min_w=150) for n in c["numbers"]]
        self.cta_follow = box(c["follow"], 40, BLACK, WHITE)
        self.f_text = font(TEXT_SIZE)
        self.gag = cfg.get("gag")  # a level card flips to another band at a moment (the "mom calls" joke)
        if self.gag:
            self.gag_card = box("BAND " + self.gag["to"], 54, (220, 60, 60, 255), WHITE, min_w=CARD_W)
        self.caps = [(c, box(c["text"], 58, WHITE, (0, 0, 0, 255), radius=30, max_w=980)) for c in cfg.get("captions", [])]

    def silhouette(self):
        im = Image.new("RGBA", (W, H), (0, 0, 0, 0))
        d = ImageDraw.Draw(im)
        fill = (70, 74, 82, 255)
        d.ellipse((560, 700, 940, 1140), fill=fill)
        d.rounded_rectangle((470, 1120, 1080, 1920), radius=200, fill=fill)
        d.text((760, 1500), "SPEAKER ZONE", font=font(44), fill=(150, 154, 162, 255), anchor="mm")
        return im

    def frame(self, t):
        cfg = self.cfg
        im = Image.new("RGBA", (W, H), (0, 0, 0, 0))
        if self.standin:
            im = self.silhouette()
        cta = cfg["cta"]
        ladder = Image.new("RGBA", (W, H), (0, 0, 0, 0))
        gagl = Image.new("RGBA", (W, H), (0, 0, 0, 0))
        base_alpha = 1.0 - clamp01((t - cta["start"]) / 0.4)
        talking = any(c["start"] <= t < c["end"] + 0.2 for c, _ in self.caps)
        ladder_alpha = base_alpha * (0.4 if talking else 1.0)  # the ladder steps back while a joke caption is up
        if base_alpha > 0:
            put(ladder, self.q, CARD_X, 200)
            for i, lv in enumerate(cfg["levels"]):
                t_in = cfg["cards_in"][i]
                p = clamp01((t - t_in) / 0.3)
                if p <= 0:
                    continue
                y = Y0 + i * DY
                active = lv["start"] - 0.1 <= t <= lv["end"] + 0.25
                black, white = self.cards[lv["band"]]
                card = white if active else black
                s = 1.06 if active else 1.0
                target = ladder
                if self.gag and lv["band"] == self.gag["band"] and t >= self.gag["at"]:
                    card, target = self.gag_card, gagl  # flipped card stays at full strength
                    s = 1.0 + 0.14 * (1 - clamp01((t - self.gag["at"]) / 0.35))  # a quick bump on the flip
                card = scaled(card, s)
                slide = int((1 - ease_back(p)) * -260)
                a = p if not (t < lv["start"] - 0.1) else p * 0.6  # waiting cards stay dimmer
                put(target, fade(card, a), CARD_X + slide - (card.width - CARD_W) // 2, y - (card.height - CARD_H) // 2)
                if t >= lv["start"]:
                    d = ImageDraw.Draw(ladder)
                    n_words = len(lv["_words"])
                    span = max(0.1, (lv["end"] - lv["start"]) * 0.85)
                    for k, (wx, wy, word) in enumerate(lv["_words"]):
                        if "words" in lv:
                            show = t >= lv["words"][k]
                        else:
                            show = t >= lv["start"] + span * k / n_words
                        if show:
                            d.text((CARD_X + wx, y + CARD_H + 16 + wy), word, font=self.f_text, fill=WHITE,
                                   stroke_width=5, stroke_fill=(0, 0, 0, 255))
            im.alpha_composite(fade(ladder, ladder_alpha))
            im.alpha_composite(fade(gagl, base_alpha))
        for c, cb in self.caps:
            if c["start"] <= t < c["end"] + 0.2 and base_alpha > 0:
                pc = clamp01((t - c["start"]) / 0.25)
                out = 1.0 - clamp01((t - c["end"]) / 0.2)
                put(im, fade(scaled(cb, 0.8 + 0.2 * ease_back(pc)), pc * out), (W - cb.width) // 2, 960)
        if t >= cta["start"]:
            lt = t - cta["start"]
            p = clamp01(lt / 0.35)
            put(im, fade(scaled(self.cta_title, 0.8 + 0.2 * ease_back(p)), p), (W - self.cta_title.width) // 2, 620)
            total = len(self.cta_nums) * 150 + (len(self.cta_nums) - 1) * 30
            for i, n in enumerate(self.cta_nums):
                pn = clamp01((lt - 0.5 - i * 0.15) / 0.3)
                if pn > 0:
                    s = ease_back(pn)
                    sn = scaled(n, s)
                    cx = (W - total) // 2 + i * 180 + 75
                    put(im, fade(sn, pn), cx - sn.width // 2, 900 + 75 - sn.height // 2)
            pf = clamp01((lt - 1.8) / 0.3)
            if pf > 0:
                put(im, fade(scaled(self.cta_follow, 0.85 + 0.15 * ease_back(pf)), pf), (W - self.cta_follow.width) // 2, 1180)
        return im


def run(cmd, **kw):
    r = subprocess.run(cmd, **kw)
    if r.returncode != 0:
        sys.exit(f"command failed: {' '.join(map(str, cmd[:3]))} ...")
    return r


def render_picture(cfg, out, video, standin):
    dur = cfg["duration"]
    ladder = Ladder(cfg, standin)
    if video:
        src = ["-i", str(video)]
        chain = "[0:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,fps=30[b];[b][1:v]overlay=shortest=1[v]"
    else:
        src = ["-f", "lavfi", "-i", f"color=c=0x24262b:s={W}x{H}:r={FPS}:d={dur}"]
        chain = "[0:v][1:v]overlay=shortest=1[v]"
    cmd = ["ffmpeg", "-y", "-v", "error", *src, "-f", "rawvideo", "-pix_fmt", "rgba", "-s", f"{W}x{H}", "-r", str(FPS),
           "-i", "-", "-filter_complex", chain, "-map", "[v]", "-t", str(dur), "-an", "-c:v", "libx264", "-crf", "18",
           "-preset", "medium", "-pix_fmt", "yuv420p", str(out)]
    p = subprocess.Popen(cmd, stdin=subprocess.PIPE)
    for n in range(int(dur * FPS)):
        p.stdin.write(ladder.frame(n / FPS).tobytes())
    p.stdin.close()
    if p.wait() != 0:
        sys.exit("picture render failed")


def sfx_events(cfg, sfx):
    ev = []
    for t in cfg["cards_in"]:
        ev.append((sfx / "pop_text.mp3", t, 0.45, 0))
    for i, lv in enumerate(cfg["levels"]):
        ev.append((sfx / "ding.mp3", lv["start"], 0.55, SEMITONES[i % len(SEMITONES)]))
    last = cfg["levels"][-1]["start"]
    ev.append((sfx / "riser.mp3", max(0, last - 1.6), 0.45, 0))
    ev.append((sfx / "impact.mp3", last, 0.6, 0))
    if cfg.get("gag"):
        ev.append((sfx / "wrong_buzzer.mp3", cfg["gag"]["at"], 0.5, 0))
    for cap in cfg.get("captions", []):
        ev.append((sfx / "pop_text.mp3", cap["start"], 0.4, 0))
    c = cfg["cta"]
    for i in range(len(c["numbers"])):
        ev.append((sfx / "pop_text.mp3", c["start"] + 0.5 + i * 0.15, 0.4, 0))
    return ev


def mix_audio(cfg, picture, sfx, out_wav, voice):
    dur = cfg["duration"]
    ev = sfx_events(cfg, sfx)
    cmd = ["ffmpeg", "-y", "-v", "error"]
    if voice:
        cmd += ["-i", str(voice)]
    else:
        cmd += ["-f", "lavfi", "-i", f"anullsrc=r=48000:cl=stereo"]
    for f, *_ in ev:
        cmd += ["-i", str(f)]
    parts, labels = ["[0:a]aresample=48000,aformat=channel_layouts=stereo[base]"], ["[base]"]
    for i, (_, t, vol, semis) in enumerate(ev, start=1):
        ms = int(t * 1000)
        pitch = f"asetrate={int(48000 * 2 ** (semis / 12))},aresample=48000," if semis else ""
        parts.append(f"[{i}:a]{pitch}aformat=channel_layouts=stereo,volume={vol},adelay={ms}|{ms}[s{i}]")
        labels.append(f"[s{i}]")
    parts.append("".join(labels) + f"amix=inputs={len(labels)}:normalize=0:duration=first,alimiter=limit=0.9[a]")
    cmd += ["-filter_complex", ";".join(parts), "-map", "[a]", "-t", str(dur), str(out_wav)]
    run(cmd)


def master(in_wav, out_wav):
    """Two-pass loudnorm to -14 LUFS, true peak -1 dB (the same targets as video-use's render.py)."""
    meas = subprocess.run(["ffmpeg", "-nostats", "-i", str(in_wav), "-af", "loudnorm=I=-14:TP=-1:LRA=11:print_format=json",
                           "-f", "null", "-"], capture_output=True, text=True).stderr
    j = json.loads(meas[meas.rindex("{"):meas.rindex("}") + 1])
    f = (f"loudnorm=I=-14:TP=-1:LRA=11:measured_I={j['input_i']}:measured_TP={j['input_tp']}:"
         f"measured_LRA={j['input_lra']}:measured_thresh={j['input_thresh']}:offset={j['target_offset']}:linear=true")
    run(["ffmpeg", "-y", "-v", "error", "-i", str(in_wav), "-af", f, "-ar", "48000", str(out_wav)])


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--config", required=True)
    ap.add_argument("--out", required=True)
    ap.add_argument("--video", help="graded vertical video to put the ladder on")
    ap.add_argument("--voice", help="audio to use under the effects (default: the video's own audio)")
    ap.add_argument("--standin", action="store_true", help="no video: draw a dark background and a speaker zone")
    ap.add_argument("--master", action="store_true", help="two-pass loudnorm to -14 LUFS (use on real footage)")
    ap.add_argument("--sfx-dir", default=str(Path(__file__).resolve().parents[1] / "sfx"))
    a = ap.parse_args()
    if not a.video and not a.standin:
        ap.error("give --video or --standin")
    cfg = json.load(open(a.config))
    out = Path(a.out)
    tmp = out.with_suffix(".tmp")
    tmp.mkdir(exist_ok=True)
    pic, mix, mst = tmp / "picture.mp4", tmp / "mix.wav", tmp / "master.wav"
    render_picture(cfg, pic, a.video, a.standin)
    voice = a.voice or (a.video if a.video else None)
    mix_audio(cfg, pic, Path(a.sfx_dir), mix, voice)
    final_audio = mix
    if a.master:
        master(mix, mst)
        final_audio = mst
    run(["ffmpeg", "-y", "-v", "error", "-i", str(pic), "-i", str(final_audio), "-map", "0:v", "-map", "1:a",
         "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-shortest", str(out)])
    print("wrote", out)


if __name__ == "__main__":
    main()
