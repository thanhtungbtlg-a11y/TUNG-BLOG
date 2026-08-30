import AxeBuilder from "@axe-core/playwright";
import { expect, type Locator, type Page } from "@playwright/test";

export const PUBLIC_ROUTES = [
	{ name: "home", path: "/" },
	{ name: "archive", path: "/archive/" },
	{ name: "gallery", path: "/gallery/" },
	{ name: "about", path: "/about/" },
	{ name: "second-brain", path: "/brain/" },
	{ name: "post", path: "/posts/6-thang-nhin-lai/" },
] as const;

export async function expectNoHorizontalOverflow(page: Page) {
	const hasOverflow = await page.evaluate(
		() => document.documentElement.scrollWidth > window.innerWidth + 1,
	);
	expect(hasOverflow).toBe(false);
}

export async function expectReadablePublicPage(page: Page) {
	await expect(page.locator("main")).toBeVisible();
	await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
	await expectNoHorizontalOverflow(page);
}

export async function expectNoSeriousAxeViolations(page: Page) {
	const results = await new AxeBuilder({ page })
		.withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
		.analyze();
	const blockingViolations = results.violations.filter(
		(violation) =>
			violation.impact === "serious" || violation.impact === "critical",
	);
	expect(blockingViolations).toEqual([]);
}

export async function expectMinimumFontSize(
	locator: Locator,
	minimumPixels: number,
) {
	const size = await locator.evaluate((element) =>
		Number.parseFloat(getComputedStyle(element).fontSize),
	);
	expect(size).toBeGreaterThanOrEqual(minimumPixels);
}
