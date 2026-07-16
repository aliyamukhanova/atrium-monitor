#!/bin/sh

set -e

python app/telegram/telethon.py &

exec uvicorn app.main:app \
  --host 0.0.0.0 \
  --port "${PORT:-8000}"