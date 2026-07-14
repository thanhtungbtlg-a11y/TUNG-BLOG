(() => {
	if (window.__thanhTungAnalyticsLoaded) return;
	window.__thanhTungAnalyticsLoaded = true;

	const ignoredPathPrefixes = ["/admin", "/api", "/_astro", "/_vercel"];
	const visitorKey = "thanh-tung-analytics-visitor";
	const sessionKey = "thanh-tung-analytics-session";
	const idPattern =
		/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
	let lastTrackedPath = "";
	let lastTrackedAt = 0;

	function randomId() {
		if (crypto.randomUUID) return crypto.randomUUID();
		return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (digit) =>
			(
				Number(digit) ^
				(crypto.getRandomValues(new Uint8Array(1))[0] &
					(15 >> (Number(digit) / 4)))
			).toString(16),
		);
	}

	function storedId(storage, key) {
		try {
			const existing = storage.getItem(key);
			if (existing && idPattern.test(existing)) return existing;
			const value = randomId();
			storage.setItem(key, value);
			return value;
		} catch {
			return randomId();
		}
	}

	function shouldSkip(path) {
		return (
			location.hostname === "localhost" ||
			location.hostname === "127.0.0.1" ||
			navigator.doNotTrack === "1" ||
			navigator.globalPrivacyControl === true ||
			ignoredPathPrefixes.some((prefix) => path.startsWith(prefix))
		);
	}

	function trackPageView() {
		const path = location.pathname.replace(/\/{2,}/g, "/");
		const now = Date.now();
		if (
			shouldSkip(path) ||
			(path === lastTrackedPath && now - lastTrackedAt < 1500)
		) {
			return;
		}

		lastTrackedPath = path;
		lastTrackedAt = now;
		void fetch("/api/analytics/track", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				eventId: randomId(),
				visitorId: storedId(localStorage, visitorKey),
				sessionId: storedId(sessionStorage, sessionKey),
				path,
				title: document.title,
				referrer: document.referrer,
			}),
			keepalive: true,
		}).catch(() => undefined);
	}

	function trackAfterNavigation() {
		window.setTimeout(trackPageView, 80);
	}

	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", trackPageView, {
			once: true,
		});
	} else {
		trackPageView();
	}
	document.addEventListener("nav", trackAfterNavigation);
	window.addEventListener("swup:page:view", trackAfterNavigation);
	window.addEventListener("popstate", trackAfterNavigation);
})();
