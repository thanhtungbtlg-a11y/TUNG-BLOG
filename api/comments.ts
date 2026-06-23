import { createHash } from "node:crypto";
import { createClient } from "@supabase/supabase-js";

type ApiRequest = {
	method?: string;
	headers: Record<string, string | string[] | undefined>;
	body?: unknown;
};

type ApiResponse = {
	status: (code: number) => ApiResponse;
	json: (data: unknown) => void;
};

const notificationEmail = "thanhtungbtlg@gmail.com";
const maxLength = 600;

export default async function handler(
	request: ApiRequest,
	response: ApiResponse,
) {
	if (request.method !== "POST") {
		response.status(405).json({ error: "Phương thức không được hỗ trợ." });
		return;
	}

	try {
		const body = parseBody(request.body);
		const slug = String(body.slug ?? "").trim();
		const content = String(body.body ?? "").trim();
		const honeypot = String(body.website ?? "").trim();

		if (honeypot) {
			response.status(202).json({ accepted: true });
			return;
		}
		if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || slug.length > 180) {
			response.status(400).json({ error: "Bài viết không hợp lệ." });
			return;
		}
		if (!content || content.length > maxLength) {
			response.status(400).json({
				error: `Bình luận phải có từ 1 đến ${maxLength} ký tự.`,
			});
			return;
		}
		if (looksLikeSpam(content)) {
			response.status(400).json({
				error: "Bình luận có quá nhiều liên kết hoặc ký tự lặp.",
			});
			return;
		}

		const supabaseUrl =
			env("PUBLIC_SUPABASE_URL") || env("NEXT_PUBLIC_SUPABASE_URL");
		const serviceKey =
			env("SUPABASE_SECRET_KEY") || env("SUPABASE_SERVICE_ROLE_KEY");
		if (!supabaseUrl || !serviceKey) {
			response.status(503).json({
				error: "Hệ thống bình luận đang được cấu hình. Vui lòng thử lại sau.",
			});
			return;
		}

		const ipHash = digest(
			`${clientIp(request.headers)}:${env("COMMENT_RATE_LIMIT_SECRET") || serviceKey}`,
		);
		const bodyHash = digest(content.toLocaleLowerCase("vi"));
		const supabase = createClient(supabaseUrl, serviceKey, {
			auth: { persistSession: false, autoRefreshToken: false },
		});
		const { data: commentId, error } = await supabase.rpc(
			"submit_blog_comment",
			{
				p_slug: slug,
				p_body: content,
				p_ip_hash: ipHash,
				p_body_hash: bodyHash,
			},
		);
		if (error) {
			if (error.message.includes("RATE_LIMIT")) {
				response.status(429).json({
					error: "Bạn đã gửi nhiều bình luận. Hãy thử lại sau 15 phút.",
				});
				return;
			}
			if (error.message.includes("DUPLICATE")) {
				response.status(409).json({
					error: "Bình luận này đã được gửi và đang chờ duyệt.",
				});
				return;
			}
			console.error("Comment RPC error", error);
			response.status(502).json({ error: "Chưa lưu được bình luận." });
			return;
		}

		await sendNotification({
			slug,
			content,
			commentId: String(commentId ?? ""),
		}).catch((notificationError) => {
			console.error("Comment notification error", notificationError);
		});
		response.status(201).json({ accepted: true });
	} catch (error) {
		console.error("Comment submission error", error);
		response.status(500).json({ error: "Máy chủ chưa xử lý được bình luận." });
	}
}

async function sendNotification({
	slug,
	content,
	commentId,
}: {
	slug: string;
	content: string;
	commentId: string;
}) {
	const apiKey = env("RESEND_API_KEY");
	if (!apiKey) return;

	const siteUrl = getSiteUrl();
	const adminUrl = `${siteUrl}/admin/`;
	const postUrl = `${siteUrl}/posts/${encodeURIComponent(slug)}/`;
	const safeContent = escapeHtml(content).replace(/\n/g, "<br>");
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
			to: [env("COMMENT_NOTIFICATION_TO") || notificationEmail],
			subject: `Bình luận mới đang chờ duyệt: ${slug}`,
			text: `${content}\n\nDuyệt: ${adminUrl}\nXem bài: ${postUrl}`,
			html: `<h2>Bình luận mới đang chờ duyệt</h2><p><strong>Bài viết:</strong> ${escapeHtml(slug)}</p><blockquote>${safeContent}</blockquote><p><a href="${adminUrl}">Mở trang quản trị</a> · <a href="${postUrl}">Xem bài viết</a></p><small>ID: ${escapeHtml(commentId)}</small>`,
		}),
	});
	if (!result.ok) {
		console.error(
			"Resend notification error",
			result.status,
			await result.text(),
		);
	}
}

function looksLikeSpam(value: string) {
	const links = value.match(/(?:https?:\/\/|www\.)/gi)?.length ?? 0;
	return links > 2 || /(.)\1{14,}/u.test(value);
}

function clientIp(headers: ApiRequest["headers"]) {
	const forwarded = headers["x-forwarded-for"];
	const value = Array.isArray(forwarded) ? forwarded[0] : forwarded;
	if (value) return value.split(",")[0].trim();
	const realIp = headers["x-real-ip"];
	return Array.isArray(realIp)
		? (realIp[0] ?? "unknown")
		: (realIp ?? "unknown");
}

function getSiteUrl() {
	const explicit = env("PUBLIC_SITE_URL").replace(/\/$/, "");
	if (explicit) return explicit;
	const vercelUrl = env("VERCEL_PROJECT_PRODUCTION_URL");
	return vercelUrl ? `https://${vercelUrl}` : "https://www.thanhtung0209.com";
}

function digest(value: string) {
	return createHash("sha256").update(value).digest("hex");
}

function parseBody(value: unknown) {
	if (typeof value === "string")
		return JSON.parse(value) as Record<string, unknown>;
	return (value ?? {}) as Record<string, unknown>;
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
