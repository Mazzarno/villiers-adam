# Tooling Reproducibility Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restore deterministic dependency/tooling workflow for monorepo so install and root orchestration run from tracked files.

**Architecture:** Keep application source untouched. Restore missing orchestration files and regenerate lockfile to match current manifests. Validate end-to-end with frozen install and root scripts.

**Tech Stack:** pnpm workspace, Turbo, Node.js, Next/Nest monorepo.

---

### Task 1: Root Cause Proof

**Files:**
- Read: `package.json`
- Read: `apps/web/package.json`
- Read: `apps/admin/package.json`
- Read: `apps/api/package.json`
- Read: `pnpm-workspace.yaml`
- Read: `turbo.json` (from `HEAD`)
- Read: `pnpm-lock.yaml` (from `HEAD`)

- [ ] **Step 1: Prove missing tracked tooling files**

Run: `git status --short | rg "pnpm-lock.yaml|turbo.json|package.json" -N`
Expected: deleted `pnpm-lock.yaml`, deleted `turbo.json`, modified package manifests.

- [ ] **Step 2: Prove lock/manifests drift**

Run: `git diff -- package.json apps/web/package.json apps/admin/package.json apps/api/package.json`
Expected: dependency/specifier changes vs lock snapshot.

### Task 2: Minimal Tooling File Fix

**Files:**
- Restore/Create: `turbo.json`
- Create/Update: `pnpm-lock.yaml`

- [ ] **Step 1: Restore Turbo config file from HEAD**

Run: `git checkout HEAD -- turbo.json`
Expected: root scripts can resolve pipeline config.

- [ ] **Step 2: Regenerate lockfile to match current manifests**

Run: `corepack pnpm install --no-frozen-lockfile`
Expected: `pnpm-lock.yaml` recreated/updated and workspace binaries resolvable.

### Task 3: Verification Gate

**Files:**
- Verify only: workspace/runtime outputs

- [ ] **Step 1: Frozen install verification**

Run: `corepack pnpm install --frozen-lockfile`
Expected: success exit code 0.

- [ ] **Step 2: Root lint**

Run: `corepack pnpm lint`
Expected: tooling starts; any failure should be code/config issue, not missing binaries.

- [ ] **Step 3: Root typecheck**

Run: `corepack pnpm typecheck`
Expected: tooling starts; failures represent real code issues.

- [ ] **Step 4: Root build**

Run: `corepack pnpm build`
Expected: tooling starts; failures represent real code issues.

- [ ] **Step 5: Root test**

Run: `corepack pnpm test`
Expected: tooling starts; failures represent real code issues.
