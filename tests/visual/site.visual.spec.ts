import { fileURLToPath } from "node:url";
import { expect, test } from "@playwright/test";
import { PUBLIC_ROUTES } from "../e2e/helpers/public-page-audit";

const snapshotStyle = fileURLToPath(new URL("./snapshot.css", import.meta.url));

const themes = ["light", "dark"] as const;

for (const theme of themes) {
	test.describe(`${theme} theme`, () => {
		test.beforeEach(async ({ page }) => {
			await page.addInitScript((selectedTheme) => {
				localStorage.setItem("theme", selectedTheme);
				localStorage.setItem("palette", "ocean");
				localStorage.removeItem("hue");
				localStorage.removeItem("archive-view");
			}, theme);
			await page.emulateMedia({ colorScheme: theme });
		});

		for (const route of PUBLIC_ROUTES) {
			test(`${route.name} remains visually stable`, async ({
				page,
			}, testInfo) => {
				await page.goto(route.path, { waitUntil: "networkidle" });
				await page.evaluate(async () => {
					await document.fonts.ready;
				});
				await expect(page.locator("main")).toBeVisible();
				const usesScopedLinuxTextTolerance =
					Boolean(process.env.CI) &&
					testInfo.project.name === "mobile-chromium" &&
					route.name === "home";
				await expect(page).toHaveScreenshot(`${route.name}-${theme}.png`, {
					fullPage: false,
					stylePath: snapshotStyle,
					// Dense mobile homepage text rasterizes differently on Linux and Windows.
					...(usesScopedLinuxTextTolerance ? { maxDiffPixelRatio: 0.055 } : {}),
				});
			});
		}
	});
}
