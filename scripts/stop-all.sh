#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
LOG_DIR="$ROOT_DIR/.dev-logs"

kill_pid_file() {
  local pid_file="$1"
  if [[ -f "$pid_file" ]]; then
    pid="$(cat "$pid_file" 2>/dev/null || true)"
    if [[ -n "${pid:-}" ]]; then
      kill "$pid" >/dev/null 2>&1 || true
    fi
    rm -f "$pid_file"
  fi
}

kill_port_listener() {
  local port="$1"
  local pids
  pids="$(lsof -ti tcp:"$port" -sTCP:LISTEN || true)"
  if [[ -n "$pids" ]]; then
    echo "$pids" | xargs kill >/dev/null 2>&1 || true
  fi
}

echo "[teardown] Stopping tracked processes"
kill_pid_file "$LOG_DIR/backend.pid"
kill_pid_file "$LOG_DIR/web.pid"
kill_pid_file "$LOG_DIR/expo-web.pid"
kill_pid_file "$LOG_DIR/expo.pid"
kill_pid_file "$LOG_DIR/ios.pid"

echo "[teardown] Stopping listeners on known ports"
kill_port_listener 4001
kill_port_listener 3000
kill_port_listener 8081

echo "[teardown] Stopping iOS build helpers if still running"
pkill -f "expo run:ios" >/dev/null 2>&1 || true
pkill -f "pod install --ansi" >/dev/null 2>&1 || true
pkill -f xcodebuild >/dev/null 2>&1 || true

echo "[teardown] Done."
