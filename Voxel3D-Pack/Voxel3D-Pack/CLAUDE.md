# CLAUDE.md (dibaca otomatis oleh Claude Code)
Ini **Voxel3D Pack**: pabrik video vertikal bergaya diorama voxel sinematik (Remotion + Three.js), dirender di GitHub Actions.
Baca berurutan sebelum bekerja: `rules/RULES.md`, `rules/STYLE-SPEC.md`, `rules/ACTION-LIBRARY.md`, `rules/CREATIVE-FREEDOM.md`, `rules/QUALITY-CHECKLIST.md`. Contoh lengkap: `engine/src/videos/RainCalm.tsx` (duduk/ruangan/kota/hujan) dan `WalkDemo.tsx` (berdiri/berjalan/melambai).
## Alur satu video
1. Naskah per frasa di `02-videos/<nama>/script.txt`: satu frasa subtitle per baris (<= 36 karakter); BARIS KOSONG = jeda suara sungguhan; tag suara ([sighs]) sendirian di antara baris kosong.
2. Voiceover (mp3/wav) -> `python3 tools/prep_voice.py voice.mp3 02-videos/<nama>/script.txt <nama> --fps 60` (membuat phrases.json, words.json, mengisi `engine/video.config.json`).
3. Buat `engine/src/videos/<Nama>.tsx` (pola: keyframe kamera dari frasa -> Scene yang mengubah `t` jadi `act` + efek -> `<VoxelVideo>`), daftarkan di `src/videos/index.ts`, set `active`.
4. `npx tsc -p .` lalu still per frasa (`node scripts/stills.mjs`), lihat hasilnya, perbaiki.
5. Commit + push (Termux: `bash tools/push.sh "pesan"`), jalankan workflow **render** di GitHub Actions, unduh artifact `<Comp>-final`.
## Sikap
Jawab dalam bahasa pengguna (default Indonesia). Jujur: sebutkan bingkai yang sudah dicek dan yang belum; render penuh hanya di GitHub. Jangan mengubah gaya identitas (lihat CREATIVE-FREEDOM).
