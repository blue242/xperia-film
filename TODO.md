# TODO — Xperia Film Mini App

## Selesai (Tahap 1 — Data Pipeline & Poster Engine)
- [x] Bangun arsitektur modular 9 file di `~/DOPESSORNO/xperia_film_sync/` (Termux Realme) dengan proteksi *anti-lock* `.session` di `$TMPDIR`.
- [x] Ekstraksi & pengayaan metadata **286 Film**, **18 Series (214 episode)**, dan **74 Donghua (1.589 episode)**.
- [x] Konversi & validasi **100% poster lokal `.webp`** (378 poster + 12 hero backdrop widescreen `.webp`) beserta `accent_color`.

## Selesai (Tahap 2 — Frontend Luxury UI/UX & Live GitHub Pages Deployment)
- [x] Bangun arsitektur frontend modular Anti-Monolith (`20+` file terpisah di bawah `src/`) menggunakan React 18, TypeScript, Vite 6, dan Tailwind CSS.
- [x] Implementasi atmosfer *Glassmorphism*, *Dynamic Ambient Aurora Glow* (`800ms`), dan SVG logo kustom `BrandLogo.tsx`.
- [x] Implementasi `PosterCard.tsx` 4-sudut penuh warna sesuai kategori (Film HD/Multi-part, Pita Vertikal `EPS` LK21 untuk Series, Pita Miring `COMPLETED` / `🔥` Anichin untuk Donghua).
- [x] Implementasi `HeroCarousel.tsx` widescreen swipeable, `ContinueWatchingBar.tsx` berlapis emas, `ContentRail.tsx` bertombol `SEMUA`, serta prinsip **Zero Dead Text** menuju `CatalogGridView.tsx` (Grid 3 Kolom, Load More per 36 item).
- [x] Implementasi 5 menu navigasi bawah (`Beranda`, `Film`, `Series`, `Donghua`, `Jelajah` + `Simpanan Gua`), `SearchOverlay.tsx` instan, `RouletteModal.tsx` (*Cinema Roulette*), dan `InfoRequestModal.tsx`.
- [x] Implementasi `DetailModal.tsx` lengkap pemilih Multi-part Film, Season/Episode Series berpenanda `✓`, pemilih Resolusi (`Otomatis`/`4K`/`1080p`/`720p`) & toggle urutan episode Donghua, serta integrasi penuh SDK `Telegram.WebApp`.
- [x] Buat skrip bantu `scripts/setup_telegram_bot.py` & `scripts/sync_and_deploy.ps1`, setup GitHub Actions `.github/workflows/deploy.yml`, dan deploy live ke `https://blue242.github.io/xperia-film/`.

## Pekerjaan Tertunda / Opsional Ke Depan
- [ ] Menjalankan `python scripts/setup_telegram_bot.py` setelah user menyiapkan `BOT_TOKEN` baru dari `@BotFather`.
- [ ] Opsional: Menjadwalkan Task Scheduler Windows mingguan untuk `scripts/sync_and_deploy.ps1` bila diinginkan sinkronisasi terjadwal otomatis.
