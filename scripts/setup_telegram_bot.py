#!/usr/bin/env python3
"""
Interaktif Setup Tombol Menu WebApp Telegram untuk Xperia Film.
Tidak menyimpan BOT_TOKEN ke file mana pun (100% aman).

Cara pakai:
  python scripts/setup_telegram_bot.py
"""

from __future__ import annotations

import argparse
import json
import os
import sys
import urllib.error
import urllib.request

DEFAULT_MINI_APP_URL = "https://blue242.github.io/xperia-film/"
DEFAULT_BUTTON_TEXT = "🎬 Xperia Film"


def tg_api_request(token: str, method: str, payload: dict | None = None) -> dict:
    url = f"https://api.telegram.org/bot{token}/{method}"
    data = None
    headers = {}
    if payload is not None:
        data = json.dumps(payload).encode("utf-8")
        headers["Content-Type"] = "application/json"

    req = urllib.request.Request(url, data=data, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=20) as resp:
            body = json.loads(resp.read().decode("utf-8"))
            return body
    except urllib.error.HTTPError as err:
        raw = err.read().decode("utf-8", errors="replace")
        raise RuntimeError(f"HTTP {err.code} pada {method}: {raw}") from err
    except urllib.error.URLError as err:
        raise RuntimeError(f"Gagal terhubung ke API Telegram: {err}") from err


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Pasang tombol Menu Mini App Xperia Film ke Bot Telegram."
    )
    parser.add_argument(
        "--token",
        help="BOT_TOKEN dari @BotFather (kosongkan untuk input interaktif).",
        default=os.environ.get("TELEGRAM_BOT_TOKEN", ""),
    )
    parser.add_argument(
        "--url",
        help=f"URL Live Mini App (default: {DEFAULT_MINI_APP_URL})",
        default=DEFAULT_MINI_APP_URL,
    )
    parser.add_argument(
        "--text",
        help=f"Teks tombol Menu Bot (default: {DEFAULT_BUTTON_TEXT})",
        default=DEFAULT_BUTTON_TEXT,
    )
    args = parser.parse_args()

    print("=" * 60)
    print("🎬  XPERIA FILM — TELEGRAM MINI APP BOT CONFIGURATOR")
    print("=" * 60)

    token = args.token.strip()
    if not token:
        token = input("Masukkan BOT_TOKEN dari @BotFather: ").strip()

    if not token or ":" not in token:
        print("❌ Format BOT_TOKEN tidak valid (contoh: 123456789:AAH...).")
        return 1

    print("\n[1/3] Memverifikasi akun bot ke Telegram...")
    me_res = tg_api_request(token, "getMe")
    if not me_res.get("ok"):
        print(f"❌ Token ditolak Telegram: {me_res}")
        return 1

    bot_info = me_res["result"]
    bot_username = bot_info.get("username", "unknown_bot")
    bot_name = bot_info.get("first_name", "Bot")
    print(f"   ✅ Terhubung ke: {bot_name} (@{bot_username})")

    print(f"\n[2/3] Memasang tombol Menu WebApp '{args.text}' -> {args.url} ...")
    menu_res = tg_api_request(
        token,
        "setChatMenuButton",
        {
            "menu_button": {
                "type": "web_app",
                "text": args.text,
                "web_app": {"url": args.url},
            }
        },
    )
    if not menu_res.get("ok"):
        print(f"❌ Gagal memasang Chat Menu Button: {menu_res}")
        return 1
    print("   ✅ Tombol Menu WebApp berhasil diaktifkan!")

    print("\n[3/3] Memperbarui daftar perintah dasar bot (/start)...")
    tg_api_request(
        token,
        "setMyCommands",
        {
            "commands": [
                {
                    "command": "start",
                    "description": "Buka Katalog Streaming Xperia Film",
                }
            ]
        },
    )
    print("   ✅ Perintah /start diperbarui!")

    print("\n" + "=" * 60)
    print("🎉 SELESAI! Mini App sudah terpasang di @" + bot_username)
    print(f"🔗 Buka bot di Telegram: https://t.me/{bot_username}")
    print(
        "💡 Opsional (Direct Link): Buka @BotFather -> /newapp -> pilih @"
        + bot_username
        + f" -> masukkan URL: {args.url}"
    )
    print("=" * 60)
    return 0


if __name__ == "__main__":
    sys.exit(main())
