export function normalizeMarkdownPath(
	value: string | string[] | undefined,
): string {
	const raw = Array.isArray(value) ? value.join("/") : (value ?? "");
	const clean = stripControlCharacters(raw)
		.replace(/^https?:\/\/[^/]+/i, "")
		.replace(/\\/g, "/")
		.split(/[?#]/, 1)[0]
		.replace(/^\/+/, "");

	return clean ? `/${clean}` : "/";
}

function stripControlCharacters(value: string): string {
	return [...value]
		.filter((character) => {
			const code = character.charCodeAt(0);
			return code >= 32 && code !== 127;
		})
		.join("");
}
