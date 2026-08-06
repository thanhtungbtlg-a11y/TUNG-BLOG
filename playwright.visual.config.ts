import { defineConfig } from "@playwright/test";
import baseConfig from "./playwright.config";

export default defineConfig({
	...baseConfig,
	testDir: "./tests/visual",
	outputDir: "./test-results/visual",
	reporter: process.env.CI
		? [
				["list"],
				["html", { outputFolder: "playwright-report/visual", open: "never" }],
			]
		: "list",
	snapshotPathTemplate:
		"{testDir}/__snapshots__/{testFilePath}/{arg}-{projectName}{ext}",
	expect: {
		toHaveScreenshot: {
			animations: "disabled",
			caret: "hide",
			maxDiffPixelRatio: 0.02,
			threshold: 0.25,
		},
	},
});
