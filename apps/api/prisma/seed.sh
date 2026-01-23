#!/usr/bin/env bash
set -euo pipefail

pnpm -F @villiers-adam/shared build
tsx prisma/seed.ts
