<script lang="ts">
import Icon from "@iconify/svelte";
import { onMount } from "svelte";
import {
	createSupabaseQuery,
	supabaseConfigured,
	supabaseRest,
} from "../utils/supabase-rest";
import CommentReactions, {
	type CommentReactionCounts,
} from "./CommentReactions.svelte";

type BlogComment = {
	id: string;
	body: string;
	created_at: string;
	parent_id?: string | null;
	author_name?: string | null;
	is_author?: boolean | null;
};

type ThreadedComment = BlogComment & {
	depth: number;
};

type CommentReactionCountsRow = CommentReactionCounts & {
	comment_id: string;
};

let { slug } = $props<{ slug: string }>();

const maxLength = 600;
let body = $state("");
let replyBody = $state("");
let replyingTo = $state<string | null>(null);
let comments = $state<BlogComment[]>([]);
let reactionCounts = $state<Record<string, CommentReactionCounts>>({});
let error = $state("");
let notice = $state("");
let loading = $state(true);
let submitting = $state(false);
let submittingReplyFor = $state<string | null>(null);
let website = $state("");
let identityDialogOpen = $state(false);
let identityName = $state("");
let identityEmail = $state("");
let identityError = $state("");
let pendingParentId = $state<string | null>(null);

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
		await loadReactionCounts();
		loading = false;
	}
}

async function loadReactionCounts() {
	if (!comments.length) return;

	try {
		const rows = await supabaseRest<CommentReactionCountsRow[]>(
			createSupabaseQuery("comment_reaction_counts", {
				select:
					"comment_id,like_count,love_count,haha_count,wow_count,sad_count,angry_count",
				comment_id: `in.(${comments.map((comment) => comment.id).join(",")})`,
			}),
		);
		reactionCounts = Object.fromEntries(
			rows.map(({ comment_id, ...counts }) => [comment_id, counts]),
		);
	} catch {
		reactionCounts = {};
	}
}

function requestComment(parentId?: string) {
	if (!validateComment(parentId)) return;
	pendingParentId = parentId ?? null;
	identityName = "";
	identityEmail = "";
	identityError = "";
	identityDialogOpen = true;
}

function validateComment(parentId?: string) {
	const isReply = Boolean(parentId);
	const source = isReply ? replyBody : body;
	const trimmed = source.trim();
	if (!trimmed) {
		error = isReply
			? "Nhập nội dung trả lời trước đã."
			: "Nhập nội dung bình luận trước đã.";
		return false;
	}

	if (trimmed.length > maxLength) {
		error = `Bình luận tối đa ${maxLength} ký tự.`;
		return false;
	}
	return true;
}

async function submitComment(useIdentity: boolean) {
	const email = useIdentity ? identityEmail.trim().toLowerCase() : "";
	if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(email)) {
		identityError = "Địa chỉ email chưa đúng.";
		return;
	}

	const sent = await createComment(
		pendingParentId ?? undefined,
		useIdentity ? identityName.trim() : "",
		email,
	);
	if (sent) closeIdentityDialog();
}

async function createComment(
	parentId?: string,
	authorName = "",
	notificationEmail = "",
) {
	if (!validateComment(parentId)) return false;
	const isReply = Boolean(parentId);
	const source = isReply ? replyBody : body;
	const trimmed = source.trim();

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
				author_name: authorName,
				notification_email: notificationEmail,
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
		return true;
	} catch (submitError) {
		error =
			submitError instanceof Error
				? submitError.message
				: "Chưa gửi được bình luận. Thử lại sau nhé.";
		return false;
	} finally {
		if (isReply) submittingReplyFor = null;
		else submitting = false;
	}
}

function closeIdentityDialog() {
	if (submitting || submittingReplyFor) return;
	identityDialogOpen = false;
	identityName = "";
	identityEmail = "";
	identityError = "";
	pendingParentId = null;
}

function handleDialogKeydown(event: KeyboardEvent) {
	if (event.key === "Escape" && identityDialogOpen) closeIdentityDialog();
}

function portalToBody(node: HTMLElement) {
	document.body.appendChild(node);

	return {
		destroy() {
			node.remove();
		},
	};
}

function threadedComments(): ThreadedComment[] {
	const ids = new Set(comments.map((comment) => comment.id));
	const children = new Map<string | null, BlogComment[]>();
	for (const comment of comments) {
		const parentId =
			comment.parent_id && ids.has(comment.parent_id)
				? comment.parent_id
				: null;
		const group = children.get(parentId) ?? [];
		group.push(comment);
		children.set(parentId, group);
	}

	const result: ThreadedComment[] = [];
	const visited = new Set<string>();
	const append = (comment: BlogComment, depth: number) => {
		if (visited.has(comment.id)) return;
		visited.add(comment.id);
		result.push({ ...comment, depth });
		const replies = [...(children.get(comment.id) ?? [])].sort(
			(a, b) =>
				new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
		);
		for (const reply of replies) append(reply, depth + 1);
	};

	const roots = [...(children.get(null) ?? [])].sort(
		(a, b) =>
			new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
	);
	for (const root of roots) append(root, 0);
	for (const comment of comments) append(comment, 0);
	return result;
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

<svelte:window onkeydown={handleDialogKeydown} />

<section id="comments" class="comment-panel card-base onload-animation" data-anonymous-comments>
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
				<button type="button" disabled={submitting} onclick={() => requestComment()}>
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
				{#each threadedComments() as comment (comment.id)}
					<div
						class="comment-entry"
						class:thread-reply={comment.depth > 0}
						style={`--thread-indent: ${Math.min(comment.depth, 5) * 1.35}rem`}
					>
						<article class="comment-item" class:reply={comment.depth > 0}>
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
								<div class="comment-toolbar">
									<CommentReactions
										commentId={comment.id}
										initialCounts={reactionCounts[comment.id]}
									/>
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
							</div>
						</article>

						{#if replyingTo === comment.id}
							<div class="reply-form">
								<textarea
									aria-label="Trả lời bình luận"
									bind:value={replyBody}
									maxlength={maxLength}
									placeholder={`Trả lời ${authorName(comment)}...`}
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
											onclick={() => requestComment(comment.id)}
										>
											<Icon icon="material-symbols:send-rounded" />
											{submittingReplyFor === comment.id ? "Đang gửi..." : "Gửi trả lời"}
										</button>
									</div>
								</div>
							</div>
						{/if}
					</div>
				{/each}
			{/if}
		</div>
	{/if}
</section>

{#if identityDialogOpen}
	<div class="identity-modal-layer" use:portalToBody>
		<button
			class="identity-backdrop"
			type="button"
			aria-label="Đóng hộp thoại"
			onclick={closeIdentityDialog}
		></button>
		<div
			class="identity-dialog"
			role="dialog"
			aria-modal="true"
			aria-labelledby="identity-dialog-title"
			aria-describedby="identity-dialog-description"
		>
			<header>
				<span class="identity-icon" aria-hidden="true">
					<Icon icon="material-symbols:mark-email-unread-outline-rounded" />
				</span>
				<div>
					<h2 id="identity-dialog-title">Bạn muốn để lại thông tin?</h2>
					<p id="identity-dialog-description">
						Hoàn toàn không bắt buộc. Bạn vẫn có thể gửi bình luận ẩn danh.
					</p>
				</div>
				<button
					class="identity-close"
					type="button"
					aria-label="Đóng"
					onclick={closeIdentityDialog}
				>
					<Icon icon="material-symbols:close-rounded" />
				</button>
			</header>

			<div class="identity-fields">
				<label>
					<span>Họ tên <small>Không bắt buộc</small></span>
					<input
						type="text"
						bind:value={identityName}
						maxlength="60"
						autocomplete="name"
						placeholder="Tên sẽ hiển thị cùng bình luận"
					/>
				</label>
				<label>
					<span>Email <small>Không bắt buộc</small></span>
					<input
						type="email"
						bind:value={identityEmail}
						maxlength="254"
						autocomplete="email"
						placeholder="Nhận mail khi có người phản hồi"
						oninput={() => (identityError = "")}
					/>
				</label>
			</div>

			<div class="identity-privacy">
				<Icon icon="material-symbols:lock-outline-rounded" />
				<span>Email chỉ dùng để báo phản hồi và không hiển thị công khai.</span>
			</div>
			{#if identityError}<p class="identity-error" role="alert">{identityError}</p>{/if}

			<div class="identity-actions">
				<button
					class="anonymous-button"
					type="button"
					disabled={submitting || Boolean(submittingReplyFor)}
					onclick={() => submitComment(false)}
				>
					<Icon icon="material-symbols:person-off-outline-rounded" />
					Gửi ẩn danh
				</button>
				<button
					type="button"
					disabled={submitting || Boolean(submittingReplyFor)}
					onclick={() => submitComment(true)}
				>
					<Icon icon="material-symbols:send-rounded" />
					{pendingParentId ? "Gửi trả lời" : "Gửi bình luận"}
				</button>
			</div>
		</div>
	</div>
{/if}

<style>
	.comment-panel {
		padding: 1rem;
		margin-bottom: 1.5rem;
		scroll-margin-top: 5.5rem;
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

	.comment-entry {
		position: relative;
		display: grid;
		gap: 0.55rem;
		margin-left: var(--thread-indent, 0rem);
	}

	.comment-entry.thread-reply::before {
		position: absolute;
		top: 0.3rem;
		bottom: 0.3rem;
		left: -0.7rem;
		width: 1px;
		background: color-mix(in oklch, var(--primary), transparent 72%);
		content: "";
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

	.comment-toolbar {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: 0.45rem;
	}

	.comment-toolbar .comment-reply-button {
		margin-top: 0.35rem;
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

	.identity-modal-layer {
		position: fixed;
		inset: 0;
		z-index: 12000;
		display: grid;
		place-items: center;
		padding: 1rem;
	}

	.identity-backdrop {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		min-height: 0;
		padding: 0;
		border: 0;
		border-radius: 0;
		background: rgb(3 10 16 / 0.58);
		backdrop-filter: blur(8px);
	}

	.identity-dialog {
		position: relative;
		width: min(31rem, 100%);
		max-height: calc(100vh - 2rem);
		overflow-y: auto;
		padding: 1rem;
		border: 1px solid var(--card-border);
		border-radius: 8px;
		background: var(--float-panel-bg);
		box-shadow: var(--card-shadow-hover);
		animation: identity-dialog-in 180ms ease-out;
	}

	.identity-dialog header {
		display: grid;
		grid-template-columns: 2.5rem minmax(0, 1fr) 2.5rem;
		align-items: start;
		gap: 0.75rem;
	}

	.identity-dialog h2 {
		font-size: 1.05rem;
	}

	.identity-dialog header p {
		margin: 0.2rem 0 0;
		color: var(--meta-color);
		font-size: 0.8rem;
		line-height: 1.5;
	}

	.identity-icon,
	.identity-close {
		display: grid;
		place-items: center;
		width: 2.5rem;
		height: 2.5rem;
		border-radius: 8px;
		background: color-mix(in oklch, var(--primary), transparent 84%);
		color: var(--primary);
		font-size: 1.3rem;
	}

	.identity-close {
		min-height: 0;
		padding: 0;
		border: 1px solid var(--card-border);
		background: var(--btn-regular-bg);
		color: var(--meta-color);
	}

	.identity-fields {
		display: grid;
		gap: 0.8rem;
		margin-top: 1rem;
	}

	.identity-fields label,
	.identity-fields label > span {
		display: grid;
		gap: 0.4rem;
	}

	.identity-fields label > span {
		grid-template-columns: auto 1fr;
		align-items: baseline;
		color: var(--content-color);
		font-size: 0.82rem;
		font-weight: 800;
	}

	.identity-fields small {
		color: var(--meta-color);
		font-size: 0.7rem;
		font-weight: 600;
	}

	.identity-fields input {
		width: 100%;
		height: 2.75rem;
		padding: 0 0.8rem;
		border: 1px solid var(--card-border);
		border-radius: 8px;
		background: var(--btn-regular-bg);
		color: var(--content-color);
		font: inherit;
		outline: none;
		transition: border-color 160ms ease, box-shadow 160ms ease;
	}

	.identity-fields input:focus {
		border-color: color-mix(in oklch, var(--primary), transparent 42%);
		box-shadow: 0 0 0 4px color-mix(in oklch, var(--primary), transparent 88%);
	}

	.identity-privacy {
		display: flex;
		align-items: center;
		gap: 0.4rem;
		margin-top: 0.85rem;
		padding: 0.55rem 0.65rem;
		border-left: 3px solid var(--primary);
		background: color-mix(in oklch, var(--primary), transparent 92%);
		color: var(--meta-color);
		font-size: 0.75rem;
	}

	.identity-privacy :global(svg) {
		flex: 0 0 auto;
		color: var(--primary);
	}

	.identity-error {
		margin: 0.55rem 0 0;
		color: #d04444;
		font-size: 0.78rem;
		font-weight: 700;
	}

	.identity-actions {
		display: flex;
		justify-content: flex-end;
		gap: 0.5rem;
		margin-top: 1rem;
	}

	.identity-actions .anonymous-button {
		border-color: var(--card-border);
		background: var(--btn-regular-bg);
		color: var(--content-color);
	}

	@keyframes identity-dialog-in {
		from {
			opacity: 0;
			transform: translateY(0.6rem) scale(0.98);
		}
		to {
			opacity: 1;
			transform: translateY(0) scale(1);
		}
	}

	@media (max-width: 640px) {
		.comment-panel {
			padding: 0.9rem;
		}

		.comment-actions {
			align-items: flex-end;
			flex-wrap: wrap;
		}

		.comment-actions button,
		.comment-reply-button,
		.ghost-button {
			min-height: 2.75rem;
		}

		.comment-entry {
			margin-left: min(var(--thread-indent, 0rem), 1.75rem);
		}

		.reply-actions {
			width: 100%;
		}

		.identity-actions {
			display: grid;
			grid-template-columns: 1fr;
		}

		.identity-actions button {
			width: 100%;
		}
	}
</style>
