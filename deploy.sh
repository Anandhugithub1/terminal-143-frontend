#!/usr/bin/env bash
set -euo pipefail

REPO_URL="git@github.com:Anandhugithub1/terminal-143-frontend.git"
DEPLOY_BRANCH="deploy/dist"
STAGING_DIR="/tmp/dist_deploy"

echo "Starting deploy: $(date)"

echo "Fetching pre-built dist from $DEPLOY_BRANCH"
rm -rf "$STAGING_DIR"
git clone --depth 1 --branch "$DEPLOY_BRANCH" "$REPO_URL" "$STAGING_DIR"

echo "Deploying to Nginx"
sudo rm -rf /usr/share/nginx/html/*
sudo cp -r "$STAGING_DIR"/* /usr/share/nginx/html/
rm -rf "$STAGING_DIR"

echo "Restarting Nginx"
sudo systemctl restart nginx

echo "Deploy complete: $(date)"
