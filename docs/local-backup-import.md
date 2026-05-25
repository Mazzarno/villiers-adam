# Local Backup And Import

Use Docker Desktop CLI. No extra local Postgres or MinIO install required.

## Local services

- Local Postgres is exposed on `localhost:5433`.
- Local MinIO usually listens on `localhost:9000`.
- Historical buckets may be `mairie-media` or `villiers-adam-media`. Check before copy commands.

## Postgres backup

Create SQL dump from running dev container:

```sh
docker compose --env-file .env -f docker/docker-compose.dev.yml exec -T postgres \
  pg_dump -U "${DB_USER:-mairie}" -d "${DB_NAME:-mairie_db}" > backups/local-postgres-$(date +%Y%m%d-%H%M%S).sql
```

If you prefer host connection, same database is on port `5433`:

```sh
PGPASSWORD="${DB_PASSWORD:-mairie_dev_password}" \
pg_dump -h localhost -p 5433 -U "${DB_USER:-mairie}" "${DB_NAME:-mairie_db}" \
  > backups/local-postgres-$(date +%Y%m%d-%H%M%S).sql
```

## Postgres import

Import non-destructively into current local DB:

```sh
cat backups/local-postgres-YYYYMMDD-HHMMSS.sql | \
docker compose --env-file .env -f docker/docker-compose.dev.yml exec -T postgres \
  psql -U "${DB_USER:-mairie}" -d "${DB_NAME:-mairie_db}"
```

Review target DB first. Do not use reset scripts for routine imports.

## MinIO backup

Install `mc` locally, configure alias once, then inspect buckets before mirroring:

```sh
mc alias set villiers-local http://localhost:9000 "${MINIO_ACCESS_KEY:-minio_dev_access}" "${MINIO_SECRET_KEY:-minio_dev_secret}"
mc ls villiers-local
```

Mirror chosen bucket after confirming its name:

```sh
mc mirror "villiers-local/mairie-media" "backups/minio/mairie-media"
```

Or:

```sh
mc mirror "villiers-local/villiers-adam-media" "backups/minio/villiers-adam-media"
```

## MinIO import

Mirror files back into existing bucket:

```sh
mc mirror "backups/minio/mairie-media" "villiers-local/mairie-media"
```

Replace bucket name only after checking `mc ls villiers-local`.

## IPv6 SSH and rsync note

For IPv6 servers, prefer SSH config host aliases instead of raw IPv6 literals inside `rsync` targets. Example:

```sshconfig
Host villiers-preprod
  HostName 2001:db8::10
  User deploy
```

Then use:

```sh
rsync -av backups/ villiers-preprod:/srv/villiers-adam/backups/
```
