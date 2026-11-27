# SFX = MANUAL (the user makes the sounds; Claude cannot hear audio)
Claude does NOT ship synthetic SFX in the delivered video. Claude plans them, writes exact prompts with timing and length, and the user creates them. Delivered mp4 = voice only (clean mix), plus the SFX list.

## What Claude produces after the video is built (every video)
1. Write `02-videos/<name>/sfx-events.json` (sorted by time). Fields per event: `t` (start second, from words.json / scene anchors), `dur` (seconds, 0.2-3.0), `name` (short English label), `what` (one line, in the USER'S language: what happens on screen), `prompt` (English text-to-SFX prompt), `db` (relative loudness, default -4).
2. Run `python3 tools/sfx_plan.py 02-videos/<name>/sfx-events.json 02-videos/<name> --lang <id|en> --name <name>` -> creates `sfx-prompts.md` and `sfx-timeline.csv`. Fix every WARN (overlap / density).
3. Run `python3 tools/mix_sfx.py engine/public/voice.wav 02-videos/<name>/sfx-events.json engine/public/mix.wav --user 02-videos/<name>/user-sfx` (empty folder = voice-only mix). Render with that mix.
4. In the delivery message put the SFX table directly in chat (No, File, start s, length s, what happens, prompt) so the user can copy it on the phone, and attach `sfx-prompts.md` + `sfx-timeline.csv`.
5. Tell the user: make files named `sfx-01.wav`, `sfx-02.wav` ... exactly as listed, then either send them to you with "SFX siap", or run `bash tools/termux/sfx-remix.sh` themselves (see PANDUAN-RENDER-GITHUB-TERMUX.md).

## When the user sends the SFX files
Put them in `02-videos/<name>/user-sfx/` (keep their numbers), run the `mix_sfx.py ... --user` command from step 3, then `bash tools/remux.sh <silent.mp4> engine/public/mix.wav 99-exports/<name>-with-sfx.mp4`. NO re-render is needed (video is copied, audio re-encoded). Missing numbers are skipped, never invented. Verify duration = voice duration, then send the mp4 (and the updated pack zip).

## How to write good SFX events
- Sparse: < 8 per 20 s, only impacts, door/handle, a few UI ticks, whooshes on hard cuts. None on captions/every word.
- `t` lands on the visual frame of the action (from the scene's anchor words), not on the sentence start. `dur` = real length of that sound, not the scene length. Typical: tick 0.2-0.3 s, click/stamp 0.3 s, impact/thud 0.5-0.8 s, whoosh 0.4-0.7 s, door creak 1.0-1.8 s, glass break 1.0-1.5 s, rising tension riser 1.5-3.0 s, ambience bed: avoid (not an event).
- `prompt` format (English): "<sound source/material>, <action>, <character: dry/close/cartoon/realistic>". The tool appends "Exactly N seconds long, single clean sound, no music, no voices, no reverb tail". Examples: "Heavy wooden door handle click and slow creak opening, close mic, dry" (1.4 s); "Cartoon thud impact, deep, short, dry" (0.5 s); "Fast air whoosh, left to right, crisp" (0.5 s).
- Loudness: `db` 0..+2 = loud hit, -4 = normal, -8 = soft. The mixer adds -14 dB under the voice plus ducking, so the voice stays dominant.
