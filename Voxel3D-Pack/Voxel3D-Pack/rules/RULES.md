# RULES (aturan keras, berlaku untuk setiap video)
1. **Format**: 720x1280 vertikal, **60 fps**. Durasi = durasi voiceover (frames dihitung `tools/prep_voice.py` ke `engine/video.config.json`).
2. **Semua dari kode**: tanpa generator gambar/video, tanpa stock, tanpa model 3D unduhan. Dunia = balok voxel (`engine/src/voxel/`).
3. **Deterministik**: tampilan = fungsi murni dari waktu `t` (detik). Dilarang `Math.random()`, `Date.now()`, dan state yang berubah antar frame. Acak pakai `rng(seed)`.
4. **Suara adalah jam**: waktu adegan dan akting diambil dari `phrases.json`, bukan ditebak. Audio TIDAK dipangkas (jeda emosi seperti [short pause]/[sighs] adalah bagian dari ritme).
5. **Satu frasa = satu makna visual**. Kamera dan akting mengikuti makna kalimat, bukan hiasan acak.
6. **Teks layar**: subtitle frasa bergaya voxel (huruf piksel dari kubus 3D, `caption.tsx`), huruf kecil, <= 36 karakter per frasa (2 baris ~18 karakter). Tidak ada teks lain kecuali memang bagian cerita (mis. kode di monitor).
7. **Anggaran render**: <= ~1.500 mesh per frame, hanya 1 lampu `castShadow`, hujan/partikel pakai `InstancedMesh`. CPU render ~25 dtk/frame/core: jangan menambah efek berat tanpa alasan.
8. **Render akhir hanya di GitHub Actions**. Di lingkungan Claude cukup `tsc` + beberapa still (skala 0.5) per frasa.
9. **Jujur soal batas**: efek yang hanya didekati (bloom = sprite glow, DOF tidak ada) dikatakan apa adanya. Jangan klaim sudah dicek bila belum dirender.
10. **Konten**: tanpa tokoh nyata, merek, IP berhak cipta, atau konten berbahaya. Fakta sains disederhanakan dengan kata longgar ("banyak orang", "menandai"), bukan klaim mutlak.
11. **Bahasa**: balas pengguna dalam bahasa yang ia pakai (default Indonesia).
