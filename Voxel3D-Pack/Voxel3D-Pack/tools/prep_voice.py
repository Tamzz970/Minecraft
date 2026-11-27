#!/usr/bin/env python3
"""usage: prep_voice.py <voice.mp3|wav> <script.txt> <name> [--fps 60]
Indonesian-friendly voice prep (no English aligner). The audio is NOT trimmed (emotion pauses like [short pause]/[sighs] stay).
script.txt: ONE subtitle phrase per line (<= 40 chars). A BLANK LINE marks a real pause in the voice; lines without a blank line between them are one continuous
spoken group. A non-word sound/tag ([sighs], [laughs]...) goes alone (blank line before and after).
Groups are matched IN ORDER to the audio segments found by silence detection; the counts must be equal (else it stops and prints the segments).
Writes: 02-videos/<name>/{phrases,words}.json, engine/public/<name>/{voice.*,phrases.json}, and updates engine/video.config.json
(frames = ceil(duration*fps)+2, audio path). Word times inside a phrase are weighted by syllables (estimate, +-0.1-0.2 s)."""
import sys, re, json, math, os, shutil, subprocess
a = [x for x in sys.argv[1:] if not x.startswith("--")]; fps = int(sys.argv[sys.argv.index("--fps") + 1]) if "--fps" in sys.argv else 60
if "--fps" in sys.argv: a = [x for x in a if x != str(fps)]
voice, script, name = a[:3]; root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
dur = float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", voice]))
log = subprocess.run(["ffmpeg", "-hide_banner", "-i", voice, "-af", "silencedetect=noise=-35dB:d=0.3", "-f", "null", "-"], capture_output=True, text=True).stderr
st = [float(x) for x in re.findall(r"silence_start: ([\d.]+)", log)]; en = [float(x) for x in re.findall(r"silence_end: ([\d.]+)", log)]
segs, cur = [], 0.0
for s, e in zip(st, en):
    if s - cur > 0.05: segs.append((cur, s))
    cur = e
if dur - cur > 0.05: segs.append((cur, dur))
raw = open(script, encoding="utf-8").read().replace("\r\n", "\n")
groups = [[l.strip() for l in blk.split("\n") if l.strip()] for blk in re.split(r"\n\s*\n", raw)]; groups = [g for g in groups if g]
if len(groups) != len(segs): sys.exit(f"MISMATCH: {len(groups)} script groups (blank-line separated) vs {len(segs)} audio segments:\n" + "\n".join(f"  seg {i+1}: {x:.2f}-{y:.2f}" for i, (x, y) in enumerate(segs)) + "\n" + "\n".join(f"  group {i+1}: {g[0][:40]}" for i, g in enumerate(groups)) + "\nMerge or split groups (blank lines) so each matches one stretch of speech; a tag line is its own group.")
syl = lambda w: max(1, len(re.findall(r"[aeiou]+", w.lower())))
isTag = lambda l: bool(re.fullmatch(r"\[.*\]", l))
wsyl = lambda l: sum(syl(re.sub(r"\W", "", w)) for w in l.split())
phrases, words = [], []
for g, (x, y) in zip(groups, segs):
    if len(g) == 1 and isTag(g[0]): phrases.append({"text": "", "tag": g[0], "a": round(x, 3), "b": round(y, 3)}); continue
    lines = [l for l in g if not isTag(l)]; tot = sum(wsyl(l) for l in lines); t = x
    for l in lines:
        d = (y - x) * wsyl(l) / tot; phrases.append({"text": l, "tag": "", "a": round(t, 3), "b": round(t + d, 3)})
        wt = t
        for w in l.split(): dw = d * syl(re.sub(r"\W", "", w)) / wsyl(l); words.append({"word": w, "start": round(wt, 3), "end": round(wt + dw, 3)}); wt += dw
        t += d
vd = os.path.join(root, "02-videos", name); pd = os.path.join(root, "engine", "public", name); os.makedirs(vd, exist_ok=True); os.makedirs(pd, exist_ok=True)
def cp(x, y):
    if os.path.abspath(x) != os.path.abspath(y): shutil.copy(x, y)
ext = os.path.splitext(voice)[1]; cp(voice, os.path.join(vd, "voice" + ext)); cp(voice, os.path.join(pd, "voice" + ext)); cp(script, os.path.join(vd, "script.txt"))
for d in (vd, pd): json.dump(phrases, open(os.path.join(d, "phrases.json"), "w"), ensure_ascii=False, indent=1)
json.dump(words, open(os.path.join(vd, "words.json"), "w"), ensure_ascii=False, indent=1)
cp = os.path.join(root, "engine", "video.config.json"); cfg = json.load(open(cp)); frames = math.ceil(dur * fps) + 2
comp = "".join(w.capitalize() for w in re.split(r"[-_ ]+", name)); cfg["videos"].setdefault(comp, {}).update({"fps": fps, "frames": frames, "audio": f"engine/public/{name}/voice{ext}"}); json.dump(cfg, open(cp, "w"), indent=2)
print(f"OK {len(groups)} pause groups, {len(phrases)} phrases, {len(words)} words, {dur:.3f}s -> {frames} frames @{fps}fps. Composition id = {comp}: register it in engine/src/videos/index.ts and set \"active\" in video.config.json.")
