# Content Migration Preprod Report

Date: 2026-05-21

## Files Changed

- `apps/api/prisma/preprod-content-lib.ts`
- `apps/api/prisma/export-preprod-content.ts`
- `apps/api/prisma/import-preprod-content.ts`
- `package.json`
- `PREPROD_CONTENT_MIGRATION_RUNBOOK.md`

## Exported Collections

- `settings`
- `media`
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

Current export file:

- `backups/preprod-content/preprod-content-2026-05-21T12-33-03-067Z.json`

Current exported counts:

- `settings`: 1
- `media`: 11
- `articles`: 174
- `articleMedia`: 0
- `events`: 5
- `eventMedia`: 0
- `directoryEntries`: 1
- `directoryEntryMedia`: 0
- `procedures`: 9
- `procedureMedia`: 0
- `councilMembers`: 15
- `municipalServices`: 7
- `transportInfo`: 8

## Excluded Collections

- `users`
- `sessions`
- `passwordResetTokens`
- `notifications`
- `auditLogs`
- `versions`
- `newsletterSubscriptions`
- `newsletterTopics`
- `newsletterSubscriptionTopics`
- `exportArchives`
- local build/runtime state
- Meilisearch index state

Why excluded:

- auth/session/security state must not move from local to preprod
- audit/version noise not needed for bootstrap content migration
- newsletters not requested in scope
- public git-tracked assets do not belong in DB export

## Media Storage Findings

Uploaded media uses MinIO-backed object storage.

Evidence:

- `apps/api/src/modules/media/media.service.ts`
- `apps/api/src/modules/media/minio.service.ts`
- `media.url` stored as `/media/public/<storageKey>`
- export file contains bucket `mairie-media` and 11 `storageKey` values

Meaning:

- JSON export/import restores **media metadata only**
- binary MinIO objects must be copied separately

Git-tracked static assets also exist under `apps/web/public/` and do not need DB export.

## Seeded Content Coverage

Covered by export:

- practical/school/transport content via `transportInfo` + `settings.municipalityProfile.vieQuotidienne`
- school/cafeteria content via `settings.municipalityProfile.vieQuotidienne.ecoleEnfance`
- school/cafeteria content via `settings.municipalityProfile.vieQuotidienne.restaurationScolaire`
- publications and flash content via `articles`

Current export evidence:

- `flashArticles`: 5
- `publicationArticles`: 169
- `ecoleEnfanceInProfile`: true
- `restaurationScolaireInProfile`: true

Not present in current exported `municipalityProfile` snapshot:

- `cultureLoisirs.sports`
- `cultureLoisirs.patrimoine`

So sports / heritage-gallery content is supported by settings export format if later present, but not currently found in local exported snapshot.

## Import Behavior

Default mode:

- `merge`
- `dry-run` supported
- no destructive delete by default

Replace mode:

- requires `--replace`
- requires `--confirm-replace REPLACE_PREPROD_CONTENT`
- deletes only selected imported content collections, not auth/session tables

Settings behavior:

- importer deep-merges `municipalityProfile`
- preserves unrelated existing nested keys

Author mapping:

- imported content rebinds `createdById` / `updatedById` to preprod bootstrap admin
- avoids dependency on local user IDs

Schema safety:

- import fails if `schemaVersion !== preprod-content.v1`

## Exact Commands Run

Validation:

```bash
corepack pnpm --filter @villiers-adam/api lint
corepack pnpm --filter @villiers-adam/api typecheck
corepack pnpm --filter @villiers-adam/api build
```

Export:

```bash
corepack pnpm content:export:preprod
```

Dry-run import:

```bash
corepack pnpm content:import:preprod:dry-run
```

JSON inspection:

```bash
node - <<'NODE'
const fs = require('fs');
const file = 'backups/preprod-content/preprod-content-2026-05-21T12-33-03-067Z.json';
const data = JSON.parse(fs.readFileSync(file, 'utf8'));
console.log(Object.keys(data.collections));
NODE
```

## Command Results

- `corepack pnpm --filter @villiers-adam/api lint`: pass
- `corepack pnpm --filter @villiers-adam/api typecheck`: pass
- `corepack pnpm --filter @villiers-adam/api build`: pass
- `corepack pnpm content:export:preprod`: pass
- `corepack pnpm content:import:preprod:dry-run`: pass

Important investigation note:

- first dry-run failed because importer required explicit admin email
- root cause: mismatch with base seed default email behavior
- fix applied: importer now falls back to `SEED_ADMIN_EMAIL` or `admin@mairie.fr`
- dry-run rerun after fix passed

## Temp DB Import Verification

Not executed.

Reason:

- local environment has no `psql`
- local environment has no `createdb`

So safe simulation used instead:

- export succeeded
- dry-run import succeeded
- exported JSON structure verified
- forbidden sensitive collections verified absent

## Risks

- MinIO binary objects are not embedded in JSON export
- replace mode is destructive for imported content collections if operator uses it
- council members use `id` as import key; if preprod manual data diverges by new IDs, merge may create parallel records only if IDs differ and manual records coexist
- article/event/directory/procedure/media relation tables are recreated per imported parent during non-dry-run import
- temp isolated DB import could not be proven in this machine due missing Postgres CLI tools

## Next Steps For VPS Import

1. Prepare Docker preprod stack
2. Run:

```bash
docker compose --env-file .env.preprod -f docker-compose.preprod.yml run --rm api pnpm exec prisma migrate deploy
```

3. Run base seed once:

```bash
docker compose --env-file .env.preprod -f docker-compose.preprod.yml run --rm api pnpm exec prisma db seed
```

4. Copy JSON export file to VPS
5. Copy local MinIO objects to preprod MinIO bucket using S3-compatible tool
6. Run safe import in merge mode:

```bash
docker compose --env-file .env.preprod -f docker-compose.preprod.yml run --rm api \
  pnpm exec tsx prisma/import-preprod-content.ts \
  --file /app/backups/preprod-content/preprod-content-2026-05-21T12-33-03-067Z.json \
  --admin-email <seed-admin-email>
```

7. Verify content in API responses and health checks

## Related Runbook

- `PREPROD_CONTENT_MIGRATION_RUNBOOK.md`
