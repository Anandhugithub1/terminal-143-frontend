#!/usr/bin/env bash
set -euo pipefail

REPO_DIR="/home/ec2-user/terminal-143-frontend"
BRANCH="main"

echo "Starting deploy: $(date)"

cd "$REPO_DIR"

git fetch origin --quiet
git checkout "$BRANCH"
git reset --hard "origin/$BRANCH"

echo "Installing dependencies"
npm ci

echo "Building project"
rm -rf dist
npm run build

echo "Deploying to Nginx"

sudo rm -rf /usr/share/nginx/html/*
sudo cp -r dist/* /usr/share/nginx/html/

echo "Restarting Nginx"
sudo systemctl restart nginx

echo "Deploy complete: $(date)"