import { appendFile, readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import matter from "gray-matter";
import MarkdownIt from "markdown-it";

const root = process.cwd();
const postsRoot = path.join(root, "src", "content", "posts");
const publicRoot = path.join(root, "public");
const pagesRoot = path.join(root, "src", "pages");
const checkExternalLinks = process.env.CHECK_EXTERNAL_LINKS !== "false";
const coverRequiredAfter = new Date("2026-06-01T00:00:00Z");
const markdown = new MarkdownIt({ html: true, linkify: true });
const findings = [];
const externalLinks = new Map();
let legacyMissingCovers = 0;

const postFiles = (await walk(postsRoot)).filter((file) =>
	file.endsWith(`${path.sep}index.md`),
);
const validRoutes = await collectRoutes(postFiles);

for (const file of postFiles) {
	await auditPost(file);
}

if (checkExternalLinks) {
	await auditExternalLinks();
}

for (const finding of findings) {
	printAnnotation(finding);
}

const errors = findings.filter((finding) => finding.level === "error");
const warnings = findings.filter((finding) => finding.level === "warning");
const externalCount = externalLinks.size;
const summary = [
	"## Website health",
	"",
	`- Posts checked: **${postFiles.length}**`,
	`- External links checked: **${checkExternalLinks ? externalCount : 0}**`,
	`- Errors: **${errors.length}**`,
	`- Warnings: **${warnings.length}**`,
	`- Legacy posts without covers: **${legacyMissingCovers}** (acknowledged baseline)`,
	"",
	errors.length
		? "Broken local content was found. Open the annotations below to fix it."
		: "No broken local content was found.",
	"",
].join("\n");

console.log(
	`Website health: ${postFiles.length} posts, ${errors.length} errors, ${warnings.length} warnings.`,
);
if (process.env.GITHUB_STEP_SUMMARY) {
	await appendFile(process.env.GITHUB_STEP_SUMMARY, summary, "utf8");
}
if (errors.length) process.exitCode = 1;

async function auditPost(file) {
	const source = await readFile(file, "utf8");
	let parsed;
	try {
		parsed = matter(source);
	} catch (error) {
		addFinding(
			"error",
			file,
			1,
			`Frontmatter không đọc được: ${message(error)}`,
		);
		return;
	}

	const sourceLines = source.split(/\r?\n/);
	const frontmatterEnd = sourceLines.findIndex(
		(line, index) => index > 0 && line.trim() === "---",
	);
	const frontmatterLines = sourceLines.slice(0, frontmatterEnd + 1);
	if (!String(parsed.data.title ?? "").trim()) {
		addFinding(
			"error",
			file,
			frontmatterLine(frontmatterLines, "title"),
			"Bài viết thiếu tiêu đề.",
		);
	}
	if (!String(parsed.data.description ?? "").trim()) {
		addFinding(
			"warning",
			file,
			frontmatterLine(frontmatterLines, "description"),
			"Bài viết thiếu mô tả; kết quả tìm kiếm và chia sẻ mạng xã hội sẽ kém rõ ràng.",
		);
	}

	const cover = String(parsed.data.image ?? "").trim();
	if (!cover) {
		const published = new Date(parsed.data.published ?? "");
		if (!Number.isNaN(published.getTime()) && published < coverRequiredAfter) {
			legacyMissingCovers += 1;
		} else {
			addFinding(
				"warning",
				file,
				frontmatterLine(frontmatterLines, "image"),
				"Bài viết chưa có ảnh bìa.",
			);
		}
	} else {
		await auditResource(
			cover,
			"image",
			file,
			frontmatterLine(frontmatterLines, "image"),
		);
	}

	const bodyStartLine = frontmatterEnd + 2;
	const tokens = markdown.parse(parsed.content, {});
	for (const token of tokens) {
		const line = bodyStartLine + (token.map?.[0] ?? 0);
		await auditToken(token, file, line);
	}
}

async function auditToken(token, file, line) {
	for (const child of token.children ?? []) {
		if (child.type === "image") {
			await auditResource(child.attrGet("src"), "image", file, line);
		}
		if (child.type === "link_open") {
			await auditResource(child.attrGet("href"), "link", file, line);
		}
	}

	if (token.type !== "html_block" && token.type !== "html_inline") return;
	const attributePattern = /\b(src|href)\s*=\s*["']([^"']+)["']/gi;
	for (const match of token.content.matchAll(attributePattern)) {
		await auditResource(
			match[2],
			match[1].toLowerCase() === "src" ? "image" : "link",
			file,
			line,
		);
	}
}

async function auditResource(rawTarget, kind, file, line) {
	if (!rawTarget) return;
	let target = decodeTarget(rawTarget.trim());
	if (/^https?:\/\//i.test(target)) target = target.replace(/[_*]+$/, "");
	if (
		!target ||
		target.startsWith("#") ||
		/^(mailto|tel|javascript|data):/i.test(target)
	)
		return;

	if (/^https?:\/\//i.test(target)) {
		if (!externalLinks.has(target)) externalLinks.set(target, { file, line });
		return;
	}

	const cleanTarget = target.split(/[?#]/, 1)[0];
	if (!cleanTarget) return;
	if (kind === "link" && cleanTarget.startsWith("/")) {
		const route = normalizeRoute(cleanTarget);
		if (validRoutes.has(route)) return;
	}

	const resolved = cleanTarget.startsWith("/")
		? path.join(publicRoot, cleanTarget.replace(/^\/+/, ""))
		: path.resolve(path.dirname(file), cleanTarget);
	if (!(await exists(resolved))) {
		addFinding(
			"error",
			file,
			line,
			`${kind === "image" ? "Ảnh" : "Liên kết nội bộ"} không tồn tại: ${rawTarget}`,
		);
	}
}

async function auditExternalLinks() {
	const entries = [...externalLinks.entries()];
	const concurrency = 6;
	let cursor = 0;
	const workers = Array.from({ length: concurrency }, async () => {
		while (cursor < entries.length) {
			const [target, reference] = entries[cursor++];
			const result = await checkExternalUrl(target);
			if (result.ok) continue;
			addFinding(
				"warning",
				reference.file,
				reference.line,
				`Link ngoài chưa truy cập được (${result.detail}): ${target}`,
			);
		}
	});
	await Promise.all(workers);
}

async function checkExternalUrl(url) {
	try {
		let response = await fetchWithTimeout(url, "HEAD");
		if ([401, 403, 405, 429].includes(response.status)) {
			response = await fetchWithTimeout(url, "GET");
		}
		if (response.ok || [401, 403, 429].includes(response.status)) {
			return { ok: true, detail: String(response.status) };
		}
		return { ok: false, detail: `HTTP ${response.status}` };
	} catch (error) {
		return { ok: false, detail: message(error) };
	}
}

async function fetchWithTimeout(url, method) {
	return fetch(url, {
		method,
		redirect: "follow",
		signal: AbortSignal.timeout(8_000),
		headers: {
			"User-Agent": "ThanhTungBlog-HealthCheck/1.0",
			...(method === "GET" ? { Range: "bytes=0-0" } : {}),
		},
	});
}

async function collectRoutes(files) {
	const routes = new Set(["/"]);
	for (const file of files) {
		routes.add(normalizeRoute(`/posts/${path.basename(path.dirname(file))}/`));
	}
	for (const file of await walk(pagesRoot)) {
		if (!file.endsWith(".astro")) continue;
		const relative = path.relative(pagesRoot, file).replaceAll(path.sep, "/");
		if (relative.includes("[")) continue;
		const route = relative
			.replace(/\.astro$/, "")
			.replace(/(^|\/)index$/, "$1");
		routes.add(normalizeRoute(`/${route}`));
	}
	return routes;
}

async function walk(directory) {
	const entries = await readdir(directory, { withFileTypes: true });
	const files = [];
	for (const entry of entries) {
		const fullPath = path.join(directory, entry.name);
		if (entry.isDirectory()) files.push(...(await walk(fullPath)));
		else files.push(fullPath);
	}
	return files;
}

async function exists(target) {
	try {
		await stat(target);
		return true;
	} catch {
		return false;
	}
}

function normalizeRoute(value) {
	const route = value.replace(/\\/g, "/").replace(/\/{2,}/g, "/");
	if (route === "/") return route;
	return `${route.replace(/\/$/, "")}/`;
}

function decodeTarget(value) {
	try {
		return decodeURIComponent(value);
	} catch {
		return value;
	}
}

function frontmatterLine(lines, key) {
	const index = lines.findIndex((line) =>
		line.trimStart().startsWith(`${key}:`),
	);
	return index >= 0 ? index + 1 : 1;
}

function addFinding(level, file, line, detail) {
	findings.push({ level, file, line: Math.max(line || 1, 1), detail });
}

function printAnnotation({ level, file, line, detail }) {
	const relative = path.relative(root, file).replaceAll(path.sep, "/");
	const title =
		level === "error" ? "Website health error" : "Website health warning";
	console.log(
		`::${level} file=${escapeCommand(relative)},line=${line},title=${title}::${escapeCommand(detail)}`,
	);
}

function escapeCommand(value) {
	return String(value)
		.replace(/%/g, "%25")
		.replace(/\r/g, "%0D")
		.replace(/\n/g, "%0A");
}

function message(error) {
	return error instanceof Error ? error.message : String(error);
}
