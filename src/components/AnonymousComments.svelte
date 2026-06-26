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
	parent_id?: string | null;
	author_name?: string | null;
	is_author?: boolean | null;
};

let { slug } = $props<{ slug: string }>();

const maxLength = 600;
let body = $state("");
let replyBody = $state("");
let replyingTo = $state<string | null>(null);
let comments = $state<BlogComment[]>([]);
let error = $state("");
let notice = $state("");
let loading = $state(true);
let submitting = $state(false);
let submittingReplyFor = $state<string | null>(null);
let website = $state("");

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
				select: "id,body,created_at,parent_id,author_name,is_author",
				slug: `eq.${slug}`,
				status: "eq.approved",
				order: "created_at.asc",
			}),
		);
	} catch {
		try {
			const legacyComments = await supabaseRest<BlogComment[]>(
				createSupabaseQuery("blog_comments", {
					select: "id,body,created_at",
					slug: `eq.${slug}`,
					status: "eq.approved",
					order: "created_at.desc",
				}),
			);
			comments = legacyComments.map((comment) => ({
				...comment,
				parent_id: null,
				author_name: "Ẩn danh",
				is_author: false,
			}));
		} catch {
			error = "Không tải được bình luận.";
		}
	} finally {
		loading = false;
	}
}

async function createComment(parentId?: string) {
	const isReply = Boolean(parentId);
	const source = isReply ? replyBody : body;
	const trimmed = source.trim();
	if (!trimmed) {
		error = isReply
			? "Nhập nội dung trả lời trước đã."
			: "Nhập nội dung bình luận trước đã.";
		return;
	}

	if (trimmed.length > maxLength) {
		error = `Bình luận tối đa ${maxLength} ký tự.`;
		return;
	}

	if (isReply) submittingReplyFor = parentId ?? null;
	else submitting = true;
	error = "";
	notice = "";

	try {
		const response = await fetch("/api/comments", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				slug,
				body: trimmed,
				parent_id: parentId,
				website,
			}),
		});
		const result = await response.json();
		if (!response.ok) {
			throw new Error(result.error ?? "Chưa gửi được bình luận.");
		}
		if (isReply) {
			replyBody = "";
			replyingTo = null;
			notice = "Trả lời đã gửi và đang chờ duyệt.";
		} else {
			body = "";
			website = "";
			notice = "Bình luận đã gửi và đang chờ duyệt.";
		}
	} catch (submitError) {
		error =
			submitError instanceof Error
				? submitError.message
				: "Chưa gửi được bình luận. Thử lại sau nhé.";
	} finally {
		if (isReply) submittingReplyFor = null;
		else submitting = false;
	}
}

function topLevelComments() {
	return [...comments.filter((comment) => !comment.parent_id)].sort(
		(a, b) =>
			new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
	);
}

function repliesFor(commentId: string) {
	return [
		...comments.filter((comment) => comment.parent_id === commentId),
	].sort(
		(a, b) =>
			new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
	);
}

function authorName(comment: BlogComment) {
	return comment.is_author
		? "Nguyễn Thanh Tùng"
		: comment.author_name || "Ẩn danh";
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
			<label class="website-field" aria-hidden="true">
				Website
				<input bind:value={website} tabindex="-1" autocomplete="off" />
			</label>
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
				<button type="button" disabled={submitting} onclick={() => createComment()}>
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
				{#each topLevelComments() as comment (comment.id)}
					<div class="comment-thread">
						<article class="comment-item">
							<div class="comment-avatar" aria-hidden="true">
								<Icon icon={comment.is_author ? "material-symbols:verified-rounded" : "material-symbols:person-rounded"} />
							</div>
							<div class="comment-content">
								<div class="comment-meta">
									<strong>{authorName(comment)}</strong>
									{#if comment.is_author}<span class="author-badge">Tác giả</span>{/if}
									<span>{formatDate(comment.created_at)}</span>
								</div>
								<p>{comment.body}</p>
								<button
									class="comment-reply-button"
									type="button"
									onclick={() => {
										replyingTo = replyingTo === comment.id ? null : comment.id;
										replyBody = "";
										resetMessages();
									}}
								>
									<Icon icon="material-symbols:reply-rounded" />
									Trả lời
								</button>
							</div>
						</article>

						{#if replyingTo === comment.id}
							<div class="reply-form">
								<textarea
									aria-label="Trả lời bình luận"
									bind:value={replyBody}
									maxlength={maxLength}
									placeholder="Viết trả lời ẩn danh..."
									oninput={resetMessages}
								></textarea>
								<div class="comment-actions">
									<span class:near-limit={replyBody.length > maxLength * 0.9}>
										{replyBody.length}/{maxLength}
									</span>
									<div class="reply-actions">
										<button
											class="ghost-button"
											type="button"
											onclick={() => {
												replyingTo = null;
												replyBody = "";
											}}
										>
											Hủy
										</button>
										<button
											type="button"
											disabled={submittingReplyFor === comment.id}
											onclick={() => createComment(comment.id)}
										>
											<Icon icon="material-symbols:send-rounded" />
											{submittingReplyFor === comment.id ? "Đang gửi..." : "Gửi trả lời"}
										</button>
									</div>
								</div>
							</div>
						{/if}

						{#each repliesFor(comment.id) as reply (reply.id)}
							<article class="comment-item reply">
								<div class="comment-avatar" aria-hidden="true">
									<Icon icon={reply.is_author ? "material-symbols:verified-rounded" : "material-symbols:person-rounded"} />
								</div>
								<div class="comment-content">
									<div class="comment-meta">
										<strong>{authorName(reply)}</strong>
										{#if reply.is_author}<span class="author-badge">Tác giả</span>{/if}
										<span>{formatDate(reply.created_at)}</span>
									</div>
									<p>{reply.body}</p>
								</div>
							</article>
						{/each}
					</div>
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
	.comment-meta,
	.reply-actions {
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
		position: relative;
		display: grid;
		gap: 0.65rem;
	}

	.website-field {
		position: absolute;
		width: 1px;
		height: 1px;
		overflow: hidden;
		clip-path: inset(50%);
		white-space: nowrap;
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
		transition: transform 160ms ease, filter 160ms ease, background 160ms ease;
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
		gap: 0.8rem;
		margin-top: 1rem;
	}

	.comment-thread {
		display: grid;
		gap: 0.55rem;
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

	.comment-item.reply,
	.reply-form {
		margin-left: 2.75rem;
	}

	.comment-item.reply {
		background: color-mix(in oklch, var(--btn-regular-bg), transparent 10%);
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

	.comment-content {
		min-width: 0;
	}

	.comment-meta {
		justify-content: flex-start;
		flex-wrap: wrap;
		gap: 0.45rem 0.65rem;
		font-size: 0.76rem;
		color: var(--meta-color);
	}

	.author-badge {
		border: 1px solid color-mix(in oklch, var(--primary), transparent 58%);
		border-radius: 999px;
		padding: 0.1rem 0.42rem;
		color: var(--primary);
		font-weight: 850;
	}

	.comment-item p {
		margin: 0.35rem 0 0;
		white-space: pre-wrap;
		line-height: 1.6;
		color: var(--content-color);
	}

	.comment-reply-button,
	.ghost-button {
		min-height: 2rem;
		margin-top: 0.45rem;
		padding: 0 0.65rem;
		border-color: var(--card-border);
		background: var(--btn-regular-bg);
		color: var(--content-color);
		font-size: 0.78rem;
	}

	.reply-form {
		display: grid;
		gap: 0.55rem;
		padding: 0.75rem;
		border: 1px dashed var(--card-border);
		border-radius: 0.85rem;
		background: color-mix(in oklch, var(--card-bg), transparent 28%);
	}

	.reply-form textarea {
		min-height: 5rem;
	}

	.reply-actions {
		justify-content: flex-end;
		gap: 0.45rem;
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
			flex-wrap: wrap;
		}

		.comment-item.reply,
		.reply-form {
			margin-left: 1.25rem;
		}

		.reply-actions {
			width: 100%;
		}
	}
</style>
