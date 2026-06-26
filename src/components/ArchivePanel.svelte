<script lang="ts">
import Icon from "@iconify/svelte";
import { getPostUrlBySlug } from "../utils/url-utils";

export let sortedPosts: Post[] = [];

interface Post {
	slug: string;
	data: {
		title: string;
		description?: string;
		tags?: string[];
		category?: string;
		published: Date | string;
		pinned?: boolean;
		pinOrder?: number;
		latest?: boolean;
	};
}

interface MonthGroup {
	key: string;
	label: string;
	posts: Post[];
}

interface YearGroup {
	year: number;
	count: number;
	months: MonthGroup[];
}

const params =
	typeof window === "undefined"
		? new URLSearchParams()
		: new URLSearchParams(window.location.search);

let selectedTag = params.get("tag") ?? "all";
let selectedCategory = params.get("uncategorized")
	? "__uncategorized"
	: (params.get("category") ?? "all");
let selectedYear = params.get("year") ?? "all";

$: tagOptions = uniqueSorted(
	sortedPosts.flatMap((post) => post.data.tags ?? []).filter(Boolean),
);
$: categoryOptions = uniqueSorted(
	sortedPosts
		.map((post) => post.data.category?.trim() ?? "")
		.filter((category) => category.length > 0),
);
$: yearOptions = uniqueSorted(
	sortedPosts.map((post) => String(toDate(post.data.published).getFullYear())),
).sort((a, b) => Number(b) - Number(a));

$: filteredPosts = sortedPosts.filter((post) => {
	const postTags = post.data.tags ?? [];
	const postCategory = post.data.category?.trim() ?? "";
	const postYear = String(toDate(post.data.published).getFullYear());
	return (
		(selectedTag === "all" || postTags.includes(selectedTag)) &&
		(selectedCategory === "all" ||
			(selectedCategory === "__uncategorized"
				? !postCategory
				: postCategory === selectedCategory)) &&
		(selectedYear === "all" || postYear === selectedYear)
	);
});
$: pinnedPosts = filteredPosts
	.filter((post) => post.data.pinned)
	.sort((a, b) => (b.data.pinOrder ?? 0) - (a.data.pinOrder ?? 0));
$: timelinePosts = filteredPosts.filter((post) => !post.data.pinned);
$: groups = groupPosts(timelinePosts);

function toDate(date: Date | string) {
	return date instanceof Date ? date : new Date(date);
}

function uniqueSorted(values: string[]) {
	return [...new Set(values)].sort((a, b) => a.localeCompare(b, "vi"));
}

function formatDay(date: Date | string) {
	const normalized = toDate(date);
	return normalized.toLocaleDateString("vi-VN", {
		day: "2-digit",
		month: "2-digit",
	});
}

function formatFullDate(date: Date | string) {
	return toDate(date).toLocaleDateString("vi-VN", {
		day: "2-digit",
		month: "long",
		year: "numeric",
	});
}

function monthLabel(date: Date | string) {
	return toDate(date).toLocaleDateString("vi-VN", {
		month: "long",
	});
}

function groupPosts(posts: Post[]): YearGroup[] {
	const years = new Map<number, Map<string, MonthGroup>>();
	for (const post of posts) {
		const date = toDate(post.data.published);
		const year = date.getFullYear();
		const month = `${year}-${String(date.getMonth() + 1).padStart(2, "0")}`;
		if (!years.has(year)) years.set(year, new Map());
		const months = years.get(year);
		if (!months) continue;
		if (!months.has(month)) {
			months.set(month, {
				key: month,
				label: monthLabel(date),
				posts: [],
			});
		}
		months.get(month)?.posts.push(post);
	}

	return [...years.entries()]
		.sort((a, b) => b[0] - a[0])
		.map(([year, months]) => {
			const monthGroups = [...months.values()].sort((a, b) =>
				b.key.localeCompare(a.key),
			);
			return {
				year,
				count: monthGroups.reduce((sum, group) => sum + group.posts.length, 0),
				months: monthGroups,
			};
		});
}

function formatTags(tagList?: string[]) {
	return (tagList ?? [])
		.slice(0, 3)
		.map((tag) => `#${tag}`)
		.join(" ");
}

function updateUrl() {
	if (typeof window === "undefined") return;
	const next = new URLSearchParams();
	if (selectedTag !== "all") next.set("tag", selectedTag);
	if (selectedCategory === "__uncategorized") next.set("uncategorized", "true");
	else if (selectedCategory !== "all") next.set("category", selectedCategory);
	if (selectedYear !== "all") next.set("year", selectedYear);
	const query = next.toString();
	window.history.replaceState(
		null,
		"",
		query ? `${window.location.pathname}?${query}` : window.location.pathname,
	);
}

function clearFilters() {
	selectedTag = "all";
	selectedCategory = "all";
	selectedYear = "all";
	updateUrl();
}
</script>

<section class="archive-shell">
	<header class="archive-header">
		<div>
			<p>Kho bài</p>
			<h1>{filteredPosts.length} bài viết</h1>
		</div>
		<button type="button" class="reset-button" onclick={clearFilters}>
			<Icon icon="material-symbols:filter-alt-off-outline-rounded" />
			Xóa lọc
		</button>
	</header>

	<div class="archive-filters">
		<label>
			<span>Năm</span>
			<select bind:value={selectedYear} onchange={updateUrl}>
				<option value="all">Tất cả</option>
				{#each yearOptions as year}<option value={year}>{year}</option>{/each}
			</select>
		</label>
		<label>
			<span>Danh mục</span>
			<select bind:value={selectedCategory} onchange={updateUrl}>
				<option value="all">Tất cả</option>
				<option value="__uncategorized">Chưa phân loại</option>
				{#each categoryOptions as category}<option value={category}>{category}</option>{/each}
			</select>
		</label>
		<label>
			<span>Thẻ</span>
			<select bind:value={selectedTag} onchange={updateUrl}>
				<option value="all">Tất cả</option>
				{#each tagOptions as tag}<option value={tag}>{tag}</option>{/each}
			</select>
		</label>
	</div>

	{#if pinnedPosts.length}
		<section class="pinned-section" aria-label="Bài ghim">
			<div class="section-title">
				<Icon icon="material-symbols:push-pin-outline-rounded" />
				<span>Bài ghim</span>
			</div>
			<div class="pinned-grid">
				{#each pinnedPosts as post}
					<a class="pinned-card" href={getPostUrlBySlug(post.slug)}>
						<div>
							<strong>{post.data.title}</strong>
							<small>{formatFullDate(post.data.published)}</small>
						</div>
						<p>{post.data.description || post.data.category || "Bài viết nổi bật"}</p>
						<span>{formatTags(post.data.tags)}</span>
					</a>
				{/each}
			</div>
		</section>
	{/if}

	<section class="timeline-section">
		<div class="section-title">
			<Icon icon="material-symbols:timeline-rounded" />
			<span>Dòng thời gian</span>
		</div>

		{#if groups.length}
			{#each groups as group}
				<section class="year-group">
					<div class="year-row">
						<strong>{group.year}</strong>
						<span>{group.count} bài</span>
					</div>

					{#each group.months as month}
						<div class="month-group">
							<div class="month-label">{month.label}</div>
							<div class="month-posts">
								{#each month.posts as post}
									<a class="timeline-post" href={getPostUrlBySlug(post.slug)}>
										<span class="post-date">{formatDay(post.data.published)}</span>
										<span class="post-dot"></span>
										<span class="post-main">
											<strong>{post.data.title}</strong>
											<small>{post.data.category || "Chưa phân loại"} {formatTags(post.data.tags)}</small>
										</span>
										{#if post.data.latest}<span class="latest-badge">Mới</span>{/if}
									</a>
								{/each}
							</div>
						</div>
					{/each}
				</section>
			{/each}
		{:else}
			<div class="archive-empty">
				<Icon icon="material-symbols:inventory-2-outline-rounded" />
				<span>Không có bài viết phù hợp.</span>
			</div>
		{/if}
	</section>
</section>

<style>
	.archive-shell {
		display: grid;
		gap: 1rem;
	}

	.archive-header,
	.archive-filters,
	.section-title,
	.year-row,
	.timeline-post {
		display: flex;
		align-items: center;
	}

	.archive-header {
		justify-content: space-between;
		gap: 1rem;
		padding: 1.1rem 1.25rem;
		border: 1px solid var(--card-border);
		border-radius: 8px;
		background: var(--card-bg);
		box-shadow: var(--card-shadow);
	}

	.archive-header p,
	.archive-header h1 {
		margin: 0;
	}

	.archive-header p {
		color: var(--meta-color);
		font-size: 0.82rem;
		font-weight: 800;
		text-transform: uppercase;
	}

	.archive-header h1 {
		margin-top: 0.15rem;
		color: var(--content-color);
		font-size: 1.65rem;
	}

	.reset-button,
	.archive-filters select {
		min-height: 2.45rem;
		border: 1px solid var(--card-border);
		border-radius: 7px;
		background: var(--btn-regular-bg);
		color: var(--content-color);
		font: inherit;
		font-weight: 750;
	}

	.reset-button {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		padding: 0 0.75rem;
		cursor: pointer;
	}

	.archive-filters {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 0.65rem;
		padding: 0.85rem;
		border: 1px solid var(--card-border);
		border-radius: 8px;
		background: color-mix(in oklch, var(--card-bg), transparent 8%);
	}

	.archive-filters label {
		display: grid;
		gap: 0.35rem;
		color: var(--meta-color);
		font-size: 0.76rem;
		font-weight: 850;
	}

	.archive-filters select {
		width: 100%;
		padding: 0 0.65rem;
	}

	.pinned-section,
	.timeline-section {
		display: grid;
		gap: 0.75rem;
	}

	.section-title {
		gap: 0.45rem;
		color: var(--primary);
		font-weight: 900;
	}

	.pinned-grid {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 0.75rem;
	}

	.pinned-card {
		display: grid;
		gap: 0.5rem;
		padding: 0.95rem;
		border: 1px solid color-mix(in oklch, var(--primary), transparent 62%);
		border-radius: 8px;
		background: color-mix(in oklch, var(--primary), transparent 90%);
		box-shadow: var(--card-shadow);
		transition: transform 160ms ease, border-color 160ms ease;
	}

	.pinned-card:hover {
		transform: translateY(-2px);
		border-color: color-mix(in oklch, var(--primary), transparent 35%);
	}

	.pinned-card strong,
	.timeline-post strong {
		color: var(--content-color);
	}

	.pinned-card small,
	.pinned-card p,
	.pinned-card span,
	.timeline-post small,
	.year-row span,
	.month-label {
		color: var(--meta-color);
	}

	.pinned-card p {
		margin: 0;
		line-height: 1.55;
	}

	.year-group {
		display: grid;
		gap: 0.65rem;
		padding: 0.9rem;
		border: 1px solid var(--card-border);
		border-radius: 8px;
		background: var(--card-bg);
	}

	.year-row {
		justify-content: space-between;
		padding-bottom: 0.35rem;
		border-bottom: 1px solid var(--line-divider);
	}

	.year-row strong {
		color: var(--content-color);
		font-size: 1.35rem;
	}

	.month-group {
		display: grid;
		grid-template-columns: 7.5rem minmax(0, 1fr);
		gap: 0.75rem;
	}

	.month-label {
		padding-top: 0.55rem;
		font-size: 0.82rem;
		font-weight: 850;
		text-transform: capitalize;
	}

	.month-posts {
		display: grid;
	}

	.timeline-post {
		position: relative;
		gap: 0.65rem;
		min-height: 3rem;
		padding: 0.45rem 0.55rem;
		border-radius: 7px;
		transition: background 160ms ease, transform 160ms ease;
	}

	.timeline-post:hover {
		background: var(--btn-plain-bg-hover);
		transform: translateX(2px);
	}

	.post-date {
		width: 3rem;
		color: var(--meta-color);
		font-size: 0.78rem;
		font-weight: 750;
		text-align: right;
	}

	.post-dot {
		width: 0.5rem;
		height: 0.5rem;
		border-radius: 999px;
		background: color-mix(in oklch, var(--primary), transparent 35%);
		box-shadow: 0 0 0 4px color-mix(in oklch, var(--primary), transparent 86%);
	}

	.post-main {
		display: grid;
		min-width: 0;
		gap: 0.15rem;
	}

	.post-main strong,
	.post-main small {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.latest-badge {
		margin-left: auto;
		border-radius: 999px;
		padding: 0.15rem 0.5rem;
		background: var(--primary);
		color: white;
		font-size: 0.7rem;
		font-weight: 850;
	}

	.archive-empty {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		min-height: 10rem;
		border: 1px dashed var(--card-border);
		border-radius: 8px;
		color: var(--meta-color);
	}

	@media (max-width: 768px) {
		.archive-header {
			align-items: flex-start;
			flex-direction: column;
		}

		.archive-filters,
		.pinned-grid,
		.month-group {
			grid-template-columns: 1fr;
		}

		.month-label {
			padding-top: 0;
		}
	}
</style>
