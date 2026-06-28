const ownerEmail = "thanhtungbtlg@gmail.com";

type AdminCommentNotification = {
	slug: string;
	content: string;
	commentId: string;
	parentId?: string;
	authorName: string;
};

type ReplyNotification = {
	to: string;
	slug: string;
	originalBody: string;
	replyBody: string;
	replierName: string;
};

export async function sendAdminCommentNotification({
	slug,
	content,
	commentId,
	parentId,
	authorName,
}: AdminCommentNotification) {
	const siteUrl = getSiteUrl();
	const adminUrl = `${siteUrl}/admin/`;
	const postUrl = `${siteUrl}/posts/${encodeURIComponent(slug)}/`;
	const safeContent = multilineHtml(content);
	const title = parentId
		? "Bình luận trả lời mới đang chờ duyệt"
		: "Bình luận mới đang chờ duyệt";

	await sendEmail({
		to: env("COMMENT_NOTIFICATION_TO") || ownerEmail,
		subject: `${title}: ${slug}`,
		text: `${authorName}: ${content}\n\nDuyệt: ${adminUrl}\nXem bài: ${postUrl}`,
		html: `<h2>${title}</h2><p><strong>Bài viết:</strong> ${escapeHtml(slug)}</p><p><strong>Người gửi:</strong> ${escapeHtml(authorName)}</p>${parentId ? `<p><strong>Trả lời cho:</strong> ${escapeHtml(parentId)}</p>` : ""}<blockquote>${safeContent}</blockquote><p><a href="${adminUrl}">Mở trang quản trị</a> · <a href="${postUrl}">Xem bài viết</a></p><small>ID: ${escapeHtml(commentId)}</small>`,
	});
}

export async function sendCommentReplyNotification({
	to,
	slug,
	originalBody,
	replyBody,
	replierName,
}: ReplyNotification) {
	const postUrl = `${getSiteUrl()}/posts/${encodeURIComponent(slug)}/#comments`;
	await sendEmail({
		to,
		subject: "Có phản hồi mới cho bình luận của bạn",
		text: `Bình luận của bạn:\n${originalBody}\n\n${replierName} đã phản hồi:\n${replyBody}\n\nXem phản hồi: ${postUrl}\n\nEmail này được gửi vì bạn đã chọn nhận thông báo phản hồi.`,
		html: `<h2>Có phản hồi mới</h2><p><strong>Bình luận của bạn:</strong></p><blockquote>${multilineHtml(originalBody)}</blockquote><p><strong>${escapeHtml(replierName)} đã phản hồi:</strong></p><blockquote>${multilineHtml(replyBody)}</blockquote><p><a href="${postUrl}">Xem phản hồi trên blog</a></p><small>Email này được gửi vì bạn đã chọn nhận thông báo phản hồi. Email của bạn không hiển thị công khai.</small>`,
	});
}

async function sendEmail({
	to,
	subject,
	text,
	html,
}: {
	to: string;
	subject: string;
	text: string;
	html: string;
}) {
	const apiKey = env("RESEND_API_KEY");
	if (!apiKey) return;

	const result = await fetch("https://api.resend.com/emails", {
		method: "POST",
		headers: {
			Authorization: `Bearer ${apiKey}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			from:
				env("COMMENT_NOTIFICATION_FROM") ||
				"Thanh Tung Blog <onboarding@resend.dev>",
			to: [to],
			subject,
			text,
			html,
		}),
	});

	if (!result.ok) {
		throw new Error(
			`Resend notification failed (${result.status}): ${await result.text()}`,
		);
	}
}

function multilineHtml(value: string) {
	return escapeHtml(value).replace(/\n/g, "<br>");
}

function escapeHtml(value: string) {
	return value.replace(/[&<>"']/g, (character) => {
		const entities: Record<string, string> = {
			"&": "&amp;",
			"<": "&lt;",
			">": "&gt;",
			'"': "&quot;",
			"'": "&#39;",
		};
		return entities[character];
	});
}

function getSiteUrl() {
	const explicit = env("PUBLIC_SITE_URL").replace(/\/$/, "");
	if (explicit) return explicit;
	const vercelUrl = env("VERCEL_PROJECT_PRODUCTION_URL");
	return vercelUrl ? `https://${vercelUrl}` : "https://www.thanhtung0209.com";
}

function env(name: string) {
	return process.env[name] ?? "";
}
