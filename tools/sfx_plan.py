#!/usr/bin/env python3
"""usage: sfx_plan.py events.json out_dir [--lang id|en] [--name VIDEO]
Turns sfx-events.json into a MANUAL SFX shopping list for the user (the user makes/records the sounds themselves, because
Claude cannot hear audio). Writes  out_dir/sfx-prompts.md  and  out_dir/sfx-timeline.csv .

events.json = list of events, ordered by time. Fields:
  t     start second in the final video (from words.json / scene anchors)      REQUIRED
  dur   length of the sound in seconds (0.2 - 3.0)                              REQUIRED
  name  short English label, e.g. "door-creak"                                  REQUIRED
  prompt English text-to-SFX prompt (for ElevenLabs SFX / Stable Audio / similar). Duration clause is appended automatically.
  what  one short line in the USER'S language: what happens on screen at that second
  db    relative loudness, default -4 (mix_sfx.py adds -14 dB under the voice + ducking)
Files the user makes are named  sfx-01.wav, sfx-02.wav ... (same order as the table) and dropped into <video>/user-sfx/ ."""
import sys, json, csv, os, argparse
ap = argparse.ArgumentParser(); ap.add_argument("events"); ap.add_argument("out"); ap.add_argument("--lang", default="en"); ap.add_argument("--name", default="")
a = ap.parse_args()
ev = sorted(json.load(open(a.events)), key=lambda e: e["t"]); os.makedirs(a.out, exist_ok=True)
L = {"id": dict(title="Daftar SFX manual", intro="Buat setiap efek suara di bawah ini sendiri (generator SFX AI, rekaman, atau library), lalu simpan dengan nama file persis seperti kolom *File* dan taruh di folder `user-sfx/`. Setelah itu kirim pesan \"SFX siap\" dan video akan di-mix ulang.",
    cols=["No", "File", "Mulai (detik)", "Durasi (detik)", "Selesai", "Terjadi di video", "Prompt (salin ke generator SFX)", "Volume"], total="Total", warn="PERINGATAN", tips="Tips: ekspor WAV/MP3 mono atau stereo, puncak sekitar -3 dB, tanpa musik, tanpa suara orang, tanpa gema panjang. Durasi boleh lebih panjang sedikit; saya potong sesuai kolom Durasi."),
     "en": dict(title="Manual SFX list", intro="Make each sound below yourself (AI SFX generator, recording, or library). Save each one with exactly the name in the *File* column and put it in the `user-sfx/` folder. Then send \"SFX ready\" and the video is re-mixed.",
    cols=["No", "File", "Start (s)", "Length (s)", "End", "On screen", "Prompt (paste into SFX generator)", "Level"], total="Total", warn="WARNING", tips="Tips: export WAV/MP3, peak around -3 dB, no music, no voices, no long reverb tail. A little longer is fine; it is trimmed to the Length column.")}[a.lang if a.lang in ("id", "en") else "en"]
rows, warns = [], []
for i, e in enumerate(ev, 1):
    d = round(float(e["dur"]), 2)
    if not 0.2 <= d <= 3.0: warns.append(f"#{i} {e['name']}: duration {d}s outside 0.2-3.0")
    p = (e.get("prompt") or e["name"]).strip().rstrip(".")
    if "second" not in p.lower(): p += f". Exactly {d:g} seconds long, single clean sound, no music, no voices, no reverb tail"
    lvl = e.get("db", -4); lvl_txt = "loud" if lvl >= -1 else "normal" if lvl >= -5 else "soft"
    rows.append(dict(no=i, file=f"sfx-{i:02d}.wav", t=round(e["t"], 2), dur=d, end=round(e["t"] + d, 2), what=e.get("what", ""), prompt=p, level=lvl_txt))
for k in range(len(rows) - 1):
    if rows[k]["end"] > rows[k + 1]["t"] + 0.01: warns.append(f"#{rows[k]['no']} overlaps #{rows[k+1]['no']}")
for k in range(len(rows)):
    n = sum(1 for r in rows if rows[k]["t"] <= r["t"] < rows[k]["t"] + 20)
    if n >= 8: warns.append(f"{n} events within 20 s starting at {rows[k]['t']}s (limit < 8)"); break
tot = round(sum(r["dur"] for r in rows), 2)
with open(os.path.join(a.out, "sfx-timeline.csv"), "w", newline="") as f:
    w = csv.writer(f); w.writerow(["no", "file", "start_s", "length_s", "end_s", "on_screen", "prompt", "level"])
    for r in rows: w.writerow([r["no"], r["file"], r["t"], r["dur"], r["end"], r["what"], r["prompt"], r["level"]])
c = L["cols"]
md = [f"# {L['title']}{' - ' + a.name if a.name else ''}", "", L["intro"], "", L["tips"], "", "| " + " | ".join(c) + " |", "|" + "---|" * len(c)]
for r in rows: md.append(f"| {r['no']} | `{r['file']}` | {r['t']:.2f} | {r['dur']:g} | {r['end']:.2f} | {r['what']} | {r['prompt']} | {r['level']} |")
md += ["", f"**{L['total']}:** {len(rows)} SFX, {tot} s"]
if warns: md += ["", *[f"- {L['warn']}: {w}" for w in warns]]
open(os.path.join(a.out, "sfx-prompts.md"), "w").write("\n".join(md) + "\n")
print(f"sfx plan: {len(rows)} events, {tot}s total -> {a.out}/sfx-prompts.md , sfx-timeline.csv" + (f"  [{len(warns)} warnings]" if warns else ""))
for w in warns: print("WARN", w)
