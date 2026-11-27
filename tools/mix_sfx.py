#!/usr/bin/env python3
"""usage: mix_sfx.py voice.wav events.json out.wav [sfxdir=sfx]
   or: mix_sfx.py voice.wav events.json out.wav --user <video>/user-sfx     (MANUAL mode, default for deliveries)
MANUAL mode: event N uses the user's own file user-sfx/sfx-NN.(wav|mp3|m4a|ogg|flac), trimmed to event "dur" (+ short fade-out).
  Events whose file is missing are skipped; with an empty folder the result is the clean voice only (voice-only mix).
  Event numbering = events sorted by "t" (same numbering as tools/sfx_plan.py).
events.json = [{"t":1.16,"sfx":"impact","db":-6}, ...]  (db = extra attenuation; SFX files peak at -3 dBFS)
Rules baked in: SFX are SPARSE and QUIET. Default offset -14 dB under the voice, plus sidechain ducking while the voice speaks,
so SFX never fight the voiceover. Output length = voice length."""
import sys, json, subprocess
import os, glob
args = sys.argv[1:]; user = None
if "--user" in args: k = args.index("--user"); user = args[k + 1]; del args[k:k + 2]
voice, ev, out = args[:3]; sfxdir = args[3] if len(args) > 3 else "sfx"
events = sorted(json.load(open(ev)), key=lambda e: e["t"]) if user else json.load(open(ev))
if user:
    used = []
    for n, e in enumerate(events, 1):
        hit = sorted(glob.glob(os.path.join(user, f"sfx-{n:02d}.*")))
        if hit: e["_file"] = hit[0]; used.append(n)
    print("manual SFX files found:", len(used), "of", len(events), "(missing ones are skipped)")
    events = [e for e in events if "_file" in e]
dur = float(subprocess.check_output(["ffprobe","-v","error","-show_entries","format=duration","-of","csv=p=0",voice]))
ins = ["-i", voice]; fl = []; lab = []
for i, e in enumerate(events, 1):
    ins += ["-i", e["_file"] if "_file" in e else f"{sfxdir}/{e['sfx']}.wav"]
    ms = int(e["t"] * 1000)
    trim = f"atrim=0:{e['dur']},afade=t=out:st={max(0, e['dur']-0.06)}:d=0.06," if "_file" in e and e.get("dur") else ""
    fl.append(f"[{i}:a]{trim}volume={e.get('db',-4)-14}dB,adelay={ms}|{ms}[s{i}]"); lab.append(f"[s{i}]")
if lab:
    fl.append("[0:a]asplit=2[v][vk]")
    fl.append("".join(lab) + f"amix=inputs={len(lab)}:normalize=0,apad=whole_dur={dur}[sx]")
    fl.append("[sx][vk]sidechaincompress=threshold=0.02:ratio=8:attack=5:release=250[sd]")
    fl.append("[v][sd]amix=inputs=2:normalize=0,alimiter=limit=0.95[a]")
else:
    fl.append("[0:a]anull[a]")
subprocess.run(["ffmpeg","-y","-v","error",*ins,"-filter_complex",";".join(fl),"-map","[a]","-t",str(dur),"-ar","48000",out], check=True)
print("mixed", out, round(dur,2), "s,", len(events), "sfx events")
