import AxeBuilder from "@axe-core/playwright";
import { expect, type Page, test } from "@playwright/test";

async function expectNoHorizontalOverflow(page: Page) {
	const hasOverflow = await page.evaluate(
		() => document.documentElement.scrollWidth > window.innerWidth + 1,
	);
	expect(hasOverflow).toBe(false);
}

test("home presents engineering work and personal discovery without horizontal overflow", async ({
	page,
}) => {
	await page.goto("/");

	await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
	await expect(page.getByRole("heading", { level: 1 })).toContainText(
		"Nguyễn Thanh Tùng",
	);
	await expect(page.locator("[data-home-hero]")).toBeVisible();
	await expect(page.locator("[data-document-register]")).toBeVisible();
	for (const heading of [
		"Selected engineering work",
		"Latest from the journal",
		"Knowledge system",
		"Recent photographs",
		"About this space",
	]) {
		await expect(page.getByRole("heading", { name: heading })).toBeVisible();
	}
	await expect(
		page.getByRole("link", { name: "View engineering work" }),
	).toBeVisible();
	await expect(
		page.getByRole("link", { name: "About Nguyễn Thanh Tùng" }),
	).toBeVisible();
	await expect(page.locator("main")).toBeVisible();
	await expectNoHorizontalOverflow(page);
});

test("gallery filters update the results and URL", async ({ page }) => {
	await page.goto("/gallery/");

	const firstItem = page.locator("[data-gallery-item]").first();
	await expect(firstItem).toBeVisible();
	const title = (await firstItem.locator("h3").textContent())?.trim();
	const year = await firstItem.getAttribute("data-year");
	const album = (
		await firstItem
			.locator("xpath=ancestor::section[@data-gallery-group]")
			.getByRole("heading", { level: 2 })
			.textContent()
	)?.trim();
	expect(title).toBeTruthy();
	expect(year).toBeTruthy();
	expect(album).toBeTruthy();

	await page.locator("#gallery-search").fill(title ?? "");
	await page.locator("#gallery-year").selectOption(year ?? "");
	await page.locator("#gallery-album").selectOption({ label: album ?? "" });

	await expect(firstItem).toBeVisible();
	await expect(page.locator("[data-gallery-item]:visible")).toHaveCount(1);
	await expect(page).toHaveURL(/q=/);
	await expect(page).toHaveURL(/year=/);
	await expect(page).toHaveURL(/album=/);

	await page.locator("#gallery-reset").click();
	await expect(page).toHaveURL(/\/gallery\/$/);
	await expectNoHorizontalOverflow(page);
});

test("portfolio navigation opens the password gate", async ({ page }) => {
	await page.goto("/");

	if ((page.viewportSize()?.width ?? 0) < 768) {
		await page.getByRole("button", { name: "Open navigation menu" }).click();
	}
	await page
		.getByRole("link", { name: "Portfolio", exact: true })
		.first()
		.click();
	const dialog = page.getByRole("dialog", { name: "Protected portfolio" });
	await expect(dialog).toBeVisible();
	await expect(dialog.locator("#portfolio-password")).toBeFocused();
	await expect(page).toHaveURL(/\/$/);
});

test("post exposes the moderated comments area", async ({ page }) => {
	await page.goto("/posts/6-thang-nhin-lai/");

	const comments = page.locator("[data-anonymous-comments]");
	await expect(comments).toBeVisible();
	await expect(
		comments.getByRole("heading", { name: "Anonymous comments" }),
	).toBeVisible();

	const input = comments.locator("[data-comment-input]");
	if ((await input.count()) > 0) {
		await expect(input).toBeEditable();
		await expect(
			comments.getByRole("button", { name: "Submit comment" }),
		).toBeVisible();
	} else {
		await expect(comments).toContainText(
			"Comments are awaiting Supabase configuration.",
		);
	}
});

test("accessibility: core pages have no serious or critical axe violations", async ({
	page,
}) => {
	for (const path of ["/", "/gallery/"]) {
		await page.goto(path);
		const results = await new AxeBuilder({ page })
			.withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
			.analyze();
		const blockingViolations = results.violations.filter(
			(violation) =>
				violation.impact === "serious" || violation.impact === "critical",
		);
		expect(blockingViolations, `axe violations on ${path}`).toEqual([]);
	}
});
