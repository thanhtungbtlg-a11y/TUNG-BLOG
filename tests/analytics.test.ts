import assert from "node:assert/strict";
import test from "node:test";
import {
	buildAnalyticsReport,
	isAnalyticsId,
	normalizeAnalyticsPath,
	normalizeAnalyticsTitle,
	normalizeReferrerHost,
} from "../src/lib/analytics.ts";

test("normalizes analytics input without keeping query details", () => {
	assert.equal(
		normalizeAnalyticsPath("/posts/hello/?utm_source=test#top"),
		"/posts/hello",
	);
	assert.equal(normalizeAnalyticsPath("https://example.com/post"), "");
	assert.equal(normalizeAnalyticsPath("admin"), "");
	assert.equal(normalizeAnalyticsTitle("  Bài viết\n mới  "), "Bài viết  mới");
	assert.equal(
		normalizeReferrerHost("https://www.google.com/search?q=private"),
		"www.google.com",
	);
	assert.equal(normalizeReferrerHost("not a url"), "");
});

test("accepts UUID identifiers used by the anonymous tracker", () => {
	assert.equal(isAnalyticsId("fdda765f-fc57-5604-a269-52a7df8164ec"), true);
	assert.equal(isAnalyticsId("visitor-1"), false);
});

test("aggregates page views, visitors, sessions and exact events", () => {
	const rows = [
		{
			path: "/posts/hello",
			title: "Hello",
			visitor_hash: "visitor-a",
			session_hash: "session-a",
			referrer_host: "google.com",
			device_type: "mobile" as const,
			viewed_at: "2026-07-14T01:00:00.000Z",
		},
		{
			path: "/posts/hello",
			title: "Hello",
			visitor_hash: "visitor-a",
			session_hash: "session-a",
			referrer_host: "",
			device_type: "mobile" as const,
			viewed_at: "2026-07-14T01:10:00.000Z",
		},
		{
			path: "/archive",
			title: "Kho bài",
			visitor_hash: "visitor-b",
			session_hash: "session-b",
			referrer_host: "facebook.com",
			device_type: "desktop" as const,
			viewed_at: "2026-07-14T02:00:00.000Z",
		},
	];
	const report = buildAnalyticsReport(
		rows,
		new Date("2026-07-14T00:00:00.000Z"),
		new Date("2026-07-15T00:00:00.000Z"),
	);

	assert.deepEqual(report.totals, {
		views: 3,
		visitors: 2,
		sessions: 2,
		pages: 2,
		bounceRate: 50,
	});
	assert.equal(report.pages[0].path, "/posts/hello");
	assert.equal(report.pages[0].views, 2);
	assert.equal(report.events[0].path, "/archive");
	assert.deepEqual(report.devices, [
		{ name: "mobile", views: 2 },
		{ name: "desktop", views: 1 },
	]);
});
