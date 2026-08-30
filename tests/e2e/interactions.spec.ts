import { expect, test } from "@playwright/test";

test("mobile navigation closes with Escape and restores focus", async ({
	page,
}) => {
	test.skip((page.viewportSize()?.width ?? 0) >= 768, "Mobile navigation only");
	await page.goto("/");

	const menuButton = page.getByRole("button", {
		name: "Open navigation menu",
	});
	await menuButton.click();
	await expect(menuButton).toHaveAttribute("aria-expanded", "true");
	const firstLink = page.locator("#nav-menu-panel a").first();
	await firstLink.focus();
	await expect(firstLink).toBeFocused();

	await page.keyboard.press("Escape");
	await expect(menuButton).toHaveAttribute("aria-expanded", "false");
	await expect(menuButton).toBeFocused();
});

test("search closes with Escape and restores its trigger", async ({ page }) => {
	await page.goto("/");

	const trigger = page.locator(
		(page.viewportSize()?.width ?? 0) < 1024 ? "#search-switch" : "#search-bar",
	);
	await trigger.click();
	const dialog = page.getByRole("dialog");
	await expect(dialog).toBeVisible();
	await expect(
		dialog.getByRole("textbox", { name: "Command search" }),
	).toBeFocused();

	await page.keyboard.press("Escape");
	await expect(dialog).toHaveCount(0);
	await expect(trigger).toBeFocused();
});

test("search keeps backward keyboard focus inside the modal", async ({
	page,
}) => {
	await page.goto("/");
	await page.keyboard.press("Control+K");
	const dialog = page.getByRole("dialog");
	await expect(
		dialog.getByRole("textbox", { name: "Command search" }),
	).toBeFocused();

	await page.keyboard.press("Shift+Tab");
	expect(
		await page.evaluate(() =>
			Boolean(document.activeElement?.closest('[role="dialog"]')),
		),
	).toBe(true);
});

test("portfolio gate closes with Escape and restores a visible trigger", async ({
	page,
}) => {
	await page.goto("/");

	const mobile = (page.viewportSize()?.width ?? 0) < 768;
	if (mobile) {
		await page.getByRole("button", { name: "Open navigation menu" }).click();
	}
	await page
		.getByRole("link", { name: "Portfolio", exact: true })
		.first()
		.click();
	const dialog = page.getByRole("dialog", { name: "Protected portfolio" });
	await expect(dialog).toBeVisible();
	await expect(dialog.locator("#portfolio-password")).toBeFocused();

	await page.keyboard.press("Escape");
	await expect(dialog).toHaveCount(0);
	if (mobile) {
		await expect(
			page.getByRole("button", { name: "Open navigation menu" }),
		).toBeFocused();
	} else {
		await expect(
			page.getByRole("link", { name: "Portfolio", exact: true }).first(),
		).toBeFocused();
	}
});

test("portfolio gate keeps keyboard focus inside the modal", async ({
	page,
}) => {
	await page.goto("/");
	if ((page.viewportSize()?.width ?? 0) < 768) {
		await page.getByRole("button", { name: "Open navigation menu" }).click();
	}
	await page
		.getByRole("link", { name: "Portfolio", exact: true })
		.first()
		.click();
	const dialog = page.getByRole("dialog", { name: "Protected portfolio" });
	await expect(dialog.locator("#portfolio-password")).toBeFocused();

	await page.keyboard.press("Shift+Tab");
	await page.keyboard.press("Shift+Tab");
	expect(
		await page.evaluate(() =>
			Boolean(document.activeElement?.closest('[role="dialog"]')),
		),
	).toBe(true);
});

test("theme choice persists after reload", async ({ page }) => {
	await page.goto("/");
	await page.evaluate(() => localStorage.setItem("theme", "dark"));
	await page.reload();
	await expect(page.locator("html")).toHaveClass(/dark/);

	await page.locator("#scheme-switch").click();
	const storedTheme = await page.evaluate(() => localStorage.getItem("theme"));
	expect(storedTheme).toBeTruthy();
	await page.reload();
	expect(await page.evaluate(() => localStorage.getItem("theme"))).toBe(
		storedTheme,
	);
});

test("compact mobile player does not cover homepage headings or actions", async ({
	page,
}) => {
	test.skip((page.viewportSize()?.width ?? 0) >= 768, "Mobile player only");
	await page.goto("/");

	const player = page.locator(".music-player:not(.expanded)");
	await expect(player).toBeVisible();
	const targets = [
		page.getByRole("link", { name: "Explore portfolio" }),
		page.getByRole("link", { name: "About Nguyễn Thanh Tùng" }),
		page.getByRole("heading", { name: "Selected engineering work" }),
		page.getByRole("heading", { name: "Latest from the journal" }),
		page.getByRole("heading", { name: "Knowledge system" }),
		page.getByRole("heading", { name: "Recent photographs" }),
		page.getByRole("heading", { name: "About this space" }),
	];

	for (const target of targets) {
		await target.scrollIntoViewIfNeeded();
		const overlaps = await target.evaluate((element) => {
			const targetRect = element.getBoundingClientRect();
			const playerElement = document.querySelector(
				".music-player:not(.expanded)",
			);
			if (!(playerElement instanceof HTMLElement)) return false;
			const playerRect = playerElement.getBoundingClientRect();
			return !(
				targetRect.right <= playerRect.left ||
				targetRect.left >= playerRect.right ||
				targetRect.bottom <= playerRect.top ||
				targetRect.top >= playerRect.bottom
			);
		});
		expect(overlaps).toBe(false);
	}
});
