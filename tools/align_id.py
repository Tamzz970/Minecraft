#!/usr/bin/env python3
"""Indonesian-friendly word alignment (no dictionary needed).
usage: align_id.py voice.wav script.txt words.json
Method: energy envelope -> long pauses are matched (DP) to the script's punctuation boundaries; inside each phrase the words
share the phrase's speech time by syllable weight; each inner boundary then snaps to the nearest energy valley (+-90 ms)."""
import sys, re, json, wave, numpy as np
wav, scr, out = sys.argv[1:4]
w = wave.open(wav); sr = w.getframerate(); ch = w.getnchannels()
x = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(float) / 32768
if ch > 1: x = x.reshape(-1, ch).mean(1)
H = int(sr * 0.01); m = len(x) // H
db = 20 * np.log10(np.sqrt((x[:m * H].reshape(m, H) ** 2).mean(1)) + 1e-9)
T = m / 100.0
sm = np.convolve(db, np.ones(3) / 3, mode="same")
SIL = -40
toks = open(scr).read().split()
syl = lambda t: max(1, len(re.findall(r"[aeiou]+", re.sub(r"[^a-z]", "", t.lower()))) + len(re.findall(r"[aeiou]{2}", re.sub(r"[^a-z]", "", t.lower()))) * 0)
wt = [syl(t) + 0.35 for t in toks]
# speech start/end
act = np.where(sm > SIL)[0]; s0, s1 = act[0] / 100, (act[-1] + 1) / 100
# silences >= 0.11 s inside speech
sils = []; i = 0
while i < m:
    if sm[i] < SIL:
        j = i
        while j < m and sm[j] < SIL: j += 1
        if (j - i) >= 8 and i / 100 > s0 and j / 100 < s1: sils.append((i / 100, j / 100))
        i = j
    else: i += 1
# punctuation boundaries (word index after which a pause is expected)
pb = [k for k, t in enumerate(toks[:-1]) if re.search(r"[.,!?:;]\W*$", t)]
cum = np.cumsum([0] + wt); total = cum[-1]
# DP: choose a subsequence of silences for the punctuation boundaries, minimising time deviation from proportional guess
exp = [s0 + (s1 - s0) * cum[k + 1] / total for k in pb]
n, M = len(pb), len(sils); INF = 1e12; U = 1.2   # U = penalty for a punctuation boundary with no audible pause
rate = total / (s1 - s0)
def seg_cost(t0, t1, wsum):
    d = max(t1 - t0, 0.05); return (d - wsum / rate) ** 2 / max(wsum / rate, 0.3)
# states: (a, j) boundary a matched to silence j; virtual start (-1) at s0 and virtual end (n) at s1
g = {}; par = {}
def W(a0, a1):  # weight between boundary a0 (exclusive) and a1 (inclusive): words pb[a0]+1 .. pb[a1]
    lo = 0 if a0 < 0 else pb[a0] + 1; hi = len(toks) if a1 >= n else pb[a1] + 1
    return cum[hi] - cum[lo]
for a_ in range(0, n + 1):
    js = range(M) if a_ < n else [0]
    for j in js:
        t_end = sils[j][0] if a_ < n else s1
        best, arg = INF, None
        for a0 in range(-1, a_):
            skipped = a_ - a0 - 1
            if a0 == -1: prev = [(None, s0, 0.0)]
            else: prev = [(jp, sils[jp][1], g.get((a0, jp), INF)) for jp in range(M) if sils[jp][1] <= t_end - 0.05 and (a0, jp) in g]
            for jp, t0, base in prev:
                c = base + seg_cost(t0, t_end, W(a0, a_)) + U * skipped
                if c < best: best, arg = c, (a0, jp)
        if a_ < n: best -= 0.8 * (sils[j][1] - sils[j][0])
        g[(a_, j)] = best; par[(a_, j)] = arg
sel = {}; cur = par[(n, 0)]
while cur is not None and cur[0] >= 0:
    sel[cur[0]] = cur[1]; cur = par[cur]
anch = {}  # word index -> (end_of_phrase_time, start_of_next_phrase_time)
for ai, k in enumerate(pb):
    if ai in sel: anch[k] = sils[sel[ai]]
ends = sorted(anch)
bounds = [(-1, s0)] + [(k, anch[k][0]) for k in ends] + [(len(toks) - 1, s1)]
starts = [s0] + [anch[k][1] for k in ends]
res = [None] * len(toks)
for pi in range(len(bounds) - 1):
    first = bounds[pi][0] + 1; last = bounds[pi + 1][0]
    a0 = starts[pi]; a1 = bounds[pi + 1][1]
    ws = wt[first:last + 1]; cs = np.cumsum([0] + ws)
    edges = [a0 + (a1 - a0) * c / cs[-1] for c in cs]
    for q in range(1, len(edges) - 1):  # snap inner boundaries to local minima
        lo, hi = int((edges[q] - 0.09) * 100), int((edges[q] + 0.09) * 100)
        lo = max(lo, int(a0 * 100) + 3); hi = min(hi, int(a1 * 100) - 3)
        if hi > lo: edges[q] = (lo + int(np.argmin(sm[lo:hi]))) / 100 + 0.005
    for q in range(len(ws)):
        res[first + q] = [toks[first + q], round(edges[q], 3), round(edges[q + 1], 3)]
# make monotonic, minimum duration
for q in range(len(res)):
    if q and res[q][1] < res[q - 1][2]: res[q][1] = res[q - 1][2]
    if res[q][2] < res[q][1] + 0.08: res[q][2] = res[q][1] + 0.08
words = [{"word": re.sub(r"^[\W_]+|[\W_]+$", "", r[0]), "start": r[1], "end": r[2]} for r in res]
json.dump(words, open(out, "w"), indent=1, ensure_ascii=False)
print(f"{len(words)} words, {len(anch)}/{len(pb)} punctuation pauses anchored, speech {s0:.2f}-{s1:.2f}s of {T:.2f}s")
rates = []
for pi in range(len(bounds) - 1):
    first = bounds[pi][0] + 1; last = bounds[pi + 1][0]; d = bounds[pi + 1][1] - starts[pi]
    rates.append(round(sum(wt[first:last + 1]) / max(d, 0.01), 1))
print("syllable rate per phrase (should be fairly even):", rates)
