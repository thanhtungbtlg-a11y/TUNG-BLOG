import { createHmac } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import {
	isAnalyticsId,
	isSameSiteReferrer,
	normalizeAnalyticsPath,
	normalizeAnalyticsTitle,
	normalizeReferrerHost,
} from "../../src/lib/analytics.js";

type ApiRequest = {
	method?: string;
	headers: Record<string, string | string[] | undefined>;
	body?: unknown;
};

type ApiResponse = {
	status: (code: number) => ApiResponse;
	json: (data: unknown) => void;
};

const botPattern =
	/bot|crawler|spider|headless|lighthouse|pagespeed|preview|facebookexternalhit|slurp/i;

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
		const path = normalizeAnalyticsPath(body.path);
		const title = normalizeAnalyticsTitle(body.title);
		const visitorId = body.visitorId;
		const sessionId = body.sessionId;
		const eventId = body.eventId;
		const userAgent = header(request.headers, "user-agent");
		const fetchSite = header(request.headers, "sec-fetch-site");

		if (
			!path ||
			path.startsWith("/admin") ||
			!isAnalyticsId(visitorId) ||
			!isAnalyticsId(sessionId) ||
			!isAnalyticsId(eventId) ||
			fetchSite === "cross-site" ||
			botPattern.test(userAgent)
		) {
			response.status(202).json({ accepted: true });
			return;
		}

		const supabaseUrl =
			env("PUBLIC_SUPABASE_URL") || env("NEXT_PUBLIC_SUPABASE_URL");
		const serviceKey =
			env("SUPABASE_SECRET_KEY") || env("SUPABASE_SERVICE_ROLE_KEY");
		if (!supabaseUrl || !serviceKey) {
			response.status(202).json({ accepted: true });
			return;
		}

		const supabase = createClient(supabaseUrl, serviceKey, {
			auth: { persistSession: false, autoRefreshToken: false },
		});
		const secret = env("ANALYTICS_HASH_SECRET") || serviceKey;
		const referrerHost = normalizeReferrerHost(body.referrer);
		const siteHost =
			header(request.headers, "x-forwarded-host") ||
			header(request.headers, "host") ||
			env("PUBLIC_SITE_URL");
		const { error } = await supabase.from("analytics_page_views").insert({
			id: eventId,
			path,
			title,
			visitor_hash: digest(visitorId, secret),
			session_hash: digest(sessionId, secret),
			referrer_host: isSameSiteReferrer(referrerHost, siteHost)
				? ""
				: referrerHost,
			device_type: detectDevice(userAgent),
		});

		if (error && error.code !== "23505") {
			console.error("Analytics insert failed", error.code, error.message);
		}
		response.status(202).json({ accepted: true });
	} catch (error) {
		console.error("Analytics request failed", error);
		response.status(202).json({ accepted: true });
	}
}

function parseBody(value: unknown) {
	if (typeof value === "string") {
		try {
			return JSON.parse(value) as Record<string, unknown>;
		} catch {
			return {};
		}
	}
	return value && typeof value === "object" && !Array.isArray(value)
		? (value as Record<string, unknown>)
		: {};
}

function detectDevice(userAgent: string) {
	if (/ipad|tablet|kindle|silk/i.test(userAgent)) return "tablet";
	if (/mobile|android|iphone|ipod/i.test(userAgent)) return "mobile";
	return userAgent ? "desktop" : "unknown";
}

function digest(value: string, secret: string) {
	return createHmac("sha256", secret).update(value).digest("hex");
}

function header(headers: ApiRequest["headers"], name: string) {
	const value = headers[name];
	return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

function env(name: string) {
	return process.env[name] ?? "";
}
