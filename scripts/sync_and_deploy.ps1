# Skrip Satu-Klik Sinkronisasi Katalog dari Realme & Deploy Otomatis ke GitHub Pages
$ErrorActionPreference = "Stop"

$ProjectDir = "c:\Users\server\katalog_mini_app"
$TempArchive = Join-Path $env:TEMP "xperia_sync_bundle.tar.gz"

Write-Host "==> [1/4] Menjalankan pipeline sinkronisasi di Termux Realme..." -ForegroundColor Cyan
ssh realme 'python3 -u ~/DOPESSORNO/xperia_film_sync/run_sync.py'

Write-Host "==> [2/4] Mengemas & mengunduh data + poster terbaru dari Realme..." -ForegroundColor Cyan
ssh realme 'tar -czf /data/data/com.termux/files/usr/tmp/sync_bundle.tar.gz -C ~/DOPESSORNO/xperia_film_sync/output data posters'
scp realme:/data/data/com.termux/files/usr/tmp/sync_bundle.tar.gz "$TempArchive"
ssh realme 'rm -f /data/data/com.termux/files/usr/tmp/sync_bundle.tar.gz'

Write-Host "==> [3/4] Mengekstrak aset ke public/ di PC..." -ForegroundColor Cyan
tar -xzf "$TempArchive" -C "$ProjectDir\public"
Remove-Item -Force "$TempArchive"

Write-Host "==> [4/4] Memeriksa perubahan & push ke GitHub Pages..." -ForegroundColor Cyan
Set-Location $ProjectDir
git add public/data public/posters

$status = git status --porcelain public/data public/posters
if ([string]::IsNullOrWhiteSpace($status)) {
    Write-Host "Tidak ada perubahan katalog baru. Live site sudah paling mutakhir!" -ForegroundColor Green
} else {
    $stamp = Get-Date -Format "yyyy-MM-dd HH:mm"
    git commit -m "chore(catalog): sync latest movies, series & donghua ($stamp)"
    git push origin main
    Write-Host "Berhasil di-push! GitHub Actions otomatis men-deploy update ke https://blue242.github.io/xperia-film/" -ForegroundColor Green
}
