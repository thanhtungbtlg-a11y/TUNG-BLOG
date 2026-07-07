import { createHash } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import sharp from "sharp";

const rootDirectory = process.cwd();
const galleryDirectory = path.join(rootDirectory, "public", "gallery");
const fullDirectory = path.join(galleryDirectory, "photos");
const thumbnailDirectory = path.join(galleryDirectory, "thumbs");
const metadataFile = path.join(rootDirectory, "src", "data", "gallery.json");
const supportedExtensions = new Set([
	".jpg",
	".jpeg",
	".png",
	".webp",
	".avif",
]);
const sourceDirectory = path.resolve(
	process.argv[2] || "C:/Users/NITRO 5/Desktop/KHO ẢNH CHO WEB",
);
const force = process.argv.includes("--force");

const sourceStats = await fs.stat(sourceDirectory);
if (!sourceStats.isDirectory()) {
	throw new Error(`Không tìm thấy thư mục ảnh: ${sourceDirectory}`);
}

await Promise.all([
	fs.mkdir(fullDirectory, { recursive: true }),
	fs.mkdir(thumbnailDirectory, { recursive: true }),
]);

const existingMetadata = await readJson(metadataFile, []);
const existingBySource = new Map(
	existingMetadata
		.filter((item) => item.source)
		.map((item) => [normalizePath(item.source), item]),
);
const sourceFiles = (await walk(sourceDirectory))
	.filter((filename) =>
		supportedExtensions.has(path.extname(filename).toLowerCase()),
	)
	.sort((a, b) => a.localeCompare(b, "vi"));

let nextIndex = 0;
let processed = 0;
let reused = 0;
const imported = [];
const failures = [];

async function worker() {
	while (nextIndex < sourceFiles.length) {
		const index = nextIndex;
		nextIndex += 1;
		const sourceFile = sourceFiles[index];
		try {
			const item = await importPhoto(sourceFile);
			imported.push(item);
			process.stdout.write(
				`\rĐã xử lý ${processed + reused}/${sourceFiles.length} ảnh`,
			);
		} catch (error) {
			failures.push({
				source: sourceFile,
				error: error instanceof Error ? error.message : String(error),
			});
		}
	}
}

await Promise.all(
	Array.from({ length: Math.min(2, sourceFiles.length) }, () => worker()),
);
process.stdout.write("\n");

const importedSources = new Set(
	imported.map((item) => normalizePath(item.source)),
);
const uniqueImported = await deduplicateImported(imported);
const preserved = existingMetadata.filter(
	(item) => !item.source || !importedSources.has(normalizePath(item.source)),
);
const metadata = [...preserved, ...uniqueImported].sort((a, b) => {
	if (a.date !== b.date) return (b.date || "").localeCompare(a.date || "");
	return a.filename.localeCompare(b.filename, "vi");
});
await fs.writeFile(
	metadataFile,
	`${JSON.stringify(metadata, null, 2)}\n`,
	"utf8",
);

const outputFiles = await walk(galleryDirectory);
const outputSize = await totalSize(outputFiles);
console.log(`Hoàn tất: ${processed} ảnh mới, ${reused} ảnh được giữ lại.`);
console.log(
	`Kho ảnh: ${metadata.length} mục, ${formatBytes(outputSize)} sau tối ưu.`,
);
console.log(
	`Bỏ qua ${sourceFiles.length ? (await walk(sourceDirectory)).length - sourceFiles.length : 0} file RAW/không hỗ trợ.`,
);
if (failures.length > 0) {
	console.error(`Có ${failures.length} ảnh không xử lý được:`);
	for (const failure of failures)
		console.error(`- ${failure.source}: ${failure.error}`);
	process.exitCode = 1;
}

async function importPhoto(sourceFile) {
	const relativeSource = normalizePath(
		path.relative(sourceDirectory, sourceFile),
	);
	const previous = existingBySource.get(relativeSource);
	const sourceStat = await fs.stat(sourceFile);
	const inferredDate = inferDate(relativeSource, sourceStat.mtime);
	const date = isCalendarDate(previous?.date) ? previous.date : inferredDate;
	const album = previous?.album || inferAlbum(relativeSource, date);
	const title = previous?.title || humanize(path.parse(sourceFile).name);
	const description = previous?.description || "";
	const baseName = previous
		? path.parse(previous.filename).name
		: await availableName(
				`${date}-${slugify(album)}-${slugify(path.parse(sourceFile).name)}`,
			);
	const filename = `photos/${baseName}.webp`;
	const thumbnail = `thumbs/${baseName}.webp`;
	const fullPath = path.join(galleryDirectory, filename);
	const thumbnailPath = path.join(galleryDirectory, thumbnail);

	if (!force && (await exists(fullPath)) && (await exists(thumbnailPath))) {
		reused += 1;
		return {
			...previous,
			filename,
			thumbnail,
			title,
			description,
			date,
			album,
			source: relativeSource,
		};
	}

	const image = sharp(sourceFile, { failOn: "warning" }).rotate();
	const fullInfo = await image
		.clone()
		.resize({
			width: 1800,
			height: 1800,
			fit: "inside",
			withoutEnlargement: true,
		})
		.webp({ quality: 80, effort: 4, smartSubsample: true })
		.toFile(fullPath);
	await image
		.clone()
		.resize({
			width: 720,
			height: 720,
			fit: "inside",
			withoutEnlargement: true,
		})
		.webp({ quality: 72, effort: 4, smartSubsample: true })
		.toFile(thumbnailPath);
	processed += 1;

	return {
		filename,
		thumbnail,
		title,
		description,
		date,
		album,
		source: relativeSource,
		width: fullInfo.width,
		height: fullInfo.height,
	};
}

async function availableName(rawName) {
	const safeName = rawName || "photo";
	let suffix = 1;
	let candidate = safeName;
	while (await exists(path.join(fullDirectory, `${candidate}.webp`))) {
		suffix += 1;
		candidate = `${safeName}-${suffix}`;
	}
	return candidate;
}

function inferDate(relativeSource, fallbackDate) {
	const normalized = normalizePath(relativeSource);
	if (!normalized.includes("/")) return formatDate(fallbackDate);

	const firstFolder = normalized.split("/")[0];
	const compact = firstFolder.match(/^(\d{2})(\d{2})(\d{2})$/);
	if (compact) return toDate(compact[1], compact[2], `20${compact[3]}`);

	const parts = firstFolder
		.split(/[^0-9]+/)
		.filter(Boolean)
		.map(Number);
	if (parts.length >= 3) {
		const [day, month, rawYear] = parts;
		const year = rawYear < 100 ? 2000 + rawYear : rawYear;
		return toDate(day, month, year);
	}
	if (parts.length === 2) return toDate(parts[0], parts[1], 2023);

	return formatDate(fallbackDate);
}

function inferAlbum(relativeSource, date) {
	const normalized = normalizePath(relativeSource);
	if (!normalized.includes("/")) return "Ảnh chọn lọc";
	const [year, month, day] = date.split("-");
	return `${day}.${month}.${year}`;
}

function toDate(day, month, year) {
	return [
		year,
		String(month).padStart(2, "0"),
		String(day).padStart(2, "0"),
	].join("-");
}

function formatDate(date) {
	return [
		date.getFullYear(),
		String(date.getMonth() + 1).padStart(2, "0"),
		String(date.getDate()).padStart(2, "0"),
	].join("-");
}

function isCalendarDate(value) {
	if (!/^\d{4}-\d{2}-\d{2}$/.test(value || "")) return false;
	const [year, month, day] = value.split("-").map(Number);
	const date = new Date(year, month - 1, day);
	return (
		date.getFullYear() === year &&
		date.getMonth() === month - 1 &&
		date.getDate() === day
	);
}

async function deduplicateImported(items) {
	const hashes = new Map();
	const unique = [];
	for (const item of items) {
		const fullPath = path.join(galleryDirectory, item.filename);
		const hash = createHash("sha256")
			.update(await fs.readFile(fullPath))
			.digest("hex");
		if (hashes.has(hash)) {
			await Promise.all([
				fs.rm(fullPath, { force: true }),
				fs.rm(path.join(galleryDirectory, item.thumbnail), { force: true }),
			]);
			console.log(`Đã bỏ ảnh trùng: ${item.source}`);
			continue;
		}
		hashes.set(hash, item.source);
		unique.push(item);
	}
	return unique;
}

async function walk(directory) {
	const entries = await fs.readdir(directory, { withFileTypes: true });
	const files = [];
	for (const entry of entries) {
		const fullPath = path.join(directory, entry.name);
		if (entry.isDirectory()) files.push(...(await walk(fullPath)));
		else if (entry.isFile()) files.push(fullPath);
	}
	return files;
}

async function totalSize(files) {
	let size = 0;
	for (const file of files) size += (await fs.stat(file)).size;
	return size;
}

async function readJson(filename, fallback) {
	try {
		return JSON.parse(await fs.readFile(filename, "utf8"));
	} catch (error) {
		if (error?.code === "ENOENT") return fallback;
		throw error;
	}
}

async function exists(filename) {
	try {
		await fs.access(filename);
		return true;
	} catch {
		return false;
	}
}

function normalizePath(value) {
	return value.replace(/\\/g, "/");
}

function slugify(value) {
	return value
		.replace(/đ/g, "d")
		.replace(/Đ/g, "D")
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "");
}

function humanize(value) {
	return value.replace(/[-_]+/g, " ").replace(/\s+/g, " ").trim();
}

function formatBytes(value) {
	return `${(value / 1024 / 1024).toFixed(1)} MB`;
}
