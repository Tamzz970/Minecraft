# ACTION-LIBRARY (apa yang sudah bisa dibuat; selebihnya = bangun baru dari balok)
## Akting tokoh (`act`)
| Maksud | act |
|---|---|
| mengetik | `mode:"sit", arms:"type"` |
| termenung/menatap jendela | `yaw` negatif ke arah jendela, `pitch` -0.1, `roll` 0.08 |
| tenang/rileks | `calm` 0->1 (bahu turun), kepala menunduk sedikit |
| menghela napas | `sigh` pulsa 0->1->0 (dada naik, mulut melebar, kepala menengadah) |
| berjalan | `mode:"stand", walk: jarak*WALK, amp: 0..1` (kaki tidak meluncur) |
| melambai / menunjuk / membawa / bersorak | `arms:"wave"/"point"/"hold"/"up"` |
| ekspresi | `mood:"smile"/"shock"/"sad"/"laugh"` |
Pulsa pakai `bump(a,puncak,b,t)` dan `sm(a,b,t)` dari `V.tsx`.
## Properti siap pakai (`props.tsx`, semua punya `p`)
RoomA, Rug, Desk, Monitor (baris kode berwarna), Keyboard, Cup, DeskLamp, Robot, Plant, Pendant, Picture, Bookshelf. Kota: `City` (+Street, Tram, lampu jalan). Cuaca: Rain, GlassDrops, Rings, Steam.
## Pola kamera
- Pembuka lebar -> dorong ke subjek; -> close-up properti; -> tarik mundur; -> keluar jendela naik ke udara (penutup).
## Metafora untuk konsep abstrak
grafik = tangga balok; uang = tumpukan blok emas; waktu = jam balok/bayangan bergerak; ide = lampu balok menyala; suara = `Rings`.
## Efek yang tidak ada (jangan dijanjikan)
bloom/DOF asli, air/api/asap fisik, pantulan, wajah/logo asli. Gunakan pendekatan: glow sprite, vignette, partikel balok.
