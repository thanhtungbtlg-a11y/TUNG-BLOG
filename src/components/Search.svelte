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
};

type SearchIndex = {
	posts: SearchIndexPost[];
	tags: SearchIndexTag[];
	categories: SearchIndexCategory[];
};

let open = false;
let keyword = "";
let activeIndex = 0;
let searchInput: HTMLInputElement;
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

const tagUrl = (tag: string) => url(`/archive/?tag=${encodeURIComponent(tag)}`);

const openPalette = () => {
	open = true;
	activeIndex = 0;
	setTimeout(() => searchInput?.focus(), 0);
};

const closePalette = () => {
	open = false;
	keyword = "";
	activeIndex = 0;
};

const togglePanel = () => {
	if (open) closePalette();
	else openPalette();
};

onMount(() => {
	fetch(url("/search-index.json"))
		.then((res) => res.json())
		.then((data: SearchIndex) => {
			searchIndex = data;
		})
		.catch((error) => {
			console.error("Cannot load search index:", error);
		});

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

	window.addEventListener("keydown", onKeydown);
	return () => window.removeEventListener("keydown", onKeydown);
});

$: query = normalize(keyword.trim());

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
	query
		? commandItems
				.map((item) => {
					const haystack = normalize(`${item.title} ${item.description}`);
					const title = normalize(item.title);
					let score = 0;
					if (title === query) score += 40;
					if (title.startsWith(query)) score += 24;
					if (title.includes(query)) score += 12;
					if (haystack.includes(query)) score += 5;
					return { ...item, score: score + (item.weight ?? 0) };
				})
				.filter((item) => item.score > (item.weight ?? 0))
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
	id="search-bar"
	aria-label={i18n(I18nKey.search)}
	class="hidden lg:flex transition-all items-center h-11 mr-2 rounded-lg px-3 gap-2 bg-black/[0.04] hover:bg-black/[0.06] focus-visible:bg-black/[0.06] dark:bg-white/5 dark:hover:bg-white/10 dark:focus-visible:bg-white/10 text-black/50 dark:text-white/50"
	onclick={openPalette}
>
	<Icon icon="material-symbols:search" class="text-[1.25rem] text-black/30 dark:text-white/30" />
	<span class="text-sm min-w-36 text-left">{i18n(I18nKey.search)}</span>
</button>

<button
	onclick={togglePanel}
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
					placeholder="Tìm bài viết, thẻ, danh mục"
					aria-label="Command search"
				/>
				<button class="command-close" aria-label="Close search" onclick={closePalette}>
					<Icon icon="material-symbols:close-rounded" />
				</button>
			</div>

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
								<span class="command-title">{item.title}</span>
								<span class="command-description">{item.description}</span>
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
