<script lang="ts">
import Icon from "@iconify/svelte";
import { createClient, type Session } from "@supabase/supabase-js";
import { onMount } from "svelte";

type CommentStatus = "pending" | "approved";

type BlogComment = {
	id: string;
	slug: string;
	body: string;
	status: CommentStatus;
	created_at: string;
	approved_at: string | null;
};

let { slug } = $props<{ slug: string }>();

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY as
	| string
	| undefined;
const supabase =
	supabaseUrl && supabaseAnonKey
		? createClient(supabaseUrl, supabaseAnonKey)
		: null;

const maxLength = 600;
const configured = !!supabase;

let body = $state("");
let comments = $state<BlogComment[]>([]);
let pendingComments = $state<BlogComment[]>([]);
let error = $state("");
let notice = $state("");
let loading = $state(true);
let submitting = $state(false);
let adminOpen = $state(false);
let adminLoading = $state(false);
let adminEmail = $state("");
let adminPassword = $state("");
let session = $state<Session | null>(null);
let isAdmin = $state(false);

onMount(() => {
	if (!supabase) {
		loading = false;
		return;
	}

	void initialise();

	const {
		data: { subscription },
	} = supabase.auth.onAuthStateChange((_event, nextSession) => {
		session = nextSession;
		void refreshAdminState();
	});

	return () => subscription.unsubscribe();
});

async function initialise() {
	await loadApprovedComments();
	await restoreSession();
	loading = false;
}

async function restoreSession() {
	if (!supabase) return;
	const { data } = await supabase.auth.getSession();
	session = data.session;
	await refreshAdminState();
}

async function refreshAdminState() {
	if (!supabase || !session?.user) {
		isAdmin = false;
		pendingComments = [];
		return;
	}

	const { data, error: adminError } = await supabase
		.from("comment_admins")
		.select("user_id")
		.eq("user_id", session.user.id)
		.maybeSingle();

	isAdmin = !adminError && !!data;
	if (isAdmin) await loadPendingComments();
	else pendingComments = [];
}

async function loadApprovedComments() {
	if (!supabase) return;

	const { data, error: loadError } = await supabase
		.from("blog_comments")
		.select("id, slug, body, status, created_at, approved_at")
		.eq("slug", slug)
		.eq("status", "approved")
		.order("created_at", { ascending: false });

	if (loadError) {
		error = "Không tải được bình luận.";
		return;
	}

	comments = (data ?? []) as BlogComment[];
}

async function loadPendingComments() {
	if (!supabase || !isAdmin) return;

	const { data, error: loadError } = await supabase
		.from("blog_comments")
		.select("id, slug, body, status, created_at, approved_at")
		.eq("slug", slug)
		.eq("status", "pending")
		.order("created_at", { ascending: false });

	if (loadError) {
		error = "Không tải được hàng chờ duyệt.";
		return;
	}

	pendingComments = (data ?? []) as BlogComment[];
}

async function createComment() {
	if (!supabase) {
		error = "Supabase chưa được cấu hình.";
		return;
	}

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

	const { error: submitError } = await supabase.from("blog_comments").insert({
		slug,
		body: trimmed,
		status: "pending",
	});

	submitting = false;

	if (submitError) {
		error = "Chưa gửi được bình luận. Thử lại sau nhé.";
		return;
	}

	body = "";
	notice = "Bình luận đã gửi và đang chờ duyệt.";
	if (isAdmin) await loadPendingComments();
}

async function signInAdmin() {
	if (!supabase) return;
	const email = adminEmail.trim();

	if (!email || !adminPassword) {
		error = "Nhập email và mật khẩu admin.";
		return;
	}

	adminLoading = true;
	error = "";
	notice = "";

	const { data, error: signInError } = await supabase.auth.signInWithPassword({
		email,
		password: adminPassword,
	});

	adminLoading = false;

	if (signInError) {
		error = "Không đăng nhập được admin.";
		return;
	}

	session = data.session;
	adminPassword = "";
	await refreshAdminState();

	if (isAdmin) {
		notice = "Đã mở quyền quản trị bình luận.";
	} else {
		error = "Tài khoản này chưa có quyền quản trị bình luận.";
	}
}

async function signOutAdmin() {
	if (!supabase) return;
	await supabase.auth.signOut();
	session = null;
	isAdmin = false;
	pendingComments = [];
	notice = "";
}

async function approveComment(comment: BlogComment) {
	if (!supabase || !isAdmin || !session?.user) return;

	adminLoading = true;
	const { error: approveError } = await supabase
		.from("blog_comments")
		.update({
			status: "approved",
			approved_at: new Date().toISOString(),
			approved_by: session.user.id,
		})
		.eq("id", comment.id);
	adminLoading = false;

	if (approveError) {
		error = "Chưa duyệt được bình luận.";
		return;
	}

	notice = "Đã duyệt bình luận.";
	await loadApprovedComments();
	await loadPendingComments();
}

async function deleteComment(comment: BlogComment) {
	if (!supabase || !isAdmin) return;
	const confirmed = window.confirm("Xóa bình luận này?");
	if (!confirmed) return;

	adminLoading = true;
	const { error: deleteError } = await supabase
		.from("blog_comments")
		.delete()
		.eq("id", comment.id);
	adminLoading = false;

	if (deleteError) {
		error = "Chưa xóa được bình luận.";
		return;
	}

	notice = "Đã xóa bình luận.";
	await loadApprovedComments();
	await loadPendingComments();
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
	<div class="comment-heading">
		<div>
			<div class="comment-title">Bình luận ẩn danh</div>
			<div class="comment-subtitle">Ẩn danh, chờ duyệt</div>
		</div>
		<div class="comment-count">
			<Icon icon="material-symbols:chat-bubble-outline-rounded" />
			<span>{comments.length}</span>
		</div>
	</div>

	{#if !configured}
		<div class="comment-empty">
			<Icon icon="material-symbols:settings-outline-rounded" />
			<span>Bình luận đang chờ cấu hình Supabase.</span>
		</div>
	{:else}
		<div class="comment-form">
			<textarea
				data-comment-input
				aria-label="Anonymous comment"
				bind:value={body}
				maxlength={maxLength}
				placeholder="Viết bình luận ẩn danh..."
				oninput={resetMessages}
			></textarea>
			<div class="comment-actions">
				<span class:error={body.length > maxLength * 0.9}>
					{body.length}/{maxLength}
				</span>
				<button
					data-comment-submit
					type="button"
					disabled={submitting}
					onclick={createComment}
				>
					<Icon icon="material-symbols:send-rounded" />
					{submitting ? "Đang gửi..." : "Gửi bình luận"}
				</button>
			</div>
			{#if error}
				<div class="comment-error" role="alert">{error}</div>
			{/if}
			{#if notice}
				<div class="comment-notice" role="status">{notice}</div>
			{/if}
		</div>

		<div class="admin-shell">
			<button
				class="admin-toggle"
				type="button"
				aria-expanded={adminOpen}
				onclick={() => (adminOpen = !adminOpen)}
			>
				<Icon icon="material-symbols:shield-person-outline-rounded" />
				Quản trị
			</button>

			{#if adminOpen}
				<div class="admin-panel">
					{#if isAdmin}
						<div class="admin-bar">
							<span>{session?.user.email}</span>
							<button type="button" onclick={signOutAdmin}>Đăng xuất</button>
						</div>

						<div class="moderation-block">
							<div class="moderation-title">
								<span>Chờ duyệt</span>
								<strong>{pendingComments.length}</strong>
							</div>
							{#if pendingComments.length === 0}
								<div class="comment-empty compact">Không có bình luận chờ duyệt.</div>
							{:else}
								<div class="comment-list compact-list">
									{#each pendingComments as comment}
										<article class="comment-item pending" data-pending-comment>
											<div class="comment-avatar" aria-hidden="true">
												<Icon icon="material-symbols:person-rounded" />
											</div>
											<div class="comment-content">
												<div class="comment-meta">
													<strong>Ẩn danh</strong>
													<span>{formatDate(comment.created_at)}</span>
												</div>
												<p>{comment.body}</p>
											</div>
											<div class="moderation-actions">
												<button
													type="button"
													disabled={adminLoading}
													onclick={() => approveComment(comment)}
												>
													Duyệt
												</button>
												<button
													type="button"
													disabled={adminLoading}
													onclick={() => deleteComment(comment)}
												>
													Xóa
												</button>
											</div>
										</article>
									{/each}
								</div>
							{/if}
						</div>
					{:else}
						<div class="admin-login">
							<input
								aria-label="Admin email"
								type="email"
								bind:value={adminEmail}
								placeholder="Email admin"
							/>
							<input
								aria-label="Admin password"
								type="password"
								bind:value={adminPassword}
								placeholder="Mật khẩu"
							/>
							<button type="button" disabled={adminLoading} onclick={signInAdmin}>
								{adminLoading ? "Đang đăng nhập..." : "Đăng nhập admin"}
							</button>
						</div>
					{/if}
				</div>
			{/if}
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
					<article class="comment-item" data-comment-item>
						<div class="comment-avatar" aria-hidden="true">
							<Icon icon="material-symbols:person-rounded" />
						</div>
						<div class="comment-content">
							<div class="comment-meta">
								<strong>Ẩn danh</strong>
								<span>{formatDate(comment.created_at)}</span>
							</div>
							<p>{comment.body}</p>
						</div>
						{#if isAdmin}
							<button
								class="comment-remove"
								type="button"
								aria-label="Xóa bình luận"
								disabled={adminLoading}
								onclick={() => deleteComment(comment)}
							>
								<Icon icon="material-symbols:close-rounded" />
							</button>
						{/if}
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

	.comment-form,
	.admin-login {
		display: grid;
		gap: 0.65rem;
	}

	textarea,
	.admin-login input {
		width: 100%;
		border: 1px solid var(--card-border);
		border-radius: 0.9rem;
		background: var(--btn-regular-bg);
		color: rgb(0 0 0 / 0.78);
		font: inherit;
		outline: none;
		transition: border-color 160ms ease, background 160ms ease, box-shadow 160ms ease;
	}

	textarea {
		min-height: 7rem;
		resize: vertical;
		padding: 0.85rem 0.95rem;
		line-height: 1.6;
	}

	.admin-login input {
		min-height: 2.65rem;
		padding: 0 0.85rem;
	}

	textarea::placeholder,
	.admin-login input::placeholder {
		color: rgb(0 0 0 / 0.35);
	}

	textarea:focus,
	.admin-login input:focus {
		border-color: color-mix(in oklch, var(--primary), transparent 45%);
		background: var(--card-bg);
		box-shadow: 0 0 0 4px color-mix(in oklch, var(--primary), transparent 88%);
	}

	:global(.dark) textarea,
	:global(.dark) .admin-login input {
		color: rgb(255 255 255 / 0.82);
	}

	:global(.dark) textarea::placeholder,
	:global(.dark) .admin-login input::placeholder {
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

	.comment-actions span.error,
	.comment-error {
		color: #d04444;
	}

	.comment-notice {
		color: color-mix(in oklch, var(--primary), black 18%);
		font-size: 0.86rem;
		font-weight: 800;
	}

	:global(.dark) .comment-notice {
		color: color-mix(in oklch, var(--primary), white 24%);
	}

	.comment-actions button,
	.comment-remove,
	.admin-toggle,
	.admin-login button,
	.admin-bar button,
	.moderation-actions button {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		border: 1px solid transparent;
		font: inherit;
		cursor: pointer;
		transition: transform 160ms ease, background 160ms ease, border-color 160ms ease;
	}

	.comment-actions button,
	.admin-login button {
		gap: 0.45rem;
		min-height: 2.5rem;
		border-radius: 999px;
		background: var(--primary);
		color: white;
		padding: 0 0.95rem;
		font-weight: 800;
		box-shadow: 0 10px 22px color-mix(in oklch, var(--primary), transparent 72%);
	}

	button:disabled {
		cursor: not-allowed;
		opacity: 0.58;
	}

	.comment-actions button:not(:disabled):hover,
	.comment-actions button:not(:disabled):focus-visible,
	.admin-login button:not(:disabled):hover,
	.admin-login button:not(:disabled):focus-visible {
		transform: translateY(-1px);
		filter: brightness(1.04);
		outline: none;
	}

	.comment-actions button:active,
	.comment-remove:active,
	.admin-toggle:active,
	.admin-login button:active,
	.admin-bar button:active,
	.moderation-actions button:active {
		transform: scale(0.96);
	}

	.comment-error {
		font-size: 0.86rem;
		font-weight: 700;
	}

	.admin-shell {
		margin-top: 0.85rem;
	}

	.admin-toggle {
		gap: 0.4rem;
		min-height: 2.35rem;
		border-color: var(--card-border);
		border-radius: 999px;
		background: var(--btn-regular-bg);
		color: var(--btn-content);
		padding: 0 0.8rem;
		font-weight: 800;
	}

	.admin-toggle:hover,
	.admin-toggle:focus-visible {
		background: var(--btn-regular-bg-hover);
		outline: none;
	}

	.admin-panel {
		margin-top: 0.65rem;
		border: 1px solid var(--card-border);
		border-radius: 0.9rem;
		background: color-mix(in oklch, var(--btn-regular-bg), transparent 18%);
		padding: 0.85rem;
	}

	.admin-bar,
	.moderation-title {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.75rem;
	}

	.admin-bar {
		margin-bottom: 0.9rem;
		color: var(--btn-content);
		font-size: 0.86rem;
		font-weight: 800;
	}

	.admin-bar button,
	.moderation-actions button {
		min-height: 2rem;
		border-color: var(--card-border);
		border-radius: 999px;
		background: var(--btn-regular-bg);
		color: var(--btn-content);
		padding: 0 0.7rem;
		font-size: 0.82rem;
		font-weight: 800;
	}

	.admin-bar button:hover,
	.admin-bar button:focus-visible,
	.moderation-actions button:hover,
	.moderation-actions button:focus-visible {
		background: var(--btn-regular-bg-hover);
		outline: none;
	}

	.moderation-title {
		margin-bottom: 0.65rem;
		color: var(--btn-content);
		font-weight: 850;
	}

	.moderation-title strong {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-width: 1.55rem;
		height: 1.55rem;
		border-radius: 999px;
		background: var(--primary);
		color: white;
		font-size: 0.78rem;
	}

	.comment-list {
		display: grid;
		gap: 0.65rem;
		margin-top: 1rem;
	}

	.compact-list {
		margin-top: 0;
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

	.comment-empty.compact {
		min-height: 3rem;
		font-size: 0.86rem;
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

	.comment-item.pending {
		grid-template-columns: 2.25rem minmax(0, 1fr);
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

	.moderation-actions {
		grid-column: 2;
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	@media (max-width: 640px) {
		.comment-panel {
			padding: 0.85rem;
		}

		.comment-heading,
		.comment-actions,
		.admin-bar {
			align-items: flex-start;
			flex-direction: column;
		}

		.comment-actions button,
		.admin-login button {
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
