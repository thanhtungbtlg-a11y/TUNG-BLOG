import { getPublicSiteUrl } from "./site-url.js";

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
	const siteUrl = getPublicSiteUrl();
	const adminUrl = `${siteUrl}/admin/`;
	const postUrl = `${siteUrl}/posts/${encodeURIComponent(slug)}/`;
	const safeContent = multilineHtml(content);
	const title = parentId
		? "New reply awaiting approval"
		: "New comment awaiting approval";

	await sendEmail({
		to: env("COMMENT_NOTIFICATION_TO") || ownerEmail,
		subject: `${title}: ${slug}`,
		text: `${authorName}: ${content}\n\nReview: ${adminUrl}\nView post: ${postUrl}`,
		html: `<h2>${title}</h2><p><strong>Post:</strong> ${escapeHtml(slug)}</p><p><strong>Submitted by:</strong> ${escapeHtml(authorName)}</p>${parentId ? `<p><strong>Replying to:</strong> ${escapeHtml(parentId)}</p>` : ""}<blockquote>${safeContent}</blockquote><p><a href="${adminUrl}">Open admin</a> · <a href="${postUrl}">View post</a></p><small>ID: ${escapeHtml(commentId)}</small>`,
	});
}

export async function sendCommentReplyNotification({
	to,
	slug,
	originalBody,
	replyBody,
	replierName,
}: ReplyNotification) {
	const postUrl = `${getPublicSiteUrl()}/posts/${encodeURIComponent(slug)}/#comments`;
	await sendEmail({
		to,
		subject: "A new reply to your comment",
		text: `Your comment:\n${originalBody}\n\n${replierName} replied:\n${replyBody}\n\nView the reply: ${postUrl}\n\nYou received this email because you opted in to reply notifications.`,
		html: `<h2>You have a new reply</h2><p><strong>Your comment:</strong></p><blockquote>${multilineHtml(originalBody)}</blockquote><p><strong>${escapeHtml(replierName)} replied:</strong></p><blockquote>${multilineHtml(replyBody)}</blockquote><p><a href="${postUrl}">View the reply on the blog</a></p><small>You received this email because you opted in to reply notifications. Your email address is never displayed publicly.</small>`,
	});
}

export async function sendCommentEmailTest() {
	const siteUrl = getPublicSiteUrl();
	await sendEmail({
		to: env("COMMENT_NOTIFICATION_TO") || ownerEmail,
		subject: "Comment notification test - Thanh Tung Blog",
		text: `Comment notification email is working.\n\nWebsite: ${siteUrl}`,
		html: `<h2>Email notifications are working</h2><p>Resend successfully delivered this test message from the blog.</p><p><a href="${siteUrl}">Open website</a></p>`,
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
	if (!apiKey) throw new Error("RESEND_API_KEY is not configured");

	for (let attempt = 0; attempt < 2; attempt += 1) {
		const result = await fetch("https://api.resend.com/emails", {
			method: "POST",
			headers: {
				Authorization: `Bearer ${apiKey}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				from:
					env("COMMENT_NOTIFICATION_FROM").trim() ||
					"Thanh Tung Blog <onboarding@resend.dev>",
				to: [to],
				subject,
				text,
				html,
			}),
		});

		if (result.ok) return;
		const details = await result.text();
		const retryable = result.status === 429 || result.status >= 500;
		if (!retryable || attempt === 1) {
			throw new Error(
				`Resend notification failed (${result.status}): ${details}`,
			);
		}
		await new Promise((resolve) => setTimeout(resolve, 450));
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

function env(name: string) {
	return process.env[name] ?? "";
}
