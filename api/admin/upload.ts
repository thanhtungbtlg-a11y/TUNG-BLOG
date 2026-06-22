import {
	normaliseAdminError,
	requireAdminToken,
} from "../../src/lib/admin-auth";
import { savePostImage } from "../../src/lib/github-content";

type ApiRequest = {
	method?: string;
	headers: Record<string, string | string[] | undefined>;
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
		if (request.method !== "POST") {
			response.status(405).json({ error: "Phương thức không được hỗ trợ." });
			return;
		}

		const authorization = request.headers.authorization;
		await requireAdminToken(
			Array.isArray(authorization) ? authorization[0] : (authorization ?? ""),
		);
		const body =
			typeof request.body === "string"
				? (JSON.parse(request.body) as Record<string, unknown>)
				: ((request.body ?? {}) as Record<string, unknown>);
		const result = await savePostImage(
			String(body.slug ?? ""),
			String(body.filename ?? ""),
			String(body.contentBase64 ?? ""),
		);
		response.status(200).json(result);
	} catch (error) {
		const result = normaliseAdminError(error);
		response.status(result.status).json({ error: result.message });
	}
}
