#!/usr/bin/env python3
"""Generate episode narration lines with an ElevenLabs voice (eleven_v4 supports Uzbek).

usage: python3 scripts/elevenlabs_lines.py ep04 [line ids...]   (default: every Uzbek line without lang=en)

The API key is injected by the session proxy / never read or printed here. Saves public/<ep>/vo_raw/<id>.wav (cached:
existing files are kept unless --force). Then run scripts/episode_voice.py <ep>.
"""
import json, subprocess, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
VOICE_ID = "N3JyoAxu35CZFiDzoIoZ"  # "Ali narrator (Javohir clone)" in the ElevenLabs account
MODEL = "eleven_v4"
# spoken text: casing/dashes that the display text uses for emphasis are softened so the voice does not spell or shout
TTS = {
    "ep04": {
        "l02": "Bu safar Ali IELTS Listening'dan sakkiz olaman deb o‘tiribdi!",
        "l07": "O‘n uch! Topdim!",
        "l10": "Ali, sorry, degan joyini umuman eshitmabdi!",
        "l11": "Javob o‘n uch emas, o‘ttiz edi!",
        "l14": "Lekin eng muhimi, javobni eshitganingdan keyin ham diqqatni yo‘qotma!",
    },
    "ep03": {"l15b": "Readingda eng katta muammoying nima: vaqtmi yoki notanish so‘zlarmi?", "l17": "Alining keyingi sarguzashtlarini o‘tkazib yubormaslik uchun obuna bo‘l!"},
}


def gen(text: str, out_wav: Path, voice_id: str = VOICE_ID, lang: str = "uz", style: float = 0.3) -> None:
    body = json.dumps({"text": text, "model_id": MODEL, "language_code": lang, "voice_settings": {"stability": 0.45, "similarity_boost": 0.9, "style": style, "use_speaker_boost": True, "speed": 1.0}})
    tmp = out_wav.with_suffix(".mp3")
    r = subprocess.run(["curl", "-sS", "-m", "120", "-o", str(tmp), "-w", "%{http_code}", "-X", "POST", f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}?output_format=mp3_44100_128", "-H", "Content-Type: application/json", "-d", body], capture_output=True, text=True)
    if r.returncode != 0:
        raise SystemExit(f"{out_wav.name}: curl failed: {r.stderr.strip()[:200]}")
    if r.stdout.strip() != "200":
        raise SystemExit(f"{out_wav.name}: HTTP {r.stdout.strip()} {tmp.read_text(errors='ignore')[:200]}")
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", str(tmp), "-ar", "44100", "-ac", "1", str(out_wav)], check=True)
    tmp.unlink()


def main() -> None:
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    force = "--force" in sys.argv
    ep, ids = args[0], args[1:]
    script = json.loads((ROOT / "src" / "episodes" / ep / "script.json").read_text())
    raw = ROOT / "public" / ep / "vo_raw"
    raw.mkdir(parents=True, exist_ok=True)
    voices = script.get("voices")
    # with a "voices" map, each line names its voice; lines voiced by a non-ElevenLabs engine (e.g. piper) are skipped
    if voices:
        todo = [l for l in script["lines"] if voices.get(l.get("voice", "narrator"), {}).get("engine") == "elevenlabs" and (not ids or l["id"] in ids)]
    else:
        todo = [l for l in script["lines"] if l.get("lang") != "en" and (not ids or l["id"] in ids)]
    chars = 0
    for l in todo:
        dst = raw / f"{l['id']}.wav"
        text = l.get("tts") or TTS.get(ep, {}).get(l["id"], l["text"])
        if dst.exists() and not force and not ids:
            print(f"{l['id']}: cached"); continue
        vid = voices[l.get("voice", "narrator")]["voice_id"] if voices else VOICE_ID
        gen(text, dst, vid, l.get("lang", "uz"), 0.55 if l.get("voice") in ("ali", "influencer") else 0.3)
        chars += len(text)
        print(f"{l['id']}: ok ({len(text)} chars) {text}")
    print("characters used:", chars)


if __name__ == "__main__":
    main()
