import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import readline from "node:readline/promises";
import sharp from "sharp";

const rootDirectory = process.cwd();
const galleryDirectory = path.join(rootDirectory, "public", "gallery");
const metadataFile = path.join(rootDirectory, "src", "data", "gallery.json");
const supportedExtensions = new Set([
	".jpg",
	".jpeg",
	".png",
	".webp",
	".avif",
]);
const args = parseArgs(process.argv.slice(2));
const interactive = Boolean(process.stdin.isTTY && process.stdout.isTTY);
const prompts = interactive
	? readline.createInterface({ input: process.stdin, output: process.stdout })
	: null;

try {
	const sourceInput = await ask("Đường dẫn ảnh", args.file || args._[0] || "");
	if (!sourceInput) throw new Error("Bạn chưa nhập đường dẫn ảnh.");

	const sourceFile = path.resolve(sourceInput.replace(/^['"]|['"]$/g, ""));
	const sourceStats = await fs.stat(sourceFile);
	if (!sourceStats.isFile())
		throw new Error("Đường dẫn không phải là một file ảnh.");

	const extension = path.extname(sourceFile).toLowerCase();
	if (!supportedExtensions.has(extension)) {
		throw new Error("Chỉ hỗ trợ JPG, JPEG, PNG, WebP hoặc AVIF.");
	}

	const fallbackTitle = humanize(path.parse(sourceFile).name);
	const title = await ask("Tiêu đề", args.title || fallbackTitle);
	const description = await ask(
		"Mô tả, có thể để trống",
		args.description === "true" ? "" : args.description || "",
	);
	const date = await ask("Ngày chụp YYYY-MM-DD", args.date || getToday());
	if (date && !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
		throw new Error("Ngày chụp phải có định dạng YYYY-MM-DD.");
	}

	await fs.mkdir(galleryDirectory, { recursive: true });
	const baseName = `${date || getToday()}-${slugify(title || fallbackTitle) || "photo"}`;
	const filename = await getAvailableFilename(baseName);
	const destination = path.join(galleryDirectory, filename);
	const imageInfo = await sharp(sourceFile)
		.rotate()
		.resize({
			width: 2200,
			height: 2200,
			fit: "inside",
			withoutEnlargement: true,
		})
		.webp({ quality: 86, effort: 5 })
		.toFile(destination);

	const metadata = await readMetadata();
	metadata.push({
		filename,
		title: title || fallbackTitle,
		description,
		date,
		width: imageInfo.width,
		height: imageInfo.height,
	});
	metadata.sort((a, b) => (b.date || "").localeCompare(a.date || ""));
	await fs.mkdir(path.dirname(metadataFile), { recursive: true });
	await fs.writeFile(
		metadataFile,
		`${JSON.stringify(metadata, null, "\t")}\n`,
		"utf8",
	);

	console.log(`Đã thêm ảnh: public/gallery/${filename}`);
	console.log(`Kích thước: ${imageInfo.width}x${imageInfo.height}`);
} catch (error) {
	console.error(
		`Lỗi: ${error instanceof Error ? error.message : String(error)}`,
	);
	process.exitCode = 1;
} finally {
	prompts?.close();
}

async function ask(label, defaultValue) {
	if (!prompts) return defaultValue;
	const suffix = defaultValue ? ` (${defaultValue})` : "";
	const answer = await prompts.question(`${label}${suffix}: `);
	return answer.trim() || defaultValue;
}

async function readMetadata() {
	try {
		return JSON.parse(await fs.readFile(metadataFile, "utf8"));
	} catch (error) {
		if (error && error.code === "ENOENT") return [];
		throw error;
	}
}

async function getAvailableFilename(baseName) {
	let suffix = 1;
	let filename = `${baseName}.webp`;
	while (true) {
		try {
			await fs.access(path.join(galleryDirectory, filename));
			suffix += 1;
			filename = `${baseName}-${suffix}.webp`;
		} catch {
			return filename;
		}
	}
}

function parseArgs(values) {
	const result = { _: [] };
	for (let index = 0; index < values.length; index += 1) {
		const value = values[index];
		if (!value.startsWith("--")) {
			result._.push(value);
			continue;
		}

		const [rawKey, inlineValue] = value.slice(2).split("=", 2);
		if (inlineValue !== undefined) {
			result[rawKey] = inlineValue;
			continue;
		}

		const nextValue = values[index + 1];
		if (nextValue && !nextValue.startsWith("--")) {
			result[rawKey] = nextValue;
			index += 1;
		} else {
			result[rawKey] = "true";
		}
	}
	return result;
}

function getToday() {
	const now = new Date();
	const year = now.getFullYear();
	const month = String(now.getMonth() + 1).padStart(2, "0");
	const day = String(now.getDate()).padStart(2, "0");
	return `${year}-${month}-${day}`;
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
