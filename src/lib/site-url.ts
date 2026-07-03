const fallbackSiteUrl = "https://www.thanhtung0209.com";

export function getPublicSiteUrl() {
	const candidates = [
		process.env.PUBLIC_SITE_URL,
		process.env.VERCEL_PROJECT_PRODUCTION_URL,
		process.env.VERCEL_URL,
	];

	for (const candidate of candidates) {
		const normalized = normalizeSiteUrl(candidate);
		if (normalized) return normalized;
	}

	return fallbackSiteUrl;
}

function normalizeSiteUrl(value: string | undefined) {
	if (!value?.trim()) return null;

	try {
		const candidate = /^https?:\/\//i.test(value) ? value : `https://${value}`;
		const parsed = new URL(candidate);
		if (!parsed.hostname || !["http:", "https:"].includes(parsed.protocol)) {
			return null;
		}
		return parsed.origin;
	} catch {
		return null;
	}
}
