#!/usr/bin/env bash
set -euo pipefail

SERVER_HOST="185.185.143.172"
SERVER_USER="deploy"
SERVER_PATH="/var/www/svayinzhproekt"
SSH_KEY="${HOME}/.ssh/svayinzhproekt_deploy"

if [[ ! -f "${SSH_KEY}" ]]; then
  echo "Deployment key not found: ${SSH_KEY}" >&2
  exit 1
fi

npm run build

rsync -az --delete \
  -e "ssh -i ${SSH_KEY} -o IdentitiesOnly=yes" \
  dist/ "${SERVER_USER}@${SERVER_HOST}:${SERVER_PATH}/"

echo "Deployed to http://${SERVER_HOST}/"
