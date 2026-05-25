# Preprod Deployment

Use `docker-compose.preprod.yml` with generated env file such as `.env.preprod.generated`. Keep runtime split:

- Browser -> `NEXT_PUBLIC_API_URL`, example `https://villiers-api.example.com`
- Next.js server code in Docker -> `API_INTERNAL_URL`, example `http://api:3001`
- API object operations -> internal MinIO `minio:9000`
- Browser upload/download presigned URLs -> public media domain, example `https://media.example.com`

## Required env

- Public domains: `WEB_DOMAIN`, `ADMIN_DOMAIN`, `API_DOMAIN`, `MEDIA_DOMAIN`
- Web/API split: `API_INTERNAL_URL`, `NEXT_PUBLIC_API_URL`
- Public media: `NEXT_PUBLIC_MEDIA_URL`, `MINIO_PUBLIC_ENDPOINT`, `MINIO_PUBLIC_PORT`, `MINIO_PUBLIC_USE_SSL`, `MINIO_PUBLIC_URL`, `MINIO_REGION`
- Internal MinIO stays required: `MINIO_ENDPOINT`, `MINIO_PORT`, `MINIO_USE_SSL`, `MINIO_ACCESS_KEY`, `MINIO_SECRET_KEY`, `MINIO_BUCKET`

## Cloudflare and Caddy

- Cloudflare DNS must proxy `WEB_DOMAIN`, `ADMIN_DOMAIN`, `API_DOMAIN`, `MEDIA_DOMAIN`.
- Put Cloudflare Origin Certificate files at:
  - `infra/caddy/certs/cloudflare-origin.pem`
  - `infra/caddy/certs/cloudflare-origin.key`
- Caddy terminates TLS with that certificate and proxies media traffic to `minio:9000`.
- Media CORS is handled by Caddy. MinIO CORS headers are stripped on proxy responses to avoid duplicate `Access-Control-Allow-Origin`.

## IPv6-only preprod note

- `build.network: host` is set only in `docker-compose.preprod.yml` for `api`, `web`, `admin`, and `api-tasks`.
- Reason: current preprod host needed host-networked Docker builds for IPv6 DNS resolution.
- Do not assume this is globally required. Normal IPv4 production may not need it.
- If Docker still fails DNS resolution on IPv6-only host, set daemon DNS explicitly, then restart Docker:
  - `2606:4700:4700::1111`
  - `2606:4700:4700::1001`
  - `2001:4860:4860::8888`
  - `2001:4860:4860::8844`
- This is server ops config, not app config. Future IPv4-capable production hosts should not require code changes for this.

## Admin auth layers

- Caddy Basic Auth protects preprod admin route at reverse-proxy level. It is separate from app auth.
- Admin bootstrap auth is app-level user stored in Postgres.
- Changing `SEED_ADMIN_PASSWORD` after bootstrap does not update existing admin password in database.
- To change admin password safely, use app password reset flow or dedicated reset script. Do not delete Postgres data, reset Docker volumes, or wipe MinIO to force a new seed.

## Deploy flow

1. Build images:

```sh
docker compose --profile ops --env-file .env.preprod.generated -f docker-compose.preprod.yml build api-tasks api web admin
```

2. Start stateful dependencies:

```sh
docker compose --env-file .env.preprod.generated -f docker-compose.preprod.yml up -d postgres minio
```

3. Run Prisma migrations and seed from builder toolchain, not final API runner:

```sh
docker compose --profile ops --env-file .env.preprod.generated -f docker-compose.preprod.yml run --rm api-tasks
```

4. Start or recreate application services:

```sh
docker compose --env-file .env.preprod.generated -f docker-compose.preprod.yml up -d api web admin reverse-proxy
```

5. Check service state:

```sh
docker compose --env-file .env.preprod.generated -f docker-compose.preprod.yml ps
```

## Scripted helpers

- Full deploy: `scripts/deploy-preprod.sh`
- Migrate + seed only: `scripts/preprod-migrate-seed.sh`
- Local backup/import notes: `docs/local-backup-import.md`

Both default to `.env.preprod.generated` and `docker-compose.preprod.yml`.

## Manual runtime checks

Web container -> internal API:

```sh
docker compose --env-file .env.preprod.generated -f docker-compose.preprod.yml exec web sh -lc 'node -e "fetch(\"http://api:3001/articles\").then(r=>r.text()).then(t=>console.log(t.slice(0,500))).catch(console.error)"'
```

API container -> public MinIO presigned URL:

```sh
docker compose --env-file .env.preprod.generated -f docker-compose.preprod.yml exec api sh -lc 'node - <<'"'"'NODE'"'"'
const { Client } = require("minio");

const client = new Client({
  endPoint: process.env.MINIO_PUBLIC_ENDPOINT,
  port: Number(process.env.MINIO_PUBLIC_PORT || 443),
  useSSL: process.env.MINIO_PUBLIC_USE_SSL === "true",
  accessKey: process.env.MINIO_ACCESS_KEY,
  secretKey: process.env.MINIO_SECRET_KEY,
  region: process.env.MINIO_REGION || "us-east-1",
});

client.presignedPutObject(process.env.MINIO_BUCKET, "debug/test-upload.txt", 600)
  .then((url) => {
    console.log(url);
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
NODE'
```

Expected result: `https://media.example.com/...`

CORS preflight on media domain:

```sh
curl -i -X OPTIONS https://media.example.com/bucket/debug/test-upload.txt \
  -H "Origin: https://admin.example.com" \
  -H "Access-Control-Request-Method: PUT" \
  -H "Access-Control-Request-Headers: content-type"
```

Expected result: exactly one `Access-Control-Allow-Origin` header.
