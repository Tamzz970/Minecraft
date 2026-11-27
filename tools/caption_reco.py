#!/usr/bin/env python3
"""usage: caption_reco.py [words.json] [script.json]   (defaults: engine/public/*)
Recommends ONE subtitle style from the measured pace and sentence shape of the script. Prints a JSON line:
{"style": "classic|highlight|minimal|impact", "why": "...", "stats": {...}}. Claude writes the style to engine/public/caption-style.json,
tells the user the recommendation in ONE line (in the user's language) and builds with it without waiting. See rules/CAPTION-STYLES.md."""
import sys, json, re
wf = sys.argv[1] if len(sys.argv) > 1 else "engine/public/words.json"; sf = sys.argv[2] if len(sys.argv) > 2 else "engine/public/script.json"
W = json.load(open(wf)); S = [str(x) for x in json.load(open(sf))]
dur = max(0.1, W[-1]["end"] - W[0]["start"]); n = len(W)
sent = max(1, sum(1 for t in S if re.search(r"[.!?]$", t))); avg = n / sent; wps = n / dur
nums = sum(1 for t in S if re.search(r"\d", t))
st = dict(words=n, seconds=round(dur, 1), words_per_sec=round(wps, 2), avg_sentence_words=round(avg, 1), numbers=nums)
if wps < 2.3 and avg >= 14: style, why = "minimal", "slow, calm pace with long sentences: a smaller 3-4 word line is easier to read"
elif avg <= 8 and wps >= 2.6: style, why = "impact", "short punchy sentences at a fast pace: one big word at a time hits harder"
elif nums >= 4 or wps >= 3.0: style, why = "highlight", "fast delivery with numbers/names: the highlighted current word keeps the eye on the spoken word"
else: style, why = "classic", "balanced pace and sentences: the classic 1-2 word caption is the safest and cleanest"
print(json.dumps(dict(style=style, why=why, stats=st), ensure_ascii=False))
