import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const musicDir = path.join(process.cwd(), "public", "music");
const outputFile = path.join(process.cwd(), "public", "music", "manifest.json");

if (!fs.existsSync(musicDir)) {
	fs.mkdirSync(musicDir, { recursive: true });
}

const files = fs
	.readdirSync(musicDir)
	.filter((file) => file.toLowerCase().endsWith(".mp3"))
	.sort();

const generatedCoverDir = path.join(musicDir, "covers", "generated");
fs.mkdirSync(generatedCoverDir, { recursive: true });

const tracks = await Promise.all(
	files.map(async (file, index) => {
		const name = file.replace(/\.mp3$/i, "");
		const { title, artist } = parseTrackName(name);

		const coverJpg = `/music/covers/${name}.jpg`;
		const coverPng = `/music/covers/${name}.png`;

		const coverPathJpg = path.join(musicDir, "covers", `${name}.jpg`);
		const coverPathPng = path.join(musicDir, "covers", `${name}.png`);

		let cover = "/favicon/favicon-dark-192.png";
		let coverSource;
		if (fs.existsSync(coverPathJpg)) {
			cover = coverJpg;
			coverSource = coverPathJpg;
		}
		if (fs.existsSync(coverPathPng)) {
			cover = coverPng;
			coverSource = coverPathPng;
		}

		let coverThumb = cover;
		if (coverSource) {
			const thumbnailName = `${name}.thumb.webp`;
			const thumbnailPath = path.join(generatedCoverDir, thumbnailName);
			await createCoverThumbnail(coverSource, thumbnailPath);
			coverThumb = `/music/covers/generated/${thumbnailName}`;
		}

		return {
			id: index + 1,
			title,
			artist,
			src: `/music/${file}`,
			cover,
			coverThumb,
		};
	}),
);

fs.writeFileSync(outputFile, JSON.stringify(tracks, null, 2), "utf-8");

console.log(`Generated ${tracks.length} tracks to public/music/manifest.json`);

async function createCoverThumbnail(source, output) {
	const sourceModified = fs.statSync(source).mtimeMs;
	const outputModified = fs.existsSync(output)
		? fs.statSync(output).mtimeMs
		: 0;
	if (outputModified >= sourceModified) return;

	await sharp(source)
		.resize(96, 96, { fit: "cover", position: "centre" })
		.webp({ quality: 78, effort: 5 })
		.toFile(output);
}

function parseTrackName(name) {
	const cleanName = cleanBaseName(name);
	const parts = cleanName.split(/\s+-\s+/);

	if (parts.length < 2) {
		return {
			title: toDisplayTitle(cleanName),
			artist: "Unknown artist",
		};
	}

	const artist = parts.pop() ?? "";

	return {
		title: toDisplayTitle(parts.join(" - ")),
		artist: toDisplayTitle(artist),
	};
}

function cleanBaseName(name) {
	return name
		.replace(/^\d+[-_\s]*/, "")
		.replace(/\s+@\s*[a-z0-9_-]{6,}$/i, "")
		.replace(/_/g, " ")
		.replace(/\s*[｜|]\s*/g, " | ")
		.replace(/\s{2,}/g, " ")
		.trim();
}

function toDisplayTitle(name) {
	return cleanBaseName(name).replace(/\b\w/g, (char) => char.toUpperCase());
}
