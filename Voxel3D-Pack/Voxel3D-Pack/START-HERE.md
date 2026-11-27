# START-HERE: Voxel3D Pack
Paket ini membuat video vertikal bergaya **diorama voxel sinematik** (ruangan hangat, hujan, kota balok, tokoh berkacamata) dari naskah + voiceover. Render akhirnya di **GitHub Actions**; **Termux** dipakai untuk mengirim (push) proyek ke GitHub.

## Isi
- `engine/` proyek Remotion. Modul gaya di `engine/src/voxel/`; contoh `src/videos/RainCalm.tsx` (video hujan) dan `WalkDemo.tsx` (tokoh berjalan/melambai).
- `engine/video.config.json` fps, jumlah frame, dan file audio tiap video (satu sumber untuk Remotion dan GitHub).
- `.github/workflows/render.yml` render paralel + gabung + pasang suara.
- `02-videos/<nama>/` naskah, voiceover, timing frasa.
- Subtitle bergaya voxel: huruf piksel dari kubus 3D (`engine/src/voxel/caption.tsx`).
- `rules/`, `CLAUDE.md`, `MASTER-PROMPT.md` aturan dan prompt untuk Claude.
- `tools/` prep_voice.py (timing suara), push.sh (Termux), alat analisis referensi (forensics, contact_sheets, dll.).

## Membuat video baru (ringkas)
1. Minta Claude: tempel `MASTER-PROMPT.md` + zip ini; sebutkan topik dan durasi (mis. 20 detik).
2. Rekam voiceover (ElevenLabs boleh pakai tag [calm], [sighs], dll.). Beri tahu teks lengkap + tagnya.
3. Claude membuat komposisi, memeriksa still per frasa, lalu menyerahkan zip baru.
4. Ekstrak, kirim ke GitHub, jalankan render, unduh hasil.

## Termux -> GitHub (pertama kali)
```
pkg install git unzip
unzip Voxel3D-Pack.zip && cd Voxel3D-Pack
git init && git add -A && git commit -m "voxel pack"
git branch -M main
git remote add origin https://github.com/USERNAME/REPO.git
git push -u origin main        # username + Personal Access Token (repo)
```
Selanjutnya cukup: `bash tools/push.sh "pesan"`. Pastikan folder tersembunyi `.github` ikut terkirim.

## Render
GitHub > **Actions** > **render** > **Run workflow** (komposisi kosong = `active` di video.config.json; potongan 6). Setelah hijau, buka run itu > **Artifacts** > `<Komposisi>-final` > unduh mp4.

## Perkiraan waktu (kasar, dari uji 1 core: ~25 dtk/frame)
Video 22,5 dtk x 60 fps = 1.354 frame ~ 9 core-jam. Runner publik 4 core x 6 potongan: sekitar 25-30 menit. Repositori privat (2 core): sekitar 50 menit per job, total sekitar 5 jam dari jatah 2.000 menit/bulan. Belum diuji di GitHub.

## Batas
Bloom/DOF asli, air/api fisik, wajah/logo asli tidak ada (didekati dengan glow, vignette, partikel balok). Kata pada subtitle memakai frasa; waktu kata per suku kata hanya perkiraan.
