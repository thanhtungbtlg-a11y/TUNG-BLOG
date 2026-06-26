import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const postsDir = path.resolve("src/content/posts");
const supportedExtensions = new Set([".jpg", ".jpeg", ".png"]);
const maxSide = 1600;
const quality = 82;
const minSavingRatio = 0.95;

const stats = {
	converted: 0,
	skipped: 0,
	originalBytes: 0,
	optimizedBytes: 0,
};

const replacementsByDirectory = new Map();

for (const file of await walk(postsDir)) {
	const extension = path.extname(file).toLowerCase();
	if (!supportedExtensions.has(extension)) continue;
	await optimize(file);
}

for (const [directory, replacements] of replacementsByDirectory.entries()) {
	const markdownPath = path.join(directory, "index.md");
	let markdown = "";
	try {
		markdown = await fs.readFile(markdownPath, "utf8");
	} catch {
		continue;
	}

	let nextMarkdown = markdown;
	for (const replacement of replacements) {
		nextMarkdown = nextMarkdown.replaceAll(replacement.from, replacement.to);
	}

	if (nextMarkdown !== markdown) {
		await fs.writeFile(markdownPath, nextMarkdown);
	}
}

console.log(
	JSON.stringify(
		{
			...stats,
			savedBytes: stats.originalBytes - stats.optimizedBytes,
		},
		null,
		2,
	),
);

async function optimize(file) {
	const input = await fs.readFile(file);
	const extension = path.extname(file);
	const directory = path.dirname(file);
	const basename = path.basename(file, extension);
	const target = await availableTarget(directory, basename);

	let output;
	try {
		const image = sharp(input, { limitInputPixels: false }).rotate();
		const metadata = await image.metadata();
		const largestSide = Math.max(metadata.width ?? 0, metadata.height ?? 0);
		const pipeline =
			largestSide > maxSide
				? image.resize({
						width: maxSide,
						height: maxSide,
						fit: "inside",
						withoutEnlargement: true,
					})
				: image;
		output = await pipeline.webp({ quality, effort: 4 }).toBuffer();
	} catch (error) {
		stats.skipped++;
		console.warn(`skip ${file}: ${error.message}`);
		return;
	}

	if (output.length >= input.length * minSavingRatio) {
		stats.skipped++;
		return;
	}

	await fs.writeFile(target, output);
	await fs.rm(file);

	const from = path.basename(file);
	const to = path.basename(target);
	if (!replacementsByDirectory.has(directory)) {
		replacementsByDirectory.set(directory, []);
	}
	replacementsByDirectory.get(directory).push({ from, to });

	stats.converted++;
	stats.originalBytes += input.length;
	stats.optimizedBytes += output.length;
}

async function availableTarget(directory, basename) {
	let target = path.join(directory, `${basename}.webp`);
	if (!(await exists(target))) return target;

	let index = 2;
	while (await exists(target)) {
		target = path.join(directory, `${basename}-${index}.webp`);
		index++;
	}
	return target;
}

async function exists(file) {
	try {
		await fs.access(file);
		return true;
	} catch {
		return false;
	}
}

async function walk(directory) {
	const entries = await fs.readdir(directory, { withFileTypes: true });
	const files = await Promise.all(
		entries.map((entry) => {
			const fullPath = path.join(directory, entry.name);
			return entry.isDirectory() ? walk(fullPath) : fullPath;
		}),
	);
	return files.flat();
}
