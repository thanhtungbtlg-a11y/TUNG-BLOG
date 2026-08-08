# Engineering Field Notes Homepage Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the image-only homepage with a static, responsive Engineering Field Notes homepage that uses real Journal, Portfolio, Gallery, and Second Brain data without changing any other route or feature.

**Architecture:** Keep the Astro-first architecture. `HomeHero.astro` owns the hero and document register; a new `HomeDiscovery.astro` owns all below-fold discovery sections and reads existing repository data at build time. The catch-all homepage route composes both components while existing global layout, navigation, theme, player, analytics, and access-control boundaries remain unchanged.

**Tech Stack:** Astro 5, TypeScript, Tailwind CSS, existing CSS variables, Astro Image, Iconify, pnpm, Playwright, axe, Lighthouse CI.

## Global Constraints

- Redesign only the first homepage; preserve paginated archive behavior in `src/pages/[...page].astro`.
- Preserve all original blog post content and all existing routes and features.
- Keep static Astro output and add no new client-side framework or dependency.
- Use the supplied workspace image as the homepage hero source.
- Keep Portfolio access control unchanged.
- Use real repository data for counts, cards, dates, and links.
- Support Ocean, Sakura, Forest, Mono, light mode, dark mode, reduced motion, keyboard navigation, desktop, and mobile.
- Do not commit or push unless the user explicitly asks.

---

### Task 1: Add the Approved Hero Asset and Homepage Data Contract

**Files:**
- Create: `src/assets/images/home-engineering-workspace.png`
- Create: `src/utils/homepage-data.ts`
- Test: `tests/homepage-data.test.ts`

**Interfaces:**
- Consumes: Astro posts from `getSortedPosts()`, `src/data/gallery.json`, `src/data/brain-topics.ts`, and `src/data/portfolio.ts`.
- Produces: `buildHomepageData(input: HomepageDataInput): HomepageData` with journal count, Gallery count, live vault count, latest updates, three selected projects, latest posts, and recent Gallery images. Astro components supply the existing build-time data so the helper remains framework-independent and directly testable.

- [ ] **Step 1: Write the failing data-contract test**

Assert that `getHomepageData()` returns non-empty selected projects, valid internal links, chronologically sorted updates, and numeric repository counts.

- [ ] **Step 2: Run the focused test and confirm failure**

Run: `pnpm test`

Expected: FAIL because `src/utils/homepage-data.ts` does not exist.

- [ ] **Step 3: Implement the minimal static data aggregator**

Accept posts, Gallery entries, Brain topics, and Portfolio projects as typed inputs; normalize update dates once and return typed data without importing Astro runtime modules.

- [ ] **Step 4: Copy the approved image without modifying the source attachment**

Copy the exact supplied PNG into `src/assets/images/home-engineering-workspace.png` and verify its dimensions remain `718 x 566`.

- [ ] **Step 5: Run the focused test**

Run: `pnpm test`

Expected: PASS.

### Task 2: Rebuild the Hero and Document Register

**Files:**
- Modify: `src/components/HomeHero.astro`

**Interfaces:**
- Consumes: `HomepageData` from `buildHomepageData()` and `home-engineering-workspace.png`.
- Produces: a semantic homepage hero with one `h1`, Portfolio CTA, document metadata, and factual register counts.

- [ ] **Step 1: Add stable test selectors to the planned markup**

Use `data-home-hero` and `data-document-register` so browser tests can verify the rendered structure without coupling to utility classes.

- [ ] **Step 2: Replace the current image-only overlay**

Render the supplied image with Astro Image, preserve its aspect ratio, place readable text in the naturally dark image area, and keep priority loading only for this hero asset.

- [ ] **Step 3: Add the factual Document Register**

Display live Journal, Gallery, and vault counts plus the current revision month using semantic list markup and tabular metadata.

- [ ] **Step 4: Implement responsive and reduced-motion states**

Use bounded type sizing, one-column mobile flow, visible focus, 44px touch targets, and transform/opacity-only motion disabled by `prefers-reduced-motion`.

- [ ] **Step 5: Run Astro checks**

Run: `pnpm check`

Expected: zero errors.

### Task 3: Build the Homepage Discovery Sections

**Files:**
- Create: `src/components/HomeDiscovery.astro`
- Modify: `src/pages/[...page].astro`

**Interfaces:**
- Consumes: `HomepageData` from `buildHomepageData()`.
- Produces: selected Engineering Work, Latest, Knowledge, Gallery, and About/Contact sections beneath the hero.

- [ ] **Step 1: Compose homepage-only sections in the catch-all route**

Render `<HomeHero />` and `<HomeDiscovery />` only when `page.currentPage === 1`; leave paginated archive rendering unchanged.

- [ ] **Step 2: Implement Selected Engineering Work**

Render one lead and two compact real projects from `portfolioProjects`, linking to the protected `/portfolio/` route without exposing restricted content outside existing public data.

- [ ] **Step 3: Implement Latest and Knowledge**

Use recent posts and the live LEED topic; present dates and status as metadata rather than decorative badges.

- [ ] **Step 4: Implement Gallery and About/Contact**

Use recent optimized Gallery assets, route to `/gallery/`, include a short factual About excerpt, and retain the existing email destination.

- [ ] **Step 5: Correct homepage metadata copy**

Set a clean English title and description in `src/pages/[...page].astro` without changing post content.

- [ ] **Step 6: Run focused unit and type checks**

Run: `pnpm test && pnpm type-check && pnpm check`

Expected: all pass.

### Task 4: Add Browser Coverage for Homepage Structure and Accessibility

**Files:**
- Modify: `tests/e2e/site.spec.ts`
- Modify: `tests/e2e/accessibility.spec.ts`
- Modify: `tests/visual/homepage.spec.ts`

**Interfaces:**
- Consumes: stable `data-home-hero` and `data-document-register` selectors.
- Produces: regression coverage for routing, links, keyboard focus, mobile layout, axe, and light/dark snapshots.

- [ ] **Step 1: Add homepage behavior assertions**

Verify the hero, register, Engineering, Latest, Knowledge, Gallery, and About sections render; verify primary links resolve to their intended routes.

- [ ] **Step 2: Add mobile overflow and keyboard assertions**

At the existing mobile viewport, assert document width does not exceed viewport width and keyboard focus reaches the hero CTA and section links.

- [ ] **Step 3: Include homepage in axe coverage**

Fail on serious or critical axe violations while preserving the existing test harness.

- [ ] **Step 4: Update intentional visual baselines**

Capture homepage desktop/mobile in light/dark mode with animations disabled and caret hidden.

- [ ] **Step 5: Run browser checks**

Run: `pnpm test:e2e && pnpm test:a11y && pnpm test:visual`

Expected: all pass with only reviewed snapshot changes.

### Task 5: Review, Simplify, and Validate Production Readiness

**Files:**
- Review: all files changed in Tasks 1-4

**Interfaces:**
- Consumes: completed homepage implementation and tests.
- Produces: a simplified, verified change set with no unrelated modifications.

- [ ] **Step 1: Perform the visual critique**

Inspect screenshots at desktop and mobile in light and dark modes. Remove any redundant border, label, card, copy, or animation that does not improve hierarchy or navigation.

- [ ] **Step 2: Review semantic and performance boundaries**

Confirm one `h1`, ordered headings, descriptive image alt text, no unnecessary hydration, responsive image sizing, no broken link, and no layout shift from fixed-format elements.

- [ ] **Step 3: Run the complete required validation set**

Run: `pnpm lint`, `pnpm test`, `pnpm test:e2e`, `pnpm test:a11y`, `pnpm test:visual`, `pnpm test:lighthouse`, `pnpm type-check`, `pnpm check`, and `pnpm build`.

Expected: all commands pass.

- [ ] **Step 4: Check repository safety**

Run: `git diff --check` and `git status --short`.

Expected: no whitespace errors; only intentional homepage, test, asset, and documentation files are modified or untracked.

## Self-Review

- Spec coverage: hero image, balanced technical/personal hierarchy, real data, document register, all discovery sections, theme support, accessibility, mobile, performance, and full verification each map to a task.
- Placeholder scan: no deferred implementation markers are present.
- Type consistency: both homepage components consume the single `HomepageData` contract produced by `buildHomepageData()`.
- Scope control: no global route, backend, Admin, Portfolio gate, comments, player, Gallery workflow, or Quartz output is modified.
