# STYLE-SPEC-VOXEL (menggantikan STYLE-SPEC Stick3D untuk video bergaya "Voxelverse")
Format: vertikal 720x1280, **60 fps**, durasi mengikuti voiceover (audio TIDAK dipangkas agar jeda emosi [short pause]/[sighs] terjaga).

## Dunia
- Semua benda dari balok (voxel). Tanpa outline tinta. Material berlampu (MeshStandardMaterial), bayangan lembut dari satu cahaya "bulan" lewat jendela.
- Ruangan cutaway (dua dinding + lantai) di lantai atas gedung; jendela menghadap jalan kota voxel berhujan.
- Palet: teal (#2e6b68), krem (#d8c4a0), bata (#a8412f), oranye hangat (#ffb36a), biru malam. Bayangan dingin, cahaya lampu hangat.
- Cahaya = lampu emisif + sprite glow aditif (pengganti bloom). Vignette + sedikit kontras/saturasi lewat CSS.
- Hujan: balok tipis instancing yang jatuh deterministik dari waktu (tidak ada Math.random per frame).

## Tokoh (src/voxel/Hero.tsx)
- Kepala besar 3D, kacamata, rambut gelap, hoodie teal, kursi putar. Akting: napas, kedip, kepala menoleh sesuai tag emosi suara:
  [thoughtful] kepala miring menatap jendela - [short pause] diam - [calm] bahu turun - [sighs] dada naik, kepala menengadah, uap cangkir bergoyang.

## Kamera
- Satu perjalanan mulus (Hermite) mengikuti makna narasi: lebar -> kaca -> tokoh -> cangkir -> helaan napas -> keluar jendela -> kota dari atas.
- Tanpa guncangan acak.

## Teks
- Subtitle frasa (bukan per kata): serif italic (Lora), huruf kecil, putih krem, bawah layar, fade 0,2-0,3 dtk.

## Alur kerja
1. Skrip satu frasa per baris di 02-videos/<nama>/script.txt (tag seperti [sighs] di baris sendiri).
2. python3 tools/prep_voice_id.py voice.mp3 script.txt <folder>  -> phrases.json + words.json (jumlah baris harus sama dengan jumlah segmen audio).
3. Salin phrases.json dan voice.mp3 ke engine/public, atur durasi di engine/src/Root.tsx (detik x fps).
4. Render lewat GitHub Actions (.github/workflows/render.yml).
