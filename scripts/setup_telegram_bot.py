#!/usr/bin/env python3
"""
Setup & Konfigurasi Lengkap Profil Bot Telegram untuk Xperia Film.
Menggunakan stdlib Python murni (urllib, json, mimetypes, uuid) dan tidak pernah
menyimpan BOT_TOKEN ke file mana pun (hanya via env var atau input interaktif).

Cara pakai (PowerShell):
  $env:TELEGRAM_BOT_TOKEN = "<token_dari_BotFather>"
  python scripts/setup_telegram_bot.py
"""

from __future__ import annotations

import argparse
import json
import mimetypes
import os
import sys
import urllib.error
import urllib.request
import uuid
from pathlib import Path
from typing import Any

REPO_ROOT = Path(__file__).resolve().parent.parent
DEFAULT_AVATAR_REL = Path("public") / "bot-avatar.jpg"
DEFAULT_MINI_APP_URL = "https://blue242.github.io/xperia-film/"
DEFAULT_BUTTON_TEXT = "🎬 Buka Katalog"
DEFAULT_SHORT_DESCRIPTION = (
    "🎬 Katalog Streaming Premium Film, Series & Donghua Sub Indo (4K/1080p) "
    "— Klik Buka Katalog untuk mulai nonton!"
)
DEFAULT_DESCRIPTION = (
    "🎬 Selamat datang di XPERIA FILM!\n\n"
    "Nikmati katalog streaming sinema premium langsung di Telegram:\n"
    "• 🎥 Ratusan Film Box Office HD Sub Indo\n"
    "• 📺 Series Barat, Korea & Asia Lengkap per Season\n"
    "• 🐉 Donghua Kultivasi 4K / 1080p / 720p Sub Indo\n\n"
    "👇 Tekan tombol [🎬 Buka Katalog] di pojok kiri bawah untuk mulai menjelajah!"
)
DEFAULT_COMMANDS = [
    {
        "command": "start",
        "description": "Buka Katalog Streaming Xperia Film",
    }
]


def _configure_utf8_stdio() -> None:
    """Pastikan stdout/stderr aman mencetak karakter emoji di terminal Windows."""
    for stream in (sys.stdout, sys.stderr):
        reconfigure = getattr(stream, "reconfigure", None)
        if callable(reconfigure):
            reconfigure(encoding="utf-8", errors="replace")


def resolve_avatar_path(raw_path: str) -> Path:
    """Cari file avatar relatif dari direktori kerja saat ini atau root repo."""
    candidate = Path(raw_path)
    if candidate.is_file():
        return candidate.resolve()
    if not candidate.is_absolute():
        repo_candidate = REPO_ROOT / candidate
        if repo_candidate.is_file():
            return repo_candidate.resolve()
    raise FileNotFoundError(
        f"File avatar tidak ditemukan: {raw_path} "
        f"(sudah dicek di CWD dan {REPO_ROOT})"
    )


def build_multipart_form(
    fields: dict[str, str],
    files: dict[str, tuple[str, bytes, str]],
) -> tuple[bytes, str]:
    """Bangun body multipart/form-data menggunakan stdlib uuid tanpa dependensi luar."""
    boundary = f"----XperiaFilmBoundary{uuid.uuid4().hex}"
    chunks: list[bytes] = []

    for name, value in fields.items():
        chunks.extend(
            [
                f"--{boundary}\r\n".encode("utf-8"),
                f'Content-Disposition: form-data; name="{name}"\r\n\r\n'.encode("utf-8"),
                f"{value}\r\n".encode("utf-8"),
            ]
        )

    for field_name, (filename, content, content_type) in files.items():
        chunks.extend(
            [
                f"--{boundary}\r\n".encode("utf-8"),
                (
                    f'Content-Disposition: form-data; name="{field_name}"; '
                    f'filename="{filename}"\r\n'
                ).encode("utf-8"),
                f"Content-Type: {content_type}\r\n\r\n".encode("utf-8"),
                content,
                b"\r\n",
            ]
        )

    chunks.append(f"--{boundary}--\r\n".encode("utf-8"))
    return b"".join(chunks), f"multipart/form-data; boundary={boundary}"


def tg_api_request(
    token: str,
    method: str,
    payload: dict[str, Any] | None = None,
    files: dict[str, tuple[str, bytes, str]] | None = None,
) -> dict[str, Any]:
    """Kirim request JSON atau multipart/form-data ke Telegram Bot API."""
    url = f"https://api.telegram.org/bot{token}/{method}"
    data: bytes | None = None
    headers: dict[str, str] = {}

    if files:
        fields = {
            key: (
                value
                if isinstance(value, str)
                else json.dumps(value, ensure_ascii=False)
            )
            for key, value in (payload or {}).items()
        }
        data, content_type = build_multipart_form(fields, files)
        headers["Content-Type"] = content_type
        headers["Content-Length"] = str(len(data))
    elif payload is not None:
        data = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        headers["Content-Type"] = "application/json; charset=utf-8"

    req = urllib.request.Request(url, data=data, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            return json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as err:
        raw = err.read().decode("utf-8", errors="replace")
        raise RuntimeError(f"HTTP {err.code} pada {method}: {raw}") from err
    except urllib.error.URLError as err:
        raise RuntimeError(
            f"Gagal terhubung ke API Telegram pada {method}: {err.reason}"
        ) from err


def assert_ok(response: dict[str, Any], step_name: str) -> Any:
    """Pastikan respons API Telegram bernilai ok=True dan kembalikan field result."""
    if not response.get("ok"):
        raise RuntimeError(f"Telegram menolak {step_name}: {response}")
    return response.get("result")


def verify_bot(token: str) -> dict[str, Any]:
    """Langkah 1: Verifikasi koneksi & identitas bot lewat getMe."""
    bot_info = assert_ok(tg_api_request(token, "getMe"), "getMe")
    print(
        f"   ✅ Terhubung ke: {bot_info.get('first_name')} "
        f"(@{bot_info.get('username')}, id={bot_info.get('id')}, "
        f"has_main_web_app={bot_info.get('has_main_web_app')})"
    )
    return bot_info


def upload_profile_photo(token: str, avatar_path: Path) -> None:
    """Langkah 2: Upload foto profil bot via setMyProfilePhoto (multipart/form-data)."""
    raw_bytes = avatar_path.read_bytes()
    guessed_type, _ = mimetypes.guess_type(avatar_path.name)
    content_type = (
        "image/jpeg"
        if avatar_path.suffix.lower() in {".jpg", ".jpeg"}
        else (guessed_type or "application/octet-stream")
    )

    res = tg_api_request(
        token,
        "setMyProfilePhoto",
        payload={"photo": {"type": "static", "photo": "attach://bot_avatar"}},
        files={"bot_avatar": (avatar_path.name, raw_bytes, content_type)},
    )
    assert_ok(res, "setMyProfilePhoto")
    print(
        f"   ✅ Foto profil '{avatar_path.name}' ({len(raw_bytes):,} bytes, "
        f"{content_type}) berhasil dipasang!"
    )


def configure_menu_button(token: str, url: str, text: str) -> None:
    """Langkah 3: Pasang tombol WebApp Menu Button."""
    res = tg_api_request(
        token,
        "setChatMenuButton",
        payload={
            "menu_button": {
                "type": "web_app",
                "text": text,
                "web_app": {"url": url},
            }
        },
    )
    assert_ok(res, "setChatMenuButton")
    print(f"   ✅ Tombol Menu WebApp '{text}' -> {url} aktif!")


def configure_short_description(token: str, short_description: str) -> None:
    """Langkah 4: Pasang bio ringkas profil bot via setMyShortDescription."""
    res = tg_api_request(
        token,
        "setMyShortDescription",
        payload={"short_description": short_description},
    )
    assert_ok(res, "setMyShortDescription")
    print(f"   ✅ Bio ringkas ({len(short_description)} karakter) diperbarui!")


def configure_description(token: str, description: str) -> None:
    """Langkah 5: Pasang deskripsi ruang chat bot via setMyDescription."""
    res = tg_api_request(
        token,
        "setMyDescription",
        payload={"description": description},
    )
    assert_ok(res, "setMyDescription")
    print(f"   ✅ Deskripsi sambutan ({len(description)} karakter) diperbarui!")


def configure_commands(token: str, commands: list[dict[str, str]]) -> None:
    """Langkah 6: Pasang daftar command bot (/start) via setMyCommands."""
    res = tg_api_request(
        token,
        "setMyCommands",
        payload={"commands": commands},
    )
    assert_ok(res, "setMyCommands")
    cmd_names = ", ".join(f"/{item['command']}" for item in commands)
    print(f"   ✅ Command bot ({cmd_names}) diperbarui!")


def run_live_verification(token: str, bot_id: int) -> dict[str, Any]:
    """Ambil kembali seluruh status profil bot secara read-only untuk verifikasi."""
    return {
        "getMe": tg_api_request(token, "getMe"),
        "getUserProfilePhotos": tg_api_request(
            token, "getUserProfilePhotos", {"user_id": bot_id}
        ),
        "getChatMenuButton": tg_api_request(token, "getChatMenuButton"),
        "getMyShortDescription": tg_api_request(token, "getMyShortDescription"),
        "getMyDescription": tg_api_request(token, "getMyDescription"),
        "getMyCommands": tg_api_request(token, "getMyCommands"),
    }


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Konfigurasi lengkap profil, avatar, bio, deskripsi & Mini App Bot Telegram Xperia Film."
    )
    parser.add_argument(
        "--token",
        help="BOT_TOKEN dari @BotFather (default membaca env var TELEGRAM_BOT_TOKEN).",
        default=os.environ.get("TELEGRAM_BOT_TOKEN", ""),
    )
    parser.add_argument(
        "--avatar",
        help=f"Path foto profil bot JPG/JPEG (default: {DEFAULT_AVATAR_REL.as_posix()} relatif dari root repo).",
        default=DEFAULT_AVATAR_REL.as_posix(),
    )
    parser.add_argument(
        "--url",
        help=f"URL Live Mini App (default: {DEFAULT_MINI_APP_URL})",
        default=DEFAULT_MINI_APP_URL,
    )
    parser.add_argument(
        "--text",
        help=f"Teks tombol Menu WebApp (default: {DEFAULT_BUTTON_TEXT})",
        default=DEFAULT_BUTTON_TEXT,
    )
    parser.add_argument(
        "--verify-only",
        action="store_true",
        help="Hanya jalankan verifikasi baca tanpa mengubah konfigurasi bot.",
    )
    return parser.parse_args()


def main() -> int:
    _configure_utf8_stdio()
    args = parse_args()

    print("=" * 64)
    print("🎬  XPERIA FILM — TELEGRAM BOT & MINI APP CONFIGURATOR")
    print("=" * 64)

    token = args.token.strip()
    if not token:
        token = input("Masukkan BOT_TOKEN dari @BotFather: ").strip()

    if not token or ":" not in token:
        print("❌ Format BOT_TOKEN tidak valid (contoh: 123456789:AAH...).")
        return 1

    if args.verify_only:
        me = verify_bot(token)
        report = run_live_verification(token, int(me["id"]))
        print("\n📋 Verifikasi Live API Telegram:")
        print(json.dumps(report, indent=2, ensure_ascii=False))
        return 0

    avatar_path = resolve_avatar_path(args.avatar)

    print("\n[1/6] Memverifikasi koneksi akun bot (getMe)...")
    bot_info = verify_bot(token)
    bot_username = bot_info.get("username", "unknown_bot")
    bot_id = int(bot_info["id"])

    print(f"\n[2/6] Mengunggah foto profil resmi ({avatar_path.name})...")
    upload_profile_photo(token, avatar_path)

    print(f"\n[3/6] Memasang tombol Menu WebApp '{args.text}' -> {args.url} ...")
    configure_menu_button(token, args.url, args.text)

    print("\n[4/6] Memasang bio profil ringkas (setMyShortDescription)...")
    configure_short_description(token, DEFAULT_SHORT_DESCRIPTION)

    print("\n[5/6] Memasang deskripsi ruang chat bot (setMyDescription)...")
    configure_description(token, DEFAULT_DESCRIPTION)

    print("\n[6/6] Memasang command dasar bot (/start)...")
    configure_commands(token, DEFAULT_COMMANDS)

    print("\n🔍 Memverifikasi status akhir langsung dari API Telegram...")
    verification = run_live_verification(token, bot_id)
    photos_result = verification["getUserProfilePhotos"].get("result", {})
    total_photos = photos_result.get("total_count", 0)
    menu_btn = verification["getChatMenuButton"].get("result", {})
    print(f"   • Foto Profil terpasang : total_count={total_photos}")
    print(
        f"   • Menu Button aktif     : {menu_btn.get('text')} -> "
        f"{menu_btn.get('web_app', {}).get('url')}"
    )

    print("\n" + "=" * 64)
    print(f"🎉 SELESAI! Profil & Mini App resmi aktif di @{bot_username}")
    print(f"🔗 Buka bot di Telegram: https://t.me/{bot_username}")
    print("=" * 64)
    return 0


if __name__ == "__main__":
    sys.exit(main())
