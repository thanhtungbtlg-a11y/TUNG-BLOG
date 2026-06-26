<script lang="ts">
import I18nKey from "@i18n/i18nKey";
import { i18n } from "@i18n/translation";
import Icon from "@iconify/svelte";
import { url } from "@utils/url-utils.ts";
import { onMount } from "svelte";

type SearchIndexPost = {
	title: string;
	description: string;
	url: string;
	tags: string[];
	category: string;
	published: string;
	content: string;
};

type SearchIndexTag = {
	name: string;
	count: number;
};

type SearchIndexCategory = {
	name: string;
	count: number;
	url: string;
};

type CommandItem = {
	type: "page" | "post" | "tag" | "category";
	title: string;
	description: string;
	url: string;
	icon: string;
	weight?: number;
	keywords?: string;
	tags?: string[];
	category?: string;
	published?: string;
	content?: string;
	snippet?: string;
	badges?: string[];
};

type ParsedQuery = {
	text: string;
	normalizedText: string;
	tags: string[];
	categories: string[];
	years: string[];
	hasFilters: boolean;
	badges: string[];
};

type HighlightPart = {
	text: string;
	match: boolean;
};

type SearchIndex = {
	posts: SearchIndexPost[];
	tags: SearchIndexTag[];
	categories: SearchIndexCategory[];
};

declare global {
	interface Window {
		__pendingBlogSearchOpen?: boolean;
	}
}

const SEARCH_OPEN_EVENT = "blog:open-search";

let open = false;
let keyword = "";
let activeIndex = 0;
let searchInput: HTMLInputElement;
let searchLoaded = false;
let searchLoading = false;
let searchIndex: SearchIndex = {
	posts: [],
	tags: [],
	categories: [],
};

const quickActions: CommandItem[] = [
	{
		type: "page",
		title: "Home",
		description: "Trang chính",
		url: url("/"),
		icon: "material-symbols:home-outline-rounded",
		weight: 10,
	},
	{
		type: "page",
		title: "Archive",
		description: "Tất cả bài viết",
		url: url("/archive/"),
		icon: "material-symbols:inventory-2-outline-rounded",
		weight: 9,
	},
	{
		type: "page",
		title: "Kho ảnh",
		description: "Ảnh và những khoảnh khắc",
		url: url("/gallery/"),
		icon: "material-symbols:photo-library-outline-rounded",
		weight: 9,
	},
	{
		type: "page",
		title: "Hồ sơ",
		description: "Kinh nghiệm và định hướng nghề nghiệp",
		url: url("/portfolio/"),
		icon: "material-symbols:person-outline-rounded",
		weight: 9,
	},
	{
		type: "page",
		title: "About",
		description: "Thông tin cá nhân",
		url: url("/about/"),
		icon: "fa6-regular:address-card",
		weight: 8,
	},
];

const normalize = (value: string) =>
	value
		.toLowerCase()
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "");

function parseSearchQuery(value: string): ParsedQuery {
	const filters: ParsedQuery = {
		text: value.trim(),
		normalizedText: "",
		tags: [],
		categories: [],
		years: [],
		hasFilters: false,
		badges: [],
	};
	const cleaned = value.replace(
		/(tag|category|year):("[^"]+"|'[^']+'|\S+)/gi,
		(_match, key: string, rawValue: string) => {
			const item = rawValue.replace(/^['"]|['"]$/g, "").trim();
			if (!item) return "";
			filters.hasFilters = true;
			if (key.toLowerCase() === "tag") {
				filters.tags.push(item);
				filters.badges.push(`#${item}`);
			}
			if (key.toLowerCase() === "category") {
				filters.categories.push(item);
				filters.badges.push(`category:${item}`);
			}
			if (key.toLowerCase() === "year") {
				filters.years.push(item);
				filters.badges.push(`year:${item}`);
			}
			return " ";
		},
	);
	filters.text = cleaned.replace(/\s+/g, " ").trim();
	filters.normalizedText = normalize(filters.text);
	return filters;
}

function postYear(value?: string) {
	if (!value) return "";
	const date = new Date(value);
	return Number.isNaN(date.getTime()) ? "" : String(date.getFullYear());
}

function matchesPostFilters(item: CommandItem, filters: ParsedQuery) {
	if (!filters.hasFilters) return true;
	if (item.type !== "post") return false;
	const itemTags = (item.tags ?? []).map(normalize);
	const itemCategory = normalize(item.category ?? "");
	const itemYear = postYear(item.published);

	return (
		filters.tags.every((tag) =>
			itemTags.some((itemTag) => itemTag.includes(normalize(tag))),
		) &&
		filters.categories.every((category) =>
			itemCategory.includes(normalize(category)),
		) &&
		filters.years.every((year) => itemYear === year)
	);
}

function createSnippet(content: string | undefined, term: string) {
	if (!content) return "";
	if (!term || !content) return "";
	const normalizedContent = normalize(content);
	const normalizedTerm = normalize(term);
	const index = normalizedContent.indexOf(normalizedTerm);
	if (index < 0) return "";
	const start = Math.max(0, index - 58);
	const end = Math.min(content.length, index + normalizedTerm.length + 92);
	const prefix = start > 0 ? "..." : "";
	const suffix = end < content.length ? "..." : "";
	return `${prefix}${content.slice(start, end).trim()}${suffix}`;
}

function highlightParts(value: string, term: string): HighlightPart[] {
	if (!term.trim()) return [{ text: value, match: false }];
	const normalizedTerm = normalize(term.trim());
	const normalizedValue = normalize(value);
	const index = normalizedValue.indexOf(normalizedTerm);
	if (index < 0) return [{ text: value, match: false }];

	const map: number[] = [];
	let normalizedCursor = "";
	for (let sourceIndex = 0; sourceIndex < value.length; sourceIndex++) {
		const normalizedCharacter = normalize(value[sourceIndex]);
		for (let offset = 0; offset < normalizedCharacter.length; offset++) {
			map[normalizedCursor.length + offset] = sourceIndex;
		}
		normalizedCursor += normalizedCharacter;
	}

	const start = map[index] ?? index;
	const end =
		(map[index + normalizedTerm.length] ?? start + normalizedTerm.length) ||
		value.length;

	return [
		{ text: value.slice(0, start), match: false },
		{ text: value.slice(start, end), match: true },
		{ text: value.slice(end), match: false },
	].filter((part) => part.text.length > 0);
}

const tagUrl = (tag: string) => url(`/archive/?tag=${encodeURIComponent(tag)}`);

const openPalette = () => {
	open = true;
	activeIndex = 0;
	void loadSearchIndex();
	setTimeout(() => searchInput?.focus(), 0);
};

const closePalette = () => {
	open = false;
	keyword = "";
	activeIndex = 0;
};

onMount(() => {
	const onOpenSearch = () => {
		window.__pendingBlogSearchOpen = false;
		openPalette();
	};
	const onKeydown = (event: KeyboardEvent) => {
		const isCommandK =
			(event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k";
		if (isCommandK) {
			event.preventDefault();
			openPalette();
			return;
		}

		if (!open) return;

		if (event.key === "Escape") {
			event.preventDefault();
			closePalette();
		}
	};

	window.addEventListener("keydown", onKeydown, true);
	window.addEventListener(SEARCH_OPEN_EVENT, onOpenSearch);
	if (window.__pendingBlogSearchOpen) queueMicrotask(onOpenSearch);

	return () => {
		window.removeEventListener("keydown", onKeydown, true);
		window.removeEventListener(SEARCH_OPEN_EVENT, onOpenSearch);
	};
});

async function loadSearchIndex() {
	if (searchLoaded || searchLoading) return;

	searchLoading = true;
	try {
		const res = await fetch(url("/search-index.json"));
		searchIndex = await res.json();
		searchLoaded = true;
	} catch (error) {
		console.error("Cannot load search index:", error);
	} finally {
		searchLoading = false;
	}
}

$: parsedQuery = parseSearchQuery(keyword);
$: query = parsedQuery.normalizedText;

$: commandItems = [
	...quickActions,
	...searchIndex.posts.map((post) => ({
		type: "post" as const,
		title: post.title,
		description:
			post.description ||
			[post.category, ...post.tags].filter(Boolean).join(" / ") ||
			"Bài viết",
		url: post.url,
		icon: "material-symbols:article-outline-rounded",
		weight: 7,
		tags: post.tags,
		category: post.category,
		published: post.published,
		content: post.content,
		keywords: [
			post.title,
			post.description,
			post.category,
			...post.tags,
			post.content,
		]
			.filter(Boolean)
			.join(" "),
	})),
	...searchIndex.tags.map((tag) => ({
		type: "tag" as const,
		title: `#${tag.name}`,
		description: `${tag.count} bài viết`,
		url: tagUrl(tag.name),
		icon: "material-symbols:tag-rounded",
		weight: 5,
	})),
	...searchIndex.categories.map((category) => ({
		type: "category" as const,
		title: category.name,
		description: `${category.count} bài viết`,
		url: category.url,
		icon: "material-symbols:folder-outline-rounded",
		weight: 6,
	})),
];

$: filteredItems = (
	query || parsedQuery.hasFilters
		? commandItems
				.map((item) => {
					if (!matchesPostFilters(item, parsedQuery)) {
						return { ...item, score: -1 };
					}
					const haystack = normalize(
						`${item.title} ${item.description} ${item.keywords ?? ""}`,
					);
					const title = normalize(item.title);
					const snippet =
						item.type === "post"
							? createSnippet(item.content, parsedQuery.text)
							: "";
					let score = 0;
					if (!query && parsedQuery.hasFilters && item.type === "post")
						score += 8;
					if (query) {
						if (title === query) score += 40;
						if (title.startsWith(query)) score += 24;
						if (title.includes(query)) score += 12;
						if (haystack.includes(query)) score += 5;
						if (snippet) score += 8;
					}
					return {
						...item,
						snippet,
						badges:
							item.type === "post"
								? [postYear(item.published), item.category ?? ""].filter(
										Boolean,
									)
								: [],
						score: score + (item.weight ?? 0),
					};
				})
				.filter(
					(item) =>
						item.score > (item.weight ?? 0) || (!query && item.score > 0),
				)
				.sort((a, b) => b.score - a.score)
		: commandItems
				.filter((item) => item.type === "page" || item.type === "post")
				.slice(0, 9)
).slice(0, 12);

$: activeIndex = Math.min(activeIndex, Math.max(filteredItems.length - 1, 0));

function selectItem(item: CommandItem) {
	window.location.href = item.url;
	closePalette();
}

function handleInputKeydown(event: KeyboardEvent) {
	if (event.key === "ArrowDown") {
		event.preventDefault();
		activeIndex = Math.min(activeIndex + 1, filteredItems.length - 1);
	}
	if (event.key === "ArrowUp") {
		event.preventDefault();
		activeIndex = Math.max(activeIndex - 1, 0);
	}
	if (event.key === "Enter" && filteredItems[activeIndex]) {
		event.preventDefault();
		selectItem(filteredItems[activeIndex]);
	}
}
</script>

<button
	type="button"
	id="search-bar"
	aria-label={i18n(I18nKey.search)}
	class="hidden lg:flex transition-all items-center h-11 mr-2 rounded-lg px-3 gap-2 bg-black/[0.04] hover:bg-black/[0.06] focus-visible:bg-black/[0.06] dark:bg-white/5 dark:hover:bg-white/10 dark:focus-visible:bg-white/10 text-black/50 dark:text-white/50"
>
	<Icon icon="material-symbols:search" class="text-[1.25rem] text-black/30 dark:text-white/30" />
	<span class="text-sm min-w-36 text-left">{i18n(I18nKey.search)}</span>
</button>

<button
	type="button"
	aria-label="Search Panel"
	id="search-switch"
	class="btn-plain scale-animation lg:!hidden rounded-lg w-11 h-11 active:scale-90"
>
	<Icon icon="material-symbols:search" class="text-[1.25rem]" />
</button>

{#if open}
	<div id="search-panel" class="command-shell" role="dialog" aria-modal="true">
		<button class="command-backdrop" aria-label="Close search" onclick={closePalette}></button>
		<div class="command-panel">
			<div class="command-input-row">
				<Icon icon="material-symbols:search" class="command-search-icon" />
				<input
					bind:this={searchInput}
					bind:value={keyword}
					onkeydown={handleInputKeydown}
					placeholder="Tìm nội dung, hoặc dùng tag: category: year:"
					aria-label="Command search"
				/>
				<button class="command-close" aria-label="Close search" onclick={closePalette}>
					<Icon icon="material-symbols:close-rounded" />
				</button>
			</div>
			{#if parsedQuery.badges.length}
				<div class="command-filter-row">
					{#each parsedQuery.badges as badge}
						<span>{badge}</span>
					{/each}
				</div>
			{/if}

			<div class="command-results">
				{#if filteredItems.length}
					{#each filteredItems as item, index}
						<button
							class="command-item"
							class:active={index === activeIndex}
							onclick={() => selectItem(item)}
							onmouseenter={() => (activeIndex = index)}
						>
							<span class="command-icon">
								<Icon icon={item.icon} />
							</span>
							<span class="command-copy">
								<span class="command-title">
									{#each highlightParts(item.title, parsedQuery.text) as part}
										<span class:command-match={part.match}>{part.text}</span>
									{/each}
								</span>
								<span class="command-description">
									{#each highlightParts(item.snippet || item.description, parsedQuery.text) as part}
										<span class:command-match={part.match}>{part.text}</span>
									{/each}
								</span>
								{#if item.badges?.length}
									<span class="command-badges">
										{#each item.badges as badge}
											<span>{badge}</span>
										{/each}
									</span>
								{/if}
							</span>
							<Icon icon="material-symbols:arrow-forward-rounded" class="command-arrow" />
						</button>
					{/each}
				{:else}
					<div class="command-empty">
						<Icon icon="material-symbols:search-off-rounded" />
						<span>Không tìm thấy kết quả</span>
					</div>
				{/if}
			</div>
		</div>
	</div>
{/if}

<style>
	input:focus {
		outline: 0;
	}

	.command-shell {
		position: fixed;
		inset: 0;
		z-index: 10000;
		display: flex;
		align-items: flex-start;
		justify-content: center;
		padding: 12vh 1rem 1rem;
	}

	.command-backdrop {
		position: absolute;
		inset: 0;
		border: none;
		background: rgba(5, 10, 18, 0.48);
		backdrop-filter: blur(8px);
		cursor: default;
	}

	.command-panel {
		position: relative;
		width: min(42rem, 100%);
		overflow: hidden;
		border: 1px solid var(--card-border);
		border-radius: 1.25rem;
		background: var(--float-panel-bg);
		box-shadow: var(--card-shadow-hover);
		backdrop-filter: blur(22px) saturate(1.12);
		animation: command-in 180ms ease-out;
	}

	.command-input-row {
		display: grid;
		grid-template-columns: 2rem 1fr 2.5rem;
		align-items: center;
		gap: 0.5rem;
		padding: 0.875rem;
		border-bottom: 1px solid var(--card-border);
	}

	.command-filter-row {
		display: flex;
		flex-wrap: wrap;
		gap: 0.35rem;
		padding: 0.55rem 0.875rem;
		border-bottom: 1px solid var(--card-border);
	}

	.command-filter-row span,
	.command-badges span {
		display: inline-flex;
		align-items: center;
		min-height: 1.35rem;
		padding: 0 0.45rem;
		border: 1px solid color-mix(in oklch, var(--primary), transparent 65%);
		border-radius: 999px;
		background: color-mix(in oklch, var(--primary), transparent 88%);
		color: var(--primary);
		font-size: 0.7rem;
		font-weight: 800;
	}

	.command-search-icon {
		margin: auto;
		color: var(--primary);
		font-size: 1.35rem;
	}

	.command-input-row input {
		height: 2.75rem;
		min-width: 0;
		border: none;
		background: transparent;
		color: rgb(0 0 0 / 0.82);
		font: inherit;
		font-size: 1rem;
	}

	:global(.dark) .command-input-row input {
		color: rgb(255 255 255 / 0.88);
	}

	.command-close {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 2.5rem;
		height: 2.5rem;
		border: none;
		border-radius: 0.75rem;
		background: var(--btn-plain-bg-hover);
		color: rgb(0 0 0 / 0.5);
		cursor: pointer;
	}

	:global(.dark) .command-close {
		color: rgb(255 255 255 / 0.64);
	}

	.command-results {
		max-height: min(30rem, 58vh);
		overflow-y: auto;
		padding: 0.5rem;
	}

	.command-item {
		display: grid;
		grid-template-columns: 2.5rem minmax(0, 1fr) 1.5rem;
		align-items: center;
		gap: 0.75rem;
		width: 100%;
		padding: 0.7rem;
		border: 1px solid transparent;
		border-radius: 0.95rem;
		background: transparent;
		color: inherit;
		text-align: left;
		cursor: pointer;
		transition: background 160ms ease, border-color 160ms ease, transform 160ms ease;
	}

	.command-item:hover,
	.command-item.active {
		background: var(--btn-plain-bg-hover);
		border-color: color-mix(in oklch, var(--primary), transparent 74%);
		transform: translateY(-1px);
	}

	.command-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 2.5rem;
		height: 2.5rem;
		border-radius: 0.85rem;
		background: var(--btn-regular-bg);
		color: var(--btn-content);
		font-size: 1.25rem;
	}

	.command-copy {
		min-width: 0;
		display: flex;
		flex-direction: column;
		gap: 0.15rem;
	}

	.command-title,
	.command-description {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.command-title {
		font-weight: 800;
		color: rgb(0 0 0 / 0.84);
	}

	.command-description {
		font-size: 0.78rem;
		color: rgb(0 0 0 / 0.48);
	}

	:global(.dark) .command-title {
		color: rgb(255 255 255 / 0.9);
	}

	:global(.dark) .command-description {
		color: rgb(255 255 255 / 0.48);
	}

	.command-match {
		border-radius: 0.25rem;
		background: color-mix(in oklch, var(--primary), transparent 78%);
		color: var(--primary);
	}

	.command-badges {
		display: flex;
		flex-wrap: wrap;
		gap: 0.25rem;
		margin-top: 0.15rem;
	}

	.command-arrow {
		color: var(--primary);
		opacity: 0;
		transform: translateX(-0.25rem);
		transition: opacity 160ms ease, transform 160ms ease;
	}

	.command-item:hover .command-arrow,
	.command-item.active .command-arrow {
		opacity: 1;
		transform: translateX(0);
	}

	.command-empty {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		min-height: 9rem;
		color: rgb(0 0 0 / 0.45);
	}

	:global(.dark) .command-empty {
		color: rgb(255 255 255 / 0.45);
	}

	@keyframes command-in {
		from {
			opacity: 0;
			transform: translateY(0.75rem) scale(0.98);
		}
		to {
			opacity: 1;
			transform: translateY(0) scale(1);
		}
	}

	@media (max-width: 768px) {
		.command-shell {
			padding-top: 5rem;
		}
	}
</style>
