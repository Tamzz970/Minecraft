# STYLE-SPEC: Voxelverse (diorama voxel sinematik)
**Rasa**: diorama mainan dari balok, malam hangat-dingin, hujan, cahaya lampu, kamera lambat. Tenang dan sinematik, bukan kartun cerah.
## Dunia
- Semua benda = balok (`Vx`). Material berlampu (PBR), TANPA outline tinta. Satu cahaya "bulan" (directional, castShadow) + lampu titik hangat di sumber cahaya nyata (lampu meja, lampu gantung, lampu jalan).
- Palet: teal `#2e6b68`, krem `#d8c4a0`, bata `#a8412f`, oranye hangat `#ffb36a`, biru malam `#2b3138`. Bayangan dingin, cahaya hangat.
- "Bloom" = sprite `Glow` aditif di sekitar lampu. Vignette + kontras 1.08 + saturasi 1.12 (CSS di `ui.tsx`). Kabut warna langit.
- Ruangan = potongan (cutaway) 2 dinding + lantai di lantai atas gedung, jendela menghadap jalan kota voxel. Ruangan lain (dapur, perpustakaan) dibangun dengan komponen `props.tsx`, bukan gaya baru.
## Tokoh (`Hero.tsx`)
- Kepala besar balok, mata dengan alis, pipi merah muda, rambut blok. `LOOKS`: dev (kacamata, hoodie teal), rust, night. Tambah look = tambah satu objek warna.
- Akting lewat `act`: mode sit/stand, arms type/down/up/point/wave/hold, mood neutral/smile/shock/sad/laugh, yaw/pitch/roll kepala, sigh/calm, walk+amp. Napas dan kedip otomatis.
- Skala: tokoh ~2.1 unit tinggi di ruangan. Di jalan/kota pakai `scale≈0.6`.
## Kamera (`cam.tsx`)
- Satu jalur Hermite lewat keyframe `{t,p,l}`; kunci waktu = batas frasa. Tanpa guncangan acak. Gerak: dorong pelan, orbit kecil, tarik keluar lewat jendela ke tampilan udara.
- fov 55. Jaga wajah tokoh terlihat 3/4 saat ia "berbicara/berpikir".
## Teks
- Subtitle frasa, Lora italic 38px, `#f4ead8`, fade 0,2-0,3 dtk, ada gradasi gelap di bawah untuk keterbacaan.
## Cuaca & suasana (`weather.tsx`)
- `Rain`, `GlassDrops`, `Rings` (riak suara), `Steam`. Semuanya fungsi dari `t`.
