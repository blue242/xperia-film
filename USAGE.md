# USAGE — Panduan Penggunaan, Update Katalog (`upmini`) & Integrasi Bot

## 1. URL Live Produksi & Bot Resmi
- **GitHub Pages (Mini App URL):** `https://blue242.github.io/xperia-film/`
- **Bot Telegram Resmi:** `@xperiafilm_bot` (`https://t.me/xperiafilm_bot`) — foto profil sinema, tombol menu **`🎬 Buka Katalog`**, bio, deskripsi sambutan, command `/start`, dan OpenGraph link preview sudah aktif.

## 2. Satu-Perintah Update Katalog (`upmini`) dari Mana Saja
Katalog dapat diperbarui langsung dari **HP Realme**, **HP Sony Xperia** (Wi-Fi maupun paket data seluler), atau **PC Ryzen** tanpa konflik Git:

### A. Dari Termux (HP Realme atau HP Xperia)
```bash
upmini           # Sync penuh (Film + Series + Donghua) -> otomatis commit & push
upmini film      # Mode cepat (~5 dtk): scan @film_fast_update saja
upmini series    # Mode cepat (~5 dtk): scan live @Gudang_Series_Terbaru saja
upmini donghua   # Scan channel donghua + union donghua_sources.json
```

### B. Dari PC Ryzen (`c:\Users\server\katalog_mini_app`)
```powershell
.\upmini.cmd           # Auto-deteksi Realme/Xperia (LAN/Tailscale/ARP), sync & git pull --rebase
.\upmini.cmd film      # Mode cepat film
.\upmini.cmd series    # Mode cepat series
.\upmini.cmd donghua   # Mode donghua
npm run sync           # Jalankan sync penuh via npm script
```
Opsi lanjutan PowerShell (`-Only all|film|series|donghua`, `-Device auto|realme|xperia`):
```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File "c:\Users\server\katalog_mini_app\scripts\sync_and_deploy.ps1" -Only series -Device xperia
```

Alur otomatis `upmini`:
1. Tarik baseline terbaru dari `origin/main` (`git fetch && git reset --hard origin/main`) agar bebas konflik saat gantian HP.
2. Salin baseline `public/data` & `public/posters` ke `output/` sehingga `.webp` lama tidak diunduh ulang.
3. Jalankan `run_sync.py --only <mode>` (dengan salinan `.session` sementara di `$TMPDIR` yang langsung dihapus).
4. Salin hasil terbaru ke `public/` (menjaga `bot-avatar.jpg` tetap utuh), lalu `git commit` & `git push origin main` bila ada perubahan baru.

## 3. Konfigurasi Profil & Mini App Bot Telegram (`@xperiafilm_bot`)
Skrip bersifat *stateless* (membaca `$env:TELEGRAM_BOT_TOKEN` di memori atau input interaktif, **tidak pernah** menyimpan token ke file mana pun):
```powershell
$env:TELEGRAM_BOT_TOKEN = "<BOT_TOKEN_DARI_BOTFATHER>"
python c:\Users\server\katalog_mini_app\scripts\setup_telegram_bot.py
```
Untuk cek status live bot tanpa mengubah pengaturan apa pun:
```powershell
python c:\Users\server\katalog_mini_app\scripts\setup_telegram_bot.py --verify-only
```
*(Opsional: Untuk mengaktifkan status `has_main_web_app=true` agar muncul tombol Launch di profil bot, daftarkan URL Mini App lewat `@BotFather` -> `/setmainapp` -> `@xperiafilm_bot`.)*

## 4. Pengembangan Lokal (PC Ryzen)
```powershell
cd c:\Users\server\katalog_mini_app
npm install
npm run dev
npm run build
```
