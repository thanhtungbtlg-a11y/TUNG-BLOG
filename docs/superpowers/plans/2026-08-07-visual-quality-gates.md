# Visual Quality Gates Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add deterministic Playwright visual regression coverage and Lighthouse CI audits to the existing Astro validation pipeline.

**Architecture:** Keep functional and accessibility tests in the current Playwright configuration. Add a dedicated visual configuration and test suite so baselines can be updated intentionally, then run Lighthouse against the already-built production preview and retain all reports as private workflow artifacts.

**Tech Stack:** Astro 5, Playwright, TypeScript, Lighthouse CI, pnpm, GitHub Actions, Node.js 22.

## Global Constraints

- Do not alter page content, visual identity, runtime behavior, Portfolio access control, Gallery data, comments, or Second Brain output.
- Build once in CI and reuse `dist/` for functional, visual, and Lighthouse checks.
- Keep screenshots deterministic across desktop/mobile and light/dark modes.
- Do not upload Lighthouse reports to public temporary storage.
- Do not commit or push until explicitly requested by the user.

---

### Task 1: Visual regression suite

**Files:**
- Create: `playwright.visual.config.ts`
- Create: `tests/visual/site.visual.spec.ts`
- Create: `tests/visual/snapshot.css`
- Modify: `package.json`
- Test: `tests/visual/site.visual.spec.ts`

**Interfaces:**
- Consumes: the existing production preview command and Playwright desktop/mobile projects.
- Produces: `pnpm test:visual` and `pnpm test:visual:update`, with committed baseline images stored beside the visual spec.

- [x] Add a dedicated Playwright configuration with stable snapshot paths and a bounded pixel-difference allowance.
- [x] Add six representative routes and force `light`/`dark` theme state before first paint.
- [x] Disable transitions, animations, carets, and the stateful music player for snapshots.
- [x] Run `pnpm test:visual` and verify it fails because baseline images do not exist.
- [x] Run `pnpm test:visual:update` to generate the baselines, then rerun `pnpm test:visual` and verify it passes.

### Task 2: Lighthouse CI

**Files:**
- Create: `lighthouserc.cjs`
- Modify: `package.json`
- Modify: `pnpm-lock.yaml`
- Modify: `.gitignore`
- Test: Lighthouse reports written to `.lighthouseci/`

**Interfaces:**
- Consumes: `pnpm preview` and the production `dist/` build.
- Produces: `pnpm test:lighthouse`, local HTML/JSON reports, and category assertions.

- [x] Add `@lhci/cli` as a pinned development dependency.
- [x] Configure six representative URLs, one baseline run, local filesystem uploads, and practical initial category thresholds.
- [x] Ignore `.lighthouseci/` locally.
- [x] Build the site and run `pnpm test:lighthouse`; adjust only unstable or inapplicable audits, not genuine failures.

### Task 3: GitHub Actions integration

**Files:**
- Modify: `.github/workflows/build.yml`

**Interfaces:**
- Consumes: the new package scripts and the existing built site.
- Produces: visual and Lighthouse checks plus retained diagnostic artifacts.

- [x] Run visual regression after the existing browser smoke/accessibility suite.
- [x] Run Lighthouse CI against the same build.
- [x] Upload Playwright and Lighthouse reports on failure or completion without exposing secrets.

### Task 4: Full verification

**Files:**
- Verify all files above.

**Interfaces:**
- Consumes: all project validation scripts.
- Produces: a clean, reviewable working tree with reproducible quality gates.

- [x] Run `pnpm lint`, `pnpm test`, `pnpm test:e2e`, `pnpm test:visual`, `pnpm test:lighthouse`, `pnpm type-check`, `pnpm check`, and `pnpm build`.
- [x] Run `git diff --check` and inspect `git status --short`.
- [x] Do not commit or push unless the user asks.
