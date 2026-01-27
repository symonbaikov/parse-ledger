#!/bin/sh
set -e

UPLOADS_DIR="${UPLOADS_DIR:-/app/uploads}"

mkdir -p "$UPLOADS_DIR" "$UPLOADS_DIR/reports"
chown -R app:app "$UPLOADS_DIR"

exec su-exec app "$@"
