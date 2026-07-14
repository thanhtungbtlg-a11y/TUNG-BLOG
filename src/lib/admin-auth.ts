import { type AuthUser, createClient } from "@supabase/supabase-js";

export class AdminRequestError extends Error {
	constructor(
		message: string,
		public status = 400,
	) {
		super(message);
	}
}

function env(name: string) {
	return process.env[name] ?? "";
}

export async function requireAdminToken(
	authorization: string,
): Promise<AuthUser> {
	const token = authorization.startsWith("Bearer ")
		? authorization.slice(7)
		: "";

	if (!token) throw new AdminRequestError("Bạn chưa đăng nhập.", 401);

	const supabaseUrl =
		env("PUBLIC_SUPABASE_URL") || env("NEXT_PUBLIC_SUPABASE_URL");
	const supabaseKey =
		env("PUBLIC_SUPABASE_ANON_KEY") ||
		env("PUBLIC_SUPABASE_PUBLISHABLE_KEY") ||
		env("NEXT_PUBLIC_SUPABASE_ANON_KEY") ||
		env("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY");

	if (!supabaseUrl || !supabaseKey) {
		throw new AdminRequestError(
			"Supabase chưa được cấu hình trên server.",
			503,
		);
	}

	const supabase = createClient(supabaseUrl, supabaseKey, {
		auth: { persistSession: false, autoRefreshToken: false },
		global: { headers: { Authorization: `Bearer ${token}` } },
	});

	const userResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
		headers: {
			apikey: supabaseKey,
			Authorization: `Bearer ${token}`,
		},
	});
	if (!userResponse.ok) {
		throw new AdminRequestError("Phiên đăng nhập đã hết hạn.", 401);
	}
	const user = (await userResponse.json()) as AuthUser;
	if (!user.id) throw new AdminRequestError("Phiên đăng nhập đã hết hạn.", 401);

	const { data: admin, error: adminError } = await supabase
		.from("comment_admins")
		.select("user_id")
		.eq("user_id", user.id)
		.maybeSingle();

	if (adminError || !admin) {
		throw new AdminRequestError("Tài khoản này không có quyền quản trị.", 403);
	}

	return user;
}

export function normaliseAdminError(error: unknown) {
	if (error instanceof AdminRequestError) {
		return { status: error.status, message: error.message };
	}
	console.error(error);
	return { status: 500, message: "Máy chủ chưa xử lý được yêu cầu." };
}
