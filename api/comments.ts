import { createHash } from "node:crypto";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { sendAdminCommentNotification } from "../src/lib/comment-email.js";
import {
	type CommentHeaders,
	getClientIp,
	hasControlCharacters,
	hasMatchingCommentContent,
	isUuid,
	isValidEmail,
	looksLikeCommentSpam,
	normaliseCommentAuthor,
	normaliseCommentContent,
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
		response.status(405).json({ error: "Method not allowed." });
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
			response.status(400).json({ error: "Invalid post." });
			return;
		}
		if (parentId && !isUuid(parentId)) {
			response.status(400).json({ error: "Invalid parent comment." });
			return;
		}
		if (!content || content.length > maxLength) {
			response.status(400).json({
				error: `Comments must contain between 1 and ${maxLength} characters.`,
			});
			return;
		}
		if (authorName.length > maxNameLength || hasControlCharacters(authorName)) {
			response.status(400).json({
				error: `Display names are limited to ${maxNameLength} characters.`,
			});
			return;
		}
		if (notificationEmail && !isValidEmail(notificationEmail)) {
			response.status(400).json({ error: "Invalid email address." });
			return;
		}
		if (looksLikeCommentSpam(content)) {
			response.status(400).json({
				error: "The comment contains too many links or repeated characters.",
			});
			return;
		}

		const supabaseUrl =
			env("PUBLIC_SUPABASE_URL") || env("NEXT_PUBLIC_SUPABASE_URL");
		const serviceKey =
			env("SUPABASE_SECRET_KEY") || env("SUPABASE_SERVICE_ROLE_KEY");
		if (!supabaseUrl || !serviceKey) {
			response.status(503).json({
				error:
					"The comment system is being configured. Please try again later.",
			});
			return;
		}

		const ipHash = digest(
			`${getClientIp(request.headers)}:${env("COMMENT_RATE_LIMIT_SECRET") || serviceKey}`,
		);
		const bodyHash = digest(normaliseCommentContent(content));
		const supabase = createClient(supabaseUrl, serviceKey, {
			auth: { persistSession: false, autoRefreshToken: false },
		});
		const submissionPayload = {
			p_slug: slug,
			p_body: content,
			p_ip_hash: ipHash,
			p_body_hash: bodyHash,
			p_parent_id: parentId || null,
			p_author_name: authorName || "Anonymous",
			p_notification_email: notificationEmail,
		};
		let submission = await supabase.rpc(
			"submit_blog_comment",
			submissionPayload,
		);
		if (
			submission.error?.message.includes("DUPLICATE") &&
			(await removeStaleDuplicateLog(supabase, slug, content, ipHash, bodyHash))
		) {
			submission = await supabase.rpc("submit_blog_comment", submissionPayload);
		}
		const { data: commentId, error } = submission;
		if (error) {
			if (
				error.message.includes("INVALID_NAME") ||
				error.message.includes("INVALID_EMAIL")
			) {
				response.status(400).json({
					error: "Invalid name or email address.",
				});
				return;
			}
			if (error.message.includes("RATE_LIMIT")) {
				response.status(429).json({
					error:
						"You have submitted several comments in quick succession. Please try again in 10 minutes.",
				});
				return;
			}
			if (error.message.includes("DUPLICATE")) {
				response.status(409).json({
					error:
						"This comment has already been submitted and is awaiting approval.",
				});
				return;
			}
			if (error.message.includes("INVALID_PARENT")) {
				response.status(400).json({
					error:
						"The comment you are replying to is invalid or has not been approved.",
				});
				return;
			}
			console.error("Comment RPC error", error);
			response.status(502).json({ error: "The comment could not be saved." });
			return;
		}

		await sendAdminCommentNotification({
			slug,
			content,
			commentId: String(commentId ?? ""),
			parentId,
			authorName: authorName || "Anonymous",
		}).catch((notificationError) => {
			console.error("Comment notification error", notificationError);
		});
		response.status(201).json({ accepted: true });
	} catch (error) {
		console.error("Comment submission error", error);
		response
			.status(500)
			.json({ error: "The server could not process the comment." });
	}
}

function digest(value: string) {
	return createHash("sha256").update(value).digest("hex");
}

async function removeStaleDuplicateLog(
	supabase: SupabaseClient,
	slug: string,
	content: string,
	ipHash: string,
	bodyHash: string,
) {
	const { data: existingComments, error: lookupError } = await supabase
		.from("blog_comments")
		.select("body")
		.eq("slug", slug);
	if (lookupError) {
		console.error("Duplicate comment lookup error", lookupError);
		return false;
	}

	const matchingCommentExists = hasMatchingCommentContent(
		existingComments ?? [],
		content,
	);
	if (matchingCommentExists) return false;

	const { error: cleanupError } = await supabase
		.from("comment_submission_log")
		.delete()
		.eq("ip_hash", ipHash)
		.eq("body_hash", bodyHash)
		.eq("slug", slug);
	if (cleanupError) {
		console.error("Stale duplicate cleanup error", cleanupError);
		return false;
	}
	return true;
}

function env(name: string) {
	return process.env[name] ?? "";
}
