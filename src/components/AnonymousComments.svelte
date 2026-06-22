<script lang="ts">
import Icon from "@iconify/svelte";
import { onMount } from "svelte";
import {
	createSupabaseQuery,
	supabaseConfigured,
	supabaseRest,
} from "../utils/supabase-rest";

type BlogComment = {
	id: string;
	body: string;
	created_at: string;
};

let { slug } = $props<{ slug: string }>();

const maxLength = 600;
let body = $state("");
let comments = $state<BlogComment[]>([]);
let error = $state("");
let notice = $state("");
let loading = $state(true);
let submitting = $state(false);

onMount(() => {
	if (!supabaseConfigured) {
		loading = false;
		return;
	}
	void loadComments();
});

async function loadComments() {
	loading = true;
	error = "";

	try {
		comments = await supabaseRest<BlogComment[]>(
			createSupabaseQuery("blog_comments", {
				select: "id,body,created_at",
				slug: `eq.${slug}`,
				status: "eq.approved",
				order: "created_at.desc",
			}),
		);
	} catch {
		error = "Không tải được bình luận.";
	} finally {
		loading = false;
	}
}

async function createComment() {
	const trimmed = body.trim();
	if (!trimmed) {
		error = "Nhập nội dung bình luận trước đã.";
		return;
	}

	if (trimmed.length > maxLength) {
		error = `Bình luận tối đa ${maxLength} ký tự.`;
		return;
	}

	submitting = true;
	error = "";
	notice = "";

	try {
		await supabaseRest("blog_comments", {
			method: "POST",
			headers: { Prefer: "return=minimal" },
			body: JSON.stringify({ slug, body: trimmed, status: "pending" }),
		});
		body = "";
		notice = "Bình luận đã gửi và đang chờ duyệt.";
	} catch {
		error = "Chưa gửi được bình luận. Thử lại sau nhé.";
	} finally {
		submitting = false;
	}
}

function formatDate(value: string) {
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return "";
	return date.toLocaleString("vi-VN", {
		dateStyle: "medium",
		timeStyle: "short",
	});
}

function resetMessages() {
	error = "";
	notice = "";
}
</script>

<section class="comment-panel card-base onload-animation" data-anonymous-comments>
	<header class="comment-heading">
		<div>
			<h2>Bình luận ẩn danh</h2>
			<p>Ẩn danh, chờ duyệt</p>
		</div>
		<div class="comment-count" aria-label={`${comments.length} bình luận`}>
			<Icon icon="material-symbols:chat-bubble-outline-rounded" />
			<span>{comments.length}</span>
		</div>
	</header>

	{#if !supabaseConfigured}
		<div class="comment-empty">
			<Icon icon="material-symbols:settings-outline-rounded" />
			<span>Bình luận đang chờ cấu hình Supabase.</span>
		</div>
	{:else}
		<div class="comment-form">
			<textarea
				data-comment-input
				aria-label="Bình luận ẩn danh"
				bind:value={body}
				maxlength={maxLength}
				placeholder="Viết bình luận ẩn danh..."
				oninput={resetMessages}
			></textarea>
			<div class="comment-actions">
				<span class:near-limit={body.length > maxLength * 0.9}>
					{body.length}/{maxLength}
				</span>
				<button type="button" disabled={submitting} onclick={createComment}>
					<Icon icon="material-symbols:send-rounded" />
					{submitting ? "Đang gửi..." : "Gửi bình luận"}
				</button>
			</div>
			{#if error}<div class="message error" role="alert">{error}</div>{/if}
			{#if notice}<div class="message notice" role="status">{notice}</div>{/if}
		</div>

		<div class="comment-list">
			{#if loading}
				<div class="comment-empty">
					<Icon icon="material-symbols:hourglass-empty-rounded" />
					<span>Đang tải bình luận...</span>
				</div>
			{:else if comments.length === 0}
				<div class="comment-empty">
					<Icon icon="material-symbols:forum-outline-rounded" />
					<span>Chưa có bình luận nào.</span>
				</div>
			{:else}
				{#each comments as comment}
					<article class="comment-item">
						<div class="comment-avatar" aria-hidden="true">
							<Icon icon="material-symbols:person-rounded" />
						</div>
						<div>
							<div class="comment-meta">
								<strong>Ẩn danh</strong>
								<span>{formatDate(comment.created_at)}</span>
							</div>
							<p>{comment.body}</p>
						</div>
					</article>
				{/each}
			{/if}
		</div>
	{/if}
</section>

<style>
	.comment-panel {
		padding: 1rem;
		margin-bottom: 1.5rem;
	}

	.comment-heading,
	.comment-actions,
	.comment-meta {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
	}

	.comment-heading {
		margin-bottom: 0.9rem;
	}

	h2 {
		margin: 0;
		font-size: 1rem;
		font-weight: 850;
		color: rgb(0 0 0 / 0.84);
	}

	.comment-heading p {
		margin: 0.15rem 0 0;
		font-size: 0.82rem;
		color: rgb(0 0 0 / 0.46);
	}

	:global(.dark) h2 {
		color: rgb(255 255 255 / 0.9);
	}

	:global(.dark) .comment-heading p {
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
		padding: 0.85rem 0.95rem;
		border: 1px solid var(--card-border);
		border-radius: 0.9rem;
		background: var(--btn-regular-bg);
		color: rgb(0 0 0 / 0.78);
		font: inherit;
		line-height: 1.6;
		outline: none;
		transition: border-color 160ms ease, background 160ms ease, box-shadow 160ms ease;
	}

	textarea:focus {
		border-color: color-mix(in oklch, var(--primary), transparent 45%);
		background: var(--card-bg);
		box-shadow: 0 0 0 4px color-mix(in oklch, var(--primary), transparent 88%);
	}

	:global(.dark) textarea {
		color: rgb(255 255 255 / 0.86);
	}

	.comment-actions > span {
		font-size: 0.78rem;
		color: var(--meta-color);
	}

	.comment-actions > span.near-limit,
	.message.error {
		color: #d64545;
	}

	button {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.45rem;
		min-height: 2.5rem;
		padding: 0 0.9rem;
		border: 1px solid color-mix(in oklch, var(--primary), transparent 70%);
		border-radius: 0.75rem;
		background: var(--primary);
		color: white;
		font: inherit;
		font-weight: 800;
		cursor: pointer;
		transition: transform 160ms ease, filter 160ms ease;
	}

	button:not(:disabled):hover {
		transform: translateY(-1px);
		filter: brightness(1.05);
	}

	button:disabled {
		opacity: 0.55;
		cursor: wait;
	}

	.message {
		font-size: 0.84rem;
	}

	.message.notice {
		color: #15803d;
	}

	.comment-list {
		display: grid;
		gap: 0.65rem;
		margin-top: 1rem;
	}

	.comment-item {
		display: grid;
		grid-template-columns: 2rem minmax(0, 1fr);
		gap: 0.75rem;
		padding: 0.8rem;
		border: 1px solid var(--card-border);
		border-radius: 0.85rem;
		background: color-mix(in oklch, var(--card-bg), transparent 18%);
	}

	.comment-avatar {
		display: grid;
		place-items: center;
		width: 2rem;
		height: 2rem;
		border-radius: 50%;
		background: color-mix(in oklch, var(--primary), transparent 82%);
		color: var(--primary);
	}

	.comment-meta {
		justify-content: flex-start;
		gap: 0.65rem;
		font-size: 0.76rem;
		color: var(--meta-color);
	}

	.comment-item p {
		margin: 0.35rem 0 0;
		white-space: pre-wrap;
		line-height: 1.6;
		color: var(--content-color);
	}

	.comment-empty {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		min-height: 4rem;
		color: var(--meta-color);
		font-size: 0.86rem;
	}

	@media (max-width: 640px) {
		.comment-panel {
			padding: 0.9rem;
		}

		.comment-actions {
			align-items: flex-end;
		}
	}
</style>
