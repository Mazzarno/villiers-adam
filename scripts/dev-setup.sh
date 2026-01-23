#!/usr/bin/env bash
set -euo pipefail

if [ ! -f .env ]; then
  cp .env.example .env
fi

docker compose --env-file .env -f docker/docker-compose.dev.yml up -d
