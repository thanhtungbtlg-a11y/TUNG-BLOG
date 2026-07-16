import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import {
	PORTFOLIO_ACCESS_COOKIE,
	PORTFOLIO_ACCESS_MESSAGE,
	readCookie,
} from "../../src/lib/portfolio-access.js";

type ApiRequest = {
	method?: string;
	headers: Record<string, string | string[] | undefined>;
	body?: unknown;
};

type ApiResponse = {
	status: (code: number) => ApiResponse;
	json: (data: unknown) => void;
	setHeader: (name: string, value: string) => void;
};

export default async function handler(
	request: ApiRequest,
	response: ApiResponse,
) {
	response.setHeader("Cache-Control", "no-store, max-age=0");
	response.setHeader("X-Content-Type-Options", "nosniff");

	const password = env("PORTFOLIO_PASSWORD");
	const accessSecret = env("PORTFOLIO_ACCESS_SECRET");
	if (!password || !accessSecret) {
		response.status(503).json({
			error: "The private portfolio has not been configured.",
		});
		return;
	}

	const token = createAccessToken(accessSecret);
	if (request.method === "GET") {
		const cookie = readCookie(
			header(request.headers, "cookie"),
			PORTFOLIO_ACCESS_COOKIE,
		);
		response.status(200).json({ unlocked: safeEqual(cookie, token) });
		return;
	}

	if (request.method === "DELETE") {
		response.setHeader(
			"Set-Cookie",
			`${PORTFOLIO_ACCESS_COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`,
		);
		response.status(200).json({ unlocked: false });
		return;
	}

	if (request.method !== "POST") {
		response.status(405).json({ error: "Method not allowed." });
		return;
	}

	const submittedPassword = parsePassword(request.body);
	if (!submittedPassword || !safeEqual(submittedPassword, password)) {
		await delay(450);
		response.status(401).json({ error: "Incorrect password." });
		return;
	}

	response.setHeader(
		"Set-Cookie",
		`${PORTFOLIO_ACCESS_COOKIE}=${encodeURIComponent(token)}; Path=/; HttpOnly; Secure; SameSite=Lax`,
	);
	response.status(200).json({ unlocked: true });
}

function createAccessToken(secret: string) {
	return createHmac("sha256", secret)
		.update(PORTFOLIO_ACCESS_MESSAGE)
		.digest("base64url");
}

function safeEqual(left: string, right: string) {
	const leftHash = createHash("sha256").update(left).digest();
	const rightHash = createHash("sha256").update(right).digest();
	return timingSafeEqual(leftHash, rightHash);
}

function parsePassword(value: unknown) {
	let body = value;
	if (typeof value === "string") {
		try {
			body = JSON.parse(value);
		} catch {
			return "";
		}
	}
	if (!body || typeof body !== "object" || Array.isArray(body)) return "";
	const password = (body as Record<string, unknown>).password;
	return typeof password === "string" && password.length <= 128 ? password : "";
}

function header(headers: ApiRequest["headers"], name: string) {
	const value = headers[name];
	return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

function delay(milliseconds: number) {
	return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

function env(name: string) {
	return process.env[name] ?? "";
}
