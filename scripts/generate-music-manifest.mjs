import fs from "node:fs";
import path from "node:path";

const musicDir = path.join(process.cwd(), "public", "music");
const outputFile = path.join(process.cwd(), "public", "music", "manifest.json");

if (!fs.existsSync(musicDir)) {
	fs.mkdirSync(musicDir, { recursive: true });
}

const files = fs
	.readdirSync(musicDir)
	.filter((file) => file.toLowerCase().endsWith(".mp3"))
	.sort();

const tracks = files.map((file, index) => {
	const name = file.replace(/\.mp3$/i, "");
	const cleanName = toDisplayTitle(name);

	const coverJpg = `/music/covers/${name}.jpg`;
	const coverPng = `/music/covers/${name}.png`;

	const coverPathJpg = path.join(process.cwd(), "public", coverJpg);
	const coverPathPng = path.join(process.cwd(), "public", coverPng);

	let cover = "/favicon/favicon-dark-192.png";
	if (fs.existsSync(coverPathJpg)) cover = coverJpg;
	if (fs.existsSync(coverPathPng)) cover = coverPng;

	return {
		id: index + 1,
		title: cleanName,
		artist: "Tung Notes",
		src: `/music/${file}`,
		cover,
	};
});

fs.writeFileSync(outputFile, JSON.stringify(tracks, null, 2), "utf-8");

console.log(`Generated ${tracks.length} tracks to public/music/manifest.json`);

function toDisplayTitle(name) {
	return name
		.replace(/^\d+[-_\s]*/, "")
		.replace(/\s+@\s*[a-z0-9_-]{6,}$/i, "")
		.replace(/_/g, " ")
		.replace(/\s*[｜|]\s*/g, " | ")
		.replace(/\s{2,}/g, " ")
		.trim()
		.replace(/\b\w/g, (char) => char.toUpperCase());
}
