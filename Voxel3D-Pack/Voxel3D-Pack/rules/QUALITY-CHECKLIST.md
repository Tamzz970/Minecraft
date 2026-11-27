# QUALITY-CHECKLIST (sebelum kirim ke GitHub)
1. `cd engine && npx tsc -p .` tanpa error.
2. `node scripts/stills.mjs . <Comp> /tmp/st 0.5 <frame awal tiap frasa>`; buat contact sheet; LIHAT hasilnya.
3. Wajah tokoh terlihat (3/4) saat adegan tokoh; tangan di atas meja, tidak menembus benda.
4. Subtitle voxel terbaca di setiap frasa (kontras cukup, tidak lebih dari 2-3 baris, tidak terpotong tepi layar).
5. Tidak ada bingkai hitam/kosong; tidak ada properti melayang atau menembus dinding.
6. Cahaya tidak terbakar (putih rata) dan tidak terlalu gelap; sumber cahaya hangat terlihat.
7. Kamera tidak menembus gedung/dinding di tengah jalur (cek bingkai di antara keyframe).
8. `video.config.json`: frames sesuai audio (`prep_voice.py`), `active` benar, komposisi terdaftar di `src/videos/index.ts`.
9. Tulis di ledger: apa yang SUDAH dicek (bingkai tertentu) dan apa yang BELUM (gerakan penuh baru terlihat setelah render GitHub).
