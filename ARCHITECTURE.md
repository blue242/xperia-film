# ARCHITECTURE — Xperia Film Mini App

## 1. Arsitektur Multi-Perangkat (`upmini`)

### A. Data Pipeline & Poster Engine (Termux Realme & Termux Xperia)
Lokasi sinkronisasi: `~/DOPESSORNO/xperia_film_sync/` (membaca sumber secara *read-only*) + clone deploy `~/DOPESSORNO/xperia_film_repo/` (via SSH deploy key `github-xperia-film`):
- `config_sync.py` — Loader kredensial `~/.config/dopessorno/media_hub/environment`, `~/DOPESSORNO/donghua_catalog/`, `TMDB_API_KEY`, `MEDIA_HUB_DIR`, dan `DONGHUA_SOURCES_PATH`.
- `session_guard.py` — `safe_telegram_client` yang menyalin `.session` sementara ke `$TMPDIR/xperia_sync_sessions/` (`receive_updates=False`) agar bebas SQLite lock dan otomatis terhapus di `finally:`.
- `enricher_api.py` — Enricher konkuren ke TMDB v3 & AniList GraphQL + cache `cache/api_cache.json`.
- `poster_downloader.py` — Konverter `.webp` (`420px` poster, `1280px` hero backdrop) + ekstraktor `accent_color` vibran.
- `collector_movies.py` — Kolektor film `@film_fast_update` (termasuk multi-part & resolusi).
- `collector_series.py` — Live scanner `@Gudang_Series_Terbaru` (impor *read-only* `SeriesChannelScanner`, `parse_series_meta`, `parse_series_episode`, & `build_series_index` dari `~/DOPESSORNO/media_hub/series_index/`, fallback ke `series_catalog.json`).
- `collector_donghua.py` — Union sumber channel publik lintas HP (`~/DOPESSORNO/donghua_catalog/donghua.json` + `output/data/donghua_sources.json` tanpa kredensial) + kolektor episode multi-resolusi.
- `exporter.py` — Validator mandiri & ekspor JSON atomik ke `output/` (menjaga `updated_at` bila tidak ada perubahan katalog).
- `run_sync.py` — Entrypoint sinkronisasi penuh & mode cepat parsial (`--only all|film|series|donghua`).
- `upmini.sh` — Orkestrator 1-perintah Termux (terpasang di `/data/data/com.termux/files/usr/bin/upmini`): `git reset --hard origin/main`, sync baseline, jalankan `run_sync.py`, perbarui `public/`, commit & push bila ada perubahan.

### B. Frontend Modular Anti-Monolith & Orkestrator PC Ryzen
Lokasi: `c:\Users\server\katalog_mini_app\` (Stack: React 18, TypeScript, Vite 6, Tailwind CSS 3, Lucide Icons):
- `src/types/catalog.ts` — Kontrak tipe data katalog, filter, riwayat tontonan, dan konteks grid.
- `src/utils/` — `telegram.ts`, `assetUrl.ts`, `catalogHelpers.ts`.
- `src/hooks/` — `useCatalogData.ts`, `useUserLibrary.ts`.
- `src/components/` — Komponen modular di subfolder `layout/`, `cards/`, `home/`, `explore/`, `detail/`, `modals/`.
- `index.html` — Entry HTML dengan Telegram WebApp SDK, font `Outfit` / `Plus Jakarta Sans`, `apple-touch-icon`, serta meta OpenGraph (`og:image` -> `bot-avatar.jpg`).
- `public/bot-avatar.jpg` — Aset foto profil resmi `@xperiafilm_bot` (`640x640` RGB JPEG) sekaligus thumbnail share link OpenGraph.
- `public/data/` — `movies.json`, `series.json`, `donghua.json`, `catalog_stats.json`, dan `donghua_sources.json` (non-rahasia, 0 kredensial).
- `scripts/setup_telegram_bot.py` — Konfigurator profil & Mini App `@xperiafilm_bot` berbasis stdlib Python (`--verify-only`, `setMyProfilePhoto`, `setChatMenuButton`, bio, deskripsi, `/start`).
- `scripts/sync_and_deploy.ps1` & `upmini.cmd` — Orkestrator PC Ryzen: deteksi otomatis HP aktif (`realme` -> `xperia` -> scan `arp -a` port `8022`), eksekusi `upmini` remote via SSH, dan `git pull --rebase origin main`.
- `src/App.tsx` & `src/main.tsx` — Koordinator state navigasi & entrypoint aplikasi.
- `.github/workflows/deploy.yml` — Workflow GitHub Actions pembangun `dist/` dan deployer otomatis ke `https://blue242.github.io/xperia-film/`.
