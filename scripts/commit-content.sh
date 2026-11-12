#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

if [[ -f ".env.deploy" ]]; then
  set -a
  source .env.deploy
  set +a
fi

COMMIT_MSG="${1:-"content: update study posts ($(date -u +%Y-%m-%dT%H:%M:%SZ))"}"

echo "==> [1/2] Staging content and source changes..."
git add public/content/ src/ README.md || true

if ! git diff --cached --quiet; then
  git commit -m "$COMMIT_MSG"
  echo "==> Committed locally."
else
  echo "==> No changes to commit."
fi

echo "==> [2/2] Pushing to GitHub (origin main)..."
if [[ -n "${GITHUB_TOKEN:-}" ]]; then
  git push "https://${GITHUB_TOKEN}@github.com/tttamer/pilogram.git" main
else
  git push origin main
fi
echo "==> Push complete."
