import { getPublicSiteUrl } from "../src/lib/site-url";

type JsonRpcRequest = {
	jsonrpc?: string;
	id?: string | number | null;
	method?: string;
	params?: Record<string, unknown>;
};

type ApiRequest = {
	method?: string;
	body?: unknown;
};

type ApiResponse = {
	setHeader: (name: string, value: string) => void;
	status: (code: number) => ApiResponse;
	json: (body: unknown) => void;
};

const serverInfo = {
	name: "Thanh Tung Blog MCP",
	version: "1.0.0",
};

const searchTool = {
	name: "search_blog",
	description:
		"Search Thanh Tung Blog posts by title, tag, category, description, or body text.",
	inputSchema: {
		type: "object",
		properties: {
			query: {
				type: "string",
				description: "Search query.",
			},
			limit: {
				type: "number",
				description: "Maximum number of results.",
				default: 5,
			},
		},
		required: ["query"],
	},
};

export default async function handler(
	request: ApiRequest,
	response: ApiResponse,
) {
	response.setHeader("Access-Control-Allow-Origin", "*");
	response.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
	response.setHeader("Access-Control-Allow-Headers", "Content-Type, Accept");

	if (request.method === "OPTIONS") {
		response.status(204).json(null);
		return;
	}

	if (request.method === "GET") {
		response.status(200).json({
			serverInfo,
			capabilities: { tools: [searchTool.name] },
			endpoint: `${getPublicSiteUrl()}/api/mcp`,
		});
		return;
	}

	if (request.method !== "POST") {
		response.status(405).json({ error: "Method not allowed" });
		return;
	}

	const body = parseBody(request.body);
	const requests = Array.isArray(body) ? body : [body];
	const results = await Promise.all(
		requests.map((entry) => handleJsonRpc(entry as JsonRpcRequest)),
	);
	response.status(200).json(Array.isArray(body) ? results : results[0]);
}

async function handleJsonRpc(request: JsonRpcRequest) {
	const id = request.id ?? null;
	try {
		if (request.method === "initialize") {
			return result(id, {
				protocolVersion: "2025-06-18",
				capabilities: {
					tools: {},
				},
				serverInfo,
			});
		}

		if (request.method === "tools/list") {
			return result(id, {
				tools: [searchTool],
			});
		}

		if (request.method === "tools/call") {
			const params = request.params ?? {};
			if (params.name !== searchTool.name) {
				return rpcError(id, -32602, "Unknown tool.");
			}
			const args = (params.arguments ?? {}) as Record<string, unknown>;
			const results = await searchBlog(args);
			return result(id, {
				content: [
					{
						type: "text",
						text: JSON.stringify(results, null, 2),
					},
				],
			});
		}

		if (request.method === "notifications/initialized") {
			return result(id, {});
		}

		return rpcError(id, -32601, "Method not found.");
	} catch (error) {
		console.error("MCP request error", error);
		return rpcError(id, -32603, "Internal error.");
	}
}

async function searchBlog(args: Record<string, unknown>) {
	const query = String(args.query ?? "")
		.trim()
		.toLowerCase();
	const limit = Math.min(Math.max(Number(args.limit ?? 5), 1), 10);
	if (!query) return [];

	const siteUrl = getPublicSiteUrl();
	const index = await fetch(`${siteUrl}/search-index.json`).then((response) =>
		response.json(),
	);
	return index.posts
		.map((post: Record<string, unknown>) => {
			const title = String(post.title ?? "");
			const description = String(post.description ?? "");
			const category = String(post.category ?? "");
			const tags = Array.isArray(post.tags) ? post.tags.map(String) : [];
			const content = String(post.content ?? "");
			const haystack = [title, description, category, ...tags, content]
				.join(" ")
				.toLowerCase();
			const titleMatch = title.toLowerCase().includes(query) ? 3 : 0;
			const tagMatch = tags.some((tag) => tag.toLowerCase().includes(query))
				? 2
				: 0;
			const bodyMatch = haystack.includes(query) ? 1 : 0;
			return { post, score: titleMatch + tagMatch + bodyMatch };
		})
		.filter((entry: { score: number }) => entry.score > 0)
		.sort((a: { score: number }, b: { score: number }) => b.score - a.score)
		.slice(0, limit)
		.map(({ post }: { post: Record<string, unknown> }) => ({
			title: post.title,
			url: new URL(String(post.url ?? "/"), siteUrl).toString(),
			description: post.description,
			category: post.category,
			tags: post.tags,
		}));
}

function result(id: JsonRpcRequest["id"], value: unknown) {
	return {
		jsonrpc: "2.0",
		id,
		result: value,
	};
}

function rpcError(id: JsonRpcRequest["id"], code: number, message: string) {
	return {
		jsonrpc: "2.0",
		id,
		error: {
			code,
			message,
		},
	};
}

function parseBody(value: unknown) {
	if (typeof value === "string")
		return JSON.parse(value) as JsonRpcRequest | JsonRpcRequest[];
	return (value ?? {}) as JsonRpcRequest | JsonRpcRequest[];
}
