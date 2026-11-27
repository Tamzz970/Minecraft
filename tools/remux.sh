#!/usr/bin/env bash
# usage: remux.sh silent.mp4 mix.wav out.mp4   (no re-render: copies video, encodes audio). Used after the user's manual SFX are mixed.
set -e
V="$1"; A="$2"; O="$3"
ffmpeg -y -v error -i "$V" -i "$A" -map 0:v:0 -map 1:a:0 -c:v copy -c:a aac -b:a 192k -shortest -movflags +faststart "$O"
vd=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$O"); ad=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$A")
python3 - "$vd" "$ad" <<'PY'
import sys; v, a = float(sys.argv[1]), float(sys.argv[2]); print(f"remux ok: video {v:.2f}s, audio {a:.2f}s"); sys.exit(0 if abs(v - a) < 0.2 else 1)
PY
