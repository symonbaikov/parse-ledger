#!/bin/sh
set -e

API_PORT="${API_PORT:-4000}"
FRONTEND_PORT="${PORT:-3000}"

echo "Running DB migrations..."
node backend/scripts/run-migrations-with-lock.js
echo "DB migrations done"

echo "Starting backend on port ${API_PORT}"
PORT="${API_PORT}" node backend/dist/main.js &
BACKEND_PID=$!

cleanup() {
  echo "Shutting down processes..."
  kill "${BACKEND_PID}" 2>/dev/null || true
}
trap cleanup EXIT INT TERM

echo "Starting frontend on port ${FRONTEND_PORT}"
cd frontend
HOSTNAME=0.0.0.0 PORT="${FRONTEND_PORT}" exec node server.js
