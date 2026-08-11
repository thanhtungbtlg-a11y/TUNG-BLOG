export type HomepagePostInput = {
	slug: string;
	body: string;
	data: {
		title?: string;
		description?: string;
		published?: Date | string;
		category?: string | null;
	};
};

export type HomepagePost = HomepagePostInput & {
	data: HomepagePostInput["data"] & {
		title: string;
		published: Date | string;
	};
};

export type HomepageGalleryItem = {
	filename: string;
	thumbnail?: string;
	title: string;
	description?: string;
	date: string;
	album: string;
	width: number;
	height: number;
	order?: number;
};

export type HomepageBrainTopic = {
	title: string;
	description: string;
	icon: string;
	status: "live" | "soon";
	href?: string;
	lastUpdated?: string;
};

export type HomepageProject = {
	title: string;
	category: string;
	period: string;
	status: "Active" | "Completed" | "Archived";
	summary: string;
	role: string;
	process: string[];
	deliverables: string;
	skills: string[];
	image?: string;
	imageAlt?: string;
	imageWidth?: number;
	imageHeight?: number;
	href?: string;
};

export type HomepageUpdate = {
	type: "journal" | "gallery" | "knowledge";
	label: string;
	title: string;
	href: string;
	date: string;
};

export type HomepageDataInput = {
	posts: HomepagePostInput[];
	gallery: HomepageGalleryItem[];
	galleryLastUpdatedAt: string;
	brainTopics: HomepageBrainTopic[];
	projects: HomepageProject[];
};

export type HomepageData = {
	counts: {
		projects: number;
		journal: number;
		gallery: number;
		liveVaults: number;
	};
	lastUpdated: string;
	latestPosts: HomepagePost[];
	recentGallery: HomepageGalleryItem[];
	liveTopics: HomepageBrainTopic[];
	selectedProjects: HomepageProject[];
	latestUpdates: HomepageUpdate[];
};

function timestamp(value: Date | string | undefined): number {
	if (!value) return 0;
	const parsed = value instanceof Date ? value.getTime() : Date.parse(value);
	return Number.isFinite(parsed) ? parsed : 0;
}

export function buildHomepageData(input: HomepageDataInput): HomepageData {
	const normalizedPosts = input.posts.filter(
		(post): post is HomepagePost =>
			Boolean(post.data.title?.trim()) && Boolean(post.data.published),
	);
	const latestPosts = [...normalizedPosts]
		.sort((a, b) => timestamp(b.data.published) - timestamp(a.data.published))
		.slice(0, 3);
	const recentGallery = [...input.gallery]
		.sort(
			(a, b) =>
				timestamp(b.date) - timestamp(a.date) ||
				(a.order ?? 0) - (b.order ?? 0),
		)
		.slice(0, 3);
	const liveTopics = input.brainTopics.filter(
		(topic): topic is HomepageBrainTopic & { href: string } =>
			topic.status === "live" && Boolean(topic.href),
	);
	const selectedProjects = input.projects
		.filter((project) => project.status !== "Archived")
		.slice(0, 3);

	const latestPost = latestPosts[0];
	const latestTopic = [...liveTopics].sort(
		(a, b) => timestamp(b.lastUpdated) - timestamp(a.lastUpdated),
	)[0];
	const latestGallery = recentGallery[0];
	const latestUpdates: HomepageUpdate[] = [];

	if (latestPost) {
		latestUpdates.push({
			type: "journal",
			label: "Journal",
			title: latestPost.data.title,
			href: `/posts/${latestPost.slug}/`,
			date: new Date(latestPost.data.published).toISOString(),
		});
	}
	if (latestTopic?.href) {
		latestUpdates.push({
			type: "knowledge",
			label: "Second Brain",
			title: latestTopic.title,
			href: latestTopic.href,
			date: latestTopic.lastUpdated ?? "",
		});
	}
	if (latestGallery) {
		latestUpdates.push({
			type: "gallery",
			label: "Gallery",
			title: latestGallery.title,
			href: "/gallery/",
			date: input.galleryLastUpdatedAt || latestGallery.date,
		});
	}

	latestUpdates.sort((a, b) => timestamp(b.date) - timestamp(a.date));

	return {
		counts: {
			projects: input.projects.filter(
				(project) => project.status !== "Archived",
			).length,
			journal: input.posts.length,
			gallery: input.gallery.length,
			liveVaults: liveTopics.length,
		},
		lastUpdated: latestUpdates[0]?.date ?? "",
		latestPosts,
		recentGallery,
		liveTopics,
		selectedProjects,
		latestUpdates,
	};
}
