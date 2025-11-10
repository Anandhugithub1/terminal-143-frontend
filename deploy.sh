#!/usr/bin/env bash
set -euo pipefail

# --- CONFIG ---
REPO_DIR="/home/ec2-user/terminal-143-frontend"
BRANCH="main"
export NODE_OPTIONS="--max-old-space-size=3072"
# ---------------

echo "===  Starting deploy: $(date) ==="

cd "$REPO_DIR"

# Make sure repo is clean and up to date
git fetch origin --quiet
git checkout "$BRANCH"
git reset --hard "origin/$BRANCH"

echo "===  Installing dependencies ==="
npm ci

echo "===   Building project ==="
npm run build

# Restart app  using  (optional)
if command -v pm2 >/dev/null 2>&1; then
  echo "===  Restarting app via PM2 ==="
  pm2 reload all || pm2 restart all || pm2 start npm --name "terminal143" -- run start
else
  echo " PM2 not found — restart your app manually if needed."
fi

echo "===  Deploy complete: $(date) ==="
