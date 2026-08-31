import { expect, test } from "@playwright/test";
import {
	expectMinimumFontSize,
	expectNoHorizontalOverflow,
	expectNoSeriousAxeViolations,
	expectReadablePublicPage,
	PUBLIC_ROUTES,
} from "./helpers/public-page-audit";

const PUBLIC_READABILITY_CASES = [
	{
		path: "/archive/",
		selectors: [".archive-header p", ".archive-filters label > span"],
	},
	{
		path: "/gallery/",
		selectors: [".gallery-kicker", ".gallery-toolbar > label > span"],
	},
	{
		path: "/brain/",
		selectors: [".brain-kicker", ".brain-status", ".brain-topic__updated"],
	},
] as const;

test("home presents engineering work and personal discovery without horizontal overflow", async ({
	page,
}) => {
	await page.goto("/");

	await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
	await expect(page.getByRole("heading", { level: 1 })).toContainText(
		"Nguyễn Thanh Tùng",
	);
	const nameLines = page.locator("#home-title > span");
	await expect(nameLines).toHaveCount(2);
	const nameLinePositions = await nameLines.evaluateAll((lines) =>
		lines.map((line) => Math.round(line.getBoundingClientRect().top)),
	);
	expect(new Set(nameLinePositions).size).toBe(2);
	await expect(page.locator("[data-home-hero]")).toBeVisible();
	await expect(page.locator("[data-document-register]")).toBeVisible();
	await expect(page.locator("[data-document-register]")).toContainText(
		"Work & Knowledge Register",
	);
	await expect(page.locator("[data-home-hero]")).not.toContainText("Revision");
	await expect(page.locator("[data-home-hero]")).not.toContainText(
		"Status Active",
	);
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
		page.getByRole("link", { name: "Explore portfolio" }),
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

test("public pages expose one primary heading without horizontal overflow", async ({
	page,
}) => {
	for (const route of PUBLIC_ROUTES) {
		await page.goto(route.path);
		await expectReadablePublicPage(page);
	}
});

test("public metadata remains readable across page types", async ({ page }) => {
	for (const route of PUBLIC_READABILITY_CASES) {
		await page.goto(route.path);
		for (const selector of route.selectors) {
			const element = page.locator(selector).first();
			await expect(element).toBeVisible();
			await expectMinimumFontSize(element, 12);
		}
	}

	await page.goto("/about/");
	await expectMinimumFontSize(page.locator(".about-intro blockquote"), 16);
	await expectMinimumFontSize(page.locator(".about-content"), 16);
});

test("accessibility: public pages have no serious or critical axe violations", async ({
	page,
}) => {
	await page.emulateMedia({ reducedMotion: "reduce" });
	for (const route of PUBLIC_ROUTES) {
		await page.goto(route.path);
		await expectNoSeriousAxeViolations(page);
	}
});

test("reduced motion removes delayed on-load fades", async ({ page }) => {
	await page.emulateMedia({ reducedMotion: "reduce" });
	await page.goto("/archive/");

	await expect(page.locator("#content-wrapper")).toHaveCSS(
		"animation-delay",
		"0s",
	);
});
