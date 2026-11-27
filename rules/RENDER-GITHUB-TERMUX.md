# RENDER VIA GITHUB ACTIONS + TERMUX (agent notes)
## Architecture
- Repo root = the pack root. Workflow: `.github/workflows/render.yml` (manual `workflow_dispatch`, inputs `comp`, `video`, `chunks`; empty inputs fall back to `render-config.json`).
- Job `plan`: frames = ceil(duration of `engine/public/mix.wav` (else voice.wav) * 30); `tools/github/plan_chunks.py` splits them into inclusive ranges (>= 45 frames each, max 12 chunks).
- Job `render` (matrix): `npm ci`, `remotion render <comp> --frames=a-b --gl=swangle --concurrency=$(nproc) --muted` -> artifact `chunk-NN`.
- Job `finish`: ffmpeg concat (`-c copy`) -> `Stick3D-<video>-silent.mp4`; `tools/remux.sh` adds `engine/public/mix.wav` -> `Stick3D-<video>.mp4`; fails if stitched frames != expected; artifact `final-mp4` (both files, 14 days).
- Estimated speed: a GitHub runner (4 vCPU public repo) is about as fast as the cloud box, so 6 chunks ~ 6x faster than local. A 60 s video (1800 frames) is roughly 10-15 min wall time including ~2 min setup per job. Private repos use 2 vCPU runners and the monthly free minutes (each render costs about chunks x job minutes): prefer a PUBLIC repo for voice/script that are not secret, else warn the user once.
- Termux scripts (`tools/termux/`): `setup.sh` (once), `render.sh` (push + dispatch + watch + download to `Download/Stick3D`), `sfx-remix.sh` (mix the user's SFX + remux, no re-render).

## What to do as the agent
1. Keep `render-config.json` current (`comp` = composition id registered in Root.tsx, `video` = folder under 02-videos).
2. Make sure every file the runner needs is committed: `engine/public/{voice.wav,mix.wav,words.json,script.json,caption-style.json}`, sources, `package-lock.json`. Do not commit `node_modules`.
3. If `gh` is authenticated here: push, `gh workflow run render.yml`, `gh run watch <id> --exit-status`, `gh run download <id> -n final-mp4 -D 99-exports`. Otherwise tell the user the Termux commands (3 lines) and render locally meanwhile.
4. If the workflow fails: read `gh run view <id> --log-failed`, fix the cause (missing file in repo, composition id typo, out-of-range frames), push, rerun once. Do not loop more than twice; then fall back to local render.
5. Termux cannot reliably run Remotion + Chromium + WebGL natively (Android has no glibc Chromium, no GPU in proot). Do not promise on-phone rendering. An on-phone render inside `proot-distro ubuntu` (node + ffmpeg + `npx remotion browser ensure`) is UNTESTED and expected to be very slow; offer it only if the user insists and GitHub is impossible.
6. Never put tokens in files. Login happens once in Termux via `gh auth login -w`.
