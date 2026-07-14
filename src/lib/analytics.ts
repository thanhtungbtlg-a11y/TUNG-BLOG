export type AnalyticsViewRow = {
	path: string;
	title: string;
	visitor_hash: string;
	session_hash: string;
	referrer_host: string;
	device_type: "desktop" | "mobile" | "tablet" | "unknown";
	viewed_at: string;
};

export type AnalyticsReport = {
	totals: {
		views: number;
		visitors: number;
		sessions: number;
		pages: number;
		bounceRate: number;
	};
	series: Array<{
		bucket: string;
		views: number;
		visitors: number;
	}>;
	pages: Array<{
		path: string;
		title: string;
		views: number;
		visitors: number;
		lastViewedAt: string;
	}>;
	events: Array<{
		path: string;
		title: string;
		viewedAt: string;
		device: AnalyticsViewRow["device_type"];
		referrer: string;
	}>;
	devices: Array<{ name: string; views: number }>;
	referrers: Array<{ name: string; views: number }>;
};

const vietnamTimeParts = new Intl.DateTimeFormat("en-CA", {
	timeZone: "Asia/Ho_Chi_Minh",
	year: "numeric",
	month: "2-digit",
	day: "2-digit",
	hour: "2-digit",
	hourCycle: "h23",
});

export function normalizeAnalyticsPath(value: unknown) {
	if (typeof value !== "string") return "";
	const path = value
		.trim()
		.split(/[?#]/, 1)[0]
		.replace(/\/{2,}/g, "/");
	if (!path.startsWith("/") || path.length > 500) return "";
	if (hasControlCharacters(path)) return "";
	return path === "/" ? path : path.replace(/\/$/, "");
}

export function normalizeAnalyticsTitle(value: unknown) {
	if (typeof value !== "string") return "";
	return [...value]
		.map((character) => (isControlCharacter(character) ? " " : character))
		.join("")
		.trim()
		.slice(0, 180);
}

export function normalizeReferrerHost(value: unknown) {
	if (typeof value !== "string" || !value.trim()) return "";
	try {
		return new URL(value).hostname.toLowerCase().slice(0, 180);
	} catch {
		return "";
	}
}

export function isAnalyticsId(value: unknown): value is string {
	return (
		typeof value === "string" &&
		/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
			value,
		)
	);
}

export function buildAnalyticsReport(
	rows: AnalyticsViewRow[],
	from: Date,
	to: Date,
): AnalyticsReport {
	const useHourlyBuckets = to.getTime() - from.getTime() <= 48 * 60 * 60 * 1000;
	const visitors = new Set<string>();
	const sessions = new Map<string, number>();
	const pageMap = new Map<
		string,
		{
			title: string;
			views: number;
			visitors: Set<string>;
			lastViewedAt: string;
		}
	>();
	const bucketMap = new Map<string, { views: number; visitors: Set<string> }>();
	const deviceMap = new Map<string, number>();
	const referrerMap = new Map<string, number>();

	for (const row of rows) {
		visitors.add(row.visitor_hash);
		sessions.set(row.session_hash, (sessions.get(row.session_hash) ?? 0) + 1);

		const page = pageMap.get(row.path) ?? {
			title: row.title,
			views: 0,
			visitors: new Set<string>(),
			lastViewedAt: row.viewed_at,
		};
		page.views += 1;
		page.visitors.add(row.visitor_hash);
		if (row.viewed_at > page.lastViewedAt) {
			page.lastViewedAt = row.viewed_at;
			if (row.title) page.title = row.title;
		}
		pageMap.set(row.path, page);

		const bucketKey = getVietnamBucket(row.viewed_at, useHourlyBuckets);
		const bucket = bucketMap.get(bucketKey) ?? {
			views: 0,
			visitors: new Set<string>(),
		};
		bucket.views += 1;
		bucket.visitors.add(row.visitor_hash);
		bucketMap.set(bucketKey, bucket);

		deviceMap.set(row.device_type, (deviceMap.get(row.device_type) ?? 0) + 1);
		if (row.referrer_host) {
			referrerMap.set(
				row.referrer_host,
				(referrerMap.get(row.referrer_host) ?? 0) + 1,
			);
		}
	}

	const bouncedSessions = [...sessions.values()].filter(
		(views) => views === 1,
	).length;
	return {
		totals: {
			views: rows.length,
			visitors: visitors.size,
			sessions: sessions.size,
			pages: pageMap.size,
			bounceRate: sessions.size
				? Math.round((bouncedSessions / sessions.size) * 100)
				: 0,
		},
		series: [...bucketMap.entries()]
			.sort(([left], [right]) => left.localeCompare(right))
			.map(([bucket, value]) => ({
				bucket,
				views: value.views,
				visitors: value.visitors.size,
			})),
		pages: [...pageMap.entries()]
			.map(([path, value]) => ({
				path,
				title: value.title,
				views: value.views,
				visitors: value.visitors.size,
				lastViewedAt: value.lastViewedAt,
			}))
			.sort(
				(left, right) =>
					right.views - left.views ||
					right.lastViewedAt.localeCompare(left.lastViewedAt),
			),
		events: rows
			.slice()
			.sort((left, right) => right.viewed_at.localeCompare(left.viewed_at))
			.slice(0, 250)
			.map((row) => ({
				path: row.path,
				title: row.title,
				viewedAt: row.viewed_at,
				device: row.device_type,
				referrer: row.referrer_host,
			})),
		devices: rankedCounts(deviceMap),
		referrers: rankedCounts(referrerMap).slice(0, 12),
	};
}

function getVietnamBucket(value: string, includeHour: boolean) {
	const parts = Object.fromEntries(
		vietnamTimeParts
			.formatToParts(new Date(value))
			.filter((part) => part.type !== "literal")
			.map((part) => [part.type, part.value]),
	);
	const date = `${parts.year}-${parts.month}-${parts.day}`;
	return includeHour ? `${date}T${parts.hour}:00` : date;
}

function rankedCounts(counts: Map<string, number>) {
	return [...counts.entries()]
		.map(([name, views]) => ({ name, views }))
		.sort(
			(left, right) =>
				right.views - left.views || left.name.localeCompare(right.name),
		);
}

function hasControlCharacters(value: string) {
	return [...value].some(isControlCharacter);
}

function isControlCharacter(character: string) {
	const code = character.charCodeAt(0);
	return code <= 31 || code === 127;
}
