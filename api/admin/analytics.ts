import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import {
	AdminRequestError,
	normaliseAdminError,
	requireAdminToken,
} from "../../src/lib/admin-auth.js";
import {
	type AnalyticsViewRow,
	buildAnalyticsReport,
	isSameSiteReferrer,
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
			throw new AdminRequestError("Method not allowed.", 405);
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
			throw new AdminRequestError("Invalid analytics date range.");
		}

		const rawPath = queryValue(request.query?.path).trim();
		const path = rawPath ? normalizeAnalyticsPath(rawPath) : "";
		if (rawPath && !path) throw new AdminRequestError("Invalid path filter.");

		const supabaseUrl =
			env("PUBLIC_SUPABASE_URL") || env("NEXT_PUBLIC_SUPABASE_URL");
		const serviceKey =
			env("SUPABASE_SECRET_KEY") || env("SUPABASE_SERVICE_ROLE_KEY");
		if (!supabaseUrl || !serviceKey) {
			throw new AdminRequestError(
				"Supabase has not been configured on the server.",
				503,
			);
		}

		const supabase = createClient(supabaseUrl, serviceKey, {
			auth: { persistSession: false, autoRefreshToken: false },
		});
		const periodDuration = to.getTime() - from.getTime();
		const previousTo = new Date(from);
		const previousFrom = new Date(from.getTime() - periodDuration);
		const [current, previous] = await Promise.all([
			loadAnalyticsRows(supabase, from, to, path),
			loadAnalyticsRows(supabase, previousFrom, previousTo, path),
		]);
		const siteHost = env("PUBLIC_SITE_URL");
		const currentRows = removeInternalReferrers(current.rows, siteHost);
		const previousRows = removeInternalReferrers(previous.rows, siteHost);

		response.status(200).json({
			range: { from: from.toISOString(), to: to.toISOString(), path },
			report: buildAnalyticsReport(currentRows, from, to),
			comparison: {
				range: {
					from: previousFrom.toISOString(),
					to: previousTo.toISOString(),
				},
				totals: buildAnalyticsReport(previousRows, previousFrom, previousTo)
					.totals,
			},
			truncated: current.truncated || previous.truncated,
		});
	} catch (error) {
		const result = normaliseAdminError(error);
		response.status(result.status).json({ error: result.message });
	}
}

function removeInternalReferrers(rows: AnalyticsViewRow[], siteHost: string) {
	if (!siteHost) return rows;
	return rows.map((row) =>
		isSameSiteReferrer(row.referrer_host, siteHost)
			? { ...row, referrer_host: "" }
			: row,
	);
}

async function loadAnalyticsRows(
	supabase: SupabaseClient,
	from: Date,
	to: Date,
	path: string,
) {
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
					"Analytics has not been initialized. Run supabase/analytics.sql once.",
					503,
				);
			}
			throw error;
		}
		rows.push(...((data ?? []) as AnalyticsViewRow[]));
		if (!data || data.length < pageSize) break;
	}
	return { rows, truncated: rows.length >= maxRows };
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
