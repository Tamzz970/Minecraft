#!/usr/bin/env python3
"""usage: plan_chunks.py <total_frames> <chunks>  -> prints JSON matrix {"include":[{"i":1,"a":0,"b":119,"n":"01"},...]}
Splits frames 0..total-1 into <= chunks contiguous ranges (inclusive, as Remotion --frames=a-b), each >= 45 frames."""
import sys, json
total, chunks = int(sys.argv[1]), max(1, int(sys.argv[2]))
chunks = max(1, min(chunks, total // 45 or 1)); size = -(-total // chunks); out = []; a = 0; i = 1
while a < total:
    b = min(total - 1, a + size - 1); out.append({"i": i, "a": a, "b": b, "n": f"{i:02d}"}); a = b + 1; i += 1
print(json.dumps({"include": out}))
