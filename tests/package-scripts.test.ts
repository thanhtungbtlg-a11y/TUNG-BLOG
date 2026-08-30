import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("keeps the fast site build separate from the complete production build", async () => {
	const packageJson = JSON.parse(await readFile("package.json", "utf8")) as {
		scripts?: Record<string, string>;
	};

	assert.equal(
		packageJson.scripts?.["build:site"],
		"node scripts/generate-music-manifest.mjs && astro build",
	);
	assert.equal(
		packageJson.scripts?.build,
		"pnpm build:site && node scripts/build-brain.mjs",
	);
});

test("reuses the Astro build in browser CI and scopes Quartz to its own workflow", async () => {
	const [siteWorkflow, brainWorkflow] = await Promise.all([
		readFile(".github/workflows/build.yml", "utf8"),
		readFile(".github/workflows/brain-build.yml", "utf8"),
	]);

	assert.match(siteWorkflow, /run: pnpm build:site/);
	assert.match(siteWorkflow, /actions\/upload-artifact@/);
	assert.match(siteWorkflow, /actions\/download-artifact@/);
	assert.doesNotMatch(siteWorkflow, /run: pnpm build\s*$/m);
	assert.match(brainWorkflow, /- "brain\/\*\*"/);
	assert.match(brainWorkflow, /run: pnpm build\s*$/m);
});

test("uses the repository pnpm version when Lighthouse starts a local preview", async () => {
	const lighthouseConfig = (await import("../lighthouserc.cjs")) as {
		default: { ci: { collect: { startServerCommand: string } } };
	};
	assert.match(
		lighthouseConfig.default.ci.collect.startServerCommand,
		process.env.CI ? /^pnpm preview/ : /^corepack pnpm preview/,
	);
});

test("uses the repository pnpm version when Playwright starts its web server", async () => {
	const playwrightConfig = (await import("../playwright.config.ts")) as {
		default: { webServer?: { command?: string } };
	};
	assert.match(
		playwrightConfig.default.webServer?.command ?? "",
		process.env.CI ? /^pnpm preview/ : /^corepack pnpm start/,
	);
});
