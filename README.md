# Xperia Film — Luxury Cinema Telegram Mini App

Katalog streaming sinematik berbasis **Telegram Mini App** untuk koleksi **Film (286 judul)**, **Series (18 judul / 214 episode)**, dan **Donghua & Anime (74 judul / 1.589 episode)** lengkap poster `.webp` lokal yang kebal blokir ISP.

- **Live WebApp URL:** https://blue242.github.io/xperia-film/
- **Repository GitHub:** https://github.com/blue242/xperia-film

## Fitur Utama UI/UX
- **Glassmorphism & Dynamic Ambient Glow:** Latar `#06060b` dengan aurora glow dinamis (`800ms`) mengikuti `accent_color` konten aktif.
- **Kartu Poster 4-Sudut Spesifik Kategori:** Badge skor/BARU + kualitas zamrud + durasi untuk Film; pita vertikal `EPS` khas LK21 + season/platform untuk Series; pita miring `COMPLETED` / api `🔥` khas Anichin + `Ep` + `Sub` untuk Donghua.
- **Zero Dead Text & Grid 3 Kolom:** Seluruh tombol `SEMUA` dan kapsul metadata (Genre, Tahun, Negara, Platform, Studio, Pemeran, Sutradara) langsung membuka Grid 3 Kolom penuh dengan pagination mulus per 36 item.
- **Pemilih Episode & Resolusi Lengkap:** Multi-part Film, Season + Episode Series dengan penanda `✓` sudah ditonton, serta pemilih resolusi (`Otomatis`/`4K`/`1080p`/`720p`) & urutan episode terbaru untuk Donghua.
- **Fitur Personal:** Bar emas `▶ Lanjutkan Menonton`, `❤️ Simpanan Gua (Watchlist)`, `🎲 Cinema Roulette`, dan Live Search instan.

## Struktur Folder
- `src/` — Kode frontend modular React 18 + TypeScript + Tailwind CSS (`types/`, `utils/`, `hooks/`, `components/{layout,cards,home,explore,detail,modals}/`).
- `public/data/` & `public/posters/` — Dataset JSON statis & 390 gambar `.webp` lokal.
- `scripts/` — `setup_telegram_bot.py` (pemasang tombol Menu Bot Telegram) & `sync_and_deploy.ps1` (satu-klik sinkronisasi Realme -> GitHub Pages).
- `.github/workflows/deploy.yml` — Pipeline CI/CD otomatis ke GitHub Pages.

## Menjalankan Lokal
```powershell
npm install
npm run dev      # Mode pengembangan lokal
npm run build    # Build produksi ke dist/
```
