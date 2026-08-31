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

test("protected portfolio links bypass Swup before the gate resolves", async ({
	page,
}) => {
	await page.goto("/");

	const portfolioLinks = page.locator('a[href^="/portfolio"]');
	expect(await portfolioLinks.count()).toBeGreaterThan(0);
	const swupManagedLinks = await portfolioLinks.evaluateAll((links) =>
		links
			.filter((link) => !link.hasAttribute("data-no-swup"))
			.map((link) => link.getAttribute("href")),
	);
	expect(swupManagedLinks).toEqual([]);
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

test("home navigation clears the previous active nav item", async ({
	page,
}) => {
	const navigationErrors: string[] = [];
	const analyticsErrors: string[] = [];
	page.on("console", (message) => {
		if (
			message.type() === "error" &&
			message.text().includes("Error in hook 'page:view'")
		) {
			navigationErrors.push(message.text());
		}
	});
	page.on("pageerror", (error) => {
		if (error.message.includes("vercel-analytics")) {
			analyticsErrors.push(error.message);
		}
	});

	await page.goto("/brain/");

	const desktopNav = page.locator(".navbar-links");
	const homeLink = desktopNav.locator('[data-nav-url="/"]');
	const brainLink = desktopNav.locator('[data-nav-url="/brain/"]');
	await expect(brainLink).toHaveAttribute("aria-current", "page");

	const menuButton = page.locator("#nav-menu-switch");
	if (await menuButton.isVisible()) await menuButton.click();
	await page.locator('a[data-nav-url="/"]:visible').first().click();

	await expect(page).toHaveURL(/\/$/);
	await expect(
		page.getByRole("heading", { level: 1, name: "Nguyễn Thanh Tùng" }),
	).toBeVisible();
	const activeNavUrls = await page
		.locator("[data-nav-url].is-active")
		.evaluateAll((links) => [
			...new Set(links.map((link) => link.getAttribute("data-nav-url"))),
		]);
	expect(activeNavUrls).toEqual(["/"]);
	await expect(homeLink).toHaveAttribute("aria-current", "page");
	await expect(homeLink).toHaveClass(/is-active/);
	await expect(brainLink).not.toHaveAttribute("aria-current", "page");
	await expect(brainLink).not.toHaveClass(/is-active/);
	await expect(page.locator("html")).toHaveClass(/homepage-index-page/);
	await expect(page.locator("body")).toHaveClass(/homepage-index-page/);
	await expect(page.locator(".navbar-brand-title")).toHaveText(
		"Nguyễn Thanh Tùng",
	);
	await expect(page.locator(".navbar-connect")).toBeAttached();
	await expect(page.locator(".navbar-connect")).not.toHaveAttribute(
		"hidden",
		"",
	);

	await page.goBack();
	await expect(page).toHaveURL(/\/brain\/$/);
	await expect(
		page.getByRole("heading", { level: 1, name: "Second Brain" }),
	).toBeVisible();
	await expect(brainLink).toHaveAttribute("aria-current", "page");
	await expect(homeLink).not.toHaveAttribute("aria-current", "page");

	await page.goForward();
	await expect(page).toHaveURL(/\/$/);
	await expect(
		page.getByRole("heading", { level: 1, name: "Nguyễn Thanh Tùng" }),
	).toBeVisible();
	await expect(homeLink).toHaveAttribute("aria-current", "page");
	await expect(brainLink).not.toHaveAttribute("aria-current", "page");
	expect(navigationErrors).toEqual([]);
	expect(analyticsErrors).toEqual([]);

	const analyticsRuntime = await page.evaluate(() => {
		const analyticsScript = [...document.scripts].find((script) =>
			script.textContent?.includes("__thanhTungVercelAnalyticsBound"),
		);
		if (!analyticsScript) return null;

		const queue =
			(window as typeof window & { vaq?: [string, unknown?][] }).vaq ?? [];
		return {
			ignoredBySwup: analyticsScript.hasAttribute("data-swup-ignore-script"),
			pageviewPaths: queue
				.filter(([event]) => event === "pageview")
				.map(([, payload]) => (payload as { path?: string } | undefined)?.path),
		};
	});
	if (analyticsRuntime) {
		expect(analyticsRuntime.ignoredBySwup).toBe(true);
		expect(analyticsRuntime.pageviewPaths).toEqual([
			"/brain/",
			"/",
			"/brain/",
			"/",
		]);
	}
});

test("collapsed player stays anchored to the viewport corner", async ({
	page,
}) => {
	await page.goto("/");

	const player = page.locator(".music-player:not(.expanded)");
	await expect(player).toBeVisible();
	const placement = await player.evaluate((element) => {
		const rect = element.getBoundingClientRect();
		return {
			position: getComputedStyle(element).position,
			bottomGap: window.innerHeight - rect.bottom,
			rightGap: window.innerWidth - rect.right,
		};
	});

	expect(placement.position).toBe("fixed");
	expect(placement.bottomGap).toBeGreaterThanOrEqual(0);
	expect(placement.bottomGap).toBeLessThanOrEqual(24);
	expect(placement.rightGap).toBeGreaterThanOrEqual(0);
	expect(placement.rightGap).toBeLessThanOrEqual(24);
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
