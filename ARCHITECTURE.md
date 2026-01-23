# Architecture

This repository is a monorepo for the Villiers-Adam CMS.

## Top-level structure

```
villiers-adam/
├── mairie.config.json
├── mairie.config.schema.json
├── apps/
│   ├── api/
│   ├── admin/
│   └── web/
├── packages/
│   ├── shared/
│   └── config/
├── docker/
├── infra/
├── docs/
└── tests/
```

## Responsibilities

- apps/api: NestJS API, Prisma, PostgreSQL, MinIO, Meilisearch, Mailjet
- apps/admin: Next.js admin UI (shadcn/ui, TipTap, Tailwind)
- apps/web: Next.js public website (OSM/Leaflet, Tailwind)
- packages/shared: shared types, schemas, helpers, mairie config loader
- packages/config: shared ESLint, TS config, Tailwind preset
- docker: local and production compose files
- infra: reverse proxy, scripts, monitoring
- docs: user and technical documentation
- tests/e2e: Playwright tests

## Naming conventions

- Files: kebab-case (example: user-profile.ts)
- React components: PascalCase (example: UserCard.tsx)
- Variables and functions: camelCase
- Constants: SCREAMING_SNAKE_CASE
