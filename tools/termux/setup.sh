#!/usr/bin/env bash
# One-time setup in Termux (Android). Installs git + GitHub CLI + ffmpeg + python and logs in to GitHub.
set -e
pkg update -y && pkg install -y git gh jq ffmpeg python curl
[ -d "$HOME/storage" ] || termux-setup-storage
if ! gh auth status >/dev/null 2>&1; then
  echo "== GitHub login: a code + link appear. Open the link in your phone browser, enter the code, approve. =="
  gh auth login -h github.com -p https -w
fi
gh auth setup-git
echo "Termux ready."
