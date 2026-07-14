import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
	copyFileSync,
	existsSync,
	mkdirSync,
	readdirSync,
	readFileSync,
	rmSync,
	writeFileSync,
} from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const brainDir = join(repoRoot, "brain");
const brainHubDir = join(repoRoot, "dist", "brain");
const serve = process.argv.includes("--serve");
const leedOutputDir = serve
	? join(brainDir, "public", "leed")
	: join(brainHubDir, "leed");
const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
const nodeModulesDir = join(brainDir, "node_modules");
const dependencyMarker = join(nodeModulesDir, ".quartz-package-lock");
const dependencyFingerprint = createHash("sha256")
	.update(readFileSync(join(brainDir, "package-lock.json")))
	.digest("hex");

function run(command, args, shell = false) {
	const result = spawnSync(command, args, {
		cwd: brainDir,
		shell,
		stdio: "inherit",
	});
	if (result.error) throw result.error;
	if (result.status !== 0) process.exit(result.status ?? 1);
}

// Vercel may restore an old node_modules cache. Reinstall only when the
// package lock changed, so Quartz upgrades are reliable without slowing every build.
const installedFingerprint = existsSync(dependencyMarker)
	? readFileSync(dependencyMarker, "utf8").trim()
	: "";
if (
	!existsSync(nodeModulesDir) ||
	installedFingerprint !== dependencyFingerprint
) {
	run(
		npmCommand,
		["ci", "--no-audit", "--no-fund"],
		process.platform === "win32",
	);
	writeFileSync(dependencyMarker, dependencyFingerprint);
}

// Vercel can restore an incomplete plugin cache where the directory exists but
// its generated entry point is missing. Rebuild that cache from the lockfile.
const pluginDir = join(brainDir, ".quartz", "plugins");
if (!existsSync(join(pluginDir, "index.ts"))) {
	rmSync(pluginDir, { recursive: true, force: true });
	run(process.execPath, ["quartz/bootstrap-cli.mjs", "plugin", "install"]);
}

const quartzArgs = [
	"quartz/bootstrap-cli.mjs",
	"build",
	"--output",
	serve ? "public/leed" : "../dist/brain/leed",
];

if (serve) quartzArgs.push("--serve", "--baseDir", "brain/leed");
run(process.execPath, quartzArgs);

const trackerSource = join(
	repoRoot,
	"public",
	"scripts",
	"analytics-tracker.js",
);
const trackerOutput = join(leedOutputDir, "scripts", "analytics-tracker.js");
mkdirSync(dirname(trackerOutput), { recursive: true });
copyFileSync(trackerSource, trackerOutput);

const trackerTag =
	'<script defer src="/scripts/analytics-tracker.js" data-persist></script>';
for (const htmlFile of findHtmlFiles(leedOutputDir)) {
	const html = readFileSync(htmlFile, "utf8");
	if (html.includes("analytics-tracker.js")) continue;
	writeFileSync(htmlFile, html.replace("</body>", `${trackerTag}</body>`));
}

if (!serve) createLegacyRedirects(leedOutputDir, brainHubDir);

function findHtmlFiles(directory) {
	const files = [];
	for (const entry of readdirSync(directory, { withFileTypes: true })) {
		const path = join(directory, entry.name);
		if (entry.isDirectory()) files.push(...findHtmlFiles(path));
		else if (entry.isFile() && entry.name.endsWith(".html")) files.push(path);
	}
	return files;
}

function createLegacyRedirects(sourceDirectory, destinationDirectory) {
	for (const htmlFile of findHtmlFiles(sourceDirectory)) {
		const relativePath = htmlFile
			.slice(sourceDirectory.length + 1)
			.replaceAll("\\", "/");
		if (relativePath === "index.html") continue;

		const redirectFile = join(destinationDirectory, relativePath);
		if (existsSync(redirectFile)) continue;

		const target = `/brain/leed/${relativePath.replace(/index\.html$/, "")}`;
		mkdirSync(dirname(redirectFile), { recursive: true });
		writeFileSync(
			redirectFile,
			`<!doctype html><html lang="vi"><head><meta charset="utf-8"><meta name="robots" content="noindex"><meta http-equiv="refresh" content="0;url=${target}"><link rel="canonical" href="${target}"><title>Chuyển đến kho LEED</title></head><body><a href="${target}">Mở kho LEED</a></body></html>`,
		);
	}
}
