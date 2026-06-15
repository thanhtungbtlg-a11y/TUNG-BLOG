<script lang="ts">
import Icon from "@iconify/svelte";
import { onDestroy, onMount } from "svelte";

type SavedPost = {
	slug: string;
	title: string;
	url: string;
	published: string;
	savedAt: string;
};

let { slug, title, url, published } = $props<{
	slug: string;
	title: string;
	url: string;
	published: string;
}>();

const BOOKMARKS_KEY = "blog-read-later-posts";
const READING_MODE_KEY = "blog-reading-mode";
const MAX_BOOKMARKS = 60;

let saved = $state(false);
let readingMode = $state(false);

onMount(() => {
	saved = readBookmarks().some((post) => post.slug === slug);
	readingMode = localStorage.getItem(READING_MODE_KEY) === "true";
	applyReadingMode();
});

onDestroy(() => {
	if (typeof document === "undefined") return;
	document.documentElement.classList.remove("reading-mode");
});

function toggleBookmark() {
	const bookmarks = readBookmarks();

	if (saved) {
		writeBookmarks(bookmarks.filter((post) => post.slug !== slug));
		saved = false;
		return;
	}

	const nextPost: SavedPost = {
		slug,
		title,
		url,
		published,
		savedAt: new Date().toISOString(),
	};

	writeBookmarks(
		[nextPost, ...bookmarks.filter((post) => post.slug !== slug)].slice(
			0,
			MAX_BOOKMARKS,
		),
	);
	saved = true;
}

function toggleReadingMode() {
	readingMode = !readingMode;
	applyReadingMode();
}

function applyReadingMode() {
	document.documentElement.classList.toggle("reading-mode", readingMode);
	localStorage.setItem(READING_MODE_KEY, String(readingMode));
}

function readBookmarks(): SavedPost[] {
	try {
		const value = JSON.parse(localStorage.getItem(BOOKMARKS_KEY) || "[]");
		if (!Array.isArray(value)) return [];

		return value.filter(
			(post): post is SavedPost =>
				typeof post?.slug === "string" &&
				typeof post?.title === "string" &&
				typeof post?.url === "string",
		);
	} catch {
		return [];
	}
}

function writeBookmarks(posts: SavedPost[]) {
	localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(posts));
}
</script>

<div class="post-tools onload-animation" aria-label="Công cụ đọc bài viết">
	<button
		type="button"
		class:active={saved}
		aria-pressed={saved}
		title={saved ? "Bỏ khỏi đọc sau" : "Lưu để đọc sau"}
		onclick={toggleBookmark}
	>
		<Icon icon={saved ? "material-symbols:bookmark-rounded" : "material-symbols:bookmark-outline-rounded"} />
		<span>{saved ? "Đã lưu" : "Đọc sau"}</span>
	</button>

	<button
		type="button"
		class:active={readingMode}
		aria-pressed={readingMode}
		title={readingMode ? "Tắt chế độ đọc" : "Bật chế độ đọc"}
		onclick={toggleReadingMode}
	>
		<Icon icon={readingMode ? "material-symbols:chrome-reader-mode-rounded" : "material-symbols:chrome-reader-mode-outline-rounded"} />
		<span>{readingMode ? "Đang đọc" : "Reading mode"}</span>
	</button>
</div>

<style>
	.post-tools {
		display: flex;
		flex-wrap: wrap;
		gap: 0.55rem;
		margin-bottom: 1.25rem;
	}

	button {
		display: inline-flex;
		align-items: center;
		gap: 0.45rem;
		min-height: 2.45rem;
		border: 1px solid var(--card-border);
		border-radius: 999px;
		background: var(--btn-regular-bg);
		color: var(--btn-content);
		padding: 0 0.85rem;
		font: inherit;
		font-size: 0.84rem;
		font-weight: 800;
		cursor: pointer;
		transition:
			transform 160ms ease,
			background 160ms ease,
			border-color 160ms ease;
	}

	button:hover,
	button:focus-visible,
	button.active {
		border-color: color-mix(in oklch, var(--primary), transparent 58%);
		background: var(--btn-regular-bg-hover);
		outline: none;
		transform: translateY(-1px);
	}

	button:active {
		transform: scale(0.97);
	}

	button :global(svg) {
		font-size: 1.08rem;
		color: var(--primary);
	}

	@media (max-width: 768px) {
		.post-tools {
			display: grid;
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}

		button {
			justify-content: center;
			padding-inline: 0.65rem;
		}
	}
</style>
