import {
	getCategoryList,
	getSortedPostsList,
	getTagList,
} from "@utils/content-utils";
import { getPostUrlBySlug } from "@utils/url-utils";
import type { APIRoute } from "astro";

export const GET: APIRoute = async () => {
	const [posts, tags, categories] = await Promise.all([
		getSortedPostsList(),
		getTagList(),
		getCategoryList(),
	]);

	return new Response(
		JSON.stringify({
			posts: posts.map((post) => ({
				title: post.data.title,
				description: post.data.description,
				url: getPostUrlBySlug(post.slug),
				tags: post.data.tags ?? [],
				category: post.data.category ?? "",
				published: post.data.published,
			})),
			tags,
			categories,
		}),
		{
			headers: {
				"Content-Type": "application/json; charset=utf-8",
			},
		},
	);
};
