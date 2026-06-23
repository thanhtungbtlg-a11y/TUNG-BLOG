import {
	normaliseAdminError,
	requireAdminToken,
} from "../../../src/lib/admin-auth.js";
import { readPost, savePost } from "../../../src/lib/github-content.js";

type ApiRequest = {
	method?: string;
	headers: Record<string, string | string[] | undefined>;
	query: Record<string, string | string[] | undefined>;
	body?: unknown;
};

type ApiResponse = {
	status: (code: number) => ApiResponse;
	json: (data: unknown) => void;
};

export default async function handler(
	request: ApiRequest,
	response: ApiResponse,
) {
	try {
		const authorization = request.headers.authorization;
		await requireAdminToken(
			Array.isArray(authorization) ? authorization[0] : (authorization ?? ""),
		);
		const slugValue = request.query.slug;
		const slug = Array.isArray(slugValue) ? slugValue[0] : (slugValue ?? "");

		if (request.method === "GET") {
			response.status(200).json(await readPost(slug));
			return;
		}

		if (request.method === "PUT") {
			const body = parseBody(request.body);
			response.status(200).json(await savePost(slug, body));
			return;
		}

		response.status(405).json({ error: "Phương thức không được hỗ trợ." });
	} catch (error) {
		const result = normaliseAdminError(error);
		response.status(result.status).json({ error: result.message });
	}
}

function parseBody(value: unknown) {
	if (typeof value === "string")
		return JSON.parse(value) as Record<string, unknown>;
	return (value ?? {}) as Record<string, unknown>;
}
