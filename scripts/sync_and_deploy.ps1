<#
.SYNOPSIS
    Multi-Device One-Command Catalog Sync & Auto-Deploy (upmini) dari PC Ryzen.
.DESCRIPTION
    Mencari HP Termux yang aktif (Realme -> fallback Xperia -> scan ARP port 8022),
    menjalankan /data/data/com.termux/files/usr/bin/upmini <Only> di HP tersebut,
    lalu menarik hasil commit terbaru ke repo PC via git pull --rebase.
#>
[CmdletBinding()]
param(
    [ValidateSet("all", "film", "movies", "series", "donghua")]
    [string]$Only = "all",

    [ValidateSet("auto", "realme", "xperia")]
    [string]$Device = "auto"
)

$ErrorActionPreference = "Stop"
if ($Only -eq "movies") { $Only = "film" }

$ProjectDir = Split-Path -Parent $PSScriptRoot
$SshDir = Join-Path $env:USERPROFILE ".ssh"
$Port = 8022

$DeviceProfiles = @{
    realme = @{
        Label = "Realme"
        User  = "u0_a445"
        Key   = Join-Path $SshDir "id_ed25519"
        Hosts = @("192.168.100.3", "192.168.100.60", "100.94.171.52")
    }
    xperia = @{
        Label = "Xperia"
        User  = "u0_a471"
        Key   = Join-Path $SshDir "id_hermes_xperia"
        Hosts = @("192.168.100.14", "192.168.100.4", "100.114.234.48")
    }
}

function Test-TcpPortFast {
    param(
        [string]$HostIp,
        [int]$TargetPort = 8022,
        [int]$TimeoutMs = 600
    )
    $client = $null
    try {
        $client = New-Object System.Net.Sockets.TcpClient
        $iar = $client.BeginConnect($HostIp, $TargetPort, $null, $null)
        if (-not $iar.AsyncWaitHandle.WaitOne($TimeoutMs, $false)) {
            return $false
        }
        $client.EndConnect($iar)
        return $true
    } catch {
        return $false
    } finally {
        if ($null -ne $client) { $client.Dispose() }
    }
}

function Test-TermuxUpmini {
    param(
        [string]$HostIp,
        [string]$User,
        [string]$KeyPath
    )
    if (-not (Test-Path $KeyPath)) { return $false }
    try {
        $probe = & ssh -o BatchMode=yes -o ConnectTimeout=4 -o StrictHostKeyChecking=accept-new -p $Port -i $KeyPath "$User@$HostIp" "test -x /data/data/com.termux/files/usr/bin/upmini && echo UPMINI_OK" 2>$null
        return ($LASTEXITCODE -eq 0 -and ($probe -match "UPMINI_OK"))
    } catch {
        return $false
    }
}

function Get-ArpOpenPort8022Hosts {
    param([string[]]$ExcludeIps)
    $candidates = New-Object System.Collections.Generic.List[string]
    $arpLines = & arp -a 2>$null
    foreach ($line in $arpLines) {
        if ($line -match '^\s*(192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(?:1[6-9]|2\d|3[0-1])\.\d+\.\d+)\s+') {
            $ip = $matches[1]
            if ($ip.EndsWith(".1") -or $ip.EndsWith(".255")) { continue }
            if ($ExcludeIps -contains $ip) { continue }
            if (-not $candidates.Contains($ip)) {
                $candidates.Add($ip)
            }
        }
    }
    if ($candidates.Count -eq 0) { return @() }

    # Probe paralel agar seluruh tabel ARP selesai dalam <600ms
    $pending = @()
    foreach ($ip in $candidates) {
        $tcp = New-Object System.Net.Sockets.TcpClient
        try {
            $iar = $tcp.BeginConnect($ip, $Port, $null, $null)
            $pending += [pscustomobject]@{ Ip = $ip; Client = $tcp; Async = $iar }
        } catch {
            $tcp.Dispose()
        }
    }

    $deadline = (Get-Date).AddMilliseconds(600)
    $openIps = New-Object System.Collections.Generic.List[string]
    foreach ($entry in $pending) {
        $remMs = [int]([Math]::Max(1, ($deadline - (Get-Date)).TotalMilliseconds))
        try {
            if ($entry.Async.AsyncWaitHandle.WaitOne($remMs, $false)) {
                $entry.Client.EndConnect($entry.Async)
                $openIps.Add($entry.Ip)
            }
        } catch {
            # port closed / refused
        } finally {
            $entry.Client.Dispose()
        }
    }
    return $openIps.ToArray()
}

function Resolve-ActiveDevice {
    param([string]$RequestedDevice)

    $order = if ($RequestedDevice -eq "auto") { @("realme", "xperia") } else { @($RequestedDevice) }
    $probedIps = New-Object System.Collections.Generic.List[string]

    foreach ($devKey in $order) {
        $prof = $DeviceProfiles[$devKey]
        foreach ($ip in $prof.Hosts) {
            if (-not $probedIps.Contains($ip)) { $probedIps.Add($ip) }
            Write-Host "  Mengecek $($prof.Label) ($ip`:$Port)..." -ForegroundColor DarkGray
            if (Test-TcpPortFast -HostIp $ip -TargetPort $Port -TimeoutMs 600) {
                if (Test-TermuxUpmini -HostIp $ip -User $prof.User -KeyPath $prof.Key) {
                    return [pscustomobject]@{
                        Key   = $devKey
                        Label = $prof.Label
                        User  = $prof.User
                        Ip    = $ip
                        KeyPath = $prof.Key
                    }
                }
            }
        }
    }

    Write-Host "  IP dikenal tidak merespons, memindai tabel ARP lokal port $Port..." -ForegroundColor Yellow
    $arpOpenIps = Get-ArpOpenPort8022Hosts -ExcludeIps $probedIps.ToArray()
    foreach ($ip in $arpOpenIps) {
        foreach ($devKey in $order) {
            $prof = $DeviceProfiles[$devKey]
            Write-Host "  Mencoba identitas $($prof.Label) di IP ARP $ip`:$Port..." -ForegroundColor DarkGray
            if (Test-TermuxUpmini -HostIp $ip -User $prof.User -KeyPath $prof.Key) {
                return [pscustomobject]@{
                    Key   = $devKey
                    Label = $prof.Label
                    User  = $prof.User
                    Ip    = $ip
                    KeyPath = $prof.Key
                }
            }
        }
    }

    throw "Tidak ada HP Termux ($($order -join ' / ')) yang aktif di port $Port (LAN, Tailscale, maupun ARP)."
}

Write-Host "==> [1/3] Mencari perangkat Termux aktif (Device=$Device, Only=$Only)..." -ForegroundColor Cyan
$target = Resolve-ActiveDevice -RequestedDevice $Device
Write-Host "  Terhubung ke $($target.Label) ($($target.User)@$($target.Ip):$Port)" -ForegroundColor Green

Write-Host "==> [2/3] Menjalankan upmini '$Only' di $($target.Label)..." -ForegroundColor Cyan
& ssh -o BatchMode=yes -o ConnectTimeout=10 -o ServerAliveInterval=15 -o ServerAliveCountMax=8 -o StrictHostKeyChecking=accept-new -p $Port -i $target.KeyPath "$($target.User)@$($target.Ip)" "/data/data/com.termux/files/usr/bin/upmini $Only"
if ($LASTEXITCODE -ne 0) {
    throw "Eksekusi upmini di $($target.Label) gagal dengan exit code $LASTEXITCODE."
}

Write-Host "==> [3/3] Menyinkronkan repo lokal PC via git pull --rebase origin main..." -ForegroundColor Cyan
Set-Location $ProjectDir
$dirty = & git status --porcelain
if ([string]::IsNullOrWhiteSpace($dirty)) {
    & git pull --rebase origin main
} else {
    & git pull --rebase --autostash origin main
}
if ($LASTEXITCODE -ne 0) {
    throw "git pull --rebase origin main gagal di $ProjectDir."
}

Write-Host "Sinkronisasi selesai! Repo PC dan GitHub Pages sudah selaras." -ForegroundColor Green
