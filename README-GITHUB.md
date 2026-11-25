# Render "Kenapa Hujan Membuat Kita Tenang?" di GitHub (60 fps, voxel)

## Isi paket
- `engine/` proyek Remotion (komposisi `RainCalm`, kode gaya voxel di `engine/src/voxel/`)
- `.github/workflows/render.yml` render paralel + gabung + pasang suara
- `02-videos/rain-calm/` skrip, voiceover, timing frasa
- `rules/STYLE-SPEC-VOXEL.md` aturan gaya

## Langkah
1. Buat repositori baru di GitHub (publik: menit Actions tidak dibatasi seketat privat).
2. Ekstrak zip ini lalu unggah SEMUA isinya ke root repositori. Folder `.github` bersifat tersembunyi: pastikan ikut terunggah.
   Lewat Termux:
   ```
   pkg install git unzip
   unzip voxel-rain-calm.zip -d voxel && cd voxel
   git init && git add -A && git commit -m "voxel rain calm"
   git branch -M main
   git remote add origin https://github.com/USERNAME/REPO.git
   git push -u origin main      # masukkan username + Personal Access Token
   ```
3. Buka tab **Actions** -> **render-rain-calm** -> **Run workflow** (potongan: 6).
4. Tunggu semua job hijau, buka run tersebut, bagian **Artifacts** -> unduh **rain-calm-final** (isinya `rain-calm-final.mp4`).

## Catatan
- Render memakai CPU (`--gl=swangle`). Perkiraan kasar dari uji di sandbox saya (1 core): sekitar 25 detik per bingkai per core, jadi total sekitar 9 core-jam. Runner 4 core x 6 potongan: sekitar 25-30 menit; runner privat 2 core: sekitar 50 menit per job, 6 job (total menit terpakai sekitar 5 jam dari jatah gratis privat 2000 menit/bulan). Angka ini belum diuji di GitHub.
- Kalau ada potongan gagal: Re-run failed jobs, lalu jalankan ulang job `join`.
- Ubah fps/durasi: `engine/src/Root.tsx` (durationInFrames) dan `TOTAL` di `render.yml`.
