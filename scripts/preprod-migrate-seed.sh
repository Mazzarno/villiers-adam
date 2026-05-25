#!/usr/bin/env sh
set -eu

ENV_FILE="${1:-.env.preprod.generated}"
COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.preprod.yml}"

docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" up -d postgres minio
docker compose --profile ops --env-file "$ENV_FILE" -f "$COMPOSE_FILE" run --rm api-tasks
