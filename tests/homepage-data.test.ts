import assert from "node:assert/strict";
import test from "node:test";
import { buildHomepageData } from "../src/utils/homepage-data.ts";

test("builds homepage discovery data from repository sources", () => {
	const data = buildHomepageData({
		posts: [
			{
				slug: "latest-note",
				body: "Latest note body",
				data: {
					title: "Latest note",
					description: "The newest journal entry.",
					published: new Date("2026-08-01T00:00:00.000Z"),
				},
			},
			{
				slug: "older-note",
				body: "Older note body",
				data: {
					title: "Older note",
					description: "An older journal entry.",
					published: new Date("2026-06-21T00:00:00.000Z"),
				},
			},
		],
		gallery: [
			{
				filename: "photos/older.webp",
				thumbnail: "thumbs/older.webp",
				title: "Older photograph",
				description: "",
				date: "2025-07-14",
				album: "July",
				width: 1800,
				height: 1200,
				order: 2,
			},
			{
				filename: "photos/newer.webp",
				thumbnail: "thumbs/newer.webp",
				title: "Newer photograph",
				description: "Window light",
				date: "2025-08-02",
				album: "Selected photos",
				width: 1800,
				height: 1012,
				order: 1,
			},
		],
		galleryLastUpdatedAt: "2026-07-16T23:58:11+07:00",
		brainTopics: [
			{
				title: "LEED",
				description: "Green building notes",
				icon: "leaf",
				status: "live",
				href: "/brain/leed/",
				lastUpdated: "2026-07-29T13:57:11.443Z",
			},
			{
				title: "Future vault",
				description: "Coming soon",
				icon: "folder",
				status: "soon",
			},
		],
		projects: [
			{
				title: "Building Services Design",
				category: "Plumbing & fire protection",
				period: "2026 - Ongoing",
				status: "Active",
				summary: "Coordinated building-services design.",
				role: "Design engineer",
				process: [],
				deliverables: "Models and drawings",
				skills: ["Revit"],
			},
			{
				title: "Plant 3D Automation",
				category: "Engineering software",
				period: "2024",
				status: "Completed",
				summary: "Automation and administration.",
				role: "Plant 3D administrator",
				process: [],
				deliverables: "Automation utilities",
				skills: ["Python"],
			},
			{
				title: "LEED Second Brain",
				category: "Knowledge system",
				period: "Ongoing",
				status: "Active",
				summary: "A public knowledge base.",
				role: "Knowledge curation",
				process: [],
				deliverables: "Quartz knowledge base",
				skills: ["LEED"],
				href: "/brain/leed/",
			},
			{
				title: "Fourth project",
				category: "Archive",
				period: "2023",
				status: "Archived",
				summary: "Not selected for the homepage.",
				role: "Engineer",
				process: [],
				deliverables: "Archive",
				skills: [],
			},
		],
	});

	assert.equal(data.counts.journal, 2);
	assert.equal(data.counts.gallery, 2);
	assert.equal(data.counts.liveVaults, 1);
	assert.equal(data.counts.projects, 3);
	assert.equal(data.lastUpdated, "2026-08-01T00:00:00.000Z");
	assert.deepEqual(
		data.latestPosts.map((post) => post.slug),
		["latest-note", "older-note"],
	);
	assert.deepEqual(
		data.recentGallery.map((photo) => photo.title),
		["Newer photograph", "Older photograph"],
	);
	assert.equal(data.selectedProjects.length, 3);
	assert.deepEqual(
		data.latestUpdates.map((update) => update.type),
		["journal", "knowledge", "gallery"],
	);
	for (const update of data.latestUpdates) {
		assert.match(update.href, /^\//);
	}
});
