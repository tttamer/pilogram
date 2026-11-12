#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

if [[ -f ".env.deploy" ]]; then
  set -a
  source .env.deploy
  set +a
fi

echo "=================================================="
echo "  PILOGRAM • Content Verification & Commit System "
echo "=================================================="

# 1. Python validator for posts & media
python3 - <<'PYEOF'
import json, glob, os, sys

posts_dir = "public/content/posts"
files = sorted(glob.glob(f"{posts_dir}/*.json"))

if not files:
    print("❌ Error: No posts found in public/content/posts/")
    sys.exit(1)

print(f"🔍 Found {len(files)} post(s) to verify:")

errors = []
valid_formats = {"flashcard_flip", "flashcard_carousel", "infographic", "short_video"}
valid_sections = {f"sec-{i}" for i in range(1, 8)}

for f in files:
    filename = os.path.basename(f)
    try:
        with open(f, "r", encoding="utf-8") as fp:
            data = json.load(fp)
    except Exception as e:
        errors.append(f"[{filename}] Invalid JSON: {e}")
        continue

    # Required fields check
    for req in ["id", "created_at", "batch_cycle", "persona_id", "section_id", "source", "format", "caption", "tags", "difficulty"]:
        if req not in data:
            errors.append(f"[{filename}] Missing required field: '{req}'")

    if data.get("format") not in valid_formats:
        errors.append(f"[{filename}] Unknown format: '{data.get('format')}'")

    if data.get("section_id") not in valid_sections:
        errors.append(f"[{filename}] Invalid section_id: '{data.get('section_id')}' (must be sec-1 through sec-7)")

    # Validate referenced media
    slides = data.get("slides") or []
    for s in slides:
        m = s.get("media_url")
        if m:
            rel = m.replace("./content/posts/", "public/content/posts/")
            if not os.path.exists(rel):
                errors.append(f"[{filename}] Missing referenced media file: '{m}'")

    infographic = data.get("infographic") or {}
    if infographic.get("image_url"):
        m = infographic["image_url"]
        rel = m.replace("./content/posts/", "public/content/posts/")
        if not os.path.exists(rel):
            errors.append(f"[{filename}] Missing infographic media file: '{m}'")

    print(f"  ✓ {filename} [Section: {data.get('section_id')}, Format: {data.get('format')}]")

if errors:
    print("\n❌ Verification failed with errors:")
    for err in errors:
        print(f"  • {err}")
    sys.exit(1)

# Update state.json
state_path = "public/content/state.json"
state = {}
if os.path.exists(state_path):
    with open(state_path, "r", encoding="utf-8") as fp:
        try:
            state = json.load(fp)
        except Exception:
            pass

state["total_study_posts"] = len(files)
with open(state_path, "w", encoding="utf-8") as fp:
    json.dump(state, fp, indent=2)
    fp.write("\n")

print(f"\n✅ All {len(files)} posts verified successfully! state.json updated.")
PYEOF

# 2. Run vitest test suite
echo ""
echo "==> Running automated test suite..."
npx vitest run

# 3. Commit and push to GitHub
echo ""
echo "==> Committing new content to GitHub..."
git add public/content/ src/ scripts/ tsconfig.json package.json || true

if ! git diff --cached --quiet; then
  COMMIT_MSG="content: verify and add new study posts ($(date -u +%Y-%m-%dT%H:%M:%SZ))"
  if [ $# -gt 0 ]; then
    COMMIT_MSG="$1"
  fi
  git commit -m "$COMMIT_MSG"
  if [[ -n "${GITHUB_TOKEN:-}" ]]; then
    git push "https://${GITHUB_TOKEN}@github.com/tttamer/pilogram.git" main
  elif git remote get-url origin >/dev/null 2>&1; then
    git push origin main
  fi
  echo "✅ Changes committed and pushed to GitHub successfully!"
else
  echo "ℹ️  No new changes to commit."
fi

# 4. Optional FTP deploy if --deploy flag passed
if [[ "${1:-}" == "--deploy" || "${2:-}" == "--deploy" ]]; then
  echo ""
  echo "==> Deploying to live hosting via FTP..."
  bash scripts/deploy-ftp.sh
fi
