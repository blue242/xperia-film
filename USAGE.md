# USAGE — Panduan Penggunaan, Update Katalog & Integrasi Bot

## 1. URL Live Produksi & Bot Resmi
- **GitHub Pages (Mini App URL):** `https://blue242.github.io/xperia-film/`
- **Bot Telegram Resmi:** `@xperiafilm_bot` (`https://t.me/xperiafilm_bot`) — foto profil sinema, tombol menu **`🎬 Buka Katalog`**, bio, deskripsi sambutan, command `/start`, dan OpenGraph link preview sudah aktif.

## 2. Satu-Klik Update Katalog ke Depannya (PC Acer)
Setiap kali ada film, episode series, atau episode donghua baru di channel Telegram, jalankan skrip otomatis berikut di PowerShell PC Acer:
```powershell
powershell -ExecutionPolicy Bypass -File "c:\Users\server\katalog_mini_app\scripts\sync_and_deploy.ps1"
```
Alur otomatis yang dikerjakan skrip tersebut:
1. Menjalankan `run_sync.py` di Termux HP Realme via SSH (memakai cache API & melewati poster `.webp` lama agar cepat).
2. Mengunduh bundel `data/` & `posters/` terbaru ke `c:\Users\server\katalog_mini_app\public\`.
3. Melakukan `git commit` & `git push origin main` sehingga GitHub Actions langsung memperbarui web live secara otomatis dalam ~1 menit.

## 3. Cara Manual Sinkronisasi (Opsional)
```powershell
ssh realme 'python3 -u ~/DOPESSORNO/xperia_film_sync/run_sync.py'
ssh realme 'tar -czf /data/data/com.termux/files/usr/tmp/sync_bundle.tar.gz -C ~/DOPESSORNO/xperia_film_sync/output data posters'
scp realme:/data/data/com.termux/files/usr/tmp/sync_bundle.tar.gz "$env:TEMP\sync_bundle.tar.gz"
ssh realme 'rm -f /data/data/com.termux/files/usr/tmp/sync_bundle.tar.gz'
tar -xzf "$env:TEMP\sync_bundle.tar.gz" -C "c:\Users\server\katalog_mini_app\public"
Remove-Item -Force "$env:TEMP\sync_bundle.tar.gz"
cd c:\Users\server\katalog_mini_app
git add public/data public/posters
git commit -m "chore(catalog): update catalog"
git push origin main
```

## 4. Konfigurasi Profil & Mini App Bot Telegram (`@xperiafilm_bot`)
Skrip bersifat *stateless* (membaca `$env:TELEGRAM_BOT_TOKEN` di memori atau input interaktif, **tidak pernah** menyimpan token ke file mana pun):
```powershell
$env:TELEGRAM_BOT_TOKEN = "<BOT_TOKEN_DARI_BOTFATHER>"
python c:\Users\server\katalog_mini_app\scripts\setup_telegram_bot.py
```
Dalam satu eksekusi, skrip otomatis menjalankan:
1. `getMe` — memverifikasi identitas bot & status `has_main_web_app`.
2. `setMyProfilePhoto` — mengunggah `public/bot-avatar.jpg` (bisa diganti lewat `--avatar`).
3. `setChatMenuButton` — memasang tombol menu **`🎬 Buka Katalog`** ke `https://blue242.github.io/xperia-film/`.
4. `setMyShortDescription` & `setMyDescription` — memasang bio ringkas & sambutan ruang chat bot.
5. `setMyCommands` — mendaftarkan command `/start`.

Untuk cek status live bot tanpa mengubah pengaturan apa pun:
```powershell
python c:\Users\server\katalog_mini_app\scripts\setup_telegram_bot.py --verify-only
```
*(Opsional: Untuk mengaktifkan status `has_main_web_app=true` agar muncul tombol Launch di profil bot, daftarkan URL Mini App lewat `@BotFather` -> `/setmainapp` -> `@xperiafilm_bot`.)*

## 5. Pengembangan Lokal
```powershell
cd c:\Users\server\katalog_mini_app
npm install
npm run dev
npm run build
```
