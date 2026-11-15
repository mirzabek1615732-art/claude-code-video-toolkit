"""Generate one narration clip with word-level timings (Edge neural TTS).
usage: tts_words.py VOICE "text" out_base [rate] [pitch]"""
import sys, asyncio, json, certifi
certifi.where = lambda: "/root/.ccr/ca-bundle.crt"   # trust the sandbox proxy CA; verification stays on
import edge_tts

async def main(voice, text, base, rate, pitch):
    comm = edge_tts.Communicate(text, voice, rate=rate, pitch=pitch, boundary="WordBoundary")
    words, audio = [], bytearray()
    async for ch in comm.stream():
        if ch["type"] == "audio":
            audio += ch["data"]
        elif ch["type"] == "WordBoundary":
            words.append({"text": ch["text"], "start": ch["offset"] / 1e7, "dur": ch["duration"] / 1e7})
    open(base + ".mp3", "wb").write(audio)
    json.dump(words, open(base + ".words.json", "w"))

a = sys.argv
asyncio.run(main(a[1], a[2], a[3], a[4] if len(a) > 4 else "+0%", a[5] if len(a) > 5 else "+0Hz"))
