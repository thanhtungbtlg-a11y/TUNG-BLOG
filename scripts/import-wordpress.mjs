import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { XMLParser } from "fast-xml-parser";
import TurndownService from "turndown";

const rootDir = path.resolve(
	path.dirname(fileURLToPath(import.meta.url)),
	"..",
);
const postsDir = path.join(rootDir, "src/content/posts");
const args = process.argv.slice(2);
const inputArg = args.find((arg) => !arg.startsWith("--"));
const overwrite = args.includes("--overwrite");
const downloadImages = !args.includes("--no-download-images");

if (!inputArg) {
	console.error(
		"Usage: pnpm import-wordpress <wordpress-export.xml> [--overwrite] [--no-download-images]",
	);
	process.exit(1);
}

const inputPath = path.resolve(rootDir, inputArg);
if (!existsSync(inputPath)) {
	console.error(`WordPress export file not found: ${inputPath}`);
	process.exit(1);
}

const parser = new XMLParser({
	ignoreAttributes: false,
	parseAttributeValue: false,
	parseTagValue: false,
	trimValues: true,
});

const turndown = new TurndownService({
	bulletListMarker: "-",
	codeBlockStyle: "fenced",
	emDelimiter: "_",
	headingStyle: "atx",
});

turndown.addRule("wordpressImage", {
	filter: "img",
	replacement(_content, node) {
		const src = node.getAttribute("src") || "";
		const alt = node.getAttribute("alt") || "";
		const title = node.getAttribute("title");
		const titlePart = title ? ` "${title.replace(/"/g, '\\"')}"` : "";
		return src ? `![${alt}](${src}${titlePart})` : "";
	},
});

const xml = await readFile(inputPath, "utf8");
const data = parser.parse(xml);
const items = asArray(data?.rss?.channel?.item);
const posts = items.filter(
	(item) => item["wp:post_type"] === "post" && item["wp:status"] === "publish",
);

const usedSlugs = new Set();
let imported = 0;
let skipped = 0;
let downloaded = 0;
let imageFailures = 0;

for (const item of posts) {
	const title = cleanText(item.title || "Untitled");
	const published = dateOnly(item["wp:post_date"] || item.pubDate);
	const updated = dateOnly(item["wp:post_modified"]);
	const slug = createUniqueSlug(
		item["wp:post_name"],
		title,
		published,
		item["wp:post_id"],
	);
	const targetDir = path.join(postsDir, slug);
	const targetFile = path.join(targetDir, "index.md");

	if (existsSync(targetFile) && !overwrite) {
		skipped += 1;
		continue;
	}

	await mkdir(targetDir, { recursive: true });

	const rawHtml = String(item["content:encoded"] || "");
	const imageMap = downloadImages
		? await downloadPostImages(rawHtml, targetDir)
		: new Map();
	downloaded += imageMap.size;

	const html = removeWordPressComments(rewriteImageUrls(rawHtml, imageMap));
	const markdown = normalizeMarkdown(turndown.turndown(html));
	const description = createDescription(item["excerpt:encoded"], rawHtml);
	const frontmatter = createFrontmatter({
		title,
		published,
		updated: updated && updated !== published ? updated : "",
		description,
		image: firstImagePath(rawHtml, imageMap),
		category: categoryFor(item),
		tags: tagsFor(item),
	});
	const sourceLink = item.link
		? `\n<!-- Imported from WordPress: ${item.link} -->\n`
		: "";
	const body = markdown || "_Bài viết được import từ WordPress._";

	await writeFile(targetFile, `${frontmatter}${sourceLink}\n${body}\n`, "utf8");
	imported += 1;
}

console.log(
	JSON.stringify(
		{
			input: path.relative(rootDir, inputPath),
			posts: posts.length,
			imported,
			skipped,
			downloadedImages: downloaded,
			imageFailures,
			output: path.relative(rootDir, postsDir),
		},
		null,
		2,
	),
);

function asArray(value) {
	if (!value) return [];
	return Array.isArray(value) ? value : [value];
}

function cleanText(value) {
	return String(value || "")
		.replace(/\s+/g, " ")
		.trim();
}

function createUniqueSlug(rawSlug, title, published, postId) {
	const base =
		slugify(safeDecode(rawSlug)) ||
		slugify(title) ||
		`post-${published || "wordpress"}-${postId || Date.now()}`;
	let slug = base;
	let count = 2;

	while (usedSlugs.has(slug)) {
		slug = `${base}-${count}`;
		count += 1;
	}

	usedSlugs.add(slug);
	return slug;
}

function safeDecode(value) {
	try {
		return decodeURIComponent(String(value || ""));
	} catch {
		return String(value || "");
	}
}

function slugify(value) {
	const normalized = String(value || "")
		.toLowerCase()
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.replace(/đ/g, "d")
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "");

	return normalized.slice(0, 90).replace(/-+$/g, "");
}

function dateOnly(value) {
	const raw = String(value || "").trim();
	if (!raw || raw.startsWith("0000-00-00")) return "";
	const date = raw.includes(" ")
		? raw.split(" ")[0]
		: new Date(raw).toISOString().slice(0, 10);
	return /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : "";
}

function categoryFor(item) {
	const categories = categoriesFor(item, "category").filter(
		(category) => category.toLowerCase() !== "uncategorized",
	);
	return categories[0] || "WordPress";
}

function tagsFor(item) {
	return categoriesFor(item, "post_tag");
}

function categoriesFor(item, domain) {
	return asArray(item.category)
		.filter((category) => category?.["@_domain"] === domain)
		.map((category) => cleanText(category["#text"]))
		.filter(Boolean);
}

function createDescription(excerptHtml, contentHtml) {
	const source = String(excerptHtml || "").trim() || contentHtml;
	const text = htmlToText(removeWordPressComments(source));
	if (text.length <= 170) return text;
	return `${text.slice(0, 167).trim()}...`;
}

function htmlToText(html) {
	return String(html || "")
		.replace(/<[^>]*>/g, " ")
		.replace(/&nbsp;/g, " ")
		.replace(/&amp;/g, "&")
		.replace(/&lt;/g, "<")
		.replace(/&gt;/g, ">")
		.replace(/&quot;/g, '"')
		.replace(/&#039;/g, "'")
		.replace(/\s+/g, " ")
		.trim();
}

function createFrontmatter({
	title,
	published,
	updated,
	description,
	image,
	category,
	tags,
}) {
	const lines = [
		"---",
		`title: ${yamlString(title)}`,
		`published: ${published}`,
		updated ? `updated: ${updated}` : "",
		`description: ${yamlString(description)}`,
		image ? `image: ${yamlString(image)}` : 'image: ""',
		`tags: ${JSON.stringify(tags)}`,
		`category: ${yamlString(category)}`,
		"lang: vi",
		"draft: false",
		"---",
	];

	return `${lines.filter(Boolean).join("\n")}\n`;
}

function yamlString(value) {
	return JSON.stringify(String(value || ""));
}

function removeWordPressComments(html) {
	return String(html || "").replace(/<!--\s*\/?wp:[\s\S]*?-->/g, "");
}

function normalizeMarkdown(markdown) {
	return String(markdown || "")
		.replace(/\r\n/g, "\n")
		.replace(/[ \t]+\n/g, "\n")
		.replace(/\n{3,}/g, "\n\n")
		.trim();
}

function extractImageUrls(html) {
	const urls = new Set();
	const imagePattern = /<img\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/gi;
	for (const match of String(html || "").matchAll(imagePattern)) {
		urls.add(match[1].replace(/&amp;/g, "&"));
	}
	return [...urls];
}

async function downloadPostImages(html, targetDir) {
	const map = new Map();
	const names = new Set();

	for (const imageUrl of extractImageUrls(html)) {
		try {
			const response = await fetch(imageUrl, {
				headers: {
					"user-agent": "thanhtung-blog-import/1.0",
				},
			});

			if (!response.ok) throw new Error(`HTTP ${response.status}`);

			const buffer = Buffer.from(await response.arrayBuffer());
			const filename = uniqueFilename(
				imageUrl,
				names,
				response.headers.get("content-type"),
			);
			await writeFile(path.join(targetDir, filename), buffer);
			map.set(imageUrl, `./${filename}`);
		} catch (error) {
			imageFailures += 1;
			console.warn(`Image download failed: ${imageUrl} (${error.message})`);
		}
	}

	return map;
}

function uniqueFilename(imageUrl, names, contentType) {
	const url = new URL(imageUrl);
	const extension = extensionFor(url.pathname, contentType);
	const nameWithoutExtension = path.basename(
		url.pathname,
		path.extname(url.pathname),
	);
	const base = slugify(nameWithoutExtension) || "image";
	let filename = `${base}${extension}`;
	let count = 2;

	while (names.has(filename)) {
		filename = `${base}-${count}${extension}`;
		count += 1;
	}

	names.add(filename);
	return filename;
}

function extensionFor(pathname, contentType) {
	const extension = path.extname(pathname).toLowerCase();
	if (/^\.(jpe?g|png|gif|webp|avif|svg)$/.test(extension)) return extension;
	if (contentType?.includes("png")) return ".png";
	if (contentType?.includes("webp")) return ".webp";
	if (contentType?.includes("gif")) return ".gif";
	if (contentType?.includes("svg")) return ".svg";
	return ".jpg";
}

function rewriteImageUrls(html, imageMap) {
	let next = String(html || "");
	for (const [remote, local] of imageMap) {
		next = next
			.split(remote)
			.join(local)
			.split(remote.replace(/&/g, "&amp;"))
			.join(local);
	}
	return next;
}

function firstImagePath(html, imageMap) {
	const [first] = extractImageUrls(html);
	if (!first) return "";
	return imageMap.get(first) || first;
}
