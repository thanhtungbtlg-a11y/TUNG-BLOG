import { createHash } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { sendAdminCommentNotification } from "../src/lib/comment-email.js";
import {
	type CommentHeaders,
	getClientIp,
	hasControlCharacters,
	isUuid,
	isValidEmail,
	looksLikeCommentSpam,
	normaliseCommentAuthor,
	parseCommentBody,
} from "../src/lib/comment-validation.js";

type ApiRequest = {
	method?: string;
	headers: CommentHeaders;
	body?: unknown;
};

type ApiResponse = {
	status: (code: number) => ApiResponse;
	json: (data: unknown) => void;
};

const maxLength = 600;
const maxNameLength = 60;

export default async function handler(
	request: ApiRequest,
	response: ApiResponse,
): Promise<void> {
	if (request.method !== "POST") {
		response.status(405).json({ error: "Phương thức không được hỗ trợ." });
		return;
	}

	try {
		const body = parseCommentBody(request.body);
		const slug = String(body.slug ?? "").trim();
		const content = String(body.body ?? "").trim();
		const honeypot = String(body.website ?? "").trim();
		const parentId = String(body.parent_id ?? body.parentId ?? "").trim();
		const authorName = normaliseCommentAuthor(
			body.author_name ?? body.authorName,
		);
		const notificationEmail = String(
			body.notification_email ?? body.notificationEmail ?? "",
		)
			.trim()
			.toLowerCase();

		if (honeypot) {
			response.status(202).json({ accepted: true });
			return;
		}
		if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || slug.length > 180) {
			response.status(400).json({ error: "Bài viết không hợp lệ." });
			return;
		}
		if (parentId && !isUuid(parentId)) {
			response.status(400).json({ error: "Bình luận gốc không hợp lệ." });
			return;
		}
		if (!content || content.length > maxLength) {
			response.status(400).json({
				error: `Bình luận phải có từ 1 đến ${maxLength} ký tự.`,
			});
			return;
		}
		if (authorName.length > maxNameLength || hasControlCharacters(authorName)) {
			response.status(400).json({
				error: `Tên hiển thị tối đa ${maxNameLength} ký tự.`,
			});
			return;
		}
		if (notificationEmail && !isValidEmail(notificationEmail)) {
			response.status(400).json({ error: "Địa chỉ email không hợp lệ." });
			return;
		}
		if (looksLikeCommentSpam(content)) {
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
			`${getClientIp(request.headers)}:${env("COMMENT_RATE_LIMIT_SECRET") || serviceKey}`,
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
				p_parent_id: parentId || null,
				p_author_name: authorName || "Ẩn danh",
				p_notification_email: notificationEmail,
			},
		);
		if (error) {
			if (
				error.message.includes("INVALID_NAME") ||
				error.message.includes("INVALID_EMAIL")
			) {
				response.status(400).json({
					error: "Tên hoặc email không hợp lệ.",
				});
				return;
			}
			if (error.message.includes("RATE_LIMIT")) {
				response.status(429).json({
					error:
						"Bạn đã gửi nhiều bình luận liên tiếp. Vui lòng thử lại sau 10 phút.",
				});
				return;
			}
			if (error.message.includes("DUPLICATE")) {
				response.status(409).json({
					error: "Bình luận này đã được gửi và đang chờ duyệt.",
				});
				return;
			}
			if (error.message.includes("INVALID_PARENT")) {
				response.status(400).json({
					error: "Bình luận cần trả lời không hợp lệ hoặc chưa được duyệt.",
				});
				return;
			}
			console.error("Comment RPC error", error);
			response.status(502).json({ error: "Chưa lưu được bình luận." });
			return;
		}

		await sendAdminCommentNotification({
			slug,
			content,
			commentId: String(commentId ?? ""),
			parentId,
			authorName: authorName || "Ẩn danh",
		}).catch((notificationError) => {
			console.error("Comment notification error", notificationError);
		});
		response.status(201).json({ accepted: true });
	} catch (error) {
		console.error("Comment submission error", error);
		response.status(500).json({ error: "Máy chủ chưa xử lý được bình luận." });
	}
}

function digest(value: string) {
	return createHash("sha256").update(value).digest("hex");
}

function env(name: string) {
	return process.env[name] ?? "";
}
