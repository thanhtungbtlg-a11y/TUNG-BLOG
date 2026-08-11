import { fileURLToPath } from "node:url";
import { expect, test } from "@playwright/test";

const snapshotStyle = fileURLToPath(new URL("./snapshot.css", import.meta.url));

const routes = [
	{ name: "home", path: "/" },
	{ name: "archive", path: "/archive/" },
	{ name: "gallery", path: "/gallery/" },
	{ name: "about", path: "/about/" },
	{ name: "second-brain", path: "/brain/" },
	{ name: "post", path: "/posts/6-thang-nhin-lai/" },
] as const;

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

		for (const route of routes) {
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
					theme === "light" &&
					route.name === "home";
				await expect(page).toHaveScreenshot(`${route.name}-${theme}.png`, {
					fullPage: false,
					stylePath: snapshotStyle,
					// Linux and Windows anti-alias dense light-theme text differently.
					...(usesScopedLinuxTextTolerance ? { maxDiffPixelRatio: 0.04 } : {}),
				});
			});
		}
	});
}
