<script lang="ts">
import Icon from "@iconify/svelte";
import { onMount } from "svelte";

export let title = "";
export let shareUrl = "";

let currentUrl = shareUrl;
let copied = false;
let canNativeShare = false;

$: encodedUrl = encodeURIComponent(currentUrl);
$: encodedTitle = encodeURIComponent(title);
$: facebookShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
$: xShareUrl = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`;
$: telegramShareUrl = `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`;
$: linkedinShareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;

onMount(() => {
	currentUrl = shareUrl || window.location.href;
	canNativeShare = typeof navigator.share === "function";
});

async function shareNative() {
	if (!canNativeShare) {
		await copyLink();
		return;
	}

	try {
		await navigator.share({
			title,
			url: currentUrl,
		});
	} catch (error) {
		if (error instanceof DOMException && error.name === "AbortError") return;
		console.error("Share error:", error);
	}
}

async function copyLink() {
	try {
		await navigator.clipboard.writeText(currentUrl);
	} catch {
		const input = document.createElement("input");
		input.value = currentUrl;
		input.setAttribute("readonly", "");
		input.style.position = "fixed";
		input.style.opacity = "0";
		document.body.append(input);
		input.select();
		document.execCommand("copy");
		input.remove();
	}

	copied = true;
	setTimeout(() => {
		copied = false;
	}, 1400);
}
</script>

<section class="share-panel card-base onload-animation" aria-label="Chia sẻ bài viết">
	<div class="share-copy">
		<div class="share-title">Chia sẻ bài viết</div>
		<div class="share-url">{currentUrl}</div>
	</div>

	<div class="share-actions">
		<button type="button" title="Chia sẻ" aria-label="Chia sẻ" onclick={shareNative}>
			<Icon icon="material-symbols:ios-share-rounded" />
		</button>
		<button
			type="button"
			title="Sao chép link"
			aria-label="Sao chép link"
			class:copied
			onclick={copyLink}
		>
			<Icon icon={copied ? "material-symbols:check-rounded" : "material-symbols:content-copy-outline-rounded"} />
		</button>
		<a href={facebookShareUrl} target="_blank" rel="noopener noreferrer" title="Facebook" aria-label="Facebook">
			<Icon icon="fa6-brands:facebook-f" />
		</a>
		<a href={xShareUrl} target="_blank" rel="noopener noreferrer" title="X" aria-label="X">
			<Icon icon="fa6-brands:x-twitter" />
		</a>
		<a href={telegramShareUrl} target="_blank" rel="noopener noreferrer" title="Telegram" aria-label="Telegram">
			<Icon icon="fa6-brands:telegram" />
		</a>
		<a href={linkedinShareUrl} target="_blank" rel="noopener noreferrer" title="LinkedIn" aria-label="LinkedIn">
			<Icon icon="fa6-brands:linkedin-in" />
		</a>
	</div>
</section>

<style>
	.share-panel {
		display: grid;
		grid-template-columns: minmax(0, 1fr) auto;
		align-items: center;
		gap: 1rem;
		padding: 1rem;
		margin-bottom: 1.5rem;
	}

	.share-copy {
		min-width: 0;
	}

	.share-title {
		font-weight: 850;
		color: rgb(0 0 0 / 0.84);
	}

	:global(.dark) .share-title {
		color: rgb(255 255 255 / 0.9);
	}

	.share-url {
		margin-top: 0.18rem;
		overflow: hidden;
		color: rgb(0 0 0 / 0.45);
		font-size: 0.78rem;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	:global(.dark) .share-url {
		color: rgb(255 255 255 / 0.45);
	}

	.share-actions {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		justify-content: flex-end;
	}

	button,
	a {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 2.55rem;
		min-height: 2.45rem;
		border: 1px solid var(--card-border);
		border-radius: 0.85rem;
		background: var(--btn-regular-bg);
		color: var(--btn-content);
		padding: 0;
		font: inherit;
		font-size: 0.82rem;
		font-weight: 800;
		text-decoration: none;
		cursor: pointer;
		transition: transform 160ms ease, background 160ms ease, border-color 160ms ease;
	}

	button:hover,
	button:focus-visible,
	a:hover,
	a:focus-visible,
	button.copied {
		border-color: color-mix(in oklch, var(--primary), transparent 58%);
		background: var(--btn-regular-bg-hover);
		outline: none;
		transform: translateY(-1px);
	}

	button:active,
	a:active {
		transform: scale(0.97);
	}

	button :global(svg),
	a :global(svg) {
		font-size: 1.12rem;
		transition: transform 160ms ease;
	}

	button:hover :global(svg),
	a:hover :global(svg) {
		transform: translateY(-1px);
	}

	@media (max-width: 768px) {
		.share-panel {
			grid-template-columns: 1fr;
		}

		.share-actions {
			display: flex;
			justify-content: flex-end;
		}
	}
</style>
