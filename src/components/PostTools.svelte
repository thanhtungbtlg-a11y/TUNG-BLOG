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
const READER_FONT_KEY = "blog-reader-font";
const READER_WIDTH_KEY = "blog-reader-width";
const MAX_BOOKMARKS = 60;

type ReaderFont = "compact" | "normal" | "large";
type ReaderWidth = "narrow" | "normal" | "wide";

const fontOptions: Array<{ id: ReaderFont; label: string; scale: number }> = [
	{ id: "compact", label: "A−", scale: 0.94 },
	{ id: "normal", label: "A", scale: 1 },
	{ id: "large", label: "A+", scale: 1.1 },
];
const widthOptions: Array<{
	id: ReaderWidth;
	label: string;
	content: string;
	shell: string;
}> = [
	{ id: "narrow", label: "Narrow", content: "40rem", shell: "44rem" },
	{ id: "normal", label: "Standard", content: "46rem", shell: "50rem" },
	{ id: "wide", label: "Wide", content: "54rem", shell: "58rem" },
];

let saved = $state(false);
let readingMode = $state(false);
let settingsOpen = $state(false);
let readerFont = $state<ReaderFont>("normal");
let readerWidth = $state<ReaderWidth>("normal");

onMount(() => {
	saved = readBookmarks().some((post) => post.slug === slug);
	readingMode = localStorage.getItem(READING_MODE_KEY) === "true";
	readerFont = readOption(
		localStorage.getItem(READER_FONT_KEY),
		fontOptions,
		"normal",
	);
	readerWidth = readOption(
		localStorage.getItem(READER_WIDTH_KEY),
		widthOptions,
		"normal",
	);
	applyReadingMode();
	applyReaderSettings();
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

function readOption<T extends string>(
	stored: string | null,
	options: Array<{ id: T }>,
	fallback: T,
): T {
	return options.some((option) => option.id === stored)
		? (stored as T)
		: fallback;
}

function setReaderFont(value: ReaderFont) {
	readerFont = value;
	applyReaderSettings();
}

function setReaderWidth(value: ReaderWidth) {
	readerWidth = value;
	applyReaderSettings();
}

function resetReaderSettings() {
	readerFont = "normal";
	readerWidth = "normal";
	applyReaderSettings();
}

function applyReaderSettings() {
	const font =
		fontOptions.find((option) => option.id === readerFont) ?? fontOptions[1];
	const width =
		widthOptions.find((option) => option.id === readerWidth) ?? widthOptions[1];
	document.documentElement.style.setProperty(
		"--reader-font-scale",
		String(font.scale),
	);
	document.documentElement.style.setProperty(
		"--reader-content-width",
		width.content,
	);
	document.documentElement.style.setProperty(
		"--reader-shell-width",
		width.shell,
	);
	localStorage.setItem(READER_FONT_KEY, readerFont);
	localStorage.setItem(READER_WIDTH_KEY, readerWidth);
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

<div class="post-tools" aria-label="Reading tools">
	<button
		type="button"
		class:active={saved}
		aria-pressed={saved}
		title={saved ? "Remove from saved posts" : "Save for later"}
		onclick={toggleBookmark}
	>
		<Icon icon={saved ? "material-symbols:bookmark-rounded" : "material-symbols:bookmark-outline-rounded"} />
		<span>{saved ? "Saved" : "Read later"}</span>
	</button>

	<button
		type="button"
		class:active={readingMode}
		aria-pressed={readingMode}
		title={readingMode ? "Exit reading mode" : "Enter reading mode"}
		onclick={toggleReadingMode}
	>
		<Icon icon={readingMode ? "material-symbols:chrome-reader-mode-rounded" : "material-symbols:chrome-reader-mode-outline-rounded"} />
		<span>{readingMode ? "Reading" : "Focus"}</span>
	</button>

	<button
		type="button"
		class="settings-toggle"
		class:active={settingsOpen}
		aria-expanded={settingsOpen}
		aria-controls="reader-settings"
		title="Customize article display"
		onclick={() => (settingsOpen = !settingsOpen)}
	>
		<Icon icon="material-symbols:text-fields-rounded" />
		<span>Display</span>
	</button>
</div>

{#if settingsOpen}
	<div id="reader-settings" class="reader-settings onload-animation">
		<div class="setting-row">
			<span class="setting-label">Text size</span>
			<div class="segment" role="group" aria-label="Article text size">
				{#each fontOptions as option}
					<button
						type="button"
						class:active={readerFont === option.id}
						aria-pressed={readerFont === option.id}
						onclick={() => setReaderFont(option.id)}
					>{option.label}</button>
				{/each}
			</div>
		</div>
		<div class="setting-row">
			<span class="setting-label">Content width</span>
			<div class="segment" role="group" aria-label="Article content width">
				{#each widthOptions as option}
					<button
						type="button"
						class:active={readerWidth === option.id}
						aria-pressed={readerWidth === option.id}
						onclick={() => setReaderWidth(option.id)}
					>{option.label}</button>
				{/each}
			</div>
		</div>
		<button class="reset-reader" type="button" onclick={resetReaderSettings}>
			<Icon icon="material-symbols:restart-alt-rounded" />
			<span>Reset</span>
		</button>
	</div>
{/if}

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

	.reader-settings {
		display: grid;
		grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) auto;
		align-items: center;
		gap: 0.75rem;
		margin: -0.55rem 0 1.35rem;
		padding: 0.75rem;
		border: 1px solid var(--card-border);
		border-radius: 8px;
		background: color-mix(in oklch, var(--card-bg-solid), transparent 10%);
		box-shadow: var(--card-shadow);
	}

	.setting-row {
		display: grid;
		grid-template-columns: auto minmax(0, 1fr);
		align-items: center;
		gap: 0.6rem;
	}

	.setting-label {
		color: var(--meta-color);
		font-size: 0.76rem;
		font-weight: 800;
	}

	.segment {
		display: grid;
		grid-template-columns: repeat(3, minmax(2.4rem, 1fr));
		gap: 0.15rem;
		padding: 0.18rem;
		border: 1px solid var(--card-border);
		border-radius: 7px;
		background: var(--btn-regular-bg);
	}

	.segment button,
	.reset-reader {
		min-height: 2rem;
		padding: 0 0.55rem;
		border: 0;
		border-radius: 5px;
		background: transparent;
		font-size: 0.76rem;
	}

	.segment button.active {
		background: var(--card-bg-solid);
		box-shadow: 0 2px 8px color-mix(in srgb, var(--page-bg), black 10%);
	}

	.reset-reader {
		white-space: nowrap;
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

		.settings-toggle {
			grid-column: 1 / -1;
		}

		.reader-settings {
			grid-template-columns: 1fr;
		}

		.setting-row {
			grid-template-columns: 4.5rem minmax(0, 1fr);
		}
	}
</style>
