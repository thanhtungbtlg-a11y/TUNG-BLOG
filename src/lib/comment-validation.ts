export type CommentHeaders = Record<string, string | string[] | undefined>;

export function looksLikeCommentSpam(value: string): boolean {
	const links = value.match(/(?:https?:\/\/|www\.)/gi)?.length ?? 0;
	return links > 2 || /(.)\1{14,}/u.test(value);
}

export function isUuid(value: string): boolean {
	return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
		value,
	);
}

export function isValidEmail(value: string): boolean {
	return value.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(value);
}

export function normaliseCommentAuthor(value: unknown): string {
	return String(value ?? "")
		.trim()
		.replace(/\s+/g, " ");
}

export function hasControlCharacters(value: string): boolean {
	return [...value].some((character) => {
		const code = character.charCodeAt(0);
		return code < 32 || code === 127;
	});
}

export function getClientIp(headers: CommentHeaders): string {
	const forwarded = headers["x-forwarded-for"];
	const value = Array.isArray(forwarded) ? forwarded[0] : forwarded;
	if (value) return value.split(",")[0].trim();

	const realIp = headers["x-real-ip"];
	return Array.isArray(realIp)
		? (realIp[0] ?? "unknown")
		: (realIp ?? "unknown");
}

export function parseCommentBody(value: unknown): Record<string, unknown> {
	const parsed = typeof value === "string" ? JSON.parse(value) : value;
	if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
	return parsed as Record<string, unknown>;
}
