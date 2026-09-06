#!/data/data/com.termux/files/usr/bin/bash
set -uo pipefail

ROOT="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
cd "$ROOT"

mkdir -p artifacts/termux
STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
LOG="artifacts/termux/task-${STAMP}.log"
LATEST="artifacts/termux/latest.log"

run_and_log() {
  printf '\n$' | tee -a "$LOG"
  printf ' %q' "$@" | tee -a "$LOG"
  printf '\n' | tee -a "$LOG"
  "$@" 2>&1 | tee -a "$LOG"
  local status=${PIPESTATUS[0]}
  printf '\n[exit_code=%s]\n' "$status" | tee -a "$LOG"
  cp "$LOG" "$LATEST"
  return "$status"
}

print_header() {
  {
    echo "Termux task report"
    echo "timestamp_utc=$STAMP"
    echo "repository=$ROOT"
    echo "branch=$(git branch --show-current 2>/dev/null || true)"
    echo "head=$(git rev-parse --short HEAD 2>/dev/null || true)"
    echo "node=$(node --version 2>/dev/null || echo missing)"
    echo "git=$(git --version 2>/dev/null || echo missing)"
    echo "uname=$(uname -a)"
  } | tee "$LOG"
}

usage() {
  cat <<'EOF'
Usage:
  bash tools/termux/run-task.sh doctor
  bash tools/termux/run-task.sh checks
  bash tools/termux/run-task.sh dimensions <image> [image...]
  bash tools/termux/run-task.sh command <program> [args...]

The full output is saved to artifacts/termux/latest.log.
The script never resets, cleans, commits, or pushes the repository.
EOF
}

print_header

case "${1:-}" in
  doctor)
    run_and_log git status -sb || true
    run_and_log git remote -v || true
    run_and_log find tools -maxdepth 2 -type f -print || true
    ;;
  checks)
    if [[ ! -f tools/checks/run.mjs ]]; then
      echo "Missing tools/checks/run.mjs. Fetch and switch to agent/architecture-sandbox first." | tee -a "$LOG"
      cp "$LOG" "$LATEST"
      exit 2
    fi
    run_and_log node tools/checks/run.mjs
    ;;
  dimensions)
    shift
    if [[ $# -eq 0 ]]; then
      usage | tee -a "$LOG"
      cp "$LOG" "$LATEST"
      exit 2
    fi
    run_and_log node tools/content-inventory/media-dimensions.mjs "$@"
    ;;
  command)
    shift
    if [[ $# -eq 0 ]]; then
      usage | tee -a "$LOG"
      cp "$LOG" "$LATEST"
      exit 2
    fi
    run_and_log "$@"
    ;;
  *)
    usage | tee -a "$LOG"
    cp "$LOG" "$LATEST"
    exit 2
    ;;
esac

printf '\nReport saved to %s\n' "$LATEST"
