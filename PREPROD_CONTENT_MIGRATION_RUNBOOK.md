# Preprod Content Migration Runbook

## Goal

Move current local editorial/content data into preprod without resetting local data.

Preprod target order:

1. Deploy containers and infrastructure
2. Run Prisma migrations on preprod
3. Run base seed once to create admin/settings row
4. Copy MinIO objects if local uploads exist
5. Import exported content JSON in merge mode

## What Gets Migrated

- `settings` including `municipalityProfile`
- `media` metadata
- `articles`
- `articleMedia`
- `events`
- `eventMedia`
- `directoryEntries`
- `directoryEntryMedia`
- `procedures`
- `procedureMedia`
- `councilMembers`
- `municipalServices`
- `transportInfo`

This covers recent content seed output too:

- practical/school/transport content
- school/cafeteria content
- sports content when stored in `settings.municipalityProfile`
- heritage/gallery-style editorial content when stored in `settings.municipalityProfile`

## What Does Not Get Migrated

- `users` beyond preprod bootstrap admin
- `sessions`
- `passwordResetTokens`
- `notifications`
- `auditLogs`
- `versions`
- `newsletterSubscriptions`
- `newsletterTopics`
- `newsletterSubscriptionTopics`
- `exportArchives`
- local build/runtime artifacts

MFA secrets are intentionally excluded because user records are not exported.

## Local Export

From repo root:

```bash
corepack pnpm content:export:preprod
```

Result:

- timestamped JSON file under `backups/preprod-content/`
- file contains metadata plus content collections only

## Dry-Run Import Against Current Local DB

Safe validation:

```bash
corepack pnpm content:import:preprod:dry-run
```

Specific file:

```bash
corepack pnpm content:import:preprod -- --file backups/preprod-content/<export-file>.json --dry-run
```

## Preprod Import Order

After Docker stack ready:

1. Copy `.env.preprod`
2. Start stack
3. Run migrations:

```bash
docker compose --env-file .env.preprod -f docker-compose.preprod.yml run --rm api pnpm exec prisma migrate deploy
```

4. Run base seed once:

```bash
docker compose --env-file .env.preprod -f docker-compose.preprod.yml run --rm api pnpm exec prisma db seed
```

5. Copy exported JSON to VPS
6. Copy MinIO objects if local uploads exist
7. Import content in merge mode:

```bash
docker compose --env-file .env.preprod -f docker-compose.preprod.yml run --rm api \
  pnpm exec tsx prisma/import-preprod-content.ts --file /app/backups/preprod-content/<export-file>.json --admin-email <seed-admin-email>
```

## MinIO Objects

Current uploaded media path uses MinIO-backed object storage and DB `media.storageKey` metadata.

JSON export/import restores only metadata. Binary objects must be copied separately.

Suggested operator flow:

1. Export metadata JSON
2. List storage keys from JSON
3. Copy MinIO bucket objects from local storage to preprod bucket using object-storage tooling such as `mc mirror`, `aws s3 sync`, or compatible S3 client
4. Then run JSON import

If image lives in `apps/web/public`, it is already versioned by git and does not need DB/media export.

## Replace Mode

Not default. Dangerous.

Only use with explicit confirmation token:

```bash
corepack pnpm content:import:preprod -- --file backups/preprod-content/<export-file>.json --replace --confirm-replace REPLACE_PREPROD_CONTENT
```

Normal preprod migration should use merge mode, not replace mode.

## Backup Rules

Before any non-dry-run preprod import:

1. backup preprod database
2. backup preprod MinIO bucket
3. keep exported JSON file immutable

## Rollback Notes

Rollback requires:

1. DB restore from pre-import backup
2. MinIO restore from pre-import backup
3. rerun app containers if needed

No automatic rollback created here.
