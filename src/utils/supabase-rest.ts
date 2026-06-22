const env = import.meta.env as Record<string, string | undefined>;

export const supabaseUrl =
	env.PUBLIC_SUPABASE_URL ?? env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const supabaseAnonKey =
	env.PUBLIC_SUPABASE_ANON_KEY ??
	env.PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
	env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
	env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
	"";

export const supabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export async function supabaseRest<T>(
	pathname: string,
	init: RequestInit = {},
): Promise<T> {
	if (!supabaseConfigured) throw new Error("Supabase is not configured");

	const response = await fetch(`${supabaseUrl}/rest/v1/${pathname}`, {
		...init,
		headers: {
			apikey: supabaseAnonKey,
			Authorization: `Bearer ${supabaseAnonKey}`,
			"Content-Type": "application/json",
			...init.headers,
		},
	});

	if (!response.ok) {
		throw new Error(`Supabase request failed (${response.status})`);
	}

	if (response.status === 204) return undefined as T;
	const text = await response.text();
	return (text ? JSON.parse(text) : undefined) as T;
}

export function createSupabaseQuery(
	table: string,
	params: Record<string, string>,
) {
	const query = new URLSearchParams(params);
	return `${table}?${query.toString()}`;
}
