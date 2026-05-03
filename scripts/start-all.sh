#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
LOG_DIR="$ROOT_DIR/.dev-logs"
mkdir -p "$LOG_DIR"

RUN_IOS=0
RUN_EXPO_WEB=0
SKIP_INSTALL=0

for arg in "$@"; do
  case "$arg" in
    --ios) RUN_IOS=1 ;;
    --expo-web) RUN_EXPO_WEB=1 ;;
    --skip-install) SKIP_INSTALL=1 ;;
    *)
      echo "Unknown option: $arg"
      echo "Usage: ./scripts/start-all.sh [--ios] [--expo-web] [--skip-install]"
      exit 1
      ;;
  esac
done

ensure_env_file() {
  local env_file="$1"
  local example_file="$2"
  local app_name="$3"

  if [[ -f "$env_file" ]]; then
    return
  fi

  if [[ ! -f "$example_file" ]]; then
    echo "Missing $example_file for $app_name"
    exit 1
  fi

  cp "$example_file" "$env_file"
  echo "[setup] Created $env_file from .env.example"
}

apply_default_backend_env() {
  local env_file="$ROOT_DIR/backend/.env"

  ENV_FILE="$env_file" python3 - <<'PY'
import os
from pathlib import Path

path = Path(os.environ["ENV_FILE"])
lines = path.read_text(encoding="utf-8").splitlines()

def replace_or_append(key: str, value: str) -> None:
    replacement = f'{key}="{value}"'
    for i, line in enumerate(lines):
        if line.startswith(f"{key}="):
            lines[i] = replacement
            return
    lines.append(replacement)

replace_or_append("DATABASE_URL", "postgresql://user:password@localhost:55432/js_ashanti_db")
replace_or_append("BETTER_AUTH_URL", "http://localhost:4001")

path.write_text("\n".join(lines) + "\n", encoding="utf-8")
PY
}

kill_port_listener() {
  local port="$1"
  local pids
  pids="$(lsof -ti tcp:"$port" -sTCP:LISTEN || true)"
  if [[ -n "$pids" ]]; then
    echo "[setup] Stopping process on port $port: $pids"
    echo "$pids" | xargs kill >/dev/null 2>&1 || true
  fi
}

wait_for_http() {
  local url="$1"
  local attempts="$2"
  local sleep_seconds="$3"

  for ((i = 1; i <= attempts; i++)); do
    code="$(curl -s -o /dev/null -w "%{http_code}" "$url" || true)"
    if [[ "$code" =~ ^(200|204|301|302|307|308)$ ]]; then
      return 0
    fi
    sleep "$sleep_seconds"
  done
  return 1
}

echo "[setup] Preparing environment files"
ensure_env_file "$ROOT_DIR/backend/.env" "$ROOT_DIR/backend/.env.example" "backend"
ensure_env_file "$ROOT_DIR/web/.env" "$ROOT_DIR/web/.env.example" "web"
ensure_env_file "$ROOT_DIR/mobile/.env" "$ROOT_DIR/mobile/.env.example" "mobile"
apply_default_backend_env

echo "[setup] Starting Docker database"
if docker ps -a --format "{{.Names}}" | awk '$0=="js_ashanti_db"{found=1} END{exit found?0:1}'; then
  docker start js_ashanti_db >/dev/null 2>&1 || true
else
  (cd "$ROOT_DIR" && docker compose up -d db >/dev/null)
fi

echo "[setup] Waiting for database readiness"
for _ in {1..20}; do
  if docker exec js_ashanti_db pg_isready -U user -d js_ashanti_db >/dev/null 2>&1; then
    break
  fi
  sleep 1
done

if ! docker exec js_ashanti_db pg_isready -U user -d js_ashanti_db >/dev/null 2>&1; then
  echo "[setup] Database did not become ready. Check docker logs."
  exit 1
fi

if [[ "$SKIP_INSTALL" -eq 0 ]]; then
  echo "[setup] Installing dependencies (backend, web, mobile)"
  (cd "$ROOT_DIR/backend" && npm install >/dev/null)
  (cd "$ROOT_DIR/web" && npm install >/dev/null)
  (cd "$ROOT_DIR/mobile" && npm install >/dev/null)
fi

kill_port_listener 4001
kill_port_listener 3000
kill_port_listener 8081

echo "[setup] Starting backend"
(cd "$ROOT_DIR/backend" && nohup npm run dev >"$LOG_DIR/backend.log" 2>&1 & echo $! >"$LOG_DIR/backend.pid")

echo "[setup] Starting web"
(cd "$ROOT_DIR/web" && nohup npm run dev >"$LOG_DIR/web.log" 2>&1 & echo $! >"$LOG_DIR/web.pid")

echo "[setup] Starting Metro bundler for Mobile App"
(cd "$ROOT_DIR/mobile" && nohup npm start >"$LOG_DIR/expo.log" 2>&1 & echo $! >"$LOG_DIR/expo.pid")

if [[ "$RUN_EXPO_WEB" -eq 1 ]]; then
  echo "[setup] Starting Expo web"
  (cd "$ROOT_DIR/mobile" && nohup npm run web >"$LOG_DIR/expo-web.log" 2>&1 & echo $! >"$LOG_DIR/expo-web.pid")
fi

if [[ "$RUN_IOS" -eq 1 ]]; then
  echo "[setup] Starting Expo iOS (first run may take several minutes)"
  (cd "$ROOT_DIR/mobile" && nohup npm run ios >"$LOG_DIR/ios.log" 2>&1 & echo $! >"$LOG_DIR/ios.pid")
fi

echo "[setup] Waiting for backend/web health checks"
wait_for_http "http://localhost:4001/api/health" 30 1 || {
  echo "[error] Backend health check failed. See $LOG_DIR/backend.log"
  exit 1
}
wait_for_http "http://localhost:3000" 45 1 || {
  echo "[error] Web health check failed. See $LOG_DIR/web.log"
  exit 1
}

echo
echo "Started services:"
echo "  - Backend: http://localhost:4001/api/health"
echo "  - Web:     http://localhost:3000"
if [[ "$RUN_EXPO_WEB" -eq 1 ]]; then
  echo "  - Expo:    http://localhost:8081"
fi
if [[ "$RUN_IOS" -eq 1 ]]; then
  echo "  - iOS:     building/running via Expo (see $LOG_DIR/ios.log)"
fi
echo
echo "Logs:"
echo "  tail -f \"$LOG_DIR/backend.log\""
echo "  tail -f \"$LOG_DIR/web.log\""
if [[ "$RUN_EXPO_WEB" -eq 1 ]]; then
  echo "  tail -f \"$LOG_DIR/expo-web.log\""
fi
if [[ "$RUN_IOS" -eq 1 ]]; then
  echo "  tail -f \"$LOG_DIR/ios.log\""
fi
