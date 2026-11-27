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

## Selesai (Tahap 3 — Audit & Perbaikan Menyeluruh Mekanika Scroll Sentuh Mobile)
- [x] Hapus pengunci `touch-pan-x` pada `ContentRail.tsx` dan seragamkan seluruh strip horizontal (`ContinueWatchingBar`, `AlphabetBar`, `SeriesEpisodePanel`, `CategoryTabView`) dengan `.horizontal-rail-scroll` (`touch-action: pan-x pan-y; overflow-y: hidden`) + `draggable={false}` pada poster/backdrop agar scroll vertikal halaman mulus 100% di atas poster.
- [x] Optimasi gestur swipe `HeroCarousel.tsx` berbasis `useRef` (0% re-render saat sentuh, rasio arah `|dx| > 48 && |dx| > |dy| * 1.6`, `touch-action: pan-y`).
- [x] Sentralisasi kunci scroll viewport modal di `App.tsx`, stabilisasi handler penutup dengan `useCallback`, pisahkan reset scroll `DetailModal.tsx` hanya saat `item.id` berubah, ganti perpindahan tab/grid menjadi `window.scrollTo(0, 0)` instan, dan rapikan CSS global (`luxury.css`).

## Selesai (Tahap 4 — Integrasi Penuh Bot `@xperiafilm_bot` & Branding)
- [x] Ekspor aset foto profil resmi `public/bot-avatar.jpg` (`640x640` RGB JPEG, `quality=95`, `subsampling=0`).
- [x] Upgrade `scripts/setup_telegram_bot.py` (murni stdlib Python) untuk upload `setMyProfilePhoto`, pasang menu WebApp `🎬 Buka Katalog`, `setMyShortDescription`, `setMyDescription`, `setMyCommands` (`/start`), dan mode `--verify-only`.
- [x] Eksekusi & verifikasi live Bot API pada `@xperiafilm_bot` (PP kustom aktif `total_count=1`, Menu WebApp mengarah ke `https://blue242.github.io/xperia-film/`, bio & deskripsi terpasang).
- [x] Tambahkan meta OpenGraph (`og:title`, `og:description`, `og:image`) dan `apple-touch-icon` di `index.html` + verifikasi `npm run build`.

## Pekerjaan Tertunda / Opsional Ke Depan
- [ ] Opsional: Aktifkan Main Mini App via `@BotFather` (`/setmainapp` -> `@xperiafilm_bot`) bila ingin `has_main_web_app=true` untuk direct link `https://t.me/xperiafilm_bot?startapp`.
- [ ] Opsional: Menjadwalkan Task Scheduler Windows mingguan untuk `scripts/sync_and_deploy.ps1` bila diinginkan sinkronisasi terjadwal otomatis.
