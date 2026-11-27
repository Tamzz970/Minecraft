#!/usr/bin/env bash
# Termux: kirim perubahan ke GitHub. usage: bash tools/push.sh "pesan"   (jalankan dari folder proyek)
set -e
git add -A; git commit -m "${1:-update}" || echo "(tidak ada perubahan baru)"; git push
echo "Terkirim. Buka GitHub > Actions > render > Run workflow."
