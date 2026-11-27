#!/usr/bin/env bash
# ONE-COMMAND SETUP (Claude runs this first; idempotent). Linux/Mac containers; no GPU needed. Final renders go to GitHub Actions.
set -e
ROOT="$(cd "$(dirname "$0")/.." && pwd)"; cd "$ROOT"
echo "== env report =="; bash tools/env_report.sh > ENV-REPORT.md 2>&1 || true; head -20 ENV-REPORT.md
command -v node >/dev/null || { echo "NODE MISSING: install Node 20+ then rerun"; exit 1; }
command -v ffmpeg >/dev/null || { echo "ffmpeg missing: apt-get install -y ffmpeg"; exit 1; }
echo "== python libs =="; (python3 -m pip install -q numpy pillow 2>&1 || python3 -m pip install -q --break-system-packages numpy pillow 2>&1) | tail -1 || true
echo "== engine deps (npm ci = locked versions) =="; cd engine && (npm ci --no-audit --no-fund --loglevel=error || npm install --no-audit --no-fund --loglevel=error) && cd ..
echo "== render flag + test still =="; cd engine
GL=swangle; command -v nvidia-smi >/dev/null && GL=angle; echo "$GL" > ../.gl-flag
ACTIVE=$(node -p "require('./video.config.json').active")
S=$(date +%s); npx remotion still "$ACTIVE" --frame=0 --gl=$GL --scale=0.5 --log=error --output=/tmp/_setup_test.png >/dev/null 2>&1 || { echo "still render FAILED with gl=$GL"; exit 1; }
E=$(date +%s); echo "first still ok ($ACTIVE, gl=$GL) in $((E-S))s (includes bundling)"
echo "SETUP DONE. Cores: $(nproc). CPU render is slow (~25 s/frame/core at 720x1280): do final renders on GitHub Actions (.github/workflows/render.yml), only stills/short checks here."
