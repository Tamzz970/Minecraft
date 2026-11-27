#!/usr/bin/env bash
# Run inside the cloned repo in Termux:   bash tools/termux/render.sh [CompId] [video-folder] [chunks]
# Pushes the project, starts the GitHub render (parallel chunks), waits, and downloads the mp4 to your phone's Download/Stick3D.
set -e
cd "$(dirname "$0")/../.."
cfg() { jq -r ".$1 // empty" render-config.json; }
COMP="${1:-$(cfg comp)}"; VIDEO="${2:-$(cfg video)}"; CH="${3:-$(cfg chunks)}"
echo "render: comp=$COMP video=$VIDEO chunks=$CH"
git add -A; git commit -qm "render $COMP" || true
git pull --rebase -q || true; git push -q
PREV=$(gh run list --workflow render.yml --limit 1 --json databaseId -q '.[0].databaseId // 0' 2>/dev/null || echo 0)
gh workflow run render.yml -f comp="$COMP" -f video="$VIDEO" -f chunks="$CH"
RUN=""; for i in $(seq 1 40); do
  RUN=$(gh run list --workflow render.yml --limit 1 --json databaseId -q '.[0].databaseId // 0' 2>/dev/null || echo 0)
  [ "$RUN" != "$PREV" ] && [ "$RUN" != "0" ] && break; sleep 3; done
[ -n "$RUN" ] && [ "$RUN" != "$PREV" ] || { echo "Could not find the new run. Open the Actions tab on GitHub."; exit 1; }
echo "run $RUN started (watching; Ctrl+C only stops watching, the render continues on GitHub)"
gh run watch "$RUN" --exit-status
OUT="$HOME/storage/downloads/Stick3D"; [ -d "$HOME/storage/downloads" ] || OUT="$PWD/out"; mkdir -p "$OUT"
gh run download "$RUN" -n final-mp4 -D "$OUT"
echo "DONE -> $OUT"; ls -la "$OUT"
