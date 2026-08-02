# Project Guidance

## Architecture

- Keep the existing Astro 5, Svelte 5, TypeScript, Tailwind, pnpm, and Vercel architecture.
- Prefer static Astro output. Hydrate Svelte only for interactions that need client state.
- Reuse current components, CSS variables, theme presets, and icon libraries before adding code or dependencies.
- Keep original blog post content unchanged unless the task explicitly requests content edits.

## Change Discipline

- Read `package.json` and the files that own the behavior before editing.
- Keep changes small and scoped. Do not replace the visual identity or homepage direction without an explicit request.
- Never hardcode passwords, tokens, Supabase keys, email credentials, or other secrets.
- Preserve Portfolio access control, comment moderation, Gallery metadata, Admin workflows, and the generated Quartz site under `/brain/leed/`.
- Treat the source Obsidian vault and Gallery originals as user-owned source material. Do not edit or delete them outside the requested scope.

## UI And UX

- Check desktop and mobile after layout, navigation, modal, form, player, Gallery, Archive, or Portfolio changes.
- Preserve semantic headings, labels, keyboard access, visible focus, contrast, and reduced-motion behavior.
- Avoid generic AI styling, decorative blobs, excessive gradients, glass effects, animation, nested cards, and unnecessary rounding.
- A successful build is not enough for an interaction change; verify the rendered flow in a browser or Playwright.

## Tool Selection

- Text, metadata, or isolated logic: read code and run the narrowest relevant checks.
- Layout or responsive behavior: inspect the rendered page at desktop and mobile widths.
- User flows and regressions: run Playwright with `pnpm test:e2e`.
- Accessibility: run `pnpm test:a11y`; investigate serious and critical axe findings.
- Console, network, hydration, or performance issues: use browser developer tooling only when the issue calls for it.
- Do not add a dependency when a native or existing project solution is sufficient.

## Validation And Git

- For shared UI, routing, API, auth, or dependency changes, run `pnpm lint`, `pnpm test`, `pnpm test:e2e`, `pnpm type-check`, `pnpm check`, and `pnpm build`.
- Run `git diff --check` before committing.
- Stage explicit files only. Do not use `git add .` when unrelated changes exist.
- Commit and push only when the user explicitly asks.
