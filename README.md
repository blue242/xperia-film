# Xperia Film — Luxury Cinema Telegram Mini App

Katalog streaming sinematik berbasis **Telegram Mini App** untuk koleksi **Film (286 judul)**, **Series (18 judul / 214 episode)**, dan **Donghua & Anime (74 judul / 1.589 episode)** lengkap poster `.webp` lokal yang kebal blokir ISP.

- **Live WebApp URL:** https://blue242.github.io/xperia-film/
- **Bot Telegram Resmi:** [@xperiafilm_bot](https://t.me/xperiafilm_bot) *(aktif dengan foto profil sinema kustom, tombol menu `🎬 Buka Katalog`, bio, deskripsi sambutan, `/start`, serta OpenGraph share preview)*
- **Repository GitHub:** https://github.com/blue242/xperia-film

## Fitur Utama UI/UX
- **Glassmorphism & Dynamic Ambient Glow:** Latar `#06060b` dengan aurora glow dinamis (`800ms`) mengikuti `accent_color` konten aktif.
- **Kartu Poster 4-Sudut Spesifik Kategori:** Badge skor/BARU + kualitas zamrud + durasi untuk Film; pita vertikal `EPS` khas LK21 + season/platform untuk Series; pita miring `COMPLETED` / api `🔥` khas Anichin + `Ep` + `Sub` untuk Donghua.
- **Zero Dead Text & Grid 3 Kolom:** Seluruh tombol `SEMUA` dan kapsul metadata (Genre, Tahun, Negara, Platform, Studio, Pemeran, Sutradara) langsung membuka Grid 3 Kolom penuh dengan pagination mulus per 36 item.
- **Pemilih Episode & Resolusi Lengkap:** Multi-part Film, Season + Episode Series dengan penanda `✓` sudah ditonton, serta pemilih resolusi (`Otomatis`/`4K`/`1080p`/`720p`) & urutan episode terbaru untuk Donghua.
- **Fitur Personal:** Bar emas `▶ Lanjutkan Menonton`, `❤️ Simpanan Gua (Watchlist)`, `🎲 Cinema Roulette`, dan Live Search instan.

## Update Katalog 1 Perintah (`upmini`)
- **Termux HP Realme / Sony Xperia:** jalankan `upmini` (penuh), `upmini film`, `upmini series`, atau `upmini donghua` (Wi-Fi maupun paket data seluler).
- **PC Ryzen:** jalankan `.\upmini.cmd` (`all|film|series|donghua`), atau `npm run sync`. Otomatis mencari HP Termux aktif (`Realme` -> `Xperia` -> scan ARP port `8022`), menjalankan `upmini` di HP, lalu `git pull --rebase origin main`.

## Struktur Folder
- `index.html` — Entrypoint WebApp dilengkapi OpenGraph preview (`og:image` -> `bot-avatar.jpg`) & `apple-touch-icon`.
- `src/` — Kode frontend modular React 18 + TypeScript + Tailwind CSS (`types/`, `utils/`, `hooks/`, `components/{layout,cards,home,explore,detail,modals}/`).
- `public/` — `bot-avatar.jpg` (PP sinema `640x640` & thumbnail share), `data/`, & `posters/` (390 gambar `.webp` lokal).
- `scripts/` — `setup_telegram_bot.py` (konfigurator `@xperiafilm_bot` tanpa menyimpan token) & `sync_and_deploy.ps1` (orkestrator multi-device PC Ryzen).
- `upmini.cmd` — Launcher singkat sinkronisasi satu klik dari Windows.
- `.github/workflows/deploy.yml` — Pipeline CI/CD otomatis ke GitHub Pages.

## Menjalankan Lokal
```powershell
npm install
npm run dev      # Mode pengembangan lokal
npm run build    # Build produksi ke dist/
```
