#!/usr/bin/env bash
# After you made the SFX files listed in 02-videos/<video>/sfx-prompts.md (sfx-01.wav, sfx-02.wav, ...):
#   bash tools/termux/sfx-remix.sh [video-folder]
# Mixes your files over the voice and re-attaches audio to the already-rendered silent video (NO re-render).
set -e
cd "$(dirname "$0")/../.."
cfg() { jq -r ".$1 // empty" render-config.json; }
VIDEO="${1:-$(cfg video)}"; D="02-videos/$VIDEO"; OUT="$HOME/storage/downloads/Stick3D"; [ -d "$HOME/storage/downloads" ] || OUT="$PWD/out"
mkdir -p "$D/user-sfx"
ls "$D"/user-sfx/sfx-* >/dev/null 2>&1 || cp "$HOME"/storage/downloads/sfx-* "$D/user-sfx/" 2>/dev/null || true
ls "$D"/user-sfx/sfx-* >/dev/null 2>&1 || { echo "No sfx-XX files found. Put them in $D/user-sfx/ or in your phone Download folder."; exit 1; }
python3 tools/mix_sfx.py engine/public/voice.wav "$D/sfx-events.json" engine/public/mix.wav --user "$D/user-sfx"
SILENT=$(ls -t "$OUT"/*-silent.mp4 2>/dev/null | head -1); [ -n "$SILENT" ] || { echo "No *-silent.mp4 in $OUT. Run render.sh first."; exit 1; }
bash tools/remux.sh "$SILENT" engine/public/mix.wav "$OUT/Stick3D-$VIDEO-with-sfx.mp4"
git add -A; git commit -qm "user sfx + mix" || true; git push -q || true
echo "DONE -> $OUT/Stick3D-$VIDEO-with-sfx.mp4"
