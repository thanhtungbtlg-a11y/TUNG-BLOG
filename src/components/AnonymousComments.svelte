<script lang="ts">
import Icon from "@iconify/svelte";
import { onMount } from "svelte";

type AnonymousComment = {
	id: string;
	body: string;
	createdAt: string;
};

let { slug } = $props<{ slug: string }>();

let body = $state("");
let comments = $state<AnonymousComment[]>([]);
let error = $state("");

const maxLength = 600;
const storageKey = `anonymous-comments:${slug}`;

onMount(() => {
	const saved = localStorage.getItem(storageKey);
	if (!saved) return;

	try {
		const parsed = JSON.parse(saved);
		if (Array.isArray(parsed)) {
			comments = parsed.filter(
				(comment) =>
					typeof comment?.id === "string" &&
					typeof comment?.body === "string" &&
					typeof comment?.createdAt === "string",
			);
		}
	} catch {
		comments = [];
	}
});

function persist(nextComments = comments) {
	localStorage.setItem(storageKey, JSON.stringify(nextComments));
}

function createComment() {
	const trimmed = body.trim();
	if (!trimmed) {
		error = "Nhập nội dung bình luận trước đã.";
		return;
	}

	if (trimmed.length > maxLength) {
		error = `Bình luận tối đa ${maxLength} ký tự.`;
		return;
	}

	const nextComments = [
		{
			id: createId(),
			body: trimmed,
			createdAt: new Date().toISOString(),
		},
		...comments,
	];

	comments = nextComments;
	body = "";
	error = "";
	persist(nextComments);
}

function removeComment(id: string) {
	const nextComments = comments.filter((comment) => comment.id !== id);
	comments = nextComments;
	persist(nextComments);
}

function createId() {
	if (window.crypto?.randomUUID) return window.crypto.randomUUID();
	return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function formatDate(value: string) {
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return "";
	return date.toLocaleString("vi-VN", {
		dateStyle: "medium",
		timeStyle: "short",
	});
}
</script>

<section class="comment-panel card-base onload-animation" data-anonymous-comments>
	<div class="comment-heading">
		<div>
			<div class="comment-title">Bình luận ẩn danh</div>
			<div class="comment-subtitle">Lưu trên trình duyệt hiện tại</div>
		</div>
		<div class="comment-count">
			<Icon icon="material-symbols:chat-bubble-outline-rounded" />
			<span>{comments.length}</span>
		</div>
	</div>

	<div class="comment-form">
		<textarea
			data-comment-input
			aria-label="Anonymous comment"
			bind:value={body}
			maxlength={maxLength}
			placeholder="Viết bình luận ẩn danh..."
			oninput={() => (error = "")}
		></textarea>
		<div class="comment-actions">
			<span class:error={body.length > maxLength * 0.9}>
				{body.length}/{maxLength}
			</span>
			<button data-comment-submit type="button" onclick={createComment}>
				<Icon icon="material-symbols:send-rounded" />
				Gửi bình luận
			</button>
		</div>
		{#if error}
			<div class="comment-error" role="alert">{error}</div>
		{/if}
	</div>

	<div class="comment-list">
		{#if comments.length === 0}
			<div class="comment-empty">
				<Icon icon="material-symbols:forum-outline-rounded" />
				<span>Chưa có bình luận nào.</span>
			</div>
		{:else}
			{#each comments as comment}
				<article class="comment-item" data-comment-item>
					<div class="comment-avatar" aria-hidden="true">
						<Icon icon="material-symbols:person-rounded" />
					</div>
					<div class="comment-content">
						<div class="comment-meta">
							<strong>Ẩn danh</strong>
							<span>{formatDate(comment.createdAt)}</span>
						</div>
						<p>{comment.body}</p>
					</div>
					<button
						class="comment-remove"
						type="button"
						aria-label="Xóa bình luận"
						onclick={() => removeComment(comment.id)}
					>
						<Icon icon="material-symbols:close-rounded" />
					</button>
				</article>
			{/each}
		{/if}
	</div>
</section>

<style>
	.comment-panel {
		padding: 1rem;
		margin-bottom: 1.5rem;
	}

	.comment-heading {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		margin-bottom: 0.9rem;
	}

	.comment-title {
		font-weight: 850;
		color: rgb(0 0 0 / 0.84);
	}

	.comment-subtitle {
		margin-top: 0.15rem;
		font-size: 0.82rem;
		color: rgb(0 0 0 / 0.46);
	}

	:global(.dark) .comment-title {
		color: rgb(255 255 255 / 0.9);
	}

	:global(.dark) .comment-subtitle {
		color: rgb(255 255 255 / 0.48);
	}

	.comment-count {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
		height: 2.25rem;
		padding: 0 0.75rem;
		border: 1px solid var(--card-border);
		border-radius: 999px;
		background: var(--btn-regular-bg);
		color: var(--btn-content);
		font-weight: 800;
	}

	.comment-form {
		display: grid;
		gap: 0.65rem;
	}

	textarea {
		width: 100%;
		min-height: 7rem;
		resize: vertical;
		border: 1px solid var(--card-border);
		border-radius: 0.9rem;
		background: var(--btn-regular-bg);
		color: rgb(0 0 0 / 0.78);
		padding: 0.85rem 0.95rem;
		font: inherit;
		line-height: 1.6;
		outline: none;
		transition: border-color 160ms ease, background 160ms ease, box-shadow 160ms ease;
	}

	textarea::placeholder {
		color: rgb(0 0 0 / 0.35);
	}

	textarea:focus {
		border-color: color-mix(in oklch, var(--primary), transparent 45%);
		background: var(--card-bg);
		box-shadow: 0 0 0 4px color-mix(in oklch, var(--primary), transparent 88%);
	}

	:global(.dark) textarea {
		color: rgb(255 255 255 / 0.82);
	}

	:global(.dark) textarea::placeholder {
		color: rgb(255 255 255 / 0.35);
	}

	.comment-actions {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.75rem;
		color: rgb(0 0 0 / 0.38);
		font-size: 0.82rem;
	}

	:global(.dark) .comment-actions {
		color: rgb(255 255 255 / 0.4);
	}

	.comment-actions span.error {
		color: #d04444;
	}

	.comment-actions button,
	.comment-remove {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		border: 1px solid transparent;
		font: inherit;
		cursor: pointer;
		transition: transform 160ms ease, background 160ms ease, border-color 160ms ease;
	}

	.comment-actions button {
		gap: 0.45rem;
		min-height: 2.5rem;
		border-radius: 999px;
		background: var(--primary);
		color: white;
		padding: 0 0.95rem;
		font-weight: 800;
		box-shadow: 0 10px 22px color-mix(in oklch, var(--primary), transparent 72%);
	}

	.comment-actions button:hover,
	.comment-actions button:focus-visible {
		transform: translateY(-1px);
		filter: brightness(1.04);
		outline: none;
	}

	.comment-actions button:active,
	.comment-remove:active {
		transform: scale(0.96);
	}

	.comment-error {
		color: #d04444;
		font-size: 0.86rem;
		font-weight: 700;
	}

	.comment-list {
		display: grid;
		gap: 0.65rem;
		margin-top: 1rem;
	}

	.comment-empty,
	.comment-item {
		border: 1px solid var(--card-border);
		border-radius: 0.9rem;
		background: color-mix(in oklch, var(--btn-regular-bg), transparent 18%);
	}

	.comment-empty {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		min-height: 4rem;
		color: rgb(0 0 0 / 0.45);
		font-weight: 700;
	}

	:global(.dark) .comment-empty {
		color: rgb(255 255 255 / 0.45);
	}

	.comment-item {
		display: grid;
		grid-template-columns: 2.25rem minmax(0, 1fr) auto;
		gap: 0.75rem;
		padding: 0.85rem;
	}

	.comment-avatar {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 2.25rem;
		height: 2.25rem;
		border-radius: 999px;
		background: color-mix(in oklch, var(--primary), transparent 84%);
		color: var(--primary);
		font-size: 1.2rem;
	}

	.comment-meta {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.5rem;
		margin-bottom: 0.25rem;
	}

	.comment-meta strong {
		color: rgb(0 0 0 / 0.82);
	}

	.comment-meta span {
		color: rgb(0 0 0 / 0.42);
		font-size: 0.78rem;
	}

	:global(.dark) .comment-meta strong {
		color: rgb(255 255 255 / 0.88);
	}

	:global(.dark) .comment-meta span {
		color: rgb(255 255 255 / 0.42);
	}

	p {
		margin: 0;
		white-space: pre-wrap;
		overflow-wrap: anywhere;
		color: rgb(0 0 0 / 0.68);
		line-height: 1.6;
	}

	:global(.dark) p {
		color: rgb(255 255 255 / 0.68);
	}

	.comment-remove {
		width: 2rem;
		height: 2rem;
		border-radius: 999px;
		background: transparent;
		color: rgb(0 0 0 / 0.35);
		font-size: 1.1rem;
	}

	.comment-remove:hover,
	.comment-remove:focus-visible {
		border-color: var(--card-border);
		background: var(--btn-regular-bg-hover);
		color: var(--btn-content);
		outline: none;
	}

	:global(.dark) .comment-remove {
		color: rgb(255 255 255 / 0.38);
	}

	@media (max-width: 640px) {
		.comment-panel {
			padding: 0.85rem;
		}

		.comment-heading,
		.comment-actions {
			align-items: flex-start;
			flex-direction: column;
		}

		.comment-actions button {
			width: 100%;
		}

		.comment-item {
			grid-template-columns: 2rem minmax(0, 1fr);
		}

		.comment-remove {
			grid-column: 2;
			justify-self: end;
		}
	}
</style>
