#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

echo "==> [1/3] Building mobile-first SPA into dist/..."
npm run build

echo "==> [2/3] Ensuring .htaccess is copied to dist/..."
cp -f public/.htaccess dist/.htaccess

echo "==> [3/3] Creating deploy-initial.zip for cPanel File Manager..."
rm -f deploy-initial.zip
(cd dist && zip -rq ../deploy-initial.zip . .htaccess)

echo "==> Done! Upload deploy-initial.zip to your cPanel target folder and extract."
