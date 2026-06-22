import matter from "gray-matter";
import { AdminRequestError } from "./admin-auth";

const defaultRepository = "thanhtungbtlg-a11y/TUNG-BLOG";

function env(name: string) {
	return process.env[name] ?? "";
}

function getConfig() {
	const token = env("GITHUB_TOKEN");
	if (!token) {
		throw new AdminRequestError(
			"Thiếu GITHUB_TOKEN trong Environment Variables của Vercel.",
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
	const { token } = getConfig();
	const response = await fetch(`https://api.github.com${pathname}`, {
		...init,
		headers: {
			Accept: "application/vnd.github+json",
			Authorization: `Bearer ${token}`,
			"X-GitHub-Api-Version": "2022-11-28",
			...init.headers,
		},
	});

	if (!response.ok) {
		const details = await response.text();
		if (response.status === 404) {
			throw new AdminRequestError("Không tìm thấy tệp bài viết.", 404);
		}
		console.error("GitHub API error", response.status, details);
		throw new AdminRequestError("GitHub chưa nhận được thay đổi.", 502);
	}

	return response.json();
}

function postPath(slug: string) {
	return `src/content/posts/${slug}/index.md`;
}

export function validateSlug(slug: string) {
	if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
		throw new AdminRequestError(
			"Slug chỉ gồm chữ thường không dấu, số và dấu gạch ngang.",
		);
	}
	return slug;
}

export async function readRepositoryFile(pathname: string) {
	const { repository, branch } = getConfig();
	const data = await githubFetch(
		`/repos/${repository}/contents/${encodePath(pathname)}?ref=${encodeURIComponent(branch)}`,
	);
	const content = Buffer.from(
		data.content.replace(/\n/g, ""),
		"base64",
	).toString("utf8");
	return { content, sha: data.sha as string };
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
		throw new AdminRequestError("Tiêu đề và ngày đăng chưa hợp lệ.");
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
		throw new AdminRequestError("Tên hoặc định dạng ảnh chưa hợp lệ.");
	}

	if (base64.length > 5_000_000) {
		throw new AdminRequestError("Ảnh sau nén vẫn quá lớn.");
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
	const { repository, branch } = getConfig();
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
