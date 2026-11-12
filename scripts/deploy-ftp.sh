#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

if [[ -f ".env.deploy" ]]; then
  set -a
  source .env.deploy
  set +a
else
  echo "Error: .env.deploy not found. Copy .env.example to .env.deploy and fill in FTP credentials."
  exit 1
fi

: "${FTP_HOST:?Missing FTP_HOST in .env.deploy}"
: "${FTP_USER:?Missing FTP_USER in .env.deploy}"
: "${FTP_PASS:?Missing FTP_PASS in .env.deploy}"
: "${FTP_REMOTE_DIR:?Missing FTP_REMOTE_DIR in .env.deploy}"

echo "==> [1/3] Committing new or updated posts to Git..."
git add public/content/ src/ || true
if ! git diff --cached --quiet; then
  git commit -m "content: add/update PSCPP-Gram study posts ($(date -u +%Y-%m-%dT%H:%M:%SZ))"
  if git remote get-url origin >/dev/null 2>&1; then
    git push origin main
  fi
fi

echo "==> [2/3] Building production bundle..."
npm run build
cp -f public/.htaccess dist/.htaccess

echo "==> [3/3] Uploading changed files to cPanel via FTP ($FTP_HOST:$FTP_REMOTE_DIR)..."
python3 - <<'PYEOF'
import os
import ftplib
from pathlib import Path

host = os.environ["FTP_HOST"]
user = os.environ["FTP_USER"]
passwd = os.environ["FTP_PASS"]
remote_root = os.environ["FTP_REMOTE_DIR"].rstrip("/")
dist_dir = Path("dist")

def ensure_remote_dir(ftp: ftplib.FTP, path: str):
    parts = [p for p in path.split("/") if p]
    curr = ""
    for part in parts:
        curr += "/" + part
        try:
            ftp.cwd(curr)
        except ftplib.error_perm:
            ftp.mkd(curr)

with ftplib.FTP(host, timeout=30) as ftp:
    ftp.login(user, passwd)
    for file_path in dist_dir.rglob("*"):
        if file_path.is_dir():
            continue
        rel = file_path.relative_to(dist_dir).as_posix()
        # Preserve server-side runtime state.json if it already exists
        if rel == "content/state.json":
            continue
        remote_file = f"{remote_root}/{rel}"
        remote_parent = os.path.dirname(remote_file)
        ensure_remote_dir(ftp, remote_parent)
        with open(file_path, "rb") as f:
            ftp.storbinary(f"STOR {remote_file}", f)
print("FTP sync completed successfully.")
PYEOF
