<script lang="ts">
import Icon from "@iconify/svelte";
import { createClient, type Session } from "@supabase/supabase-js";
import { onMount, tick } from "svelte";

type PostSummary = {
	slug: string;
	title: string;
	published: string;
	category: string;
	pinned: boolean;
	latest: boolean;
	draft: boolean;
};

type EditorPost = {
	slug: string;
	title: string;
	published: string;
	description: string;
	image: string;
	tags: string;
	category: string;
	lang: string;
	draft: boolean;
	pinned: boolean;
	pinOrder: number;
	latest: boolean;
	latestOrder: number;
	body: string;
};

type BlogComment = {
	id: string;
	slug: string;
	body: string;
	status: "pending" | "approved";
	created_at: string;
};

let { posts: initialPosts } = $props<{ posts: PostSummary[] }>();

const env = import.meta.env as Record<string, string | undefined>;
const supabaseUrl =
	env.PUBLIC_SUPABASE_URL ?? env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseKey =
	env.PUBLIC_SUPABASE_ANON_KEY ??
	env.PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
	env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
	env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
	"";
const supabase =
	supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

let posts = $state([...initialPosts]);
let session = $state<Session | null>(null);
let authReady = $state(false);
let isAdmin = $state(false);
let email = $state("");
let password = $state("");
let activeTab = $state<"posts" | "comments">("posts");
let selectedSlug = $state("");
let postSearch = $state("");
let commentStatus = $state<"all" | "pending" | "approved">("pending");
let commentSlug = $state("all");
let comments = $state<BlogComment[]>([]);
let editor = $state(createEmptyPost());
let busy = $state(false);
let uploading = $state(false);
let error = $state("");
let notice = $state("");
let fileInput: HTMLInputElement;
let bodyTextarea: HTMLTextAreaElement;

onMount(() => {
	if (!supabase) {
		authReady = true;
		return;
	}

	void restoreSession();
	const {
		data: { subscription },
	} = supabase.auth.onAuthStateChange((_event, nextSession) => {
		session = nextSession;
		void verifyAdmin();
	});

	return () => subscription.unsubscribe();
});

async function restoreSession() {
	if (!supabase) return;
	const { data } = await supabase.auth.getSession();
	session = data.session;
	await verifyAdmin();
	authReady = true;
}

async function verifyAdmin() {
	if (!supabase || !session?.user) {
		isAdmin = false;
		return;
	}

	const { data } = await supabase
		.from("comment_admins")
		.select("user_id")
		.eq("user_id", session.user.id)
		.maybeSingle();
	isAdmin = Boolean(data);
	if (isAdmin) await loadComments();
}

async function signIn() {
	if (!supabase || busy) return;
	busy = true;
	error = "";
	const { data, error: signInError } = await supabase.auth.signInWithPassword({
		email: email.trim(),
		password,
	});
	busy = false;
	if (signInError) {
		error = "Không đăng nhập được. Kiểm tra lại email và mật khẩu.";
		return;
	}
	session = data.session;
	password = "";
	await verifyAdmin();
	if (!isAdmin) error = "Tài khoản này chưa có quyền quản trị.";
}

async function signOut() {
	await supabase?.auth.signOut();
	session = null;
	isAdmin = false;
	selectedSlug = "";
	editor = createEmptyPost();
	comments = [];
}

function createEmptyPost(): EditorPost {
	return {
		slug: "",
		title: "",
		published: new Date().toISOString().slice(0, 10),
		description: "",
		image: "",
		tags: "",
		category: "Nhật ký cá nhân",
		lang: "vi",
		draft: false,
		pinned: false,
		pinOrder: 0,
		latest: true,
		latestOrder: 0,
		body: "",
	};
}

function newPost() {
	selectedSlug = "";
	editor = createEmptyPost();
	clearMessages();
}

async function loadPost(slug: string) {
	if (busy) return;
	busy = true;
	clearMessages();
	try {
		const result = await adminFetch(
			`/api/admin/post/${encodeURIComponent(slug)}`,
		);
		const data = result.data ?? {};
		selectedSlug = slug;
		editor = {
			slug,
			title: data.title ?? "",
			published: data.published ?? "",
			description: data.description ?? "",
			image: data.image ?? "",
			tags: Array.isArray(data.tags) ? data.tags.join(", ") : "",
			category: data.category ?? "",
			lang: data.lang ?? "vi",
			draft: Boolean(data.draft),
			pinned: Boolean(data.pinned),
			pinOrder: Number(data.pinOrder ?? 0),
			latest: Boolean(data.latest),
			latestOrder: Number(data.latestOrder ?? 0),
			body: result.body ?? "",
		};
	} catch (loadError) {
		error = errorMessage(loadError);
	} finally {
		busy = false;
	}
}

async function savePost() {
	if (busy) return;
	const slug = selectedSlug || editor.slug.trim() || slugify(editor.title);
	if (!slug || !editor.title.trim()) {
		error = "Nhập tiêu đề và slug trước khi lưu.";
		return;
	}

	busy = true;
	clearMessages();
	try {
		await adminFetch(`/api/admin/post/${encodeURIComponent(slug)}`, {
			method: "PUT",
			body: JSON.stringify({
				...editor,
				tags: editor.tags
					.split(",")
					.map((tag) => tag.trim())
					.filter(Boolean),
			}),
		});
		selectedSlug = slug;
		editor.slug = slug;
		const summary: PostSummary = {
			slug,
			title: editor.title,
			published: editor.published,
			category: editor.category,
			pinned: editor.pinned,
			latest: editor.latest,
			draft: editor.draft,
		};
		const index = posts.findIndex((post) => post.slug === slug);
		if (index >= 0) posts[index] = summary;
		else posts = [summary, ...posts];
		notice = "Đã lưu vào GitHub. Vercel đang triển khai bản mới.";
	} catch (saveError) {
		error = errorMessage(saveError);
	} finally {
		busy = false;
	}
}

async function uploadImage(event: Event) {
	const input = event.currentTarget as HTMLInputElement;
	const file = input.files?.[0];
	if (!file) return;

	const slug = selectedSlug || editor.slug.trim() || slugify(editor.title);
	if (!slug) {
		error = "Nhập tiêu đề hoặc slug trước khi tải ảnh.";
		input.value = "";
		return;
	}

	uploading = true;
	clearMessages();
	try {
		const compressed = await compressImage(file);
		const stem = slugify(file.name.replace(/\.[^.]+$/, "")) || "image";
		const filename = `${Date.now()}-${stem}.webp`;
		const result = await adminFetch("/api/admin/upload", {
			method: "POST",
			body: JSON.stringify({
				slug,
				filename,
				contentBase64: await blobToBase64(compressed),
			}),
		});
		insertImageMarkdown(result.filename);
		if (!editor.image) editor.image = result.filename;
		notice = "Đã tải và chèn ảnh WebP vào nội dung.";
	} catch (uploadError) {
		error = errorMessage(uploadError);
	} finally {
		uploading = false;
		input.value = "";
	}
}

function insertImageMarkdown(filename: string) {
	const start = bodyTextarea?.selectionStart ?? editor.body.length;
	const end = bodyTextarea?.selectionEnd ?? start;
	const markdown = `\n\n![Mô tả ảnh](${filename})\n\n`;
	editor.body = `${editor.body.slice(0, start)}${markdown}${editor.body.slice(end)}`;
	void tick().then(() => {
		bodyTextarea?.focus();
		bodyTextarea?.setSelectionRange(
			start + markdown.length,
			start + markdown.length,
		);
	});
}

async function loadComments() {
	if (!supabase || !isAdmin) return;
	const { data, error: loadError } = await supabase
		.from("blog_comments")
		.select("id,slug,body,status,created_at")
		.order("created_at", { ascending: false });
	if (loadError) {
		error = "Không tải được bình luận.";
		return;
	}
	comments = (data ?? []) as BlogComment[];
}

async function approveComment(comment: BlogComment) {
	if (!supabase || !session?.user || busy) return;
	busy = true;
	const { error: updateError } = await supabase
		.from("blog_comments")
		.update({
			status: "approved",
			approved_at: new Date().toISOString(),
			approved_by: session.user.id,
		})
		.eq("id", comment.id);
	busy = false;
	if (updateError) error = "Chưa duyệt được bình luận.";
	else {
		comment.status = "approved";
		notice = "Đã duyệt bình luận.";
	}
}

async function deleteComment(comment: BlogComment) {
	if (!supabase || busy || !window.confirm("Xóa bình luận này?")) return;
	busy = true;
	const { error: deleteError } = await supabase
		.from("blog_comments")
		.delete()
		.eq("id", comment.id);
	busy = false;
	if (deleteError) error = "Chưa xóa được bình luận.";
	else comments = comments.filter((item) => item.id !== comment.id);
}

function visiblePosts() {
	const query = postSearch.trim().toLocaleLowerCase("vi");
	return posts
		.filter((post) =>
			query
				? `${post.title} ${post.slug}`.toLocaleLowerCase("vi").includes(query)
				: true,
		)
		.sort((a, b) => b.published.localeCompare(a.published));
}

function visibleComments() {
	return comments.filter(
		(comment) =>
			(commentStatus === "all" || comment.status === commentStatus) &&
			(commentSlug === "all" || comment.slug === commentSlug),
	);
}

function commentSlugs() {
	return [...new Set(comments.map((comment) => comment.slug))].sort();
}

async function adminFetch(path: string, init: RequestInit = {}) {
	if (!session?.access_token) throw new Error("Bạn chưa đăng nhập.");
	const response = await fetch(path, {
		...init,
		headers: {
			Authorization: `Bearer ${session.access_token}`,
			"Content-Type": "application/json",
			...init.headers,
		},
	});
	const data = await response.json();
	if (!response.ok) throw new Error(data.error ?? "Yêu cầu chưa hoàn tất.");
	return data;
}

async function compressImage(file: File) {
	const bitmap = await createImageBitmap(file);
	const scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height));
	const canvas = document.createElement("canvas");
	canvas.width = Math.max(1, Math.round(bitmap.width * scale));
	canvas.height = Math.max(1, Math.round(bitmap.height * scale));
	canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
	bitmap.close();
	return new Promise<Blob>((resolve, reject) =>
		canvas.toBlob(
			(blob) =>
				blob ? resolve(blob) : reject(new Error("Không nén được ảnh.")),
			"image/webp",
			0.82,
		),
	);
}

async function blobToBase64(blob: Blob) {
	const bytes = new Uint8Array(await blob.arrayBuffer());
	let binary = "";
	for (let index = 0; index < bytes.length; index += 0x8000) {
		binary += String.fromCharCode(...bytes.subarray(index, index + 0x8000));
	}
	return btoa(binary);
}

function slugify(value: string) {
	return value
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.replace(/đ/g, "d")
		.replace(/Đ/g, "D")
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "");
}

function formatDate(value: string) {
	return new Date(value).toLocaleString("vi-VN", {
		dateStyle: "medium",
		timeStyle: "short",
	});
}

function clearMessages() {
	error = "";
	notice = "";
}

function errorMessage(value: unknown) {
	return value instanceof Error ? value.message : "Yêu cầu chưa hoàn tất.";
}
</script>

{#if !authReady}
	<div class="admin-loading"><Icon icon="material-symbols:progress-activity" /> Đang kiểm tra phiên...</div>
{:else if !supabase}
	<div class="admin-loading error">Supabase chưa được cấu hình.</div>
{:else if !isAdmin}
	<section class="login-panel card-base">
		<div class="login-icon"><Icon icon="material-symbols:admin-panel-settings-outline-rounded" /></div>
		<h1>Quản trị blog</h1>
		<form onsubmit={(event) => { event.preventDefault(); void signIn(); }}>
			<label>Email<input type="email" autocomplete="username" bind:value={email} required /></label>
			<label>Mật khẩu<input type="password" autocomplete="current-password" bind:value={password} required /></label>
			<button type="submit" disabled={busy}><Icon icon="material-symbols:login-rounded" /> Đăng nhập</button>
		</form>
		{#if error}<p class="feedback error">{error}</p>{/if}
	</section>
{:else}
	<section class="admin-shell card-base">
		<header class="admin-header">
			<div>
				<h1>Quản trị blog</h1>
				<p>{session?.user.email}</p>
			</div>
			<button class="icon-button" type="button" title="Đăng xuất" aria-label="Đăng xuất" onclick={signOut}>
				<Icon icon="material-symbols:logout-rounded" />
			</button>
		</header>

		<nav class="admin-tabs" aria-label="Khu vực quản trị">
			<button class:active={activeTab === "posts"} type="button" onclick={() => (activeTab = "posts")}>
				<Icon icon="material-symbols:article-outline-rounded" /> Bài viết
			</button>
			<button class:active={activeTab === "comments"} type="button" onclick={() => (activeTab = "comments")}>
				<Icon icon="material-symbols:forum-outline-rounded" /> Bình luận
				{#if comments.some((comment) => comment.status === "pending")}<span class="dot"></span>{/if}
			</button>
		</nav>

		{#if error}<div class="feedback error" role="alert">{error}</div>{/if}
		{#if notice}<div class="feedback notice" role="status">{notice}</div>{/if}

		{#if activeTab === "posts"}
			<div class="post-workspace">
				<aside class="post-browser">
					<div class="browser-tools">
						<label class="search-field"><Icon icon="material-symbols:search-rounded" /><input aria-label="Tìm bài" placeholder="Tìm bài" bind:value={postSearch} /></label>
						<button class="icon-button primary" type="button" title="Bài mới" aria-label="Tạo bài mới" onclick={newPost}><Icon icon="material-symbols:add-rounded" /></button>
					</div>
					<div class="post-list">
						{#each visiblePosts() as post}
							<button class:active={selectedSlug === post.slug} type="button" onclick={() => loadPost(post.slug)}>
								<span>{post.title}</span>
								<small>{post.published}{post.pinned ? " · Ghim" : post.latest ? " · Mới" : ""}</small>
							</button>
						{/each}
					</div>
				</aside>

				<form class="post-editor" onsubmit={(event) => { event.preventDefault(); void savePost(); }}>
					<div class="form-grid">
						<label class="wide-field">Tiêu đề<input bind:value={editor.title} oninput={() => { if (!selectedSlug) editor.slug = slugify(editor.title); }} required /></label>
						<label>Slug<input bind:value={editor.slug} disabled={Boolean(selectedSlug)} required /></label>
						<label>Ngày đăng<input type="date" bind:value={editor.published} required /></label>
						<label>Danh mục<input bind:value={editor.category} /></label>
						<label>Thẻ<input bind:value={editor.tags} placeholder="nhật ký, cuộc sống" /></label>
						<label class="wide-field">Mô tả<input bind:value={editor.description} /></label>
						<label class="wide-field">Ảnh bìa<input bind:value={editor.image} /></label>
						<label>Ngôn ngữ<input bind:value={editor.lang} /></label>
						<label class="number-field">Thứ tự ghim<input type="number" min="0" bind:value={editor.pinOrder} /></label>
						<label class="number-field">Thứ tự mới<input type="number" min="0" bind:value={editor.latestOrder} /></label>
					</div>

					<div class="toggle-row">
						<label><input type="checkbox" bind:checked={editor.pinned} /> Ghim</label>
						<label><input type="checkbox" bind:checked={editor.latest} /> Mới nhất</label>
						<label><input type="checkbox" bind:checked={editor.draft} /> Bản nháp</label>
					</div>

					<div class="editor-toolbar">
						<strong>Nội dung</strong>
						<button type="button" disabled={uploading} onclick={() => fileInput.click()} title="Tải và chèn ảnh">
							<Icon icon="material-symbols:add-photo-alternate-outline-rounded" /> {uploading ? "Đang tải" : "Ảnh"}
						</button>
						<input class="file-input" bind:this={fileInput} type="file" accept="image/*" onchange={uploadImage} />
					</div>
					<textarea class="body-editor" bind:this={bodyTextarea} bind:value={editor.body} aria-label="Nội dung Markdown"></textarea>

					<div class="editor-actions">
						{#if selectedSlug}<a href={`/posts/${selectedSlug}/`} target="_blank" rel="noopener"><Icon icon="material-symbols:open-in-new-rounded" /> Xem bài</a>{/if}
						<button class="save-button" type="submit" disabled={busy}><Icon icon="material-symbols:save-outline-rounded" /> {busy ? "Đang lưu" : "Lưu bài"}</button>
					</div>
				</form>
			</div>
		{:else}
			<div class="comment-tools">
				<select aria-label="Trạng thái" bind:value={commentStatus}>
					<option value="pending">Chờ duyệt</option>
					<option value="approved">Đã duyệt</option>
					<option value="all">Tất cả</option>
				</select>
				<select aria-label="Bài viết" bind:value={commentSlug}>
					<option value="all">Tất cả bài viết</option>
					{#each commentSlugs() as slug}<option value={slug}>{slug}</option>{/each}
				</select>
				<button class="icon-button" type="button" title="Tải lại" aria-label="Tải lại bình luận" onclick={loadComments}><Icon icon="material-symbols:refresh-rounded" /></button>
			</div>
			<div class="moderation-list">
				{#each visibleComments() as comment}
					<article>
						<div class="comment-row-meta"><strong>{comment.slug}</strong><span>{formatDate(comment.created_at)}</span></div>
						<p>{comment.body}</p>
						<div class="moderation-actions">
							{#if comment.status === "pending"}<button type="button" onclick={() => approveComment(comment)} disabled={busy}><Icon icon="material-symbols:check-rounded" /> Duyệt</button>{/if}
							<button class="danger" type="button" onclick={() => deleteComment(comment)} disabled={busy} title="Xóa bình luận"><Icon icon="material-symbols:delete-outline-rounded" /></button>
						</div>
					</article>
				{:else}
					<div class="empty-state">Không có bình luận phù hợp.</div>
				{/each}
			</div>
		{/if}
	</section>
{/if}

<style>
	.admin-loading,
	.empty-state {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		min-height: 12rem;
		color: var(--meta-color);
	}

	.login-panel {
		width: min(100%, 26rem);
		margin: 4rem auto;
		padding: 1.5rem;
		border-radius: 8px;
	}

	.login-icon {
		display: grid;
		place-items: center;
		width: 2.75rem;
		height: 2.75rem;
		border-radius: 8px;
		background: color-mix(in oklch, var(--primary), transparent 82%);
		color: var(--primary);
		font-size: 1.5rem;
	}

	h1 {
		margin: 0.75rem 0 1rem;
		font-size: 1.35rem;
		color: var(--content-color);
	}

	.login-panel form,
	.post-editor {
		display: grid;
		gap: 0.85rem;
	}

	label {
		display: grid;
		gap: 0.35rem;
		font-size: 0.78rem;
		font-weight: 750;
		color: var(--meta-color);
	}

	input,
	select,
	textarea {
		width: 100%;
		border: 1px solid var(--card-border);
		border-radius: 6px;
		background: var(--btn-regular-bg);
		color: var(--content-color);
		font: inherit;
		outline: none;
	}

	input,
	select {
		min-height: 2.5rem;
		padding: 0 0.7rem;
	}

	input:focus,
	select:focus,
	textarea:focus {
		border-color: color-mix(in oklch, var(--primary), transparent 42%);
		box-shadow: 0 0 0 3px color-mix(in oklch, var(--primary), transparent 88%);
	}

	button,
	.editor-actions a {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.4rem;
		min-height: 2.4rem;
		padding: 0 0.8rem;
		border: 1px solid var(--card-border);
		border-radius: 6px;
		background: var(--btn-regular-bg);
		color: var(--content-color);
		font: inherit;
		font-weight: 750;
		cursor: pointer;
		transition: transform 160ms ease, background 160ms ease, border-color 160ms ease;
	}

	button:not(:disabled):hover,
	.editor-actions a:hover {
		transform: translateY(-1px);
		background: var(--btn-regular-bg-hover);
	}

	button:disabled {
		opacity: 0.55;
		cursor: wait;
	}

	.login-panel button,
	.save-button,
	.icon-button.primary {
		border-color: transparent;
		background: var(--primary);
		color: white;
	}

	.admin-shell {
		min-height: calc(100vh - 7rem);
		padding: 1rem;
		border-radius: 8px;
	}

	.admin-header,
	.admin-tabs,
	.browser-tools,
	.editor-toolbar,
	.editor-actions,
	.comment-tools,
	.comment-row-meta,
	.moderation-actions {
		display: flex;
		align-items: center;
	}

	.admin-header {
		justify-content: space-between;
		padding-bottom: 0.85rem;
		border-bottom: 1px solid var(--line-divider);
	}

	.admin-header h1 {
		margin: 0;
	}

	.admin-header p {
		margin: 0.2rem 0 0;
		font-size: 0.78rem;
		color: var(--meta-color);
	}

	.icon-button {
		width: 2.5rem;
		padding: 0;
	}

	.admin-tabs {
		gap: 0.35rem;
		padding: 0.75rem 0;
	}

	.admin-tabs button {
		position: relative;
	}

	.admin-tabs button.active {
		border-color: color-mix(in oklch, var(--primary), transparent 55%);
		background: color-mix(in oklch, var(--primary), transparent 84%);
		color: var(--primary);
	}

	.dot {
		width: 0.45rem;
		height: 0.45rem;
		border-radius: 50%;
		background: #e5484d;
	}

	.feedback {
		margin-bottom: 0.75rem;
		padding: 0.65rem 0.75rem;
		border-radius: 6px;
		font-size: 0.82rem;
	}

	.feedback.error {
		background: rgb(220 38 38 / 0.1);
		color: #dc2626;
	}

	.feedback.notice {
		background: rgb(22 163 74 / 0.1);
		color: #15803d;
	}

	.post-workspace {
		display: grid;
		grid-template-columns: 15rem minmax(0, 1fr);
		min-height: 42rem;
		border-top: 1px solid var(--line-divider);
	}

	.post-browser {
		padding: 0.8rem 0.8rem 0 0;
		border-right: 1px solid var(--line-divider);
	}

	.browser-tools {
		gap: 0.45rem;
	}

	.search-field {
		position: relative;
		flex: 1;
	}

	.search-field :global(svg) {
		position: absolute;
		left: 0.65rem;
		top: 0.75rem;
		z-index: 1;
	}

	.search-field input {
		padding-left: 2rem;
	}

	.post-list {
		display: grid;
		gap: 0.2rem;
		max-height: 37rem;
		margin-top: 0.65rem;
		overflow: auto;
	}

	.post-list button {
		display: grid;
		justify-items: start;
		gap: 0.2rem;
		min-width: 0;
		padding: 0.6rem;
		text-align: left;
		background: transparent;
	}

	.post-list button.active {
		border-color: color-mix(in oklch, var(--primary), transparent 58%);
		background: color-mix(in oklch, var(--primary), transparent 88%);
	}

	.post-list span {
		max-width: 100%;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.post-list small {
		color: var(--meta-color);
		font-weight: 500;
	}

	.post-editor {
		align-content: start;
		padding: 0.8rem 0 0 1rem;
	}

	.form-grid {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 0.7rem;
	}

	.wide-field {
		grid-column: span 2;
	}

	.toggle-row {
		display: flex;
		flex-wrap: wrap;
		gap: 1rem;
	}

	.toggle-row label {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
	}

	.toggle-row input {
		width: 1rem;
		min-height: 1rem;
		accent-color: var(--primary);
	}

	.editor-toolbar,
	.editor-actions {
		justify-content: space-between;
		gap: 0.5rem;
	}

	.editor-toolbar button {
		min-height: 2rem;
	}

	.file-input {
		display: none;
	}

	.body-editor {
		min-height: 22rem;
		padding: 0.85rem;
		resize: vertical;
		font-family: "JetBrains Mono Variable", monospace;
		font-size: 0.85rem;
		line-height: 1.6;
	}

	.editor-actions {
		justify-content: flex-end;
	}

	.comment-tools {
		gap: 0.5rem;
		padding: 0.75rem 0;
		border-top: 1px solid var(--line-divider);
	}

	.comment-tools select {
		width: auto;
		min-width: 10rem;
	}

	.moderation-list {
		display: grid;
		gap: 0.5rem;
	}

	.moderation-list article {
		display: grid;
		grid-template-columns: minmax(0, 1fr) auto;
		gap: 0.55rem 1rem;
		padding: 0.8rem;
		border: 1px solid var(--card-border);
		border-radius: 6px;
		background: color-mix(in oklch, var(--card-bg), transparent 14%);
	}

	.comment-row-meta,
	.moderation-list p {
		grid-column: 1;
	}

	.comment-row-meta {
		gap: 0.6rem;
		font-size: 0.75rem;
		color: var(--meta-color);
	}

	.moderation-list p {
		margin: 0;
		white-space: pre-wrap;
		line-height: 1.55;
		color: var(--content-color);
	}

	.moderation-actions {
		grid-column: 2;
		grid-row: 1 / span 2;
		gap: 0.4rem;
	}

	.moderation-actions .danger {
		width: 2.4rem;
		padding: 0;
		color: #dc2626;
	}

	@media (max-width: 900px) {
		.post-workspace {
			grid-template-columns: 1fr;
		}

		.post-browser {
			padding-right: 0;
			padding-bottom: 0.8rem;
			border-right: 0;
			border-bottom: 1px solid var(--line-divider);
		}

		.post-list {
			grid-template-columns: repeat(2, minmax(0, 1fr));
			max-height: 13rem;
		}

		.post-editor {
			padding-left: 0;
		}
	}

	@media (max-width: 640px) {
		.admin-shell {
			padding: 0.75rem;
		}

		.form-grid,
		.post-list {
			grid-template-columns: 1fr;
		}

		.wide-field {
			grid-column: span 1;
		}

		.comment-tools {
			align-items: stretch;
			flex-direction: column;
		}

		.comment-tools select {
			width: 100%;
		}

		.moderation-list article {
			grid-template-columns: 1fr;
		}

		.moderation-actions {
			grid-column: 1;
			grid-row: auto;
		}
	}
</style>
