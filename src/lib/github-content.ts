import matter from "gray-matter";
import { AdminRequestError } from "./admin-auth.js";

const defaultRepository = "thanhtungbtlg-a11y/TUNG-BLOG";

function env(name: string) {
	return process.env[name] ?? "";
}

function getConfig(requireToken = false) {
	const token = env("GITHUB_TOKEN");
	if (requireToken && !token) {
		throw new AdminRequestError(
			"GITHUB_TOKEN is missing from the Vercel environment variables.",
			503,
		);
	}

	return {
		token,
		repository: env("GITHUB_REPOSITORY") || defaultRepository,
		branch: env("GITHUB_BRANCH") || "main",
	};
}

function encodePath(pathname: string) {
	return pathname.split("/").map(encodeURIComponent).join("/");
}

async function githubFetch(pathname: string, init: RequestInit = {}) {
	const method = (init.method ?? "GET").toUpperCase();
	const isReadRequest = method === "GET";
	const { token } = getConfig(!isReadRequest);
	const request = (authorizationToken = "") =>
		fetch(`https://api.github.com${pathname}`, {
			...init,
			headers: {
				Accept: "application/vnd.github+json",
				...(authorizationToken
					? { Authorization: `Bearer ${authorizationToken}` }
					: {}),
				"X-GitHub-Api-Version": "2022-11-28",
				...init.headers,
			},
		});

	let response = await request(token);
	// Repository data is public. A stale PAT should not block read-only admin views.
	if (isReadRequest && token && [401, 403].includes(response.status)) {
		response = await request();
	}

	if (!response.ok) {
		const details = await response.text();
		if (response.status === 404) {
			throw new AdminRequestError(
				"The requested GitHub data was not found.",
				404,
			);
		}
		console.error("GitHub API error", response.status, details);
		if (response.status === 401) {
			throw new AdminRequestError(
				"GITHUB_TOKEN is invalid or has expired.",
				502,
			);
		}
		if (response.status === 403) {
			throw new AdminRequestError(
				"GITHUB_TOKEN needs Contents: Read and write access to the repository.",
				502,
			);
		}
		if (response.status === 409 || response.status === 422) {
			throw new AdminRequestError(
				"The GitHub content changed recently. Reload the page and try again.",
				409,
			);
		}
		throw new AdminRequestError(
			`GitHub could not process the request (HTTP ${response.status}).`,
			502,
		);
	}

	return response.json();
}

type RepositoryFileChange = {
	path: string;
	content?: Buffer;
};

export async function commitRepositoryFiles(
	changes: RepositoryFileChange[],
	message: string,
) {
	if (changes.length === 0) return;

	const { repository, branch } = getConfig(true);
	const refPath = `heads/${branch}`;
	const ref = await githubFetch(
		`/repos/${repository}/git/ref/${encodePath(refPath)}`,
	);
	const parentSha = String(ref.object?.sha ?? "");
	if (!parentSha) {
		throw new AdminRequestError(
			"The current GitHub branch could not be read.",
			502,
		);
	}

	const parent = await githubFetch(
		`/repos/${repository}/git/commits/${parentSha}`,
	);
	const tree = await Promise.all(
		changes.map(async (change) => {
			if (!change.content) {
				return {
					path: change.path,
					mode: "100644",
					type: "blob",
					sha: null,
				};
			}

			const blob = await githubFetch(`/repos/${repository}/git/blobs`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					content: change.content.toString("base64"),
					encoding: "base64",
				}),
			});
			return {
				path: change.path,
				mode: "100644",
				type: "blob",
				sha: blob.sha,
			};
		}),
	);

	const nextTree = await githubFetch(`/repos/${repository}/git/trees`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			base_tree: parent.tree.sha,
			tree,
		}),
	});
	const commit = await githubFetch(`/repos/${repository}/git/commits`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			message,
			tree: nextTree.sha,
			parents: [parentSha],
		}),
	});

	await githubFetch(`/repos/${repository}/git/refs/${encodePath(refPath)}`, {
		method: "PATCH",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ sha: commit.sha, force: false }),
	});

	return { sha: commit.sha as string };
}

function postPath(slug: string) {
	return `src/content/posts/${slug}/index.md`;
}

export function validateSlug(slug: string) {
	if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
		throw new AdminRequestError(
			"Slugs may contain only lowercase unaccented letters, numbers, and hyphens.",
		);
	}
	return slug;
}

export async function readRepositoryFile(pathname: string) {
	const file = await readRepositoryFileBase64(pathname);
	return {
		content: Buffer.from(file.contentBase64, "base64").toString("utf8"),
		sha: file.sha,
	};
}

export async function readRepositoryFileBase64(pathname: string) {
	const { repository, branch } = getConfig();
	const data = await githubFetch(
		`/repos/${repository}/contents/${encodePath(pathname)}?ref=${encodeURIComponent(branch)}`,
	);
	let contentBase64 = String(data.content ?? "").replace(/\n/g, "");
	if (!contentBase64 && data.sha) {
		const blob = await githubFetch(
			`/repos/${repository}/git/blobs/${encodeURIComponent(data.sha)}`,
		);
		contentBase64 = String(blob.content ?? "").replace(/\n/g, "");
	}
	return {
		contentBase64,
		sha: data.sha as string,
	};
}

export async function readPost(slug: string) {
	validateSlug(slug);
	const file = await readRepositoryFile(postPath(slug));
	const parsed = matter(file.content);
	return {
		sha: file.sha,
		body: parsed.content.trim(),
		data: {
			...parsed.data,
			published: normaliseDate(parsed.data.published),
			updated: parsed.data.updated
				? normaliseDate(parsed.data.updated)
				: undefined,
		},
	};
}

export async function savePost(
	slug: string,
	post: Record<string, unknown> & { body?: string },
) {
	validateSlug(slug);
	let existing: Awaited<ReturnType<typeof readPost>> | null = null;
	try {
		existing = await readPost(slug);
	} catch (error) {
		if (!(error instanceof AdminRequestError) || error.status !== 404)
			throw error;
	}

	const title = String(post.title ?? "").trim();
	const published = String(post.published ?? "").trim();
	if (!title || !/^\d{4}-\d{2}-\d{2}$/.test(published)) {
		throw new AdminRequestError("The title or publication date is invalid.");
	}

	const tags = Array.isArray(post.tags)
		? post.tags.map((tag) => String(tag).trim()).filter(Boolean)
		: [];
	const oldData = existing?.data ?? {};
	const frontmatter: Record<string, unknown> = {
		...oldData,
		title,
		published: new Date(`${published}T00:00:00.000Z`),
		description: String(post.description ?? "").trim(),
		image: String(post.image ?? "").trim(),
		tags,
		category: String(post.category ?? "").trim(),
		lang: String(post.lang ?? "vi").trim() || "vi",
		draft: Boolean(post.draft),
		pinned: Boolean(post.pinned),
		pinOrder: toOrder(post.pinOrder),
		latest: Boolean(post.latest),
		latestOrder: toOrder(post.latestOrder),
	};

	delete frontmatter.updated;
	if (existing) frontmatter.updated = new Date();

	const markdown = matter.stringify(
		`${String(post.body ?? "").trim()}\n`,
		frontmatter,
	);
	const result = await writeRepositoryFile(
		postPath(slug),
		Buffer.from(markdown, "utf8").toString("base64"),
		`${existing ? "Update" : "Create"} post: ${title}`,
		existing?.sha,
	);

	return { slug, sha: result.content?.sha, created: !existing };
}

export async function savePostImage(
	slug: string,
	filename: string,
	base64: string,
) {
	validateSlug(slug);
	const safeFilename = filename
		.toLowerCase()
		.replace(/[^a-z0-9._-]+/g, "-")
		.replace(/^-+|-+$/g, "");

	if (!safeFilename || !/\.(webp|jpe?g|png|gif)$/.test(safeFilename)) {
		throw new AdminRequestError("The image name or format is invalid.");
	}

	if (base64.length > 5_000_000) {
		throw new AdminRequestError("The compressed image is still too large.");
	}

	const pathname = `src/content/posts/${slug}/${safeFilename}`;
	let sha: string | undefined;
	try {
		sha = (await readRepositoryFile(pathname)).sha;
	} catch (error) {
		if (!(error instanceof AdminRequestError) || error.status !== 404)
			throw error;
	}

	await writeRepositoryFile(
		pathname,
		base64,
		`Upload post image: ${safeFilename}`,
		sha,
	);
	return { filename: safeFilename };
}

async function writeRepositoryFile(
	pathname: string,
	base64: string,
	message: string,
	sha?: string,
) {
	const { repository, branch } = getConfig(true);
	return githubFetch(`/repos/${repository}/contents/${encodePath(pathname)}`, {
		method: "PUT",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			message,
			content: base64,
			branch,
			...(sha ? { sha } : {}),
		}),
	});
}

function normaliseDate(value: unknown) {
	const date = value instanceof Date ? value : new Date(String(value ?? ""));
	return Number.isNaN(date.getTime())
		? String(value ?? "")
		: date.toISOString().slice(0, 10);
}

function toOrder(value: unknown) {
	const number = Number(value);
	return Number.isFinite(number) ? Math.max(0, Math.floor(number)) : 0;
}
