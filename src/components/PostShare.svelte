<script lang="ts">
import Icon from "@iconify/svelte";
import { onMount } from "svelte";

export let title = "";
export let shareUrl = "";
export let variant: "full" | "compact" = "full";

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

<section class={`share-panel ${variant === "full" ? "card-base" : "compact"} onload-animation`} aria-label="Chia sẻ bài viết">
	{#if variant === "full"}
		<div class="share-copy">
			<div class="share-title">Chia sẻ bài viết</div>
			<div class="share-url">{currentUrl}</div>
		</div>
	{:else}
		<div class="compact-label">Chia sẻ</div>
	{/if}

	<div class="share-actions">
		<button type="button" title="Chia sẻ" aria-label="Chia sẻ" onclick={shareNative}>
			<Icon icon="material-symbols:ios-share-rounded" />
			<span class="action-label">Chia sẻ</span>
		</button>
		<button
			type="button"
			title="Sao chép link"
			aria-label="Sao chép link"
			class:copied
			onclick={copyLink}
		>
			<Icon icon={copied ? "material-symbols:check-rounded" : "material-symbols:content-copy-outline-rounded"} />
			<span class="action-label">{copied ? "Đã chép" : "Copy"}</span>
		</button>
		<a href={facebookShareUrl} target="_blank" rel="noopener noreferrer" title="Facebook" aria-label="Facebook">
			<Icon icon="fa6-brands:facebook-f" />
			<span class="action-label">Facebook</span>
		</a>
		<a href={xShareUrl} target="_blank" rel="noopener noreferrer" title="X" aria-label="X">
			<Icon icon="fa6-brands:x-twitter" />
			<span class="action-label">X</span>
		</a>
		<a href={telegramShareUrl} target="_blank" rel="noopener noreferrer" title="Telegram" aria-label="Telegram">
			<Icon icon="fa6-brands:telegram" />
			<span class="action-label">Telegram</span>
		</a>
		<a href={linkedinShareUrl} target="_blank" rel="noopener noreferrer" title="LinkedIn" aria-label="LinkedIn">
			<Icon icon="fa6-brands:linkedin-in" />
			<span class="action-label">LinkedIn</span>
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

	.share-panel.compact {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.75rem;
		padding: 0 0 1rem;
		margin: -0.2rem 0 1.25rem;
		border-bottom: 1px dashed var(--line-divider);
	}

	.compact-label {
		color: rgb(0 0 0 / 0.45);
		font-size: 0.78rem;
		font-weight: 800;
	}

	:global(.dark) .compact-label {
		color: rgb(255 255 255 / 0.5);
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
		gap: 0.4rem;
		min-height: 2.45rem;
		border: 1px solid var(--card-border);
		border-radius: 999px;
		background: var(--btn-regular-bg);
		color: var(--btn-content);
		padding: 0 0.8rem;
		font: inherit;
		font-size: 0.82rem;
		font-weight: 800;
		text-decoration: none;
		cursor: pointer;
		transition: transform 160ms ease, background 160ms ease, border-color 160ms ease;
	}

	.share-panel.compact button,
	.share-panel.compact a {
		width: 2.35rem;
		min-height: 2.35rem;
		padding: 0;
		border-radius: 0.8rem;
	}

	.share-panel.compact .action-label {
		position: absolute;
		width: 1px;
		height: 1px;
		overflow: hidden;
		clip: rect(0 0 0 0);
		white-space: nowrap;
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

		.share-panel.compact {
			display: flex;
		}

		.share-actions {
			display: grid;
			grid-template-columns: repeat(2, minmax(0, 1fr));
			justify-content: stretch;
		}

		.share-panel.compact .share-actions {
			display: flex;
			justify-content: flex-end;
		}
	}
</style>
