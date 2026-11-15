#!/usr/bin/env bash
# Render the reel + poster frame. Output: ./final-video.mp4 and ./thumbnail.png
set -euo pipefail
cd "$(dirname "$0")/.."
mkdir -p out
npx remotion render src/index.ts AliIeltsReel out/final-video.mp4 --codec=h264 --crf=18 --audio-codec=aac --audio-bitrate=192k "$@"
# Audio mastering: social-media loudness (-14 LUFS), true-peak limit -1.5 dBTP.
ffmpeg -y -v error -i out/final-video.mp4 -c:v copy -af "loudnorm=I=-14:TP=-1.5:LRA=11" -ar 48000 -c:a aac -b:a 192k -movflags +faststart out/final-video-mastered.mp4
npx remotion still src/index.ts Thumbnail out/thumbnail.png
cp out/final-video-mastered.mp4 final-video.mp4
cp out/thumbnail.png thumbnail.png
echo "Done → $(pwd)/final-video.mp4"
