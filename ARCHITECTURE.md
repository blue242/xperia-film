# ARCHITECTURE — Xperia Film Mini App

## 1. Arsitektur 2 Lapisan Terisolasi

### A. Data Pipeline & Poster Engine (Remote Termux Realme)
Lokasi: `~/DOPESSORNO/xperia_film_sync/` (membaca sumber secara *read-only*):
- `config_sync.py` — Loader kredensial `~/.config/dopessorno/media_hub/environment`, `~/DOPESSORNO/donghua_catalog/`, dan `TMDB_API_KEY`.
- `session_guard.py` — `safe_telegram_client` yang menyalin `.session` ke `$TMPDIR/xperia_sync_sessions/` (`receive_updates=False`) agar bebas SQLite lock.
- `enricher_api.py` — Enricher konkuren ke TMDB v3 & AniList GraphQL + cache `cache/api_cache.json`.
- `poster_downloader.py` — Konverter `.webp` (`420px` poster, `1280px` hero backdrop) + ekstraktor `accent_color` vibran.
- `collector_movies.py`, `collector_series.py`, `collector_donghua.py` — Kolektor metadata & episode multi-resolusi.
- `exporter.py` & `run_sync.py` — Validator mandiri & ekspor JSON atomik ke `output/`.

### B. Frontend Modular Anti-Monolith (PC Acer & GitHub Pages)
Lokasi: `c:\Users\server\katalog_mini_app\` (Stack: React 18, TypeScript, Vite 6, Tailwind CSS 3, Lucide Icons):
- `src/types/catalog.ts` — Kontrak tipe data katalog, filter, riwayat tontonan, dan konteks grid.
- `src/utils/`
  - `telegram.ts` — Integrasi Telegram WebApp SDK (`ready`, `expand`, `disableVerticalSwipes`, `BackButton` stack, `HapticFeedback`, `openTelegramLink`, `shareCatalogItem`).
  - `assetUrl.ts` — Resolver path relatif `./` untuk GitHub Pages, konversi RGB ambient glow, dan palet warna genre/platform.
  - `catalogHelpers.ts` — Mesin pencari instan, multi-filter, pengurut, dan kurasi tontonan serupa.
- `src/hooks/`
  - `useCatalogData.ts` — Loader paralel keempat file JSON + indeks `Map` per `id`.
  - `useUserLibrary.ts` — Persistensi `localStorage` untuk Watchlist, Continue Watching, penanda episode `✓`, dan preferensi resolusi Donghua.
- `src/components/layout/` — `AmbientBackground.tsx`, `BrandLogo.tsx`, `TopHeader.tsx`, `BottomNav.tsx`, `CatalogStateScreen.tsx`.
- `src/components/cards/` — `PosterCard.tsx` (kartu 2:3 dengan 4-sudut badge khas per kategori).
- `src/components/home/` — `HeroCarousel.tsx`, `ContinueWatchingBar.tsx`, `StatsRibbon.tsx`, `ContentRail.tsx`, `HomeTabView.tsx`, `CategoryTabView.tsx`.
- `src/components/explore/` — `AlphabetBar.tsx`, `CatalogGridView.tsx` (Grid 3 Kolom + Load More 36 item), `SuperExplorerView.tsx`.
- `src/components/detail/` — `DetailModal.tsx`, `MovieWatchPanel.tsx`, `SeriesEpisodePanel.tsx`, `DonghuaEpisodePanel.tsx`.
- `src/components/modals/` — `SearchOverlay.tsx`, `RouletteModal.tsx`, `InfoRequestModal.tsx`.
- `index.html` — Entry HTML dengan Telegram WebApp SDK, font `Outfit` / `Plus Jakarta Sans`, `apple-touch-icon`, serta meta OpenGraph (`og:title`, `og:description`, `og:image` ke `bot-avatar.jpg`).
- `public/bot-avatar.jpg` — Aset foto profil resmi `@xperiafilm_bot` (`640x640` RGB JPEG) sekaligus thumbnail share link OpenGraph.
- `scripts/setup_telegram_bot.py` — Konfigurator profil & Mini App `@xperiafilm_bot` berbasis stdlib Python (`urllib`, `mimetypes`, `uuid`) untuk `setMyProfilePhoto`, `setChatMenuButton`, bio, deskripsi, `/start`, dan `--verify-only`.
- `scripts/sync_and_deploy.ps1` — Skrip sinkronisasi 1-klik Termux Realme -> `public/` -> GitHub Pages.
- `src/App.tsx` & `src/main.tsx` — Koordinator state navigasi & entrypoint aplikasi.
- `.github/workflows/deploy.yml` — Workflow GitHub Actions pembangun `dist/` dan deployer otomatis ke `https://blue242.github.io/xperia-film/`.
