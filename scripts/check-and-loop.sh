#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

if [[ -f ".env.deploy" ]]; then
  set -a
  source .env.deploy
  set +a
fi

STATUS_JSON=""
if [[ -n "${SITE_URL:-}" ]]; then
  STATUS_JSON="$(curl -fsSL "${SITE_URL%/}/api/status.php" 2>/dev/null || true)"
fi

if [[ -z "${STATUS_JSON:-}" ]]; then
  STATUS_JSON="$(php public/api/status.php)"
fi

echo "$STATUS_JSON"
