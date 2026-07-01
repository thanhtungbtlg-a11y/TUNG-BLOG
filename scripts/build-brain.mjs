import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const brainDir = join(repoRoot, "brain");
const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
const serve = process.argv.includes("--serve");
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
if (!existsSync(nodeModulesDir) || installedFingerprint !== dependencyFingerprint) {
	run(npmCommand, ["ci", "--no-audit", "--no-fund"], process.platform === "win32");
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
	serve ? "public" : "../dist/brain",
];

if (serve) quartzArgs.push("--serve", "--baseDir", "brain");
run(process.execPath, quartzArgs);
