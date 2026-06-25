import TurndownService from "turndown";

type ApiRequest = {
	method?: string;
	headers: Record<string, string | string[] | undefined>;
	query: Record<string, string | string[] | undefined>;
};

type ApiResponse = {
	setHeader: (name: string, value: string) => void;
	status: (code: number) => ApiResponse;
	send: (body: string) => void;
};

const turndown = new TurndownService({
	codeBlockStyle: "fenced",
	headingStyle: "atx",
	bulletListMarker: "-",
});

turndown.remove(["script", "style", "noscript", "canvas"]);

export default async function handler(
	request: ApiRequest,
	response: ApiResponse,
) {
	if (request.method && !["GET", "HEAD"].includes(request.method)) {
		response.status(405).send("Method not allowed");
		return;
	}

	const targetPath = normalizePath(request.query.path);
	const targetUrl = buildTargetUrl(request, targetPath);

	try {
		const htmlResponse = await fetch(targetUrl, {
			headers: {
				Accept: "text/html",
				"User-Agent": "ThanhTungBlogMarkdownNegotiator/1.0",
			},
		});
		const contentType = htmlResponse.headers.get("content-type") ?? "";
		if (!htmlResponse.ok || !contentType.includes("text/html")) {
			response
				.status(htmlResponse.status || 404)
				.send(`# ${htmlResponse.status || 404}\n\nMarkdown source not found.`);
			return;
		}

		const html = await htmlResponse.text();
		const markdown = cleanupMarkdown(turndown.turndown(extractMain(html)));
		response.setHeader("Content-Type", "text/markdown; charset=utf-8");
		response.setHeader("Vary", "Accept");
		response.setHeader("X-Markdown-Tokens", String(estimateTokens(markdown)));
		response.status(200).send(markdown);
	} catch (error) {
		console.error("Markdown negotiation error", error);
		response
			.status(502)
			.send(
				"# Markdown unavailable\n\nThe page could not be converted right now.",
			);
	}
}

function normalizePath(value: string | string[] | undefined) {
	const raw = Array.isArray(value) ? value.join("/") : (value ?? "");
	const clean = raw.replace(/^https?:\/\/[^/]+/i, "").replace(/\0/g, "");
	if (!clean || clean === "/") return "/";
	return clean.startsWith("/") ? clean : `/${clean}`;
}

function buildTargetUrl(request: ApiRequest, targetPath: string) {
	const hostHeader =
		request.headers["x-forwarded-host"] ?? request.headers.host;
	const host = Array.isArray(hostHeader) ? hostHeader[0] : hostHeader;
	const protocolHeader = request.headers["x-forwarded-proto"];
	const protocol = Array.isArray(protocolHeader)
		? (protocolHeader[0] ?? "https")
		: (protocolHeader ?? "https");
	return new URL(
		targetPath,
		`${protocol}://${host || "www.thanhtung0209.com"}`,
	).toString();
}

function extractMain(html: string) {
	const withoutHead = html.replace(/<head[\s\S]*?<\/head>/gi, "");
	return (
		withoutHead.match(/<main\b[\s\S]*?<\/main>/i)?.[0] ?? withoutHead
	).replace(/<svg\b[\s\S]*?<\/svg>/gi, "");
}

function cleanupMarkdown(value: string) {
	return value
		.replace(/\n{3,}/g, "\n\n")
		.replace(/[ \t]+\n/g, "\n")
		.trim()
		.concat("\n");
}

function estimateTokens(value: string) {
	const words = value.trim().split(/\s+/).filter(Boolean).length;
	return Math.max(1, Math.ceil(words * 1.35));
}
