import { createClient } from "@supabase/supabase-js";
import {
	AdminRequestError,
	normaliseAdminError,
	requireAdminToken,
} from "../../src/lib/admin-auth.js";
import { sendCommentReplyNotification } from "../../src/lib/comment-email.js";

type ApiRequest = {
	method?: string;
	headers: Record<string, string | string[] | undefined>;
	body?: unknown;
};

type ApiResponse = {
	status: (code: number) => ApiResponse;
	json: (data: unknown) => void;
};

type BlogComment = {
	id: string;
	slug: string;
	body: string;
	status: "pending" | "approved";
	created_at: string;
	parent_id?: string | null;
	author_name?: string | null;
	is_author?: boolean | null;
};

const commentSelect =
	"id,slug,body,status,created_at,parent_id,author_name,is_author";

export default async function handler(
	request: ApiRequest,
	response: ApiResponse,
) {
	try {
		if (request.method !== "POST") {
			response.status(405).json({ error: "Phương thức không được hỗ trợ." });
			return;
		}

		const authorization = request.headers.authorization;
		const user = await requireAdminToken(
			Array.isArray(authorization) ? authorization[0] : (authorization ?? ""),
		);
		const body = parseBody(request.body);
		const action = String(body.action ?? "");
		const commentId = String(body.comment_id ?? body.commentId ?? "").trim();
		if (!isUuid(commentId)) {
			throw new AdminRequestError("Bình luận không hợp lệ.");
		}

		const supabase = createServiceClient();
		if (action === "approve") {
			const { data, error } = await supabase
				.from("blog_comments")
				.update({
					status: "approved",
					approved_at: new Date().toISOString(),
					approved_by: user.id,
				})
				.eq("id", commentId)
				.eq("status", "pending")
				.select(commentSelect)
				.single();
			if (error || !data) {
				throw new AdminRequestError(
					"Bình luận đã được xử lý hoặc không còn tồn tại.",
					409,
				);
			}

			const approvedComment = data as BlogComment;
			if (approvedComment.parent_id) {
				await notifySubscriber(
					supabase,
					approvedComment.parent_id,
					approvedComment,
				);
			}
			response.status(200).json({ data: approvedComment });
			return;
		}

		if (action === "reply") {
			const content = String(body.body ?? "").trim();
			if (!content || content.length > 600) {
				throw new AdminRequestError("Trả lời phải có từ 1 đến 600 ký tự.");
			}

			const { data: target, error: targetError } = await supabase
				.from("blog_comments")
				.select(commentSelect)
				.eq("id", commentId)
				.eq("status", "approved")
				.single();
			if (targetError || !target) {
				throw new AdminRequestError(
					"Bình luận cần trả lời không còn tồn tại.",
					404,
				);
			}

			const targetComment = target as BlogComment;
			const { data, error } = await supabase
				.from("blog_comments")
				.insert({
					slug: targetComment.slug,
					body: content,
					status: "approved",
					parent_id: targetComment.parent_id ?? targetComment.id,
					author_name: "Nguyễn Thanh Tùng",
					is_author: true,
					approved_at: new Date().toISOString(),
					approved_by: user.id,
				})
				.select(commentSelect)
				.single();
			if (error || !data) {
				throw new AdminRequestError("Chưa đăng được trả lời.", 502);
			}

			const reply = data as BlogComment;
			await notifySubscriber(supabase, targetComment.id, reply);
			response.status(201).json({ data: reply });
			return;
		}

		throw new AdminRequestError("Thao tác không hợp lệ.");
	} catch (error) {
		const result = normaliseAdminError(error);
		response.status(result.status).json({ error: result.message });
	}
}

async function notifySubscriber(
	supabase: ReturnType<typeof createServiceClient>,
	targetCommentId: string,
	reply: BlogComment,
) {
	const [{ data: subscription }, { data: original }] = await Promise.all([
		supabase
			.from("comment_subscriptions")
			.select("email")
			.eq("comment_id", targetCommentId)
			.maybeSingle(),
		supabase
			.from("blog_comments")
			.select("body")
			.eq("id", targetCommentId)
			.maybeSingle(),
	]);
	if (!subscription?.email || !original?.body) return;

	await sendCommentReplyNotification({
		to: subscription.email,
		slug: reply.slug,
		originalBody: original.body,
		replyBody: reply.body,
		replierName: reply.is_author
			? "Nguyễn Thanh Tùng"
			: reply.author_name || "Ẩn danh",
	}).catch((error) => {
		console.error("Comment reply email error", error);
	});
}

function createServiceClient() {
	const supabaseUrl =
		env("PUBLIC_SUPABASE_URL") || env("NEXT_PUBLIC_SUPABASE_URL");
	const serviceKey =
		env("SUPABASE_SECRET_KEY") || env("SUPABASE_SERVICE_ROLE_KEY");
	if (!supabaseUrl || !serviceKey) {
		throw new AdminRequestError(
			"Supabase chưa được cấu hình trên server.",
			503,
		);
	}
	return createClient(supabaseUrl, serviceKey, {
		auth: { persistSession: false, autoRefreshToken: false },
	});
}

function parseBody(value: unknown) {
	if (typeof value === "string")
		return JSON.parse(value) as Record<string, unknown>;
	return (value ?? {}) as Record<string, unknown>;
}

function isUuid(value: string) {
	return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
		value,
	);
}

function env(name: string) {
	return process.env[name] ?? "";
}
