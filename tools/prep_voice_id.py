#!/usr/bin/env python3
"""usage: prep_voice_id.py <voice.mp3> <script.txt> <outdir>
Indonesian-friendly voice prep (no English aligner). Audio is NOT trimmed.
script.txt: one spoken phrase per line; a line like [sighs] = a non-word sound (kept as a silent caption slot).
Phrases are matched, in order, to the audio segments found by silence detection (must be equal in number).
Writes <outdir>/phrases.json (phrase-level timings) and words.json (words timed by syllable weight)."""
import sys, re, json, subprocess
voice, script, out = sys.argv[1], sys.argv[2], sys.argv[3]
dur = float(subprocess.check_output(["ffprobe","-v","error","-show_entries","format=duration","-of","csv=p=0",voice]))
log = subprocess.run(["ffmpeg","-hide_banner","-i",voice,"-af","silencedetect=noise=-35dB:d=0.3","-f","null","-"],capture_output=True,text=True).stderr
st = [float(x) for x in re.findall(r"silence_start: ([\d.]+)", log)]; en = [float(x) for x in re.findall(r"silence_end: ([\d.]+)", log)]
segs, cur = [], 0.0
for s, e in zip(st, en):
    if s - cur > 0.05: segs.append((cur, s))
    cur = e
if dur - cur > 0.05: segs.append((cur, dur))
lines = [l.strip() for l in open(script, encoding="utf-8") if l.strip()]
if len(lines) != len(segs): sys.exit(f"MISMATCH: {len(lines)} script lines vs {len(segs)} audio segments {segs}")
syl = lambda w: max(1, len(re.findall(r"[aeiou]+", w.lower())))
phrases, words = [], []
for line, (a, b) in zip(lines, segs):
    tag = bool(re.fullmatch(r"\[.*\]", line)); phrases.append({"text": "" if tag else line, "tag": line if tag else "", "a": round(a,3), "b": round(b,3)})
    if tag: continue
    ws = line.split(); tot = sum(syl(re.sub(r"\W","",w)) for w in ws); t = a
    for w in ws:
        d = (b - a) * syl(re.sub(r"\W","",w)) / tot; words.append({"word": w, "start": round(t,3), "end": round(t+d,3)}); t += d
json.dump(phrases, open(out + "/phrases.json","w"), ensure_ascii=False, indent=1); json.dump(words, open(out + "/words.json","w"), ensure_ascii=False, indent=1)
print("OK", len(phrases), "phrases,", len(words), "words, duration", round(dur,3), "s ->", int(dur*60)+2, "frames @60fps")
