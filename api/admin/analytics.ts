import { createClient } from "@supabase/supabase-js";
import {
	AdminRequestError,
	normaliseAdminError,
	requireAdminToken,
} from "../../src/lib/admin-auth.js";
import {
	type AnalyticsViewRow,
	buildAnalyticsReport,
	normalizeAnalyticsPath,
} from "../../src/lib/analytics.js";

type ApiRequest = {
	method?: string;
	headers: Record<string, string | string[] | undefined>;
	query?: Record<string, string | string[] | undefined>;
};

type ApiResponse = {
	status: (code: number) => ApiResponse;
	json: (data: unknown) => void;
};

const pageSize = 1000;
const maxRows = 20_000;
const maxRangeMs = 366 * 24 * 60 * 60 * 1000;

export default async function handler(
	request: ApiRequest,
	response: ApiResponse,
) {
	try {
		if (request.method !== "GET") {
			throw new AdminRequestError("Phương thức không được hỗ trợ.", 405);
		}

		const authorization = request.headers.authorization;
		await requireAdminToken(
			Array.isArray(authorization) ? authorization[0] : (authorization ?? ""),
		);

		const now = new Date();
		const to = parseDate(queryValue(request.query?.to)) ?? now;
		const from =
			parseDate(queryValue(request.query?.from)) ??
			new Date(to.getTime() - 7 * 24 * 60 * 60 * 1000);
		if (from >= to || to.getTime() - from.getTime() > maxRangeMs) {
			throw new AdminRequestError("Khoảng thời gian thống kê không hợp lệ.");
		}

		const rawPath = queryValue(request.query?.path).trim();
		const path = rawPath ? normalizeAnalyticsPath(rawPath) : "";
		if (rawPath && !path)
			throw new AdminRequestError("Đường dẫn lọc không hợp lệ.");

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

		const supabase = createClient(supabaseUrl, serviceKey, {
			auth: { persistSession: false, autoRefreshToken: false },
		});
		const rows: AnalyticsViewRow[] = [];
		for (let offset = 0; offset < maxRows; offset += pageSize) {
			let query = supabase
				.from("analytics_page_views")
				.select(
					"path,title,visitor_hash,session_hash,referrer_host,device_type,viewed_at",
				)
				.gte("viewed_at", from.toISOString())
				.lt("viewed_at", to.toISOString())
				.order("viewed_at", { ascending: false })
				.range(offset, offset + pageSize - 1);
			if (path) query = query.eq("path", path);

			const { data, error } = await query;
			if (error) {
				if (error.code === "42P01" || error.code === "PGRST205") {
					throw new AdminRequestError(
						"Analytics chưa được khởi tạo. Hãy chạy supabase/analytics.sql một lần.",
						503,
					);
				}
				throw error;
			}
			rows.push(...((data ?? []) as AnalyticsViewRow[]));
			if (!data || data.length < pageSize) break;
		}

		response.status(200).json({
			range: { from: from.toISOString(), to: to.toISOString(), path },
			report: buildAnalyticsReport(rows, from, to),
			truncated: rows.length >= maxRows,
		});
	} catch (error) {
		const result = normaliseAdminError(error);
		response.status(result.status).json({ error: result.message });
	}
}

function parseDate(value: string) {
	if (!value) return null;
	const parsed = new Date(value);
	return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function queryValue(value: string | string[] | undefined) {
	return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

function env(name: string) {
	return process.env[name] ?? "";
}
