<script lang="ts">
import Icon from "@iconify/svelte";
import { onMount } from "svelte";
import { getPostUrlBySlug } from "../utils/url-utils";

export let sortedPosts: Post[] = [];

interface Post {
	slug: string;
	data: {
		title: string;
		description?: string;
		tags?: string[];
		category?: string | null;
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

type ViewMode = "timeline" | "grid" | "list";

const params =
	typeof window === "undefined"
		? new URLSearchParams()
		: new URLSearchParams(window.location.search);

let selectedTag = params.get("tag") ?? "all";
let selectedCategory = params.get("uncategorized")
	? "__uncategorized"
	: (params.get("category") ?? "all");
let selectedYear = params.get("year") ?? "all";
let query = params.get("q") ?? "";
let viewMode: ViewMode = "timeline";

onMount(() => {
	const storedView = localStorage.getItem("archive-view");
	if (
		storedView === "timeline" ||
		storedView === "grid" ||
		storedView === "list"
	) {
		viewMode = storedView;
	}
});

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
$: normalizedQuery = normalizeSearch(query);

$: filteredPosts = sortedPosts.filter((post) => {
	const postTags = post.data.tags ?? [];
	const postCategory = post.data.category?.trim() ?? "";
	const postYear = String(toDate(post.data.published).getFullYear());
	const searchableText = normalizeSearch(
		[post.data.title, post.data.description, postCategory, ...postTags].join(
			" ",
		),
	);
	return (
		(!normalizedQuery || searchableText.includes(normalizedQuery)) &&
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
$: latestPosts = filteredPosts
	.filter((post) => !post.data.pinned && post.data.latest)
	.slice(0, 3);
$: timelinePosts = filteredPosts.filter(
	(post) => !post.data.pinned && !latestPosts.includes(post),
);
$: groups = groupPosts(timelinePosts);
$: hasActiveFilters =
	query.trim().length > 0 ||
	selectedTag !== "all" ||
	selectedCategory !== "all" ||
	selectedYear !== "all";

function toDate(date: Date | string) {
	return date instanceof Date ? date : new Date(date);
}

function uniqueSorted(values: string[]) {
	return [...new Set(values)].sort((a, b) => a.localeCompare(b, "en"));
}

function normalizeSearch(value: string) {
	return value
		.normalize("NFD")
		.replace(/\p{Diacritic}/gu, "")
		.toLocaleLowerCase("en")
		.trim();
}

function formatDay(date: Date | string) {
	const normalized = toDate(date);
	return normalized.toLocaleDateString("en-GB", {
		day: "2-digit",
		month: "2-digit",
	});
}

function formatFullDate(date: Date | string) {
	return toDate(date).toLocaleDateString("en-GB", {
		day: "2-digit",
		month: "long",
		year: "numeric",
	});
}

function monthLabel(date: Date | string) {
	return toDate(date).toLocaleDateString("en-GB", {
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
	if (query.trim()) next.set("q", query.trim());
	if (selectedTag !== "all") next.set("tag", selectedTag);
	if (selectedCategory === "__uncategorized") next.set("uncategorized", "true");
	else if (selectedCategory !== "all") next.set("category", selectedCategory);
	if (selectedYear !== "all") next.set("year", selectedYear);
	const queryString = next.toString();
	window.history.replaceState(
		null,
		"",
		queryString
			? `${window.location.pathname}?${queryString}`
			: window.location.pathname,
	);
}

function clearFilters() {
	query = "";
	selectedTag = "all";
	selectedCategory = "all";
	selectedYear = "all";
	updateUrl();
}

function setViewMode(mode: ViewMode) {
	viewMode = mode;
	localStorage.setItem("archive-view", mode);
}
</script>

<section class="archive-shell">
	<header class="archive-header">
		<div>
			<p>Archive</p>
			<h1 aria-live="polite">{filteredPosts.length} {filteredPosts.length === 1 ? "post" : "posts"}</h1>
			<span class="archive-total">from {sortedPosts.length} saved posts</span>
		</div>
		<button
			type="button"
			class="reset-button"
			disabled={!hasActiveFilters}
			onclick={clearFilters}
		>
			<Icon icon="material-symbols:filter-alt-off-outline-rounded" />
			Clear filters
		</button>
	</header>

	<div class="archive-filters">
		<label class="archive-search">
			<span>Quick search</span>
			<div>
				<Icon icon="material-symbols:search-rounded" aria-hidden="true" />
				<input
					type="search"
					placeholder="Search titles, topics, or tags"
					aria-label="Search the archive"
					bind:value={query}
					oninput={updateUrl}
				/>
			</div>
		</label>
		<label>
			<span>Year</span>
			<select bind:value={selectedYear} onchange={updateUrl}>
				<option value="all">All</option>
				{#each yearOptions as year}<option value={year}>{year}</option>{/each}
			</select>
		</label>
		<label>
			<span>Category</span>
			<select bind:value={selectedCategory} onchange={updateUrl}>
				<option value="all">All</option>
				<option value="__uncategorized">Uncategorized</option>
				{#each categoryOptions as category}<option value={category}>{category}</option>{/each}
			</select>
		</label>
		<label>
			<span>Tag</span>
			<select bind:value={selectedTag} onchange={updateUrl}>
				<option value="all">All</option>
				{#each tagOptions as tag}<option value={tag}>{tag}</option>{/each}
			</select>
		</label>
		<div class="view-switch" role="group" aria-label="View mode">
			<button
				type="button"
				class:active={viewMode === "timeline"}
				aria-label="Timeline"
				aria-pressed={viewMode === "timeline"}
				title="Timeline"
				onclick={() => setViewMode("timeline")}
			>
				<Icon icon="material-symbols:view-timeline-rounded" />
			</button>
			<button
				type="button"
				class:active={viewMode === "grid"}
				aria-label="Grid"
				aria-pressed={viewMode === "grid"}
				title="Grid"
				onclick={() => setViewMode("grid")}
			>
				<Icon icon="material-symbols:grid-view-rounded" />
			</button>
			<button
				type="button"
				class:active={viewMode === "list"}
				aria-label="List"
				aria-pressed={viewMode === "list"}
				title="List"
				onclick={() => setViewMode("list")}
			>
				<Icon icon="material-symbols:view-list-rounded" />
			</button>
		</div>
	</div>

	{#if pinnedPosts.length}
		<section class="pinned-section" aria-label="Pinned posts">
			<div class="section-title">
				<Icon icon="material-symbols:push-pin-outline-rounded" />
				<span>Pinned posts</span>
			</div>
			<div class="pinned-grid">
				{#each pinnedPosts as post}
					<a class="pinned-card" href={getPostUrlBySlug(post.slug)}>
						<div>
							<strong>{post.data.title}</strong>
							<small>{formatFullDate(post.data.published)}</small>
						</div>
						<p>{post.data.description || post.data.category || "Featured post"}</p>
						<span>{formatTags(post.data.tags)}</span>
					</a>
				{/each}
			</div>
		</section>
	{/if}

	{#if latestPosts.length}
		<section class="latest-section" aria-label="Recently updated">
			<div class="section-title">
				<Icon icon="material-symbols:history-rounded" />
				<span>Recently updated</span>
			</div>
			<div class="latest-grid">
				{#each latestPosts as post}
					<a class="latest-card" href={getPostUrlBySlug(post.slug)}>
						<time>{formatFullDate(post.data.published)}</time>
						<strong>{post.data.title}</strong>
						<p>{post.data.description || post.data.category || "New post"}</p>
					</a>
				{/each}
			</div>
		</section>
	{/if}

	<section class="timeline-section">
		<div class="section-title">
			<Icon icon={viewMode === "timeline" ? "material-symbols:view-timeline-rounded" : viewMode === "grid" ? "material-symbols:grid-view-rounded" : "material-symbols:view-list-rounded"} />
			<span>{viewMode === "timeline" ? "Timeline" : "Posts"}</span>
		</div>

		{#if viewMode === "timeline"}
		{#if groups.length}
			{#each groups as group}
				<section class="year-group">
					<div class="year-row">
						<strong>{group.year}</strong>
						<span>{group.count} {group.count === 1 ? "post" : "posts"}</span>
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
											<small>{post.data.category || "Uncategorized"} {formatTags(post.data.tags)}</small>
										</span>
										{#if post.data.latest}<span class="latest-badge">New</span>{/if}
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
				<span>No matching posts found.</span>
			</div>
		{/if}
		{:else if viewMode === "grid"}
			{#if timelinePosts.length}
				<div class="post-grid">
					{#each timelinePosts as post}
						<a class="archive-card" href={getPostUrlBySlug(post.slug)}>
							<div class="archive-card-meta">
								<time>{formatFullDate(post.data.published)}</time>
								{#if post.data.latest}<span class="latest-badge">New</span>{/if}
							</div>
							<strong>{post.data.title}</strong>
							<p>{post.data.description || post.data.category || "Uncategorized"}</p>
							<small>{post.data.category || "Uncategorized"} {formatTags(post.data.tags)}</small>
						</a>
					{/each}
				</div>
			{:else}
				<div class="archive-empty">
					<Icon icon="material-symbols:inventory-2-outline-rounded" />
					<span>No matching posts found.</span>
				</div>
			{/if}
		{:else}
			{#if timelinePosts.length}
				<div class="compact-list">
					{#each timelinePosts as post}
						<a class="compact-post" href={getPostUrlBySlug(post.slug)}>
							<time>{formatDay(post.data.published)}</time>
							<span class="compact-main">
								<strong>{post.data.title}</strong>
								<small>{post.data.category || "Uncategorized"} {formatTags(post.data.tags)}</small>
							</span>
							{#if post.data.latest}<span class="latest-badge">New</span>{/if}
							<span class="compact-arrow" aria-hidden="true">
								<Icon icon="material-symbols:chevron-right-rounded" />
							</span>
						</a>
					{/each}
				</div>
			{:else}
				<div class="archive-empty">
					<Icon icon="material-symbols:inventory-2-outline-rounded" />
					<span>No matching posts found.</span>
				</div>
			{/if}
		{/if}
	</section>
</section>

<style>
	.archive-shell {
		display: grid;
		gap: 1.35rem;
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
		padding: 0.45rem 0.25rem 1.25rem;
		border-bottom: 1px solid var(--line-divider);
	}

	.archive-header p,
	.archive-header h1,
	.archive-total {
		margin: 0;
	}

	.archive-header p {
		color: var(--btn-content);
		font-family: var(--public-font-mono);
		font-size: var(--public-font-meta);
		font-weight: 700;
		letter-spacing: 0;
		text-transform: uppercase;
	}

	.archive-header h1 {
		margin-top: 0.15rem;
		color: var(--content-color);
		font-family: var(--public-font-serif);
		font-size: var(--public-font-title);
		font-weight: 620;
		line-height: 1.08;
	}

	.archive-total {
		display: block;
		margin-top: 0.28rem;
		color: var(--meta-color);
		font-family: var(--public-font-mono);
		font-size: var(--public-font-meta);
		font-weight: 650;
	}

	.reset-button,
	.archive-filters select,
	.archive-search > div {
		min-height: 2.45rem;
		border: 1px solid var(--card-border);
		border-radius: var(--public-radius-control);
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

	.reset-button:disabled {
		cursor: default;
		opacity: 0.52;
	}

	.archive-filters {
		display: grid;
		grid-template-columns: minmax(14rem, 1.4fr) repeat(3, minmax(7.5rem, 1fr)) auto;
		gap: 0.65rem;
		padding: 0.85rem;
		border: 1px solid var(--card-border);
		border-radius: var(--public-radius-surface);
		background: var(--card-bg-solid);
		box-shadow: var(--card-shadow);
	}

	.archive-filters label {
		display: grid;
		gap: 0.35rem;
		color: var(--meta-color);
		font-family: var(--public-font-mono);
		font-size: var(--public-font-meta);
		font-weight: 700;
	}

	.archive-search > div {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0 0.7rem;
	}

	.archive-search :global(svg) {
		flex: 0 0 auto;
		color: var(--meta-color);
		font-size: 1.15rem;
	}

	.archive-search input {
		width: 100%;
		min-width: 0;
		border: 0;
		outline: 0;
		background: transparent;
		color: var(--content-color);
		font: inherit;
		font-weight: 650;
	}

	.archive-search input::placeholder {
		color: var(--meta-color);
		opacity: 0.8;
	}

	.archive-filters select {
		width: 100%;
		padding: 0 0.65rem;
	}

	.view-switch {
		align-self: end;
		display: grid;
		grid-template-columns: repeat(3, 2.45rem);
		padding: 0.18rem;
		border: 1px solid var(--card-border);
		border-radius: var(--public-radius-control);
		background: var(--btn-regular-bg);
	}

	.view-switch button {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 2.1rem;
		height: 2.1rem;
		border: 0;
		border-radius: var(--public-radius-control);
		background: transparent;
		color: var(--meta-color);
		cursor: pointer;
		transition: background 160ms ease, color 160ms ease, transform 160ms ease;
	}

	.view-switch button:hover {
		color: var(--content-color);
	}

	.view-switch button.active {
		background: var(--card-bg-solid);
		color: var(--primary);
		box-shadow: 0 3px 12px color-mix(in oklch, var(--page-bg), black 12%);
	}

	.pinned-section,
	.latest-section,
	.timeline-section {
		display: grid;
		gap: 0.85rem;
	}

	.section-title {
		gap: 0.45rem;
		color: var(--btn-content);
		font-family: var(--public-font-mono);
		font-size: var(--public-font-meta);
		font-weight: 700;
		text-transform: uppercase;
	}

	.pinned-grid {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 0.75rem;
	}

	.latest-grid {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 0.75rem;
	}

	.latest-card {
		display: grid;
		align-content: start;
		gap: 0.45rem;
		min-height: 8rem;
		padding: 0.95rem;
		border: 1px solid var(--card-border);
		border-radius: var(--public-radius-surface);
		background: var(--card-bg);
		box-shadow: var(--card-shadow);
		transition: transform 180ms ease, border-color 180ms ease, background-color 180ms ease;
	}

	.latest-card:hover {
		transform: translateY(-2px);
		border-color: color-mix(in oklch, var(--primary), var(--card-border) 45%);
		background: color-mix(in oklch, var(--card-bg), var(--primary) 4%);
	}

	.latest-card time,
	.latest-card p {
		color: var(--meta-color);
		font-size: var(--public-font-small);
	}

	.latest-card time {
		font-family: var(--public-font-mono);
		font-size: var(--public-font-meta);
	}

	.latest-card strong {
		color: var(--content-color);
		line-height: 1.45;
	}

	.latest-card p {
		display: -webkit-box;
		overflow: hidden;
		margin: 0;
		line-height: 1.5;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 2;
	}

	.pinned-card {
		display: grid;
		gap: 0.5rem;
		padding: 0.95rem;
		border: 1px solid color-mix(in oklch, var(--primary), transparent 62%);
		border-radius: var(--public-radius-surface);
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
		padding: 1rem;
		border: 1px solid var(--card-border);
		border-radius: var(--public-radius-surface);
		background: var(--card-bg);
		content-visibility: auto;
		contain-intrinsic-size: auto 28rem;
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
		font-family: var(--public-font-mono);
		font-size: var(--public-font-meta);
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
		border-radius: var(--public-radius-control);
		transition: background 160ms ease, transform 160ms ease;
	}

	.timeline-post:hover {
		background: var(--btn-plain-bg-hover);
		transform: translateX(2px);
	}

	.post-grid {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 0.75rem;
	}

	.archive-card {
		display: grid;
		align-content: start;
		gap: 0.55rem;
		min-height: 10.5rem;
		padding: 1rem;
		border: 1px solid var(--card-border);
		border-radius: var(--public-radius-surface);
		background: var(--card-bg);
		box-shadow: var(--card-shadow);
		transition: transform 180ms ease, border-color 180ms ease, box-shadow 180ms ease;
	}

	.archive-card:hover {
		transform: translateY(-3px);
		border-color: color-mix(in oklch, var(--primary), var(--card-border) 45%);
		box-shadow: var(--card-shadow-hover);
	}

	.archive-card-meta {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.5rem;
		color: var(--meta-color);
		font-family: var(--public-font-mono);
		font-size: var(--public-font-meta);
		font-weight: 750;
	}

	.archive-card > strong {
		color: var(--content-color);
		font-family: var(--public-font-serif);
		font-size: var(--public-font-content-title);
		font-weight: 620;
		line-height: 1.4;
	}

	.archive-card p {
		display: -webkit-box;
		overflow: hidden;
		margin: 0;
		color: var(--meta-color);
		font-size: var(--public-font-small);
		line-height: 1.55;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 2;
	}

	.archive-card small {
		margin-top: auto;
		color: var(--meta-color);
	}

	.compact-list {
		display: grid;
		border: 1px solid var(--card-border);
		border-radius: var(--public-radius-surface);
		background: var(--card-bg);
		box-shadow: var(--card-shadow);
		overflow: hidden;
	}

	.compact-post {
		display: grid;
		grid-template-columns: 4.25rem minmax(0, 1fr) auto auto;
		align-items: center;
		gap: 0.75rem;
		min-height: 4rem;
		padding: 0.6rem 0.85rem;
		border-bottom: 1px solid var(--line-divider);
		transition: background 160ms ease;
	}

	.compact-post:last-child {
		border-bottom: 0;
	}

	.compact-post:hover {
		background: var(--btn-plain-bg-hover);
	}

	.compact-post time,
	.compact-main small {
		color: var(--meta-color);
		font-family: var(--public-font-mono);
		font-size: var(--public-font-meta);
	}

	.compact-post time {
		font-weight: 750;
	}

	.compact-main {
		display: grid;
		min-width: 0;
		gap: 0.15rem;
	}

	.compact-main strong,
	.compact-main small {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.compact-main strong {
		color: var(--content-color);
	}

	.compact-arrow {
		color: var(--meta-color);
		font-size: 1.3rem;
		transition: transform 160ms ease, color 160ms ease;
	}

	.compact-post:hover .compact-arrow {
		transform: translateX(2px);
		color: var(--primary);
	}

	.post-date {
		width: 3rem;
		color: var(--meta-color);
		font-family: var(--public-font-mono);
		font-size: var(--public-font-meta);
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
		font-family: var(--public-font-mono);
		font-size: var(--public-font-meta);
		font-weight: 850;
	}

	.archive-empty {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		min-height: 10rem;
		border: 1px dashed var(--card-border);
		border-radius: var(--public-radius-surface);
		color: var(--meta-color);
	}

	@media (max-width: 768px) {
		.archive-header {
			align-items: flex-end;
		}

		.archive-filters,
		.pinned-grid,
		.latest-grid,
		.post-grid,
		.month-group {
			grid-template-columns: 1fr;
		}

		.view-switch {
			grid-template-columns: repeat(3, 1fr);
		}

		.view-switch button {
			width: 100%;
			height: 2.5rem;
		}

		.archive-filters select,
		.reset-button {
			min-height: 2.75rem;
		}

		.compact-post {
			grid-template-columns: 3.5rem minmax(0, 1fr) auto;
		}

		.compact-post .latest-badge {
			display: none;
		}

		.month-label {
			padding-top: 0;
		}

		.reset-button {
			flex: 0 0 auto;
		}
	}

	@media (max-width: 480px) {
		.archive-header {
			align-items: flex-start;
			flex-direction: column;
		}

		.reset-button {
			width: 100%;
			justify-content: center;
		}
	}

	@media (min-width: 769px) and (max-width: 1100px) {
		.archive-filters {
			grid-template-columns: repeat(2, minmax(0, 1fr)) auto;
		}

		.archive-search {
			grid-column: span 2;
		}
	}

	@media (min-width: 769px) {
		.archive-filters {
			position: sticky;
			top: 4.75rem;
			z-index: 20;
		}
	}
</style>
