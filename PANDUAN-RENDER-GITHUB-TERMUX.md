# Panduan: render lewat GitHub + Termux, dan SFX manual

## A. Satu kali saja (sekitar 10 menit)
1. **GitHub**: buat repo baru (disarankan *Public* supaya menit render gratis tanpa batas; *Private* dapat jatah menit bulanan). Upload isi folder pack ini ke repo (isi folder `Stick3D-Pack`, bukan folder pembungkusnya), pastikan `.github/workflows/render.yml` ada di akar repo, dan branch utamanya `main`.
2. **Termux** (dari F-Droid atau GitHub, bukan Play Store): jalankan
   ```
   pkg install -y git
   git clone https://github.com/NAMA-ANDA/NAMA-REPO.git stick3d && cd stick3d
   bash tools/termux/setup.sh
   ```
   Saat diminta login GitHub, buka link yang muncul di browser HP, masukkan kode, lalu setujui.

## B. Render video
Setelah Claude Code selesai membangun video dan mengirim pesan bahwa project sudah siap (atau bila ia sudah push sendiri, cukup `git pull`):
```
cd stick3d && git pull
bash tools/termux/render.sh
```
Skrip ini push project, menjalankan render di server GitHub (dibagi menjadi beberapa chunk paralel), menunggu sampai selesai, lalu mengunduh hasilnya ke folder **Download/Stick3D** di HP:
- `Stick3D-<nama>.mp4` (suara narasi saja, tanpa SFX)
- `Stick3D-<nama>-silent.mp4` (video tanpa audio, dipakai untuk menambah SFX tanpa render ulang)

Kalau Claude Code sudah terhubung ke GitHub, ia menjalankan render sendiri dan Termux hanya dipakai untuk mengunduh/memantau (`gh run list`, `gh run download`).

## C. SFX manual
Efek suara tidak ikut dirender karena Claude tidak bisa mendengar. Claude memberi **daftar SFX**: nomor, nama file, detik mulai, **durasi (detik)**, adegan yang terjadi, dan prompt siap salin (`02-videos/<nama>/sfx-prompts.md` dan `sfx-timeline.csv`).
1. Buat tiap suara dengan generator SFX AI (mis. ElevenLabs Sound Effects) atau rekam sendiri, sesuai durasi yang tertulis.
2. Simpan dengan nama persis: `sfx-01.wav`, `sfx-02.wav`, ... (mp3/m4a juga bisa).
3. Pilih salah satu:
   - Kirim file-file itu ke Claude Code dengan pesan **"SFX siap"**; ia akan me-mix dan mengirim mp4 baru. Atau
   - Taruh di folder Download HP, lalu di Termux: `bash tools/termux/sfx-remix.sh`. Hasil: `Download/Stick3D/Stick3D-<nama>-with-sfx.mp4`. Tidak ada render ulang, selesai dalam hitungan detik.

## D. Gaya subtitle
Claude merekomendasikan satu gaya (classic, highlight, minimal, atau impact) dalam satu baris saat naskah dan voiceover masuk, lalu langsung membuat video. Untuk mengganti, balas: `subtitle: highlight` (butuh render ulang penuh).

## Catatan jujur
- Render di dalam Termux itu sendiri (tanpa GitHub) tidak disarankan: Chromium + WebGL di Android sangat tidak stabil dan lambat. Termux di sini berfungsi sebagai remote control.
- Hasil artifact GitHub disimpan 14 hari; unduh segera.
