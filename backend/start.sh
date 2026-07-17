#!/bin/sh

set -e

python3 -m app.telegram.listener &

exec uvicorn app.main:app \
  --host 0.0.0.0 \
  --port "${PORT:-8000}"