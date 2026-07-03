import { type CollectionEntry, getCollection } from "astro:content";
import I18nKey from "@i18n/i18nKey";
import { i18n } from "@i18n/translation";
import { getCategoryUrl } from "@utils/url-utils.ts";

type PostsSortMode = "featured" | "date";

// Retrieve posts and sort them for home/feed surfaces or by original timeline.
async function getRawSortedPosts(sortMode: PostsSortMode = "featured") {
	const allBlogPosts = await getCollection("posts", ({ data }) => {
		return import.meta.env.PROD ? data.draft !== true : true;
	});

	const sorted = allBlogPosts.sort((a, b) => {
		if (sortMode === "featured") {
			const pinnedA = a.data.pinned ? 0 : 1;
			const pinnedB = b.data.pinned ? 0 : 1;
			if (pinnedA !== pinnedB) return pinnedA - pinnedB;

			if (a.data.pinned && b.data.pinned) {
				const orderA = a.data.pinOrder ?? 0;
				const orderB = b.data.pinOrder ?? 0;
				if (orderA !== orderB) return orderA - orderB;
			}

			const latestA = a.data.latest ? 0 : 1;
			const latestB = b.data.latest ? 0 : 1;
			if (latestA !== latestB) return latestA - latestB;

			if (a.data.latest && b.data.latest) {
				const orderA = a.data.latestOrder ?? 0;
				const orderB = b.data.latestOrder ?? 0;
				if (orderA !== orderB) return orderA - orderB;
			}
		}

		const dateA = new Date(a.data.published);
		const dateB = new Date(b.data.published);
		return dateB.getTime() - dateA.getTime();
	});
	return sorted;
}

export async function getSortedPosts() {
	const sorted = await getRawSortedPosts();

	for (let i = 1; i < sorted.length; i++) {
		sorted[i].data.nextSlug = sorted[i - 1].slug;
		sorted[i].data.nextTitle = sorted[i - 1].data.title;
	}
	for (let i = 0; i < sorted.length - 1; i++) {
		sorted[i].data.prevSlug = sorted[i + 1].slug;
		sorted[i].data.prevTitle = sorted[i + 1].data.title;
	}

	return sorted;
}
export type PostForList = {
	slug: string;
	body: string;
	data: CollectionEntry<"posts">["data"];
};
export async function getSortedPostsList(): Promise<PostForList[]> {
	const sortedFullPosts = await getRawSortedPosts();

	// delete post.body
	const sortedPostsList = sortedFullPosts.map((post) => ({
		slug: post.slug,
		body: post.body,
		data: post.data,
	}));

	return sortedPostsList;
}

export type ArchivePost = {
	slug: string;
	data: {
		title: string;
		description?: string;
		tags?: string[];
		category?: string | null;
		published: Date;
		pinned?: boolean;
		pinOrder?: number;
		latest?: boolean;
	};
};

export async function getChronologicalPostsList(): Promise<ArchivePost[]> {
	const sortedFullPosts = await getRawSortedPosts("date");

	return sortedFullPosts.map((post) => ({
		slug: post.slug,
		data: {
			title: post.data.title,
			description: post.data.description,
			tags: post.data.tags,
			category: post.data.category,
			published: post.data.published,
			pinned: post.data.pinned,
			pinOrder: post.data.pinOrder,
			latest: post.data.latest,
		},
	}));
}

export async function getRelatedPosts(
	entry: CollectionEntry<"posts">,
	limit = 3,
): Promise<CollectionEntry<"posts">[]> {
	const allBlogPosts = await getRawSortedPosts();
	const currentTags = new Set(entry.data.tags ?? []);
	const currentCategory = entry.data.category?.trim();

	return allBlogPosts
		.filter((post) => post.slug !== entry.slug)
		.map((post) => {
			const tagScore = (post.data.tags ?? []).filter((tag) =>
				currentTags.has(tag),
			).length;
			const categoryScore =
				currentCategory && post.data.category?.trim() === currentCategory
					? 2
					: 0;
			const recencyScore = Math.max(
				0,
				1 -
					(Date.now() - new Date(post.data.published).getTime()) /
						1000 /
						60 /
						60 /
						24 /
						365,
			);

			return {
				post,
				score: tagScore * 3 + categoryScore + recencyScore,
			};
		})
		.sort((a, b) => b.score - a.score)
		.slice(0, limit)
		.map(({ post }) => post);
}

export type Tag = {
	name: string;
	count: number;
};

export async function getTagList(): Promise<Tag[]> {
	const allBlogPosts = await getCollection<"posts">("posts", ({ data }) => {
		return import.meta.env.PROD ? data.draft !== true : true;
	});

	const countMap: { [key: string]: number } = {};
	allBlogPosts.forEach((post) => {
		(post.data.tags ?? []).forEach((tag: string) => {
			if (!countMap[tag]) countMap[tag] = 0;
			countMap[tag]++;
		});
	});

	// sort tags
	const keys: string[] = Object.keys(countMap).sort((a, b) => {
		return a.toLowerCase().localeCompare(b.toLowerCase());
	});

	return keys.map((key) => ({ name: key, count: countMap[key] }));
}

export type Category = {
	name: string;
	count: number;
	url: string;
};

export async function getCategoryList(): Promise<Category[]> {
	const allBlogPosts = await getCollection<"posts">("posts", ({ data }) => {
		return import.meta.env.PROD ? data.draft !== true : true;
	});
	const count: { [key: string]: number } = {};
	allBlogPosts.forEach((post) => {
		if (!post.data.category) {
			const ucKey = i18n(I18nKey.uncategorized);
			count[ucKey] = count[ucKey] ? count[ucKey] + 1 : 1;
			return;
		}

		const categoryName =
			typeof post.data.category === "string"
				? post.data.category.trim()
				: String(post.data.category).trim();

		count[categoryName] = count[categoryName] ? count[categoryName] + 1 : 1;
	});

	const lst = Object.keys(count).sort((a, b) => {
		return a.toLowerCase().localeCompare(b.toLowerCase());
	});

	const ret: Category[] = [];
	for (const c of lst) {
		ret.push({
			name: c,
			count: count[c],
			url: getCategoryUrl(c),
		});
	}
	return ret;
}
